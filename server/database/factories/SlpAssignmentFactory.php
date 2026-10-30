<?php

namespace Database\Factories;

use App\Models\SlpAssignment;
use App\Models\SlpExerciseVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SlpAssignment> */
class SlpAssignmentFactory extends Factory
{
    protected $model = SlpAssignment::class;

    public function definition(): array
    {
        return ['patient_id' => User::factory(), 'clinician_id' => User::factory(), 'exercise_version_id' => SlpExerciseVersion::factory(), 'status' => 'active', 'schedule' => null, 'configuration_snapshot' => []];
    }
}
