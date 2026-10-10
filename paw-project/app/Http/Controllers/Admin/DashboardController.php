<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    private const STATUSES = [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED, Booking::STATUS_CANCELLED];

    public function index(Request $request): Response
    {
        return $this->renderPage($request);
    }

    public function show(Request $request, Booking $booking): Response
    {
        return $this->renderPage($request, $booking->load(['user:id,name,email,phone_number', 'event.venue', 'event.category']));
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate(['status' => ['required', Rule::in(self::STATUSES)]]);
        $filters = $this->filters($request);

        DB::transaction(function () use ($booking, $validated): void {
            // Serialize status changes for the same event before counting seats.
            $event = Event::query()->lockForUpdate()->findOrFail($booking->event_id);
            $record = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            if ($validated['status'] !== Booking::STATUS_CANCELLED && $record->status === Booking::STATUS_CANCELLED) {
                $reserved = $event->bookings()->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                    ->whereKeyNot($record->id)->sum('ticket_quantity');
                if ($reserved + $record->ticket_quantity > $event->quota) {
                    throw ValidationException::withMessages(['status' => 'This event does not have enough seats to restore this booking.']);
                }
            }
            $record->update(['status' => $validated['status']]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Booking status updated.']);

        return to_route('admin.bookings.show', ['booking' => $booking->id, ...$filters]);
    }

    public function destroy(Request $request, Booking $booking): RedirectResponse
    {
        $filters = $this->filters($request);
        $booking->deleteOrFail();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Booking deleted.']);

        return to_route('admin.dashboard', $filters);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $query = $this->query($filters);

        return response()->streamDownload(function () use ($query): void {
            $stream = fopen('php://output', 'w');
            if ($stream === false) {
                return;
            }
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, ['Booking code', 'Customer', 'Email', 'Event', 'Event date', 'Tickets', 'Total (IDR)', 'Booked at', 'Status'], ',', '"', '');
            $query->chunk(200, function ($bookings) use ($stream): void {
                foreach ($bookings as $booking) {
                    $row = [
                        $booking->booking_code, $booking->user->name, $booking->user->email,
                        $booking->event->title, $booking->event->date->format('Y-m-d'),
                        (string) $booking->ticket_quantity, $booking->total_price,
                        $booking->booking_date->format('Y-m-d H:i:s'), $booking->status,
                    ];
                    // Prevent spreadsheet programs interpreting customer text as formulas.
                    $row = array_map(fn (string $value): string => preg_match('/^[\s]*[=+@-]/u', $value) ? "'".$value : $value, $row);
                    fputcsv($stream, $row, ',', '"', '');
                }
            });
            fclose($stream);
        }, 'agendain-bookings-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return array{search: string, status: string, event_id: string} */
    private function filters(Request $request): array
    {
        $validated = Validator::make($request->query(), [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'event_id' => ['nullable', 'integer', Rule::exists('events', 'id')],
            'page' => ['nullable', 'integer', 'min:1'],
        ])->validate();

        return [
            'search' => trim((string) ($validated['search'] ?? '')),
            'status' => (string) ($validated['status'] ?? ''),
            'event_id' => (string) ($validated['event_id'] ?? ''),
        ];
    }

    /**
     * @param  array{search: string, status: string, event_id: string}  $filters
     * @return Builder<Booking>
     */
    private function query(array $filters): Builder
    {
        return Booking::query()->with(['user:id,name,email,phone_number', 'event.venue', 'event.category'])
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $query->where(function (Builder $query) use ($filters): void {
                    $term = '%'.$filters['search'].'%';
                    $query->where('booking_code', 'like', $term)
                        ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $term)->orWhere('email', 'like', $term))
                        ->orWhereHas('event', fn (Builder $event) => $event->where('title', 'like', $term));
                });
            })
            ->when($filters['status'] !== '', fn (Builder $query) => $query->where('status', $filters['status']))
            ->when($filters['event_id'] !== '', fn (Builder $query) => $query->where('event_id', $filters['event_id']))
            ->orderByDesc('booking_date')->orderByDesc('id');
    }

    private function renderPage(Request $request, ?Booking $selected = null): Response
    {
        $filters = $this->filters($request);
        $bookings = $this->query($filters)->paginate(5)->withQueryString();
        $bookings->withPath(route('admin.dashboard'));

        return Inertia::render('admin/dashboard', [
            'bookings' => $bookings,
            'selectedBooking' => $selected,
            'filters' => $filters,
            'events' => Event::query()->select('id', 'title')->orderBy('title')->get(),
            'stats' => [
                'events' => Event::count(), 'categories' => Category::count(),
                'venues' => Venue::count(), 'bookings' => Booking::count(),
                'pending' => Booking::where('status', Booking::STATUS_PENDING)->count(),
                'confirmed' => Booking::where('status', Booking::STATUS_CONFIRMED)->count(),
                'cancelled' => Booking::where('status', Booking::STATUS_CANCELLED)->count(),
            ],
        ]);
    }
}
