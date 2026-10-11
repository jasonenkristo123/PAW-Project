<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Event;
use App\Support\DemoEventCatalog;
use Brick\Math\BigDecimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @phpstan-import-type DemoEvent from DemoEventCatalog
 *
 * @phpstan-type DemoBooking array{code: string, event_id: int, ticket_quantity: int, status: string, name: string, email: string, phone_number: string, total_price: int, service_fee: int}
 */
class ExploreController extends Controller
{
    public function index(Request $request): Response
    {
        if (Event::query()->where('status', Event::STATUS_PUBLISHED)->exists()) {
            $events = Event::query()
                ->with(['category', 'venue', 'bookings'])
                ->where('status', Event::STATUS_PUBLISHED)
                ->where('date', '>=', now('Asia/Jakarta')->format('Y-m-d'))
                ->orderBy('date')
                ->orderBy('time')
                ->get()
                ->map(fn (Event $event): array => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'category' => $event->category?->name ?? 'General',
                    'tagline' => $event->description,
                    'date' => $event->date->format('Y-m-d'),
                    'time' => substr($event->time, 0, 5),
                    'end_time' => '21:00',
                    'venue' => $event->venue?->name ?? 'Venue',
                    'address' => $event->venue?->address ?? '',
                    'price' => (int) $event->price,
                    'quota' => $event->quota,
                    'remaining' => max(0, $event->quota - $event->bookings()->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])->sum('ticket_quantity')),
                    'image' => '/images/events/'.(match ($event->category?->name) {
                        'Workshop' => 'workshop',
                        'Music' => 'music',
                        'Technology' => 'technology',
                        'Competition' => 'competition',
                        'Seminar' => 'seminar',
                        default => 'coffee',
                    }).'.jpg',
                    'organizer' => 'Agendain',
                    'description' => $event->description,
                    'included' => $event->whats_included ? explode("\n", $event->whats_included) : ['Admission to the full session'],
                    'bring' => $event->what_to_bring ? explode("\n", $event->what_to_bring) : ['Your booking reference'],
                ])->all();

            return Inertia::render('explore/events', ['events' => $events]);
        }

        $bookings = $this->bookings($request);

        return Inertia::render('explore/events', [
            'events' => array_values(array_filter($this->events($bookings), fn (array $event): bool => $event['date'] >= now('Asia/Jakarta')->format('Y-m-d'))),
        ]);
    }

    public function show(Request $request, int $event): Response
    {
        $dbEvent = Event::query()->with(['category', 'venue', 'bookings'])->find($event);
        if ($dbEvent) {
            $reserved = $dbEvent->bookings()
                ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                ->sum('ticket_quantity');

            return Inertia::render('explore/event-details', [
                'event' => [
                    'id' => $dbEvent->id,
                    'title' => $dbEvent->title,
                    'category' => $dbEvent->category?->name ?? 'General',
                    'tagline' => $dbEvent->description,
                    'date' => $dbEvent->date->format('Y-m-d'),
                    'time' => substr($dbEvent->time, 0, 5),
                    'end_time' => '21:00',
                    'venue' => $dbEvent->venue?->name ?? 'Venue',
                    'address' => $dbEvent->venue?->address ?? '',
                    'price' => (int) $dbEvent->price,
                    'quota' => $dbEvent->quota,
                    'remaining' => max(0, $dbEvent->quota - $reserved),
                    'image' => '/images/events/'.(match ($dbEvent->category?->name) {
                        'Workshop' => 'workshop',
                        'Music' => 'music',
                        'Technology' => 'technology',
                        'Competition' => 'competition',
                        'Seminar' => 'seminar',
                        default => 'coffee',
                    }).'.jpg',
                    'organizer' => 'Agendain',
                    'description' => $dbEvent->description,
                    'included' => $dbEvent->whats_included ? explode("\n", $dbEvent->whats_included) : ['Admission to the full session'],
                    'bring' => $dbEvent->what_to_bring ? explode("\n", $dbEvent->what_to_bring) : ['Your booking reference'],
                ],
            ]);
        }

        DemoEventCatalog::find($event);
        $bookings = $this->bookings($request);
        $events = $this->events($bookings);

        return Inertia::render('explore/event-details', [
            'event' => collect($events)->firstWhere('id', $event),
        ]);
    }

    public function myBookings(Request $request): Response
    {
        $user = $request->user();
        $dbBookings = [];

        if ($user) {
            $records = Booking::query()
                ->with(['event.venue', 'event.category', 'user'])
                ->where('user_id', $user->id)
                ->orderByDesc('booking_date')
                ->orderByDesc('id')
                ->get();

            foreach ($records as $b) {
                $event = $b->event;
                $fee = (float) $b->total_price > 0 ? 5000 : 0;
                $dbBookings[] = [
                    'code' => $b->booking_code,
                    'event_id' => $b->event_id,
                    'ticket_quantity' => $b->ticket_quantity,
                    'status' => $b->status,
                    'name' => $b->user->name,
                    'email' => $b->user->email,
                    'phone_number' => $b->user->phone_number ?? '',
                    'total_price' => (int) $b->total_price,
                    'service_fee' => $fee,
                    'booking_date' => $b->booking_date->toIso8601String(),
                    'event' => [
                        'id' => $event?->id ?? 0,
                        'title' => $event?->title ?? 'Event',
                        'category' => $event?->category?->name ?? 'General',
                        'tagline' => $event?->description ?? '',
                        'date' => $event?->date?->format('Y-m-d') ?? now()->format('Y-m-d'),
                        'time' => substr($event?->time ?? '09:00', 0, 5),
                        'end_time' => '21:00',
                        'venue' => $event?->venue?->name ?? 'Venue',
                        'address' => $event?->venue?->address ?? '',
                        'price' => (int) ($event?->price ?? 0),
                        'quota' => $event?->quota ?? 50,
                        'remaining' => 10,
                        'image' => '/images/events/'.(match ($event?->category?->name) {
                            'Workshop' => 'workshop',
                            'Music' => 'music',
                            'Technology' => 'technology',
                            'Competition' => 'competition',
                            'Seminar' => 'seminar',
                            default => 'coffee',
                        }).'.jpg',
                        'organizer' => 'Agendain',
                        'description' => $event?->description ?? '',
                        'included' => $event?->whats_included ? explode("\n", $event->whats_included) : ['Admission to the full session'],
                        'bring' => $event?->what_to_bring ? explode("\n", $event->what_to_bring) : ['Your booking reference'],
                    ],
                ];
            }
        }

        if ($dbBookings !== []) {
            return Inertia::render('explore/bookings', [
                'bookings' => $dbBookings,
            ]);
        }

        return Inertia::render('explore/bookings', [
            'bookings' => array_map(fn (array $booking): array => [
                ...$booking, 'event' => DemoEventCatalog::find($booking['event_id']),
            ], $this->bookings($request)),
        ]);
    }

    public function book(Request $request, int $event): RedirectResponse
    {
        $validated = $request->validate([
            'ticket_quantity' => ['required', 'integer', 'min:1', 'max:4'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ]);
        $quantity = $request->integer('ticket_quantity');

        // 1. Production database booking (when Event exists in database)
        $eventModel = Event::query()->find($event);
        if ($eventModel) {
            if ($eventModel->status !== Event::STATUS_PUBLISHED || $eventModel->date->format('Y-m-d') < now('Asia/Jakarta')->format('Y-m-d')) {
                throw ValidationException::withMessages(['ticket_quantity' => 'There are not enough available seats for this booking.']);
            }

            DB::transaction(function () use ($request, $eventModel, $quantity): void {
                $locked = Event::query()->lockForUpdate()->findOrFail($eventModel->id);
                $reserved = $locked->bookings()
                    ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                    ->sum('ticket_quantity');

                if ($quantity > ($locked->quota - $reserved)) {
                    throw ValidationException::withMessages(['ticket_quantity' => 'There are not enough available seats for this booking.']);
                }

                $subtotal = BigDecimal::of($locked->price)->multipliedBy($quantity);
                $fee = (float) $locked->price > 0 ? 5000 : 0;
                $totalPrice = (string) $subtotal->plus($fee)->toScale(2);

                $request->user()->bookings()->create([
                    'event_id' => $locked->id,
                    'ticket_quantity' => $quantity,
                    'total_price' => $totalPrice,
                    'status' => Booking::STATUS_CONFIRMED,
                ]);
            });

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Booking confirmed successfully. Your pass is in My Bookings.']);

            return to_route('bookings.index');
        }

        // 2. Demo session fallback (for catalog fixtures and initial tests)
        $selected = DemoEventCatalog::find($event);
        $bookings = $this->bookings($request);
        $available = $this->remaining($selected, $bookings);

        if ($selected['date'] < now('Asia/Jakarta')->format('Y-m-d') || $quantity > $available) {
            throw ValidationException::withMessages(['ticket_quantity' => 'There are not enough available seats for this booking.']);
        }

        $subtotal = $selected['price'] * $quantity;
        $fee = $selected['price'] > 0 ? 5000 : 0;
        array_unshift($bookings, [
            'code' => 'DEMO-'.Str::ulid(), 'event_id' => $event,
            'ticket_quantity' => $quantity, 'status' => 'confirmed',
            'name' => $validated['name'], 'email' => $validated['email'], 'phone_number' => $validated['phone_number'] ?? '',
            'total_price' => $subtotal + $fee, 'service_fee' => $fee,
        ]);
        $request->session()->put('demo_bookings', $bookings);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Demo booking confirmed. Your pass is in My Bookings.']);

        return to_route('bookings.index');
    }

    public function cancel(Request $request, string $booking): RedirectResponse
    {
        // 1. Check real database
        $record = Booking::query()
            ->where('booking_code', $booking)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($record) {
            if (! in_array($record->status, [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED], true)) {
                throw ValidationException::withMessages(['booking' => 'This booking can no longer be cancelled.']);
            }

            $record->update(['status' => Booking::STATUS_CANCELLED]);
            Inertia::flash('toast', ['type' => 'success', 'message' => 'Your booking has been cancelled.']);

            return to_route('bookings.index');
        }

        // 2. Demo session fallback
        $bookings = $this->bookings($request);
        $found = false;
        foreach ($bookings as &$record) {
            if ($record['code'] !== $booking) {
                continue;
            }
            $found = true;
            if (! in_array($record['status'], ['pending', 'confirmed'], true)) {
                throw ValidationException::withMessages(['booking' => 'This booking can no longer be cancelled.']);
            }
            $record['status'] = 'cancelled';
            break;
        }
        unset($record);
        abort_unless($found, 404);
        $request->session()->put('demo_bookings', $bookings);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Your demo booking has been cancelled.']);

        return to_route('bookings.index');
    }

    /** @return list<DemoBooking> */
    private function bookings(Request $request): array
    {
        if (! $request->session()->has('demo_bookings')) {
            $user = $request->user();
            $records = [];
            foreach ([[1, 'confirmed', 2], [2, 'pending', 1], [3, 'cancelled', 1], [9, 'completed', 1]] as $index => [$eventId, $status, $quantity]) {
                $event = DemoEventCatalog::find($eventId);
                $fee = $event['price'] > 0 ? 5000 : 0;
                $records[] = [
                    'code' => 'DEMO-00'.($index + 1), 'event_id' => $eventId,
                    'status' => $status, 'ticket_quantity' => $quantity,
                    'name' => $user->name, 'email' => $user->email, 'phone_number' => $user->phone_number ?? '',
                    'total_price' => $event['price'] * $quantity + $fee, 'service_fee' => $fee,
                ];
            }
            $request->session()->put('demo_bookings', $records);
        }

        return $request->session()->get('demo_bookings', []);
    }

    /** @param list<DemoBooking> $bookings
     * @return list<DemoEvent>
     */
    private function events(array $bookings): array
    {
        return array_map(fn (array $event): array => [
            ...$event, 'remaining' => $this->remaining($event, $bookings),
        ], DemoEventCatalog::all());
    }

    /** @param DemoEvent $event
     * @param  list<DemoBooking>  $bookings
     */
    private function remaining(array $event, array $bookings): int
    {
        $reserved = 0;
        foreach ($bookings as $booking) {
            if ($booking['event_id'] === $event['id'] && in_array($booking['status'], ['confirmed', 'pending'], true)) {
                $reserved += $booking['ticket_quantity'];
            }
        }

        return max(0, $event['remaining'] - $reserved);
    }
}
