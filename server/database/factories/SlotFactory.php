<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\Slot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Slot>
 */
class SlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'schedule_id' => Schedule::factory(),
            'clinician_id' => fn (array $attributes): string => Schedule::query()->findOrFail($attributes['schedule_id'])->clinician_id,
            'start_at' => now()->addDays(2)->startOfHour(),
            'end_at' => now()->addDays(2)->startOfHour()->addHour(),
            'status' => 'FREE',
            'is_hidden' => false,
        ];
    }
}
