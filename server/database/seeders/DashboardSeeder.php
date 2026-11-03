<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\ClinicianPatient;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\SlpAssignment;
use App\Models\SlpAttempt;
use App\Models\SlpConsent;
use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
use App\Models\SlpRecording;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class DashboardSeeder extends Seeder
{
    public function run(): void
    {
        $clinician = User::query()->where('email', 'clinician@example.com')->firstOrFail();
        $patients = User::query()->whereIn('email', [
            'patient.aphasia@example.com',
            'patient.stuttering@example.com',
            'patient.autism@example.com',
        ])->orderBy('email')->get()->values();

        $today = CarbonImmutable::now()->startOfDay();
        $scenarios = [
            [-3, 'COMPLETED', 0, $patients[0]],
            [-2, 'COMPLETED', 1, $patients[1]],
            [-1, 'REJECT', 2, $patients[2]],
            [0, 'PENDING', 1, $patients[0]],
            [1, 'ACCEPTED', 0, $patients[1]],
            [2, 'FREE', 1, null],
            [3, 'FREE', 2, null],
        ];

        foreach ($scenarios as [$dayOffset, $status, $hourOffset, $patient]) {
            $start = $today->addDays($dayOffset)->setTime(9 + ($hourOffset * 2), 0);
            $schedule = Schedule::query()->updateOrCreate(
                ['clinician_id' => $clinician->id, 'start_at' => $start],
                ['end_at' => $start->addHours(8), 'timezone' => 'UTC'],
            );
            $slot = Slot::query()->updateOrCreate(
                ['schedule_id' => $schedule->id, 'start_at' => $start],
                [
                    'clinician_id' => $clinician->id,
                    'end_at' => $start->addHour(),
                    'status' => $status,
                    'is_hidden' => false,
                ],
            );

            if ($patient) {
                $timestamps = [
                    'booked_at' => $start->subDays(2),
                    'confirmed_at' => in_array($status, ['ACCEPTED', 'COMPLETED'], true) ? $start->subDay() : null,
                    'cancelled_at' => $status === 'REJECT' ? $start->subDay() : null,
                    'completed_at' => $status === 'COMPLETED' ? $start->addHour() : null,
                ];
                Appointment::query()->updateOrCreate(
                    ['slot_id' => $slot->id],
                    ['patient_id' => $patient->id, 'clinician_id' => $clinician->id, 'status' => $status, ...$timestamps],
                );
            }
        }

        foreach ($patients as $patient) {
            ClinicianPatient::query()->updateOrCreate(
                ['clinician_id' => $clinician->id, 'patient_id' => $patient->id],
                ['first_completed_at' => $today->subDays(30)],
            );
        }

        $exercise = SlpExercise::query()->firstOrCreate(
            ['owner_id' => $clinician->id, 'module' => 'fluency'],
            ['scope' => 'private'],
        );
        $version = SlpExerciseVersion::query()->updateOrCreate(
            ['exercise_id' => $exercise->id, 'revision' => 1],
            [
                'language' => 'en',
                'task_type' => 'passage_reading',
                'status' => 'published',
                'prompt_text' => 'Read the passage at a comfortable pace.',
                'configuration' => ['target_duration_seconds' => 60],
                'created_by' => $clinician->id,
            ],
        );
        $assignment = SlpAssignment::query()->updateOrCreate(
            ['patient_id' => $patients[0]->id, 'clinician_id' => $clinician->id, 'exercise_version_id' => $version->id],
            ['status' => 'active', 'configuration_snapshot' => ['source' => 'dashboard-demo']],
        );
        $consent = SlpConsent::query()->updateOrCreate(
            ['subject_id' => $patients[0]->id, 'actor_id' => $patients[0]->id, 'purpose' => 'slp_recording'],
            ['policy_version' => '2026-10-28', 'accepted_at' => $today->subDays(7)],
        );
        $attempt = SlpAttempt::query()->updateOrCreate(
            ['assignment_id' => $assignment->id, 'submission_key' => 'dashboard-demo-1'],
            ['consent_id' => $consent->id, 'status' => 'submitted'],
        );
        SlpRecording::query()->updateOrCreate(
            ['attempt_id' => $attempt->id],
            [
                'path' => 'demo/dashboard-demo-1.webm',
                'mime_type' => 'audio/webm',
                'bytes' => 128000,
                'checksum' => hash('sha256', 'dashboard-demo-1'),
                'duration_ms' => 42000,
                'retention_until' => $today->addYear(),
            ],
        );
    }
}
