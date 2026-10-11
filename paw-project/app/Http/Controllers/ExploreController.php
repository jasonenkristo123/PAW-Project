<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookingRequest;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Support\EventCatalog;
use Brick\Math\BigDecimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExploreController extends Controller
{
    public function __construct(private EventCatalog $catalog) {}

    public function index(): Response
    {
        return Inertia::render('explore/events', [
            'events' => $this->catalog->upcoming()->get()->map(fn (Event $event): array => $this->catalog->present($event)),
            'categories' => Category::query()->whereHas('events', fn ($query) => $query
                ->where('status', Event::STATUS_PUBLISHED)
                ->where('date', '>=', now('Asia/Jakarta')->format('Y-m-d')))
                ->orderBy('name')->pluck('name'),
        ]);
    }

    public function show(int $event): Response
    {
        $record = $this->catalog->upcoming()->findOrFail($event);

        return Inertia::render('explore/event-details', ['event' => $this->catalog->present($record)]);
    }

    public function myBookings(Request $request): Response
    {
        $records = $request->user()->bookings()->with([
            'user', 'event' => fn ($query) => $query->with(['category', 'venue'])->withSum([
                'bookings as reserved_tickets' => fn ($query) => $query
                    ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED]),
            ], 'ticket_quantity'),
        ])->orderByDesc('booking_date')->orderByDesc('id')->get();

        return Inertia::render('explore/bookings', [
            'bookings' => $records->map(fn (Booking $booking): array => [
                'code' => $booking->booking_code,
                'event_id' => $booking->event_id,
                'ticket_quantity' => $booking->ticket_quantity,
                'status' => $booking->status,
                'name' => $booking->attendee_name ?? $booking->user->name,
                'email' => $booking->attendee_email ?? $booking->user->email,
                'phone_number' => $booking->attendee_phone ?? $booking->user->phone_number ?? '',
                'total_price' => (float) $booking->total_price,
                'booking_date' => $booking->booking_date->toIso8601String(),
                'event' => $this->catalog->present($booking->event),
            ]),
        ]);
    }

    public function book(BookingRequest $request, int $event): RedirectResponse
    {
        $validated = $request->validated();
        DB::transaction(function () use ($request, $event, $validated): void {
            $record = Event::query()->lockForUpdate()->findOrFail($event);
            $reserved = $record->bookings()->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                ->sum('ticket_quantity');
            $quantity = $request->integer('ticket_quantity');
            if ($record->status !== Event::STATUS_PUBLISHED
                || $record->date->format('Y-m-d') < now('Asia/Jakarta')->format('Y-m-d')
                || $quantity > $record->quota - $reserved) {
                throw ValidationException::withMessages(['ticket_quantity' => 'This event is unavailable or does not have enough seats.']);
            }
            $total = BigDecimal::of($record->price)->multipliedBy($quantity)
                ->plus((float) $record->price > 0 ? 5000 : 0)->toScale(2);
            $request->user()->bookings()->create([
                'event_id' => $record->id, 'ticket_quantity' => $quantity,
                'total_price' => (string) $total, 'status' => Booking::STATUS_CONFIRMED,
                'attendee_name' => $validated['name'], 'attendee_email' => $validated['email'],
                'attendee_phone' => $validated['phone_number'] ?? null,
            ]);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Booking confirmed successfully. Your pass is in My Bookings.']);

        return to_route('bookings.index');
    }

    public function cancel(Request $request, string $booking): RedirectResponse
    {
        $record = $request->user()->bookings()->where('booking_code', $booking)->firstOrFail();
        DB::transaction(function () use ($record): void {
            Event::query()->lockForUpdate()->findOrFail($record->event_id);
            $locked = Booking::query()->lockForUpdate()->findOrFail($record->id);
            if (! in_array($locked->status, [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED], true)) {
                throw ValidationException::withMessages(['booking' => 'This booking can no longer be cancelled.']);
            }
            $locked->update(['status' => Booking::STATUS_CANCELLED]);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Your booking has been cancelled.']);

        return to_route('bookings.index');
    }
}
