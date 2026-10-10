<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use Brick\Math\BigDecimal;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Booking> */
class BookingFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'booking_code' => 'BK-'.Str::ulid(),
            'user_id' => User::factory(),
            'event_id' => Event::factory()->state(['status' => Event::STATUS_PUBLISHED]),
            'ticket_quantity' => 1,
            'total_price' => fn (array $attributes): string => (string) BigDecimal::of(
                Event::query()->whereKey($attributes['event_id'])->firstOrFail()->price
            )->multipliedBy($attributes['ticket_quantity'])->toScale(2),
            'status' => Booking::STATUS_PENDING,
            'booking_date' => now(),
        ];
    }
}
