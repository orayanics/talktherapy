<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PhonemeAssessmentRequest;
use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
use App\Services\PhonemeClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class PhonemeAssessmentController extends Controller
{
    public function __invoke(PhonemeAssessmentRequest $request, PhonemeClient $client): JsonResponse
    {
        $reference = $request->validated('reference_text');
        $language = $request->validated('language', 'en');
        if ($versionId = $request->validated('exercise_version_id')) {
            abort_unless($request->user()->profile->role->value === 'patient', 403);
            $version = SlpExerciseVersion::query()->whereKey($versionId)->patientPractice($request->user())->firstOrFail();
            $reference = $version->prompt_text;
            $language = $version->language;
        }
        if ($id = $request->validated('exercise_id')) {
            $exercise = SlpExercise::query()->findOrFail($id);
            Gate::authorize('view', $exercise);
            $version = $exercise->versions()->latest('revision')->firstOrFail();
            $reference = $version->prompt_text;
            $language = $version->language;
        }
        if (! in_array($language, ['en', 'tl'], true)) {
            throw ValidationException::withMessages(['language' => ['Speech practice supports English and Filipino only.']]);
        }
        $assessment = $client->assess(
            $request->file('audio'),
            $reference,
            (string) $request->attributes->get('request_id'),
            $language,
        );

        return response()->json(['data' => $assessment]);
    }
}
