<?php

namespace Database\Factories;

use App\Models\OutboxMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OutboxMessage>
 */
class OutboxMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'kind' => 'account.created',
            'aggregate_id' => (string) fake()->uuid(),
            'delivery_key' => (string) fake()->uuid(),
            'payload' => [],
            'available_at' => now(),
        ];
    }
}
