<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\SlpAssetResource;
use App\Http\Resources\SlpAssignmentResource;
use App\Http\Resources\SlpReportResource;
use App\Http\Resources\SlpReviewAttemptResource;
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
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class SlpWorkflowController extends Controller
{
    public function visibility(Request $request, SlpExerciseVersion $version): array
    {
        Gate::authorize('update', $version->exercise);
        $data = $request->validate([
            'visible' => ['required', 'boolean'],
            'audience' => ['sometimes', Rule::in(['all', 'selected'])],
            'patient_ids' => ['sometimes', 'array', 'max:1000'],
            'patient_ids.*' => ['uuid', Rule::exists('users', 'id')],
        ]);
        $audience = $data['audience'] ?? (($version->configuration['patient_audience'] ?? 'all'));
        abort_if($audience === 'selected' && count($data['patient_ids'] ?? []) === 0, 422, 'Select at least one patient.');
        if ($audience === 'selected') {
            $ids = array_values(array_unique($data['patient_ids'] ?? []));
            abort_unless(ClinicianPatient::query()->where('clinician_id', $request->user()->id)->whereIn('patient_id', $ids)->count() === count($ids), 403);
        }
        $version->update(['configuration' => [...($version->configuration ?? []), 'patient_visible' => $data['visible'], 'patient_audience' => $audience, 'patient_ids' => $data['patient_ids'] ?? ($version->configuration['patient_ids'] ?? [])]]);

        return ['data' => ['visible' => $data['visible'], 'audience' => $audience, 'patient_ids' => $data['patient_ids'] ?? []]];
    }

    public function reviewVersion(Request $request, SlpExerciseVersion $version): array
    {
        abort_unless($this->staff($request->user()) && ($version->exercise->owner_id === $request->user()->id || $this->admin($request->user())), 403);
        abort_unless(SlpExerciseVersion::query()->whereKey($version->id)->where('status', 'draft')->update(['status' => 'reviewed', 'reviewed_by' => $request->user()->id]) === 1, 409);
        $version->refresh();

        return ['data' => ['id' => $version->id, 'status' => $version->status, 'reviewed_by' => $version->reviewed_by]];
    }

    public function publishVersion(Request $request, SlpExerciseVersion $version): array
    {
        abort_unless($this->admin($request->user()) && $version->status === 'reviewed', 403);
        abort_unless(SlpExerciseVersion::query()->whereKey($version->id)->where('status', 'reviewed')->update(['status' => 'published']) === 1, 409);
        $version->refresh();

        return ['data' => ['id' => $version->id, 'status' => $version->status]];
    }

    public function storeAsset(Request $request): array
    {
        abort_unless($this->staff($request->user()), 403);
        $data = $request->validate(['asset' => ['required', 'file', 'max:10240', 'mimetypes:image/jpeg,image/png,audio/mpeg,audio/wav,audio/mp4'], 'license' => ['nullable', 'string', 'max:255']]);
        $file = $data['asset'];
        $path = $file->store('slp-assets', 'local');
        $asset = SlpAsset::query()->create(['owner_id' => $request->user()->id, 'path' => $path, 'mime_type' => $file->getMimeType(), 'bytes' => $file->getSize(), 'checksum' => hash_file('sha256', $file->getRealPath()), 'license' => $data['license'] ?? null]);

        return ['data' => SlpAssetResource::make($asset)->resolve($request)];
    }

    public function assets(Request $request): AnonymousResourceCollection
    {
        abort_unless($this->staff($request->user()), 403);
        $query = SlpAsset::query();
        if (! $this->admin($request->user())) {
            $query->where('owner_id', $request->user()->id);
        }

        return SlpAssetResource::collection($query->latest()->paginate(30));
    }

    public function showAsset(Request $request, SlpAsset $asset): StreamedResponse
    {
        $role = $request->user()->profile?->role;
        $allowed = $this->admin($request->user()) || ($role === UserRole::Clinician && $asset->owner_id === $request->user()->id);
        if ($role === UserRole::Patient) {
            $allowed = SlpExerciseVersion::query()->whereJsonContains('configuration->asset_ids', $asset->id)->patientPractice($request->user())->exists();
        }
        abort_unless($allowed, 403);
        $disk = Storage::disk('local');
        abort_unless($disk->exists($asset->path), 404);
        $stream = $disk->readStream($asset->path);
        abort_unless(is_resource($stream), 404);

        return response()->stream(function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, 200, ['Content-Type' => $asset->mime_type, 'Content-Length' => (string) $asset->bytes, 'Content-Disposition' => 'inline; filename="slp-asset"', 'Cache-Control' => 'private, max-age=3600']);
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
        $data = $request->validate(['per_page' => ['sometimes', 'integer', 'min:1', 'max:100']]);
        $user = $request->user();
        $query = SlpAssignment::query()->with(['patient', 'version.exercise.collection']);
        if ($user->profile?->role === UserRole::Patient) {
            // Existing assignments remain available even after an exercise is hidden from new practice.
            $query->where('status', 'active')
                ->whereHas('version', fn ($q) => $q->where('status', 'published')
                    ->whereHas('exercise', fn ($e) => $e->whereNull('archived_at')));
        }
        if ($user->profile?->role === UserRole::Patient) {
            $query->where('patient_id', $user->id);
        } elseif ($user->profile?->role === UserRole::Clinician) {
            $query->where('clinician_id', $user->id)->where('status', 'active');
        } else {
            abort(403);
        }

        return SlpAssignmentResource::collection($query->latest()->paginate($data['per_page'] ?? 15));
    }

    public function reviewAttempts(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()->profile?->role === UserRole::Clinician, 403);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['queued', 'running', 'awaiting_review', 'failed', 'approved'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $query = SlpAttempt::query()
            ->with(['assignment.patient', 'assignment.version', 'analysis', 'recording', 'reviews'])
            ->whereHas('assignment', fn ($q) => $q->where('clinician_id', $request->user()->id));
        if (isset($data['status'])) {
            $query->where('status', $data['status']);
        } else {
            $query->where('status', 'awaiting_review');
        }

        return SlpReviewAttemptResource::collection($query->latest()->paginate($data['per_page'] ?? 15));
    }

    public function reports(Request $request): AnonymousResourceCollection
    {
        $role = $request->user()->profile?->role;
        abort_unless(in_array($role, [UserRole::Patient, UserRole::Clinician], true), 403);
        $query = SlpReport::query()->with(['review.attempt.assignment.patient', 'review.attempt.assignment.version']);
        if ($role === UserRole::Patient) {
            $query->whereNotNull('released_at')->whereHas('review.attempt.assignment', fn ($q) => $q->where('patient_id', $request->user()->id));
        } else {
            $query->whereHas('review.attempt.assignment', fn ($q) => $q->where('clinician_id', $request->user()->id));
        }

        return SlpReportResource::collection($query->latest()->paginate(15));
    }

    public function recording(Request $request, SlpAttempt $attempt): StreamedResponse
    {
        abort_unless($request->user()->profile?->role === UserRole::Clinician, 403);
        abort_unless($attempt->assignment->clinician_id === $request->user()->id, 403);
        $recording = $attempt->recording;
        abort_unless($recording !== null && ($recording->retention_until === null || $recording->retention_until->isFuture()), 404);
        $disk = Storage::disk('local');
        abort_unless($disk->exists($recording->path), 404);
        $stream = $disk->readStream($recording->path);
        abort_unless(is_resource($stream), 404);

        return response()->stream(function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => $recording->mime_type,
            'Content-Length' => (string) $recording->bytes,
            'Content-Disposition' => 'inline; filename="speech-recording"',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function storeAssignment(Request $request): JsonResponse
    {
        abort_unless($request->user()->profile?->role === UserRole::Clinician, 403);
        $data = $request->validate(['patient_id' => ['nullable', 'uuid', Rule::exists('users', 'id')], 'patient_ids' => ['nullable', 'array', 'max:1000'], 'patient_ids.*' => ['uuid', Rule::exists('users', 'id')], 'audience' => ['sometimes', Rule::in(['all', 'selected'])], 'exercise_version_id' => ['required', 'uuid', Rule::exists('slp_exercise_versions', 'id')], 'schedule' => ['nullable', 'array']]);
        $audience = $data['audience'] ?? 'selected';
        $version = SlpExerciseVersion::query()->with('exercise')->findOrFail($data['exercise_version_id']);
        abort_unless($version->status === 'published', 422, 'Publish this version before assigning it.');
        abort_unless($version->exercise->owner_id === $request->user()->id || ($version->exercise->scope === 'shared' && $version->status === 'published'), 403);
        abort_unless($version->exercise->availableForAssignment() && ($version->configuration['patient_visible'] ?? false) === true, 422, 'Unhide the collection and exercise and enable patient visibility before assigning this version.');
        $patientIds = $audience === 'all'
            ? ClinicianPatient::query()->where('clinician_id', $request->user()->id)->pluck('patient_id')->all()
            : ($data['patient_ids'] ?? (! empty($data['patient_id']) ? [$data['patient_id']] : []));
        abort_if(count($patientIds) === 0, 422, 'Select at least one patient.');
        abort_unless(ClinicianPatient::query()->where('clinician_id', $request->user()->id)->whereIn('patient_id', $patientIds)->count() === count(array_unique($patientIds)), 403);
        $assignments = collect($patientIds)->unique()->map(fn (string $patientId): SlpAssignment => SlpAssignment::query()->updateOrCreate(
            ['clinician_id' => $request->user()->id, 'patient_id' => $patientId, 'exercise_version_id' => $version->id],
            ['status' => 'active', 'schedule' => $data['schedule'] ?? null, 'configuration_snapshot' => $version->configuration],
        ));

        return response()->json(['data' => $assignments->values()], 201);
    }

    public function unassign(Request $request, SlpAssignment $assignment): Response
    {
        abort_unless($request->user()->profile?->role === UserRole::Clinician, 403);
        abort_unless($assignment->clinician_id === $request->user()->id, 403);

        $assignment->update(['status' => 'cancelled']);

        return response()->noContent();
    }

    public function storeAttempt(Request $request, SlpAssignment $assignment): JsonResponse
    {
        abort_unless($assignment->patient_id === $request->user()->id, 403);
        abort_unless($assignment->availableToPatient($request->user()->id), 409, 'This exercise is not currently available.');
        $data = $request->validate(['submission_key' => ['required', 'string', 'max:100'], 'consent_id' => ['required', 'uuid', Rule::exists('slp_consents', 'id')]]);
        $consent = SlpConsent::query()->findOrFail($data['consent_id']);
        abort_unless($consent->subject_id === $request->user()->id && $consent->purpose === 'slp_recording' && $consent->withdrawn_at === null, 422);
        $attempt = SlpAttempt::query()->firstOrCreate(['assignment_id' => $assignment->id, 'submission_key' => $data['submission_key']], ['consent_id' => $consent->id, 'status' => 'created']);

        return response()->json(['data' => $attempt], 201);
    }

    public function uploadRecording(Request $request, SlpAttempt $attempt): JsonResponse
    {
        abort_unless($attempt->assignment->patient_id === $request->user()->id, 403);
        $data = $request->validate(['recording' => ['required', 'file', 'max:20480', 'mimetypes:audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/webm']]);
        $path = null;
        try {
            [$recording, $run] = DB::transaction(function () use ($request, $attempt, $data, &$path): array {
                $locked = SlpAttempt::query()->lockForUpdate()->findOrFail($attempt->id);
                $consent = $locked->consent()->lockForUpdate()->firstOrFail();
                abort_unless($consent->withdrawn_at === null && $locked->assignment->availableToPatient($request->user()->id), 409, 'Consent or exercise availability has changed.');
                $file = $data['recording'];
                $checksum = hash_file('sha256', $file->getRealPath());
                $existing = $locked->recording;
                if ($existing !== null) {
                    abort_unless(hash_equals($existing->checksum, $checksum), 409);

                    return [$existing, $locked->analysis()->firstOrFail()];
                }
                abort_unless($locked->status === 'created', 409);
                $path = $file->store('slp-recordings', 'local');
                abort_unless(is_string($path) && $path !== '', 503, 'Recording storage is unavailable.');
                $recording = SlpRecording::query()->create(['attempt_id' => $locked->id, 'path' => $path, 'mime_type' => $file->getMimeType(), 'bytes' => $file->getSize(), 'checksum' => $checksum, 'retention_until' => now()->addDays(30)]);
                $locked->update(['status' => 'queued']);
                $run = SlpAnalysisRun::query()->create(['attempt_id' => $locked->id, 'status' => 'queued']);

                return [$recording, $run];
            });
        } catch (Throwable $exception) {
            if (is_string($path) && $path !== '') {
                Storage::disk('local')->delete($path);
            }
            throw $exception;
        }
        if ($run->status === 'queued') {
            try {
                RunSlpAnalysis::dispatch($run->id);
            } catch (Throwable $exception) {
                Log::warning('SLP analysis dispatch deferred to recovery.', ['exception_type' => $exception::class]);
            }
        }

        return response()->json(['data' => ['attempt_id' => $attempt->id, 'recording_id' => $recording->id, 'analysis_run_id' => $run->id, 'status' => $run->status]], 202);
    }

    public function attempt(Request $request, SlpAttempt $attempt): array
    {
        $user = $request->user();
        $allowed = $attempt->assignment->patient_id === $user->id || $attempt->assignment->clinician_id === $user->id;
        abort_unless($allowed, 403);
        $attempt->load(['analysis', 'recording', 'assignment.version']);
        $data = ['id' => $attempt->id, 'status' => $attempt->status, 'analysis_status' => $attempt->analysis?->status, 'exercise' => $attempt->assignment->version];
        if ($attempt->assignment->patient_id === $user->id) {
            $data['analysis'] = null;
        } else {
            $data['analysis'] = $attempt->analysis;
        }

        return ['data' => $data];
    }

    public function saveReview(Request $request, SlpAttempt $attempt): array
    {
        abort_unless($attempt->assignment->clinician_id === $request->user()->id, 403);
        abort_unless($attempt->status === 'awaiting_review', 409, 'Analysis is not ready for review.');
        $data = $request->validate(['annotations' => ['required', 'array'], 'metrics' => ['nullable', 'array']]);
        $review = DB::transaction(function () use ($attempt, $request, $data): SlpReview {
            $locked = SlpAttempt::query()->lockForUpdate()->findOrFail($attempt->id);
            $revision = (int) ($locked->reviews()->max('revision') ?? 0) + 1;

            return SlpReview::query()->create(['attempt_id' => $locked->id, 'revision' => $revision, 'reviewer_id' => $request->user()->id, 'status' => 'draft', 'annotations' => $data['annotations'], 'metrics' => $data['metrics'] ?? []]);
        });

        return ['data' => $review];
    }

    public function approveReview(Request $request, SlpReview $review): array
    {
        abort_unless($review->attempt->assignment->clinician_id === $request->user()->id, 403);

        return DB::transaction(function () use ($review, $request): array {
            $attempt = SlpAttempt::query()->lockForUpdate()->findOrFail($review->attempt_id);
            $locked = SlpReview::query()->lockForUpdate()->findOrFail($review->id);
            $report = SlpReport::query()->where('review_id', $locked->id)->first();
            if ($report === null) {
                abort_unless($locked->status === 'draft', 409);
                abort_unless($attempt->status === 'awaiting_review', 409, 'Analysis is not ready for approval.');
                $locked->update(['status' => 'approved']);
                $attempt->update(['status' => 'approved']);
                $version = $attempt->assignment->version;
                $report = SlpReport::query()->create(['review_id' => $locked->id, 'created_by' => $request->user()->id, 'snapshot' => ['exercise_version_id' => $version->id, 'revision' => $version->revision, 'prompt_text' => $version->prompt_text, 'language' => $version->language, 'analysis' => $attempt->analysis?->result, 'metrics' => $locked->metrics, 'annotations' => $locked->annotations, 'approved_at' => now()->toISOString()]]);
            }

            return ['data' => ['review' => $locked, 'report' => $report]];
        });
    }

    public function releaseReport(Request $request, SlpReport $report): array
    {
        abort_unless($report->review->attempt->assignment->clinician_id === $request->user()->id, 403);

        return DB::transaction(function () use ($report, $request): array {
            $locked = SlpReport::query()->lockForUpdate()->findOrFail($report->id);
            abort_unless($locked->review->status === 'approved', 409, 'Approve the review before releasing the report.');
            if ($locked->released_at === null) {
                $locked->update(['released_at' => now(), 'released_by' => $request->user()->id]);
            }

            return ['data' => new SlpReportResource($locked->load(['review.attempt.assignment.patient', 'review.attempt.assignment.version']))];
        });
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
