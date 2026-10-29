<?php

namespace Database\Factories;

use App\Models\ActivationChallenge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivationChallenge>
 */
class ActivationChallengeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'email' => fake()->unique()->safeEmail(),
            'purpose' => 'activation',
            'code_digest' => hash_hmac('sha256', '123456', config('app.key')),
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => now()->addMinutes(10),
        ];
    }
}
