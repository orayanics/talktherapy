<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Encounter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Encounter>
 */
class EncounterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_id' => Appointment::factory(),
            'diagnosis' => fake()->sentence(4),
            'chief_complaint' => fake()->sentence(),
            'referral_source' => fake()->company(),
            'referral_url' => null,
        ];
    }
}
