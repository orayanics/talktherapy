<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SlpPracticeExerciseResource;
use App\Models\SlpExerciseCollection;
use App\Models\SlpExerciseVersion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SlpCollectionPracticeController extends Controller
{
    public function __invoke(Request $request, SlpExerciseCollection $collection): AnonymousResourceCollection
    {
        abort_unless($request->user()->profile->role->value === 'patient', 403);
        Gate::authorize('view', $collection);
        $request->validate(['page' => ['sometimes', 'integer', 'min:1']]);

        return SlpPracticeExerciseResource::collection(SlpExerciseVersion::query()
            ->whereHas('exercise', fn ($q) => $q->where('collection_id', $collection->id))
            ->patientPractice($request->user())
            ->with(['assignments' => fn ($q) => $q->where('patient_id', $request->user()->id)->where('status', 'active')])
            ->orderBy('created_at')->orderBy('id')->paginate(15));
    }
}
