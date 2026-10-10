<?php

namespace Tests\Feature\EventManagement;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Event;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_profile_fields_preserve_registration_defaults_and_guard_the_role(): void
    {
        $user = User::create([
            'name' => 'Event Guest',
            'email' => 'guest@example.com',
            'phone_number' => '+6281234567890',
            'password' => 'password',
            'role' => User::ROLE_ADMIN,
        ])->refresh();

        $this->assertSame('+6281234567890', $user->phone_number);
        $this->assertSame(User::ROLE_USER, $user->role);
        $this->assertNull(User::factory()->create()->phone_number);
        $this->assertArrayNotHasKey('password', $user->toArray());

        $user->role = User::ROLE_ADMIN;
        $user->save();

        $this->assertSame(User::ROLE_ADMIN, $user->refresh()->role);
    }

    public function test_all_schema_relationships_can_be_loaded_in_both_directions(): void
    {
        $category = Category::factory()->create();
        $venue = Venue::factory()->create();
        $user = User::factory()->create();
        $event = Event::factory()->for($category)->for($venue)->create();
        $booking = Booking::factory()->for($event)->for($user)->create();

        $this->assertTrue($event->category->is($category));
        $this->assertTrue($event->venue->is($venue));
        $this->assertTrue($category->events->sole()->is($event));
        $this->assertTrue($venue->events->sole()->is($event));
        $this->assertTrue($event->bookings->sole()->is($booking));
        $this->assertTrue($user->bookings->sole()->is($booking));
        $this->assertTrue($booking->user->is($user));
        $this->assertTrue($booking->event->is($event));

        $loaded = Booking::with(['user', 'event.category', 'event.venue'])->findOrFail($booking->id);

        $this->assertSame($category->name, $loaded->event->category->name);
        $this->assertSame($venue->address, $loaded->event->venue->address);
    }

    public function test_dates_and_money_round_trip_with_the_expected_json_types(): void
    {
        $event = Event::factory()->create([
            'date' => '2026-12-15',
            'time' => '14:30:00',
            'price' => '150000.35',
            'quota' => '50',
        ])->refresh();

        $booking = Booking::factory()->for($event)->create([
            'ticket_quantity' => 3,
            'booking_date' => '2026-10-10 09:00:00',
        ])->refresh();

        $this->assertSame('2026-12-15', $event->date->format('Y-m-d'));
        $this->assertSame('2026-12-15', $event->toArray()['date']);
        $this->assertSame('14:30:00', $event->time);
        $this->assertSame('150000.35', $event->price);
        $this->assertSame(50, $event->quota);
        $this->assertIsInt($event->venue->capacity);
        $this->assertSame(3, $booking->ticket_quantity);
        $this->assertSame('450001.05', $booking->total_price);
        $this->assertSame('450001.05', $booking->toArray()['total_price']);
        $this->assertSame('2026-10-10 09:00:00', $booking->booking_date->format('Y-m-d H:i:s'));
    }

    public function test_creating_bookings_through_a_user_generates_references_and_defaults(): void
    {
        $this->travelTo(now()->startOfSecond());
        $user = User::factory()->create();
        $event = Event::factory()->create();
        $attributes = ['event_id' => $event->id, 'total_price' => $event->price];

        $first = $user->bookings()->create($attributes)->refresh();
        $second = $user->bookings()->create($attributes)->refresh();

        $this->assertMatchesRegularExpression('/^BK-[0-9A-HJKMNP-TV-Z]{26}$/', $first->booking_code);
        $this->assertNotSame($first->booking_code, $second->booking_code);
        $this->assertTrue($first->booking_date->equalTo(now()));
        $this->assertSame(1, $first->ticket_quantity);
        $this->assertSame(Booking::STATUS_PENDING, $first->status);
        $this->assertSame(Event::STATUS_DRAFT, $event->status);
        $this->assertSame(Category::STATUS_ACTIVE, $event->category->status);
        $this->assertSame(Venue::STATUS_ACTIVE, $event->venue->status);

        $originalCode = $first->booking_code;
        $first->update(['status' => Booking::STATUS_CONFIRMED]);

        $this->assertSame($originalCode, $first->refresh()->booking_code);
    }

    public function test_explicit_booking_references_and_dates_are_preserved(): void
    {
        $event = Event::factory()->create();
        $booking = User::factory()->create()->bookings()->create([
            'event_id' => $event->id,
            'booking_code' => 'IMPORTED-BOOKING-001',
            'booking_date' => '2026-10-01 10:30:00',
            'total_price' => $event->price,
        ])->refresh();

        $this->assertSame('IMPORTED-BOOKING-001', $booking->booking_code);
        $this->assertSame('2026-10-01 10:30:00', $booking->booking_date->format('Y-m-d H:i:s'));
    }

    public function test_the_database_rejects_duplicate_booking_codes(): void
    {
        $booking = Booking::factory()->create();

        $this->expectException(QueryException::class);

        Booking::factory()->create(['booking_code' => $booking->booking_code]);
    }

    /** @return array<string, array{string}> */
    public static function referencedParents(): array
    {
        return [
            'category with events' => ['category'],
            'venue with events' => ['venue'],
            'event with bookings' => ['event'],
            'user with bookings' => ['user'],
        ];
    }

    #[DataProvider('referencedParents')]
    public function test_the_database_protects_referenced_records_from_deletion(string $parent): void
    {
        $booking = Booking::factory()->create();
        $record = match ($parent) {
            'category' => $booking->event->category,
            'venue' => $booking->event->venue,
            'event' => $booking->event,
            'user' => $booking->user,
        };

        $this->expectException(QueryException::class);

        $record->delete();
    }

    #[DataProvider('referencedParents')]
    public function test_the_database_rejects_missing_foreign_keys(string $parent): void
    {
        $this->expectException(QueryException::class);

        match ($parent) {
            'category' => Event::factory()->create(['category_id' => 999999]),
            'venue' => Event::factory()->create(['venue_id' => 999999]),
            'event' => Booking::factory()->create(['event_id' => 999999, 'total_price' => '100.00']),
            'user' => Booking::factory()->create(['user_id' => 999999]),
        };
    }
}
