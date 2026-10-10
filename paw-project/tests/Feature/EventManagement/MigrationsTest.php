<?php

namespace Tests\Feature\EventManagement;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigrationsTest extends TestCase
{
    use DatabaseMigrations;

    private const MIGRATIONS = [
        'database/migrations/2026_10_10_000001_add_event_management_fields_to_users_table.php',
        'database/migrations/2026_10_10_000002_create_categories_table.php',
        'database/migrations/2026_10_10_000003_create_venues_table.php',
        'database/migrations/2026_10_10_000004_create_events_table.php',
        'database/migrations/2026_10_10_000005_create_bookings_table.php',
    ];

    public function test_migrations_can_roll_back_and_reapply_without_removing_existing_users(): void
    {
        $user = User::factory()->create(['phone_number' => '+6281234567890']);
        Booking::factory()->for($user)->create();

        $this->artisan('migrate:rollback', ['--path' => self::MIGRATIONS, '--force' => true])
            ->assertExitCode(0);

        foreach (['categories', 'venues', 'events', 'bookings'] as $table) {
            $this->assertFalse(Schema::hasTable($table));
        }

        $this->assertFalse(Schema::hasColumn('users', 'phone_number'));
        $this->assertFalse(Schema::hasColumn('users', 'role'));
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $user->email]);

        $this->artisan('migrate', ['--path' => self::MIGRATIONS, '--force' => true])
            ->assertExitCode(0);

        $this->assertSame(User::ROLE_USER, $user->refresh()->role);
        $this->assertNull($user->phone_number);
        $this->assertTrue(Booking::factory()->for($user)->create()->exists);
    }

    public function test_database_defaults_are_applied_without_eloquent_model_events(): void
    {
        $booking = Booking::factory()->create();
        $attributes = $booking->getAttributes();
        unset($attributes['id'], $attributes['status'], $attributes['ticket_quantity'], $attributes['booking_date']);
        $attributes['booking_code'] = 'DIRECT-INSERT-001';

        $id = DB::table('bookings')->insertGetId($attributes);
        $inserted = Booking::findOrFail($id);

        $this->assertSame(Booking::STATUS_PENDING, $inserted->status);
        $this->assertSame(1, $inserted->ticket_quantity);
        $this->assertNotNull($inserted->booking_date);
    }
}
