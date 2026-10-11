<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_event_action_requires_an_admin(): void
    {
        $event = Event::factory()->create();
        $actions = [
            ['GET', 'index', []], ['GET', 'create', []], ['POST', 'store', []],
            ['GET', 'show', $event], ['GET', 'edit', $event],
            ['PUT', 'update', $event], ['DELETE', 'destroy', $event],
        ];
        foreach ($actions as [$method, $action, $parameters]) {
            $this->call($method, route('admin.events.'.$action, $parameters))
                ->assertRedirect(route('login'));
        }
        $this->actingAs(User::factory()->create());
        foreach ($actions as [$method, $action, $parameters]) {
            $this->call($method, route('admin.events.'.$action, $parameters))->assertForbidden();
        }
        $this->assertModelExists($event);
    }

    public function test_event_list_filters_pagination_and_ticket_counts_use_database_records(): void
    {
        $event = Event::factory()->create(['title' => 'Database workshop', 'status' => 'published']);
        Booking::factory()->for($event)->create(['ticket_quantity' => 3, 'status' => 'pending']);
        Booking::factory()->for($event)->create(['ticket_quantity' => 2, 'status' => 'confirmed']);
        Booking::factory()->for($event)->create(['ticket_quantity' => 4, 'status' => 'cancelled']);
        Event::factory()->count(6)->create();
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.events.index'))
            ->assertInertia(fn (Assert $page) => $page->component('admin/events')
                ->has('events.data', 6)->where('events.total', 7)->where('stats.events', 7));
        $this->get(route('admin.events.index', [
            'search' => 'Database', 'category_id' => $event->category_id, 'status' => 'published',
        ]))->assertInertia(fn (Assert $page) => $page->has('events.data', 1)
            ->where('events.data.0.id', $event->id)->where('events.data.0.sold_tickets', 5));
    }

    public function test_admin_can_create_read_and_update_an_event(): void
    {
        $this->actingAs(User::factory()->admin()->create());
        $payload = $this->payload();
        $this->get(route('admin.events.create'))->assertInertia(fn (Assert $page) => $page->where('dialog.mode', 'create'));
        $this->post(route('admin.events.store'), [...$payload, 'id' => 900])
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.events.index'));
        $event = Event::query()->sole();
        $this->assertNotSame(900, $event->id);
        $this->assertDatabaseHas('events', ['id' => $event->id, 'title' => $payload['title'], 'quota' => 50]);
        $this->get(route('admin.events.show', $event))->assertInertia(fn (Assert $page) => $page
            ->where('dialog.mode', 'show')->where('dialog.event.id', $event->id)
            ->has('dialog.event.venue.address')->has('dialog.event.category.name'));
        $this->get(route('admin.events.edit', $event))->assertInertia(fn (Assert $page) => $page
            ->where('dialog.mode', 'edit')->where('dialog.event.id', $event->id));
        $this->put(route('admin.events.update', $event), [...$payload, 'title' => 'Updated workshop', 'status' => 'draft'])
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.events.index'));
        $this->assertDatabaseHas('events', ['id' => $event->id, 'title' => 'Updated workshop', 'status' => 'draft']);
    }

    public function test_invalid_event_fields_are_rejected_without_writing(): void
    {
        $payload = $this->payload();
        $this->actingAs(User::factory()->admin()->create())
            ->post(route('admin.events.store'), [...$payload,
                'category_id' => 999999, 'venue_id' => 999999, 'title' => '',
                'date' => 'invalid', 'time' => '25:99', 'price' => -1, 'quota' => 0, 'status' => 'invalid',
            ])->assertSessionHasErrors(['category_id', 'venue_id', 'title', 'date', 'time', 'price', 'quota', 'status']);
        $this->assertDatabaseCount('events', 0);
        $this->post(route('admin.events.store'), [...$payload, 'quota' => 101])->assertSessionHasErrors('quota');
        $this->post(route('admin.events.store'), [...$payload, 'venue_id' => ['invalid']])->assertSessionHasErrors('venue_id');
        $this->post(route('admin.events.store'), [...$payload, 'price' => '1.234'])->assertSessionHasErrors('price');
    }

    public function test_quota_cannot_drop_below_reserved_tickets(): void
    {
        $payload = $this->payload();
        $event = Event::factory()->create($payload);
        Booking::factory()->for($event)->create(['status' => 'pending', 'ticket_quantity' => 3]);
        Booking::factory()->for($event)->create(['status' => 'confirmed', 'ticket_quantity' => 2]);
        Booking::factory()->for($event)->create(['status' => 'cancelled', 'ticket_quantity' => 4]);
        $this->actingAs(User::factory()->admin()->create())
            ->put(route('admin.events.update', $event), [...$payload, 'quota' => 4])->assertSessionHasErrors('quota');
        $this->assertSame(50, $event->refresh()->quota);
        $this->put(route('admin.events.update', $event), [...$payload, 'quota' => 5])->assertSessionHasNoErrors();
        $this->assertSame(5, $event->refresh()->quota);
    }

    public function test_existing_inactive_assignments_remain_available_when_editing(): void
    {
        $event = Event::factory()->create();
        $event->category->update(['status' => Category::STATUS_INACTIVE]);
        $event->venue->update(['status' => Venue::STATUS_INACTIVE]);
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.events.edit', $event))
            ->assertInertia(fn (Assert $page) => $page->where('categories.0.id', $event->category_id)
                ->where('venues.0.id', $event->venue_id));
    }

    public function test_admin_can_delete_unbooked_events_but_booked_events_are_preserved(): void
    {
        $event = Event::factory()->create();
        $this->actingAs(User::factory()->admin()->create())->delete(route('admin.events.destroy', $event))
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.events.index'));
        $this->assertModelMissing($event);
        $booking = Booking::factory()->create(['status' => 'cancelled']);
        $this->from(route('admin.events.index'))->delete(route('admin.events.destroy', $booking->event))
            ->assertSessionHasErrors('event');
        $this->assertModelExists($booking->event);
        $this->assertModelExists($booking);
    }

    private function payload(): array
    {
        return [
            'category_id' => Category::factory()->create()->id,
            'venue_id' => Venue::factory()->create(['capacity' => 100])->id,
            'title' => 'Database workshop', 'description' => 'Learn together.',
            'whats_included' => 'Materials', 'what_to_bring' => 'Laptop',
            'date' => '2026-12-01', 'time' => '09:00', 'price' => '50000',
            'quota' => 50, 'status' => 'published',
        ];
    }
}
