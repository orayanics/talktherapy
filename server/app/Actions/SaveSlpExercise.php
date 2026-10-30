<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaveSlpExercise
{
    /** @param array<string,mixed> $attributes */
    public function create(User $actor, array $attributes, ?string $requestId): SlpExercise
    {
        return DB::transaction(function () use ($actor, $attributes, $requestId): SlpExercise {
            $exercise = SlpExercise::query()->create(['owner_id' => $actor->id, 'scope' => $attributes['scope'] ?? 'private', 'module' => $attributes['module']]);
            $this->version($exercise, $actor, $attributes, 1);
            $this->audit($actor, $exercise, 'slp.exercise.created', $requestId);

            return $exercise->load('versions');
        });
    }

    /** @param array<string,mixed> $attributes */
    public function update(User $actor, SlpExercise $exercise, array $attributes, ?string $requestId): SlpExercise
    {
        return DB::transaction(function () use ($actor, $attributes, $exercise, $requestId): SlpExercise {
            $locked = SlpExercise::query()->lockForUpdate()->findOrFail($exercise->id);
            $latest = $locked->versions()->max('revision') ?? 0;
            $this->version($locked, $actor, $attributes + $locked->versions()->latest('revision')->firstOrFail()->only(['language', 'dialect', 'task_type', 'prompt_text', 'configuration']), $latest + 1);
            $this->audit($actor, $locked, 'slp.exercise.updated', $requestId);

            return $locked->load('versions');
        });
    }

    public function archive(User $actor, SlpExercise $exercise, ?string $requestId): void
    {
        DB::transaction(function () use ($actor, $exercise, $requestId): void {
            $locked = SlpExercise::query()->lockForUpdate()->findOrFail($exercise->id);
            $locked->update(['archived_at' => now()]);
            $this->audit($actor, $locked, 'slp.exercise.archived', $requestId);
        });
    }

    /** @param array<string,mixed> $attributes */
    private function version(SlpExercise $exercise, User $actor, array $attributes, int $revision): void
    {
        SlpExerciseVersion::query()->create([
            'exercise_id' => $exercise->id,
            'revision' => $revision,
            'language' => $attributes['language'],
            'dialect' => $attributes['dialect'] ?? null,
            'task_type' => $attributes['task_type'],
            'status' => 'draft',
            'prompt_text' => $attributes['prompt_text'],
            'configuration' => $attributes['configuration'] ?? null,
            'created_by' => $actor->id,
        ]);
    }

    private function audit(User $actor, SlpExercise $exercise, string $action, ?string $requestId): void
    {
        AuditLog::query()->create(['actor_id' => $actor->id, 'actor_role' => $actor->profile->role->value, 'action' => $action, 'entity_type' => 'slp_exercise', 'entity_id' => $exercise->id, 'request_id' => $requestId, 'details' => []]);
    }
}
