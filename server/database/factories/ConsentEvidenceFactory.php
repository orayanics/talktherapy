<?php

namespace Database\Factories;

use App\Models\ConsentEvidence;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConsentEvidence>
 */
class ConsentEvidenceFactory extends Factory
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
            'purpose' => 'terms_and_privacy',
            'version' => '2026-10-28',
            'accepted_at' => now(),
        ];
    }
}
