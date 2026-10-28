<?php

namespace Database\Factories;

use App\Models\Soap;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Soap>
 */
class SoapFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'clinician_id' => User::factory(),
            'patient_id' => User::factory(),
            'activity_plan' => fake()->sentence(),
            'session_type' => fake()->word(),
            'subjective_notes' => fake()->sentence(),
            'objective_notes' => fake()->sentence(),
            'assessment' => fake()->sentence(),
            'recommendation' => fake()->sentence(),
            'comments' => null,
            'version' => 1,
        ];
    }
}
