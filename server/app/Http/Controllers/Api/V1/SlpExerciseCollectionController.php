<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SaveSlpExerciseCollection;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\SlpExerciseCollectionRequest;
use App\Http\Resources\SlpExerciseCollectionResource;
use App\Models\SlpExerciseCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SlpExerciseCollectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', SlpExerciseCollection::class);
        $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);

        $query = SlpExerciseCollection::query();
        if ($request->user()->profile->role === UserRole::Patient) {
            $query->forPatient($request->user());
        } else {
            $query->whereNull('archived_at');
            if ($request->user()->profile->role === UserRole::Clinician) {
                $query->where('owner_id', $request->user()->id);
            }
        }

        return SlpExerciseCollectionResource::collection($query->withCount(['exercises' => fn ($q) => $q->whereNull('archived_at')])->latest()->orderByDesc('id')->paginate(15));
    }

    public function store(SlpExerciseCollectionRequest $request, SaveSlpExerciseCollection $save): JsonResponse
    {
        return SlpExerciseCollectionResource::make($save->save($request->user(), null, $request->validated(), $request->attributes->get('request_id')))->response()->setStatusCode(201);
    }

    public function show(SlpExerciseCollection $collection): SlpExerciseCollectionResource
    {
        Gate::authorize('view', $collection);

        return SlpExerciseCollectionResource::make($collection->loadCount(['exercises' => fn ($q) => $q->whereNull('archived_at')]));
    }

    public function update(SlpExerciseCollectionRequest $request, SlpExerciseCollection $collection, SaveSlpExerciseCollection $save): SlpExerciseCollectionResource
    {
        return SlpExerciseCollectionResource::make($save->save($request->user(), $collection, $request->validated(), $request->attributes->get('request_id')));
    }

    public function destroy(Request $request, SlpExerciseCollection $collection, SaveSlpExerciseCollection $save): Response
    {
        Gate::authorize('delete', $collection);
        $save->archive($request->user(), $collection, $request->attributes->get('request_id'));

        return response()->noContent();
    }

    public function cover(SlpExerciseCollection $collection): StreamedResponse
    {
        Gate::authorize('view', $collection);
        abort_unless($collection->cover_path && Storage::disk('local')->exists($collection->cover_path), 404);

        return Storage::disk('local')->response($collection->cover_path, null, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
