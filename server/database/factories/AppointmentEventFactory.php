<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\AppointmentEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppointmentEvent>
 */
class AppointmentEventFactory extends Factory
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
            'actor_type' => 'patient',
            'actor_id' => fn (array $attributes): string => Appointment::query()->findOrFail($attributes['appointment_id'])->patient_id,
            'from_status' => null,
            'to_status' => 'PENDING',
            'reason' => null,
            'created_at' => now(),
        ];
    }
}
