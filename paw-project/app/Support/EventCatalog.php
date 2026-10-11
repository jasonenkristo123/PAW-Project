<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;

class EventCatalog
{
    /** @return Builder<Event> */
    public function query(): Builder
    {
        return Event::query()->with(['category', 'venue'])->withSum([
            'bookings as reserved_tickets' => fn (Builder $query) => $query
                ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED]),
        ], 'ticket_quantity');
    }

    /** @return Builder<Event> */
    public function upcoming(): Builder
    {
        return $this->query()->where('status', Event::STATUS_PUBLISHED)
            ->where('date', '>=', now('Asia/Jakarta')->format('Y-m-d'))
            ->orderBy('date')->orderBy('time')->orderBy('id');
    }

    /** @return array<string, mixed> */
    public function present(Event $event): array
    {
        return [
            'id' => $event->id,
            'title' => $event->title,
            'status' => $event->status,
            'discoverable' => $event->status === Event::STATUS_PUBLISHED
                && $event->date->format('Y-m-d') >= now('Asia/Jakarta')->format('Y-m-d'),
            'category' => $event->category->name,
            'tagline' => $event->description,
            'date' => $event->date->format('Y-m-d'),
            'time' => substr($event->time, 0, 5),
            'venue' => $event->venue->name,
            'address' => $event->venue->address,
            'price' => (float) $event->price,
            'quota' => $event->quota,
            'remaining' => max(0, $event->quota - (int) $event->getAttribute('reserved_tickets')),
            'image' => '/images/events/'.(match ($event->category->name) {
                'Workshop' => 'workshop', 'Music' => 'music', 'Technology' => 'technology',
                'Competition' => 'competition', 'Seminar' => 'seminar', default => 'coffee',
            }).'.jpg',
            'organizer' => 'Agendain',
            'description' => $event->description,
            'included' => $event->whats_included ? explode("\n", $event->whats_included) : [],
            'bring' => $event->what_to_bring ? explode("\n", $event->what_to_bring) : [],
        ];
    }
}
