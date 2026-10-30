<?php

namespace Database\Factories;

use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SlpExercise> */
class SlpExerciseFactory extends Factory
{
    protected $model = SlpExercise::class;

    public function definition(): array
    {
        return ['owner_id' => User::factory(), 'scope' => 'private', 'module' => 'fluency'];
    }

    public function withDraft(array $attributes = []): static
    {
        return $this->afterCreating(function (SlpExercise $exercise) use ($attributes): void {
            SlpExerciseVersion::factory()->for($exercise, 'exercise')->create($attributes);
        });
    }
}
