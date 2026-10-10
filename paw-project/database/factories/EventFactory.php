<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Event;
use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Event> */
class EventFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'venue_id' => Venue::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'whats_included' => 'Event admission and refreshments.',
            'what_to_bring' => 'Your booking confirmation.',
            'date' => fake()->dateTimeBetween('+1 week', '+3 months')->format('Y-m-d'),
            'time' => '09:00:00',
            'price' => fake()->numberBetween(50000, 500000),
            'quota' => 50,
            'status' => Event::STATUS_DRAFT,
        ];
    }
}
