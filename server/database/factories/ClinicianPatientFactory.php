<?php

namespace Database\Factories;

use App\Models\ClinicianPatient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClinicianPatient>
 */
class ClinicianPatientFactory extends Factory
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
            'first_completed_at' => now(),
        ];
    }
}
