<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\SlpExerciseCollection;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class SaveSlpExerciseCollection
{
    public function save(User $actor, ?SlpExerciseCollection $collection, array $data, ?string $requestId): SlpExerciseCollection
    {
        $path = isset($data['cover']) ? $data['cover']->store('slp-collection-covers', 'local') : null;
        abort_if($path === false, 503, 'The cover could not be stored.');
        $oldPath = null;
        try {
            $saved = DB::transaction(function () use ($actor, $collection, $data, $path, $requestId, &$oldPath): SlpExerciseCollection {
                $model = $collection ? SlpExerciseCollection::query()->lockForUpdate()->findOrFail($collection->id) : new SlpExerciseCollection(['owner_id' => $actor->id, 'is_hidden' => false, 'patient_audience' => 'assigned']);
                abort_if($model->archived_at !== null, 409);
                $oldPath = $model->cover_path;
                $model->fill(array_intersect_key($data, array_flip(['title', 'description', 'is_hidden', 'patient_audience', 'patient_ids'])));
                if ($model->patient_audience !== 'selected') {
                    $model->patient_ids = [];
                }
                if ($path !== null || ($data['remove_cover'] ?? false)) {
                    $model->cover_path = $path;
                }
                $model->save();
                $this->audit($actor, $model, $collection ? 'updated' : 'created', $requestId);

                return $model;
            });
        } catch (Throwable $exception) {
            if ($path) {
                Storage::disk('local')->delete($path);
            }
            throw $exception;
        }
        if ($oldPath && $oldPath !== $saved->cover_path) {
            Storage::disk('local')->delete($oldPath);
        }

        return $saved;
    }

    public function archive(User $actor, SlpExerciseCollection $collection, ?string $requestId): void
    {
        $path = DB::transaction(function () use ($actor, $collection, $requestId): ?string {
            $locked = SlpExerciseCollection::query()->lockForUpdate()->findOrFail($collection->id);
            $path = $locked->cover_path;
            $locked->update(['archived_at' => now(), 'is_hidden' => true, 'cover_path' => null]);
            $this->audit($actor, $locked, 'archived', $requestId);

            return $path;
        });
        if ($path) {
            Storage::disk('local')->delete($path);
        }
    }

    private function audit(User $actor, SlpExerciseCollection $collection, string $action, ?string $requestId): void
    {
        AuditLog::query()->create(['actor_id' => $actor->id, 'actor_role' => $actor->profile->role->value, 'action' => 'slp.collection.'.$action, 'entity_type' => 'slp_exercise_collection', 'entity_id' => $collection->id, 'request_id' => $requestId, 'details' => []]);
    }
}
