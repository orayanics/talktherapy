<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SaveSlpExercise;
use App\Http\Controllers\Controller;
use App\Http\Requests\SlpExerciseRequest;
use App\Http\Resources\SlpExerciseResource;
use App\Models\SlpExercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class SlpExerciseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', SlpExercise::class);
        $query = SlpExercise::query()->with('versions')->whereNull('archived_at');
        if ($request->user()->profile?->role->value === 'clinician') $query->where('owner_id', $request->user()->id);
        return SlpExerciseResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
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

    public function destroy(Request $request, SlpExercise $exercise, SaveSlpExercise $save): \Illuminate\Http\Response
    {
        Gate::authorize('delete', $exercise);
        $save->archive($request->user(), $exercise, $request->attributes->get('request_id'));
        return response()->noContent();
    }
}
