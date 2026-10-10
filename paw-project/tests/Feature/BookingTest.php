<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function createPublishedEvent(array $attributes = []): Event
    {
        $category = Category::factory()->create(['status' => Category::STATUS_ACTIVE]);
        $venue = Venue::factory()->create(['capacity' => 200, 'status' => Venue::STATUS_ACTIVE]);

        return Event::factory()->create([
            'category_id' => $category->id,
            'venue_id' => $venue->id,
            'status' => Event::STATUS_PUBLISHED,
            'price' => '50000.00',
            'quota' => 20,
            'date' => now('Asia/Jakarta')->addDays(7)->format('Y-m-d'),
            'time' => '10:00:00',
            ...$attributes,
        ]);
    }

    public function test_user_can_book_real_event_and_it_persists_in_database(): void
    {
        $user = User::factory()->create(['name' => 'Rina Sasmita', 'email' => 'rina@example.test']);
        $event = $this->createPublishedEvent();

        $response = $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 2,
            'name' => 'Rina Sasmita',
            'email' => 'rina@example.test',
            'phone_number' => '+628123456789',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'ticket_quantity' => 2,
            'status' => Booking::STATUS_CONFIRMED,
            'total_price' => '105000.00', // (50,000 * 2) + 5,000 service fee
        ]);

        $booking = Booking::first();
        $this->assertNotNull($booking);
        $this->assertStringStartsWith('BK-', $booking->booking_code);
    }

    public function test_free_event_booking_has_no_service_fee_in_database(): void
    {
        $user = User::factory()->create();
        $event = $this->createPublishedEvent(['price' => '0.00']);

        $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 3,
            'name' => 'Budi Santoso',
            'email' => 'budi@example.test',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'ticket_quantity' => 3,
            'total_price' => '0.00',
        ]);
    }

    public function test_booking_fails_when_seats_exceed_quota(): void
    {
        $user = User::factory()->create();
        $event = $this->createPublishedEvent(['quota' => 2]);

        $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 3,
            'name' => 'Testing Overbook',
            'email' => 'overbook@example.test',
        ])->assertSessionHasErrors(['ticket_quantity']);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_user_can_view_database_bookings_in_my_bookings_page(): void
    {
        $user = User::factory()->create();
        $event = $this->createPublishedEvent(['title' => 'Flutter Development Workshop']);

        $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 1,
            'name' => $user->name,
            'email' => $user->email,
        ])->assertSessionHasNoErrors();

        $booking = Booking::where('user_id', $user->id)->firstOrFail();

        $this->get('/my-bookings')->assertInertia(fn (Assert $page) => $page
            ->component('explore/bookings')
            ->has('bookings', 1)
            ->where('bookings.0.code', $booking->booking_code)
            ->where('bookings.0.event.title', 'Flutter Development Workshop')
            ->where('bookings.0.status', 'confirmed')
            ->where('bookings.0.ticket_quantity', 1));
    }

    public function test_user_can_cancel_their_database_booking(): void
    {
        $user = User::factory()->create();
        $event = $this->createPublishedEvent();

        $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 2,
            'name' => $user->name,
            'email' => $user->email,
        ]);

        $booking = Booking::where('user_id', $user->id)->firstOrFail();
        $this->assertEquals(Booking::STATUS_CONFIRMED, $booking->status);

        $this->actingAs($user)
            ->post("/my-bookings/{$booking->booking_code}/cancel")
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CANCELLED,
        ]);
    }

    public function test_user_cannot_cancel_another_users_booking(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $event = $this->createPublishedEvent();

        $this->actingAs($userA)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 1,
            'name' => $userA->name,
            'email' => $userA->email,
        ]);

        $booking = Booking::where('user_id', $userA->id)->firstOrFail();

        // User B tries to cancel User A's booking
        $this->actingAs($userB)
            ->post("/my-bookings/{$booking->booking_code}/cancel")
            ->assertNotFound();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }

    public function test_admin_can_see_user_booking_in_dashboard(): void
    {
        $user = User::factory()->create(['name' => 'Customer Satu', 'email' => 'customer@example.test']);
        $admin = User::factory()->admin()->create();
        $event = $this->createPublishedEvent(['title' => 'Jakarta Tech Meetup']);

        $this->actingAs($user)->post("/events/{$event->id}/bookings", [
            'ticket_quantity' => 2,
            'name' => $user->name,
            'email' => $user->email,
        ]);

        $booking = Booking::firstOrFail();

        // Admin visits dashboard
        $this->actingAs($admin)->get('/admin')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->where('stats.bookings', 1)
                ->where('stats.confirmed', 1)
                ->has('bookings.data', 1)
                ->where('bookings.data.0.booking_code', $booking->booking_code)
                ->where('bookings.data.0.user.name', 'Customer Satu'));
    }
}
