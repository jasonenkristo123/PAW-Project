<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_dashboard_actions_are_admin_only(): void
    {
        $booking = Booking::factory()->create();
        $routes = [['GET', '/admin'], ['GET', '/admin/bookings'], ['GET', '/admin/bookings/export'],
            ['GET', '/admin/bookings/'.$booking->id], ['PATCH', '/admin/bookings/'.$booking->id], ['DELETE', '/admin/bookings/'.$booking->id]];
        foreach ($routes as [$method, $url]) {
            $this->call($method, $url, ['status' => 'confirmed'])->assertRedirect(route('login'));
        }
        $this->actingAs(User::factory()->create());
        foreach ($routes as [$method, $url]) {
            $this->call($method, $url, ['status' => 'confirmed'])->assertForbidden();
        }
        $this->assertModelExists($booking);
        $this->assertSame('pending', $booking->refresh()->status);
    }

    public function test_dashboard_contains_real_statistics_and_paginated_related_bookings(): void
    {
        $event = Event::factory()->create();
        Booking::factory()->for($event)->count(6)->create(['status' => 'confirmed']);
        Booking::factory()->for($event)->create(['status' => 'cancelled']);
        $this->actingAs(User::factory()->admin()->create())->get('/admin')
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')->where('stats.events', 1)->where('stats.categories', 1)
            ->where('stats.venues', 1)->where('stats.bookings', 7)->where('stats.confirmed', 6)
            ->where('stats.cancelled', 1)->has('bookings.data', 5)->where('bookings.last_page', 2)
            ->has('bookings.data.0.user.email')->has('bookings.data.0.event.venue.name')
            ->where('selectedBooking', null));
        $this->get('/admin?page=2')->assertInertia(fn (Assert $page) => $page->has('bookings.data', 2));
    }

    public function test_search_event_and_status_filters_compose_and_do_not_change_summary_counts(): void
    {
        $event = Event::factory()->create(['title' => 'Design Workshop']);
        $user = User::factory()->create(['name' => 'Nadia Putri', 'email' => 'nadia@example.test']);
        $matching = Booking::factory()->for($event)->for($user)->create(['status' => 'confirmed', 'booking_code' => 'AGD-10284']);
        Booking::factory()->for($event)->for($user)->create(['status' => 'pending']);
        Booking::factory()->create(['status' => 'confirmed']);
        $this->actingAs(User::factory()->admin()->create());
        foreach (['Nadia', 'nadia@example.test', 'AGD-10284', 'Design'] as $search) {
            $this->get(route('admin.dashboard', ['search' => $search, 'status' => 'confirmed', 'event_id' => $event->id]))
                ->assertInertia(fn (Assert $page) => $page->has('bookings.data', 1)
                    ->where('bookings.data.0.id', $matching->id)->where('stats.bookings', 3)
                    ->where('filters.event_id', (string) $event->id));
        }
    }

    public function test_booking_details_load_customer_event_and_venue(): void
    {
        $booking = Booking::factory()->create();
        $this->actingAs(User::factory()->admin()->create())->get(route('admin.bookings.show', $booking))
            ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard')
                ->where('selectedBooking.id', $booking->id)->has('selectedBooking.user.email')
                ->has('selectedBooking.event.venue.address')->has('selectedBooking.event.category.name'));
        $this->get('/admin/bookings/999999')->assertNotFound();
    }

    public function test_status_update_only_changes_status_and_preserves_the_query_filter(): void
    {
        $booking = Booking::factory()->create(['status' => 'pending']);
        $total = $booking->total_price;
        $this->actingAs(User::factory()->admin()->create())
            ->patch(route('admin.bookings.update', ['booking' => $booking, 'status' => 'pending', 'search' => 'BK-']), ['status' => 'confirmed', 'total_price' => 1])
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.bookings.show', ['booking' => $booking, 'search' => 'BK-', 'status' => 'pending', 'event_id' => '']));
        $this->assertSame('confirmed', $booking->refresh()->status);
        $this->assertSame($total, $booking->total_price);
        $this->patch(route('admin.bookings.update', $booking), ['status' => 'anything'])->assertSessionHasErrors('status');
        $this->assertSame('confirmed', $booking->refresh()->status);
    }

    public function test_cancelled_bookings_cannot_be_restored_when_the_event_is_full(): void
    {
        $event = Event::factory()->create(['quota' => 2]);
        Booking::factory()->for($event)->create(['ticket_quantity' => 2, 'status' => 'confirmed']);
        $booking = Booking::factory()->for($event)->create(['status' => 'cancelled']);
        $this->actingAs(User::factory()->admin()->create());
        foreach (['pending', 'confirmed'] as $status) {
            $this->patch(route('admin.bookings.update', $booking), ['status' => $status])->assertSessionHasErrors('status');
        }
        $this->assertSame('cancelled', $booking->refresh()->status);
    }

    public function test_restoration_succeeds_after_cancellation_frees_capacity(): void
    {
        $event = Event::factory()->create(['quota' => 1]);
        $active = Booking::factory()->for($event)->create(['status' => 'confirmed']);
        $cancelled = Booking::factory()->for($event)->create(['status' => 'cancelled']);
        $this->actingAs(User::factory()->admin()->create());
        $this->patch(route('admin.bookings.update', $active), ['status' => 'cancelled'])->assertSessionHasNoErrors();
        $this->patch(route('admin.bookings.update', $cancelled), ['status' => 'confirmed'])->assertSessionHasNoErrors();
        $this->assertSame('confirmed', $cancelled->refresh()->status);
    }

    public function test_admin_can_delete_a_booking_without_deleting_its_user_or_event(): void
    {
        $booking = Booking::factory()->create();
        $this->actingAs(User::factory()->admin()->create())->delete(route('admin.bookings.destroy', $booking))
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.dashboard', ['search' => '', 'status' => '', 'event_id' => '']));
        $this->assertModelMissing($booking);
        $this->assertDatabaseHas('users', ['id' => $booking->user_id]);
        $this->assertDatabaseHas('events', ['id' => $booking->event_id]);
    }

    public function test_csv_export_respects_filters_and_escapes_spreadsheet_formulas(): void
    {
        $user = User::factory()->create(['name' => '=HYPERLINK("malicious")']);
        $booking = Booking::factory()->for($user)->create(['status' => 'confirmed', 'booking_code' => 'EXPORT-ME']);
        Booking::factory()->create(['status' => 'pending', 'booking_code' => 'EXCLUDE-ME']);
        $response = $this->actingAs(User::factory()->admin()->create())->get('/admin/bookings/export?status=confirmed');
        $response->assertOk()->assertDownload('agendain-bookings-'.now()->format('Y-m-d').'.csv');
        $csv = $response->streamedContent();
        $this->assertStringContainsString($booking->booking_code, $csv);
        $this->assertStringNotContainsString('EXCLUDE-ME', $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }

    public function test_invalid_filters_are_rejected(): void
    {
        $this->actingAs(User::factory()->admin()->create())->get('/admin?status=invalid&event_id=999999&page=0')
            ->assertSessionHasErrors(['status', 'event_id', 'page']);
    }
}
