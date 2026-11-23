<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SaveSlpExercise;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\SlpExerciseRequest;
use App\Http\Resources\SlpExerciseResource;
use App\Models\SlpExercise;
use App\Models\SlpExerciseCollection;
use App\Models\SlpExerciseVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SlpExerciseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', SlpExercise::class);
        $filters = $request->validate([
            'collection_id' => ['sometimes', 'uuid'],
            'module' => ['sometimes', 'nullable', Rule::in(['fluency', 'timing', 'articulation', 'aphasia', 'voice', 'motor_speech'])],
            'language' => ['sometimes', 'nullable', 'string', 'max:16'],
            'scope' => ['sometimes', 'nullable', Rule::in(['private', 'shared'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $query = SlpExercise::query()->with(['versions', 'collection'])->whereNull('archived_at')
            ->where(fn ($q) => $q->whereNull('collection_id')->orWhereHas('collection', fn ($c) => $c->whereNull('archived_at')));
        if ($request->user()->profile->role === UserRole::Clinician) {
            $query->where('owner_id', $request->user()->id);
        }
        if (isset($filters['collection_id'])) {
            Gate::authorize('view', SlpExerciseCollection::query()->findOrFail($filters['collection_id']));
        }

        foreach (['module', 'scope', 'collection_id'] as $field) {
            if (isset($filters[$field])) {
                $query->where($field, $filters[$field]);
            }
        }
        if (isset($filters['language'])) {
            $query->where(SlpExerciseVersion::query()->select('language')
                ->whereColumn('exercise_id', 'slp_exercises.id')->orderByDesc('revision')->limit(1), $filters['language']);
        }

        return SlpExerciseResource::collection($query->latest()->orderByDesc('id')->paginate($filters['per_page'] ?? 15));
    }

    public function store(SlpExerciseRequest $request, SaveSlpExercise $save): JsonResponse
    {
        $exercise = $save->create($request->user(), $request->validated(), $request->attributes->get('request_id'));

        return SlpExerciseResource::make($exercise)->response()->setStatusCode(201);
    }

    public function show(Request $request, SlpExercise $exercise): SlpExerciseResource
    {
        Gate::authorize('view', $exercise);

        return SlpExerciseResource::make($exercise->load('versions'));
    }

    public function update(SlpExerciseRequest $request, SlpExercise $exercise, SaveSlpExercise $save): SlpExerciseResource
    {
        $updated = $save->update($request->user(), $exercise, $request->validated(), $request->attributes->get('request_id'));

        return SlpExerciseResource::make($updated);
    }

    public function destroy(Request $request, SlpExercise $exercise, SaveSlpExercise $save): Response
    {
        Gate::authorize('delete', $exercise);
        $save->archive($request->user(), $exercise, $request->attributes->get('request_id'));

        return response()->noContent();
    }
}
