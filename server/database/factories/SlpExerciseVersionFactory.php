<?php

namespace Database\Factories;

use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SlpExerciseVersion> */
class SlpExerciseVersionFactory extends Factory
{
    protected $model = SlpExerciseVersion::class;

    public function definition(): array
    {
        return [
            'exercise_id' => SlpExercise::factory(),
            'revision' => 1,
            'language' => 'en',
            'dialect' => null,
            'task_type' => 'passage_reading',
            'status' => 'draft',
            'prompt_text' => fake()->sentence(),
            'configuration' => ['target_duration_seconds' => 60],
            'created_by' => User::factory(),
        ];
    }
}
