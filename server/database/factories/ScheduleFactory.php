<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
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
            'start_at' => now()->addDays(2)->startOfHour(),
            'end_at' => now()->addDays(2)->startOfHour()->addHour(),
            'recurrence_rule' => null,
            'timezone' => 'UTC',
        ];
    }
}
