<?php

namespace Tests\Feature;

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
        $this->post('/my-bookings/DEMO-001/cancel')->assertRedirect(route('login'));
    }

    public function test_events_and_details_show_demo_data_and_current_availability(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/events')->assertInertia(fn (Assert $page) => $page
            ->component('explore/events')->has('events', 8)
            ->where('events.0.remaining', 34)->where('auth.user.role', 'user'));
        $this->get('/events/1')->assertInertia(fn (Assert $page) => $page
            ->component('explore/event-details')->where('event.id', 1)
            ->where('event.price', 50000)->where('event.remaining', 34));
        $this->get('/events/999')->assertNotFound();
    }

    public function test_booking_uses_server_prices_persists_in_session_and_reduces_seats(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/events/1/bookings', [...$this->payload(), 'total_price' => 1, 'status' => 'completed'])
            ->assertSessionHasNoErrors()->assertRedirect(route('bookings.index'));
        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page
            ->component('explore/bookings')->has('bookings', 5)
            ->where('bookings.0.ticket_quantity', 2)->where('bookings.0.total_price', 105000)
            ->where('bookings.0.status', 'confirmed')->where('bookings.0.name', 'Demo Attendee'));
        $this->get('/events/1')->assertInertia(fn (Assert $page) => $page->where('event.remaining', 32));
        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('events', 0);
    }

    public function test_free_events_have_no_service_fee(): void
    {
        $this->actingAs(User::factory()->create())->post('/events/3/bookings', $this->payload())
            ->assertSessionHasNoErrors();
        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page
            ->where('bookings.0.total_price', 0)->where('bookings.0.service_fee', 0));
    }

    public function test_invalid_sold_out_and_past_bookings_are_rejected(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/events/1/bookings', [...$this->payload(), 'ticket_quantity' => 5, 'email' => 'invalid'])
            ->assertSessionHasErrors(['ticket_quantity', 'email']);
        foreach ([8, 9] as $id) {
            $this->post("/events/{$id}/bookings", $this->payload())->assertSessionHasErrors('ticket_quantity');
        }
        $this->post('/events/999/bookings', $this->payload())->assertNotFound();
    }

    public function test_seat_limit_is_checked_against_existing_session_reservations(): void
    {
        $this->actingAs(User::factory()->create());
        for ($i = 0; $i < 3; $i++) {
            $this->post('/events/5/bookings', [...$this->payload(), 'ticket_quantity' => 4])->assertSessionHasNoErrors();
        }
        $this->post('/events/5/bookings', $this->payload())->assertSessionHasErrors('ticket_quantity');
        $this->get('/events/5')->assertInertia(fn (Assert $page) => $page->where('event.remaining', 0));
    }

    public function test_cancellation_restores_seats_and_cannot_cancel_completed_or_unknown_passes(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/my-bookings/DEMO-001/cancel')->assertSessionHasNoErrors()->assertRedirect(route('bookings.index'));
        $this->get('/events/1')->assertInertia(fn (Assert $page) => $page->where('event.remaining', 36));
        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page->where('bookings.0.status', 'cancelled'));
        $this->post('/my-bookings/DEMO-001/cancel')->assertSessionHasErrors('booking');
        $this->post('/my-bookings/DEMO-004/cancel')->assertSessionHasErrors('booking');
        $this->post('/my-bookings/not-my-pass/cancel')->assertNotFound();
    }

    public function test_admin_role_is_shared_on_the_main_pages(): void
    {
        $this->actingAs(User::factory()->admin()->create())->get('/events')
            ->assertInertia(fn (Assert $page) => $page->where('auth.user.role', 'admin'));
    }

    /** @return array<string, int|string> */
    private function payload(): array
    {
        return ['ticket_quantity' => 2, 'name' => 'Demo Attendee', 'email' => 'attendee@example.test', 'phone_number' => '+628123456789'];
    }
}
