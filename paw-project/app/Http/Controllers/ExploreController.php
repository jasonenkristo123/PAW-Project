<?php

namespace App\Http\Controllers;

use App\Support\DemoEventCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $bookings = $this->bookings($request);

        return Inertia::render('explore/events', [
            'events' => array_values(array_filter($this->events($bookings), fn (array $event): bool => $event['date'] >= now('Asia/Jakarta')->format('Y-m-d'))),
        ]);
    }

    public function show(Request $request, int $event): Response
    {
        DemoEventCatalog::find($event);
        $bookings = $this->bookings($request);
        $events = $this->events($bookings);

        return Inertia::render('explore/event-details', [
            'event' => collect($events)->firstWhere('id', $event),
        ]);
    }

    public function myBookings(Request $request): Response
    {
        return Inertia::render('explore/bookings', [
            'bookings' => array_map(fn (array $booking): array => [
                ...$booking, 'event' => DemoEventCatalog::find($booking['event_id']),
            ], $this->bookings($request)),
        ]);
    }

    public function book(Request $request, int $event): RedirectResponse
    {
        $selected = DemoEventCatalog::find($event);
        $validated = $request->validate([
            'ticket_quantity' => ['required', 'integer', 'min:1', 'max:4'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ]);
        $quantity = $request->integer('ticket_quantity');
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
