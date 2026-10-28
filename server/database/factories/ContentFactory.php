<?php

namespace Database\Factories;

use App\Models\Content;
use App\Models\Diagnosis;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Content>
 */
class ContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'diagnosis_id' => Diagnosis::factory(),
            'title' => fake()->sentence(5),
            'description' => fake()->sentence(),
            'body' => fake()->paragraphs(3, true),
        ];
    }
}
