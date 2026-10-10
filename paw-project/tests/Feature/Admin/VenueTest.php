<?php

namespace Tests\Feature\Admin;

use App\Models\Event;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VenueTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{string, string, bool}> */
    public static function venueRoutes(): array
    {
        return [
            'index' => ['GET', 'admin.venues.index', false],
            'create' => ['GET', 'admin.venues.create', false],
            'store' => ['POST', 'admin.venues.store', false],
            'show' => ['GET', 'admin.venues.show', true],
            'edit' => ['GET', 'admin.venues.edit', true],
            'update' => ['PUT', 'admin.venues.update', true],
            'destroy' => ['DELETE', 'admin.venues.destroy', true],
        ];
    }

    #[DataProvider('venueRoutes')]
    public function test_guests_must_log_in_for_every_venue_route(string $method, string $name, bool $usesVenue): void
    {
        $venue = Venue::factory()->create();

        $this->call($method, route($name, $usesVenue ? $venue : []), $this->payload())
            ->assertRedirect(route('login'));

        $this->assertDatabaseCount('venues', 1);
    }

    #[DataProvider('venueRoutes')]
    public function test_regular_users_cannot_access_any_venue_route(string $method, string $name, bool $usesVenue): void
    {
        $venue = Venue::factory()->create();
        $this->actingAs(User::factory()->create());

        $this->call($method, route($name, $usesVenue ? $venue : []), $this->payload())
            ->assertForbidden();

        $this->assertDatabaseCount('venues', 1);
        $this->assertDatabaseHas('venues', ['id' => $venue->id, 'name' => $venue->name]);
    }

    public function test_admin_index_has_real_statistics_counts_and_paginated_venues(): void
    {
        Venue::factory()->count(7)->create();
        $venue = Venue::factory()->create(['name' => 'A Creative Hall']);
        Event::factory()->for($venue)->create();

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.venues.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/venues')
                ->has('venues.data', 6)
                ->where('venues.total', 8)
                ->where('venues.last_page', 2)
                ->where('venues.data.0.name', 'A Creative Hall')
                ->where('venues.data.0.events_count', 1)
                ->where('stats.venues', 8)
                ->where('stats.events', 1)
                ->where('stats.available', 8)
                ->where('dialog', null)
                ->where('auth.user.role', User::ROLE_ADMIN));
    }

    public function test_search_matches_names_and_addresses_and_respects_availability(): void
    {
        Venue::factory()->create(['name' => 'Creative Hall', 'address' => 'Jakarta']);
        Venue::factory()->create(['name' => 'Rooftop', 'address' => 'Creative Street']);
        Venue::factory()->create(['name' => 'Creative Ballroom', 'status' => Venue::STATUS_INACTIVE]);
        Venue::factory()->create(['name' => 'Another Hall', 'address' => 'Another Street']);

        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.venues.index', ['search' => 'Creative', 'status' => Venue::STATUS_ACTIVE]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('venues.data', 2)
                ->where('venues.total', 2)
                ->where('filters.search', 'Creative')
                ->where('filters.status', Venue::STATUS_ACTIVE)
                ->where('stats.available', 3)
                ->where('stats.unavailable', 1));
    }

    public function test_admin_can_open_create_view_and_edit_dialog_routes(): void
    {
        $venue = Venue::factory()->create();
        Event::factory()->for($venue)->create(['title' => 'Workshop']);
        $this->actingAs(User::factory()->admin()->create());

        $this->get(route('admin.venues.create'))->assertInertia(fn (Assert $page) => $page
            ->component('admin/venues')->where('dialog.mode', 'create')->where('dialog.venue', null));

        $this->get(route('admin.venues.show', $venue))->assertInertia(fn (Assert $page) => $page
            ->component('admin/venues')->where('dialog.mode', 'show')
            ->where('dialog.venue.id', $venue->id)->where('dialog.venue.events_count', 1)
            ->has('dialog.venue.events', 1)->where('dialog.venue.events.0.title', 'Workshop'));

        $this->get(route('admin.venues.edit', $venue))->assertInertia(fn (Assert $page) => $page
            ->component('admin/venues')->where('dialog.mode', 'edit')->where('dialog.venue.id', $venue->id));
    }

    public function test_admin_can_create_a_venue_using_only_validated_fields(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->post(route('admin.venues.store'), [...$this->payload(), 'id' => 900, 'events_count' => 999])
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.venues.index'));

        $this->assertDatabaseHas('venues', $this->payload());
        $this->assertDatabaseMissing('venues', ['id' => 900]);
    }

    public function test_admin_can_update_availability_and_venue_details(): void
    {
        $venue = Venue::factory()->create();
        $payload = [...$this->payload(), 'status' => Venue::STATUS_INACTIVE];

        $this->actingAs(User::factory()->admin()->create())
            ->put(route('admin.venues.update', $venue), $payload)
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.venues.index'));

        $this->assertDatabaseHas('venues', ['id' => $venue->id, ...$payload]);
    }

    public function test_invalid_venue_details_are_rejected_without_writing(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->post(route('admin.venues.store'), ['name' => '', 'address' => '', 'capacity' => 0, 'status' => 'anything'])
            ->assertSessionHasErrors(['name', 'address', 'capacity', 'status']);

        $this->assertDatabaseCount('venues', 0);
    }

    public function test_capacity_cannot_drop_below_an_existing_event_quota(): void
    {
        $venue = Venue::factory()->create(['capacity' => 250]);
        Event::factory()->for($venue)->create(['quota' => 200]);

        $this->actingAs(User::factory()->admin()->create())
            ->put(route('admin.venues.update', $venue), [...$this->payload(), 'capacity' => 100])
            ->assertSessionHasErrors('capacity');

        $this->assertSame(250, $venue->refresh()->capacity);
    }

    public function test_admin_can_delete_a_venue_without_events(): void
    {
        $venue = Venue::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->delete(route('admin.venues.destroy', $venue))
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.venues.index'));

        $this->assertModelMissing($venue);
    }

    public function test_a_venue_with_events_returns_a_clear_deletion_error(): void
    {
        $venue = Venue::factory()->create();
        Event::factory()->for($venue)->create();

        $this->actingAs(User::factory()->admin()->create())->from(route('admin.venues.index'))
            ->delete(route('admin.venues.destroy', $venue))
            ->assertRedirect(route('admin.venues.index'))->assertSessionHasErrors('venue');

        $this->assertModelExists($venue);
        $this->assertDatabaseCount('events', 1);
    }

    public function test_missing_venues_return_404_for_an_admin(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.venues.show', 999999))->assertNotFound();
    }

    public function test_unknown_roles_do_not_grant_admin_access(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'manager']))
            ->get(route('admin.venues.index'))->assertForbidden();
    }

    public function test_admin_root_renders_the_booking_dashboard(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->get(route('admin.dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')->has('bookings.data', 0));
    }

    /** @return array<string, mixed> */
    private function payload(): array
    {
        return [
            'name' => 'Creative Hall',
            'address' => 'Jl. Sudirman No. 24, Jakarta Pusat',
            'capacity' => 250,
            'status' => Venue::STATUS_ACTIVE,
        ];
    }
}
