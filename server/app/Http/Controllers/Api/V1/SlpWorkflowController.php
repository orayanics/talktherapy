<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\SlpAssignmentResource;
use App\Jobs\RunSlpAnalysis;
use App\Models\ClinicianPatient;
use App\Models\SlpAnalysisRun;
use App\Models\SlpAsset;
use App\Models\SlpAssignment;
use App\Models\SlpAttempt;
use App\Models\SlpConsent;
use App\Models\SlpExerciseVersion;
use App\Models\SlpRecording;
use App\Models\SlpReport;
use App\Models\SlpReview;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SlpWorkflowController extends Controller
{
    public function visibility(Request $request, SlpExerciseVersion $version): array
    {
        abort_unless($this->staff($request->user()) && ($version->exercise->owner_id === $request->user()->id || $this->admin($request->user())), 403);
        $data = $request->validate(['visible' => ['required', 'boolean']]);
        $version->update(['configuration' => [...($version->configuration ?? []), 'patient_visible' => $data['visible']]]);

        return ['data' => ['visible' => $data['visible']]];
    }

    public function reviewVersion(Request $request, SlpExerciseVersion $version): array
    {
        abort_unless($this->staff($request->user()), 403);
        $version->update(['status' => 'reviewed', 'reviewed_by' => $request->user()->id]);

        return ['data' => ['id' => $version->id, 'status' => $version->status, 'reviewed_by' => $version->reviewed_by]];
    }

    public function publishVersion(Request $request, SlpExerciseVersion $version): array
    {
        abort_unless($this->admin($request->user()) && $version->status === 'reviewed', 403);
        $version->update(['status' => 'published']);

        return ['data' => ['id' => $version->id, 'status' => $version->status]];
    }

    public function storeAsset(Request $request): array
    {
        abort_unless($this->staff($request->user()), 403);
        $data = $request->validate(['asset' => ['required', 'file', 'max:10240', 'mimetypes:image/jpeg,image/png,audio/mpeg,audio/wav,audio/mp4'], 'license' => ['nullable', 'string', 'max:255']]);
        $file = $data['asset'];
        $path = $file->store('slp-assets', 'local');
        $asset = SlpAsset::query()->create(['owner_id' => $request->user()->id, 'path' => $path, 'mime_type' => $file->getMimeType(), 'bytes' => $file->getSize(), 'checksum' => hash_file('sha256', $file->getRealPath()), 'license' => $data['license'] ?? null]);

        return ['data' => $asset];
    }

    public function deleteAsset(Request $request, SlpAsset $asset): Response
    {
        abort_unless($this->admin($request->user()) || $asset->owner_id === $request->user()->id, 403);
        abort_if($asset->exists && DB::table('slp_exercise_versions')->whereJsonContains('configuration->asset_ids', $asset->id)->exists(), 409);
        Storage::disk('local')->delete($asset->path);
        $asset->delete();

        return response()->noContent();
    }

    public function storeConsent(Request $request): array
    {
        $data = $request->validate(['subject_id' => ['required', 'uuid', Rule::exists('users', 'id')], 'purpose' => ['required', 'string', 'max:80'], 'policy_version' => ['required', 'string', 'max:40']]);
        abort_unless($data['subject_id'] === $request->user()->id || $this->admin($request->user()), 403);

        return ['data' => SlpConsent::query()->create([...$data, 'actor_id' => $request->user()->id, 'accepted_at' => now()])];
    }

    public function withdrawConsent(Request $request, SlpConsent $consent): array
    {
        abort_unless($consent->subject_id === $request->user()->id || $this->admin($request->user()), 403);
        $consent->update(['withdrawn_at' => now()]);

        return ['data' => ['id' => $consent->id, 'withdrawn_at' => $consent->withdrawn_at?->toISOString()]];
    }

    public function assignments(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = SlpAssignment::query()->with('version.exercise');
        if ($user->profile?->role === UserRole::Patient) {
            $query->whereHas('version', fn ($q) => $q->where('configuration->patient_visible', true)->whereHas('exercise', fn ($e) => $e->whereNull('archived_at')));
        }
        if ($user->profile?->role === UserRole::Patient) {
            $query->where('patient_id', $user->id);
        } elseif ($user->profile?->role === UserRole::Clinician) {
            $query->where('clinician_id', $user->id);
        } else {
            abort(403);
        }

        return SlpAssignmentResource::collection($query->latest()->paginate($request->integer('per_page', 15)));
    }

    public function storeAssignment(Request $request): JsonResponse
    {
        abort_unless($request->user()->profile?->role === UserRole::Clinician, 403);
        $data = $request->validate(['patient_id' => ['required', 'uuid', Rule::exists('users', 'id')], 'exercise_version_id' => ['required', 'uuid', Rule::exists('slp_exercise_versions', 'id')], 'schedule' => ['nullable', 'array']]);
        abort_unless(ClinicianPatient::query()->where('clinician_id', $request->user()->id)->where('patient_id', $data['patient_id'])->exists(), 403);
        $version = SlpExerciseVersion::query()->with('exercise')->findOrFail($data['exercise_version_id']);
        abort_unless($version->exercise->owner_id === $request->user()->id || ($version->exercise->scope === 'shared' && $version->status === 'published'), 403);
        abort_unless($version->exercise->archived_at === null && ($version->configuration['patient_visible'] ?? false) === true, 422, 'Enable patient visibility before assigning this version.');

        return response()->json(['data' => SlpAssignment::query()->create([...$data, 'clinician_id' => $request->user()->id, 'status' => 'active', 'configuration_snapshot' => $version->configuration])], 201);
    }

    public function storeAttempt(Request $request, SlpAssignment $assignment): JsonResponse
    {
        abort_unless($assignment->patient_id === $request->user()->id, 403);
        abort_unless($assignment->status === 'active' && $assignment->version->exercise->archived_at === null && ($assignment->version->configuration['patient_visible'] ?? false) === true, 409, 'This exercise is not currently available.');
        $data = $request->validate(['submission_key' => ['required', 'string', 'max:100'], 'consent_id' => ['required', 'uuid', Rule::exists('slp_consents', 'id')]]);
        $consent = SlpConsent::query()->findOrFail($data['consent_id']);
        abort_unless($consent->subject_id === $request->user()->id && $consent->purpose === 'slp_recording' && $consent->withdrawn_at === null, 422);
        $attempt = SlpAttempt::query()->firstOrCreate(['assignment_id' => $assignment->id, 'submission_key' => $data['submission_key']], ['consent_id' => $consent->id, 'status' => 'created']);

        return response()->json(['data' => $attempt], 201);
    }

    public function uploadRecording(Request $request, SlpAttempt $attempt): JsonResponse
    {
        abort_unless($attempt->assignment->patient_id === $request->user()->id, 403);
        abort_unless($attempt->consent->withdrawn_at === null && $attempt->assignment->status === 'active' && $attempt->assignment->version->exercise->archived_at === null && ($attempt->assignment->version->configuration['patient_visible'] ?? false) === true, 409, 'Consent or exercise availability has changed.');
        $data = $request->validate(['recording' => ['required', 'file', 'max:20480', 'mimetypes:audio/mpeg,audio/wav,audio/mp4,audio/webm']]);
        abort_if($attempt->recording()->exists(), 409);
        $file = $data['recording'];
        $path = $file->store('slp-recordings', 'local');
        $recording = SlpRecording::query()->create(['attempt_id' => $attempt->id, 'path' => $path, 'mime_type' => $file->getMimeType(), 'bytes' => $file->getSize(), 'checksum' => hash_file('sha256', $file->getRealPath()), 'retention_until' => now()->addDays(30)]);
        $attempt->update(['status' => 'queued']);
        $run = SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'queued']);
        RunSlpAnalysis::dispatch($run->id);

        return response()->json(['data' => ['attempt_id' => $attempt->id, 'recording_id' => $recording->id, 'analysis_run_id' => $run->id, 'status' => 'queued']], 202);
    }

    public function attempt(Request $request, SlpAttempt $attempt): array
    {
        $user = $request->user();
        $allowed = $attempt->assignment->patient_id === $user->id || $attempt->assignment->clinician_id === $user->id || $this->admin($user);
        abort_unless($allowed, 403);
        $attempt->load(['analysis', 'recording', 'assignment.version']);
        $data = ['id' => $attempt->id, 'status' => $attempt->status, 'analysis' => $attempt->analysis, 'exercise' => $attempt->assignment->version];
        if ($attempt->assignment->clinician_id !== $user->id && ! $this->admin($user)) {
            unset($data['analysis']);
        }

        return ['data' => $data];
    }

    public function saveReview(Request $request, SlpAttempt $attempt): array
    {
        abort_unless($attempt->assignment->clinician_id === $request->user()->id || $this->admin($request->user()), 403);
        $data = $request->validate(['annotations' => ['required', 'array'], 'metrics' => ['nullable', 'array']]);
        $revision = (int) ($attempt->reviews()->max('revision') ?? 0) + 1;
        $review = SlpReview::query()->create(['attempt_id' => $attempt->id, 'revision' => $revision, 'reviewer_id' => $request->user()->id, 'status' => 'draft', 'annotations' => $data['annotations'], 'metrics' => $data['metrics'] ?? []]);

        return ['data' => $review];
    }

    public function approveReview(Request $request, SlpReview $review): array
    {
        abort_unless($review->reviewer_id === $request->user()->id || $this->admin($request->user()), 403);
        $review->update(['status' => 'approved']);
        $review->attempt()->update(['status' => 'approved']);
        $report = SlpReport::query()->create(['review_id' => $review->id, 'created_by' => $request->user()->id, 'snapshot' => ['metrics' => $review->metrics, 'annotations' => $review->annotations, 'approved_at' => now()->toISOString()]]);

        return ['data' => ['review' => $review, 'report' => $report]];
    }

    private function staff(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Clinician, UserRole::Admin, UserRole::Superadmin], true);
    }

    private function admin(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
    }
}
