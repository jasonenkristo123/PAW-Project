<?php

namespace Database\Factories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Venue> */
class VenueFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Hall',
            'address' => fake()->address(),
            'capacity' => fake()->numberBetween(100, 1000),
            'status' => Venue::STATUS_ACTIVE,
        ];
    }
}
