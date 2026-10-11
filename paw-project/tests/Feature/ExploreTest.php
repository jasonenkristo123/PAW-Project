<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExploreTest extends TestCase
{
    use RefreshDatabase;

    public function test_explore_pages_require_authentication(): void
    {
        foreach (['/events', '/events/1', '/my-bookings'] as $url) {
            $this->get($url)->assertRedirect(route('login'));
        }
        $this->post('/events/1/bookings')->assertRedirect(route('login'));
        $this->post('/my-bookings/unknown/cancel')->assertRedirect(route('login'));
    }

    public function test_empty_database_shows_empty_events_and_bookings_without_demo_records(): void
    {
        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('featuredEvents', 0));
        $this->actingAs(User::factory()->create())->withSession(['demo_bookings' => [['code' => 'DEMO-001']]])
            ->get('/events')->assertInertia(fn (Assert $page) => $page->has('events', 0)->has('categories', 0));
        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page->has('bookings', 0));
        $this->get('/events/1')->assertNotFound();
        $this->post('/events/1/bookings', $this->payload())->assertNotFound();
    }

    public function test_landing_and_explore_only_show_published_upcoming_database_events(): void
    {
        $category = Category::factory()->create(['name' => 'Outdoor Adventures']);
        $event = Event::factory()->for($category)->create(['status' => 'published', 'quota' => 20]);
        Booking::factory()->for($event)->create(['ticket_quantity' => 3, 'status' => 'pending']);
        Booking::factory()->for($event)->create(['ticket_quantity' => 2, 'status' => 'confirmed']);
        Booking::factory()->for($event)->create(['ticket_quantity' => 4, 'status' => 'cancelled']);
        foreach (['draft', 'cancelled', 'completed'] as $status) {
            Event::factory()->create(['status' => $status]);
        }
        $past = Event::factory()->create(['status' => 'published', 'date' => now()->subDay()]);
        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('featuredEvents', 1)
            ->where('featuredEvents.0.id', $event->id)->where('featuredEvents.0.remaining', 15));
        $this->actingAs(User::factory()->create())->get('/events')->assertInertia(fn (Assert $page) => $page
            ->has('events', 1)->where('events.0.id', $event->id)->where('categories.0', 'Outdoor Adventures'));
        $this->get('/events/'.$event->id)->assertInertia(fn (Assert $page) => $page->where('event.remaining', 15)
            ->where('event.address', $event->venue->address));
        foreach (Event::whereKeyNot($event->id)->get() as $hidden) {
            $this->get('/events/'.$hidden->id)->assertNotFound();
        }
    }

    public function test_booking_persists_attendee_details_prices_and_is_visible_to_admin(): void
    {
        $event = Event::factory()->create(['status' => 'published', 'price' => '50000', 'quota' => 10]);
        $user = User::factory()->create();
        $this->actingAs($user)->post('/events/'.$event->id.'/bookings', [...$this->payload(), 'total_price' => 1, 'status' => 'cancelled'])
            ->assertSessionHasNoErrors()->assertRedirect(route('bookings.index'));
        $booking = Booking::query()->sole();
        $this->assertSame('105000.00', $booking->total_price);
        $this->assertSame('confirmed', $booking->status);
        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page->has('bookings', 1)
            ->where('bookings.0.name', 'Event Attendee')->where('bookings.0.event.remaining', 8));
        $this->actingAs(User::factory()->admin()->create())->get('/admin?search=attendee@example.test')
            ->assertInertia(fn (Assert $page) => $page->has('bookings.data', 1)
                ->where('bookings.data.0.attendee_name', 'Event Attendee'));
        $this->patch(route('admin.bookings.update', $booking), ['status' => 'cancelled'])->assertSessionHasNoErrors();
        $this->actingAs($user)->get('/my-bookings')->assertInertia(fn (Assert $page) => $page
            ->where('bookings.0.status', 'cancelled')->where('bookings.0.event.remaining', 10));
    }

    public function test_booking_rejects_hidden_past_and_sold_out_events_and_invalid_input(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (['draft', 'cancelled', 'completed'] as $status) {
            $event = Event::factory()->create(['status' => $status]);
            $this->post('/events/'.$event->id.'/bookings', $this->payload())->assertSessionHasErrors('ticket_quantity');
        }
        $past = Event::factory()->create(['status' => 'published', 'date' => now()->subDay()]);
        $this->post('/events/'.$past->id.'/bookings', $this->payload())->assertSessionHasErrors('ticket_quantity');
        $event = Event::factory()->create(['status' => 'published', 'quota' => 2]);
        Booking::factory()->for($event)->create(['ticket_quantity' => 2]);
        $this->post('/events/'.$event->id.'/bookings', $this->payload())->assertSessionHasErrors('ticket_quantity');
        $this->post('/events/'.$event->id.'/bookings', [...$this->payload(), 'ticket_quantity' => 5, 'email' => 'invalid'])
            ->assertSessionHasErrors(['ticket_quantity', 'email']);
    }

    public function test_cancellation_restores_capacity_for_everyone_and_is_owned_by_user(): void
    {
        $event = Event::factory()->create(['status' => 'published', 'quota' => 2]);
        $booking = Booking::factory()->for($event)->create(['ticket_quantity' => 2, 'status' => 'confirmed']);
        $this->actingAs(User::factory()->create())->post('/my-bookings/'.$booking->booking_code.'/cancel')->assertNotFound();
        $this->actingAs($booking->user)->post('/my-bookings/'.$booking->booking_code.'/cancel')->assertSessionHasNoErrors();
        $this->post('/my-bookings/'.$booking->booking_code.'/cancel')->assertSessionHasErrors('booking');
        $this->get('/events/'.$event->id)->assertInertia(fn (Assert $page) => $page->where('event.remaining', 2));
        $this->assertSame('cancelled', $booking->refresh()->status);
    }

    public function test_admin_event_updates_and_removal_reach_landing_and_explore(): void
    {
        $event = Event::factory()->create(['status' => 'published']);
        $this->actingAs(User::factory()->admin()->create());
        $this->put(route('admin.events.update', $event), [
            'category_id' => $event->category_id, 'venue_id' => $event->venue_id,
            'title' => 'Updated by admin', 'description' => 'New description',
            'date' => $event->date->format('Y-m-d'), 'time' => '12:30',
            'price' => '12345.50', 'quota' => 40, 'status' => 'published',
        ])->assertSessionHasNoErrors();
        $this->get('/')->assertInertia(fn (Assert $page) => $page->where('featuredEvents.0.title', 'Updated by admin'));
        $this->get('/events/'.$event->id)->assertInertia(fn (Assert $page) => $page->where('event.price', 12345.5));
        $this->delete(route('admin.events.destroy', $event))->assertSessionHasNoErrors();
        $this->get('/events')->assertInertia(fn (Assert $page) => $page->has('events', 0));
        $this->get('/')->assertInertia(fn (Assert $page) => $page->has('featuredEvents', 0));
    }

    /** @return array<string, int|string> */
    private function payload(): array
    {
        return ['ticket_quantity' => 2, 'name' => 'Event Attendee', 'email' => 'attendee@example.test', 'phone_number' => '+628123456789'];
    }
}
