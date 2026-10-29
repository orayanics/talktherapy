<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slot_id' => Slot::factory(),
            'patient_id' => User::factory(),
            'clinician_id' => fn (array $attributes): string => Slot::query()->findOrFail($attributes['slot_id'])->clinician_id,
            'status' => 'PENDING',
            'booked_at' => now(),
            'confirmed_at' => null,
            'cancelled_at' => null,
            'completed_at' => null,
            'room_id' => null,
        ];
    }
}
