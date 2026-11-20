<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class RelationalBenchmarkFixtures
{
    public const CLOCK = '2026-01-01 00:00:00 UTC';

    public static function id(string $kind, int $number): string
    {
        $hex = md5($kind.':'.$number);

        return substr($hex, 0, 8).'-'.substr($hex, 8, 4).'-4'.substr($hex, 13, 3).'-8'.substr($hex, 17, 3).'-'.substr($hex, 20, 12);
    }

    public function seed(int $scale): array
    {
        if (! app()->environment(['local', 'testing']) || $scale < 1 || $scale > 1000) {
            throw new \RuntimeException('Fixtures require local or testing and a scale from 1 to 1000.');
        }
        $stamp = '2024-01-01 00:00:00';
        $timestamps = ['created_at' => $stamp, 'updated_at' => $stamp];
        $clinician = self::id('clinician', 0);
        $admin = self::id('admin', 0);
        DB::table('diagnoses')->insert(['id' => 'bench-diagnosis', 'label' => 'Synthetic diagnosis', 'value' => 'BENCH', ...$timestamps]);
        foreach ([$clinician => 'clinician', $admin => 'superadmin'] as $id => $role) {
            DB::table('users')->insert(['id' => $id, 'name' => $role, 'email' => $role.'@benchmark.invalid', 'password' => 'disabled-synthetic-account', 'email_verified_at' => $stamp, ...$timestamps]);
            DB::table('user_profiles')->insert(['user_id' => $id, 'role' => $role, 'status' => 'active', 'diagnosis_id' => 'bench-diagnosis', ...$timestamps]);
        }
        $counts = [];
        for ($offset = 0; $offset < 10 * $scale; $offset += 100) {
            $tables = [];
            for ($i = $offset; $i < min($offset + 100, 10 * $scale); $i++) {
                $id = fn (string $kind): string => self::id($kind, $i);
                // Half the episodes grow one patient's history; the rest grow the population.
                $newPatient = $i === 0 || $i % 2 === 1;
                $patient = self::id('patient', $newPatient ? $i : 0);
                $date = gmdate('Y-m-d H:i:s', strtotime($stamp.' UTC') + ($i * 3600));
                $end = gmdate('Y-m-d H:i:s', strtotime($date.' UTC') + 1800);
                $ts = ['created_at' => $date, 'updated_at' => $date];
                $add = function (string $table, array $row) use (&$tables): void {
                    $tables[$table][] = $row;
                };
                if ($newPatient) {
                    $add('users', ['id' => $patient, 'name' => 'Synthetic patient '.$i, 'email' => 'patient'.$i.'@benchmark.invalid', 'password' => 'disabled-synthetic-account', 'email_verified_at' => $stamp, ...$ts]);
                    $add('user_profiles', ['user_id' => $patient, 'role' => 'patient', 'status' => $i % 10 === 9 ? 'suspended' : 'active', 'diagnosis_id' => 'bench-diagnosis', ...$ts]);
                    $add('activation_challenges', ['id' => $id('activation'), 'user_id' => $patient, 'email' => 'patient'.$i.'@benchmark.invalid', 'purpose' => 'activation', 'code_digest' => str_repeat('0', 64), 'expires_at' => $end, 'consumed_at' => $date, ...$ts]);
                    $add('consent_evidence', ['id' => $id('consent-evidence'), 'user_id' => $patient, 'purpose' => 'registration', 'policy_version' => 'benchmark-v1', 'accepted_at' => $date, 'created_at' => $date]);
                    $add('clinician_patients', ['id' => $id('roster'), 'clinician_id' => $clinician, 'patient_id' => $patient, 'first_completed_at' => $end, ...$ts]);
                }
                $add('tags', ['id' => $id('tag'), 'author_id' => $clinician, 'name' => 'Synthetic '.$i, 'slug' => 'synthetic-'.$i, ...$ts]);
                $add('contents', ['id' => $id('content'), 'author_id' => $clinician, 'diagnosis_id' => 'bench-diagnosis', 'title' => 'Synthetic content '.$i, 'description' => 'Synthetic description', 'body' => 'Synthetic body only', ...$ts]);
                $add('content_tag', ['content_id' => $id('content'), 'tag_id' => $id('tag'), ...$ts]);
                $add('bookmarks', ['id' => $id('bookmark'), 'user_id' => $patient, 'content_id' => $id('content'), ...$ts]);
                $status = $newPatient ? 'COMPLETED' : ['COMPLETED', 'ACCEPTED', 'PENDING', 'REJECT', 'CANCELLED'][$i % 5];
                $add('schedules', ['id' => $id('schedule'), 'clinician_id' => $clinician, 'start_at' => $date, 'end_at' => $end, 'timezone' => 'UTC', ...$ts]);
                $add('slots', ['id' => $id('slot'), 'schedule_id' => $id('schedule'), 'clinician_id' => $clinician, 'start_at' => $date, 'end_at' => $end, 'status' => $status, 'is_hidden' => false, ...$ts]);
                $add('appointments', ['id' => $id('appointment'), 'slot_id' => $id('slot'), 'patient_id' => $patient, 'clinician_id' => $clinician, 'status' => $status, 'booked_at' => $date, 'completed_at' => $status === 'COMPLETED' ? $end : null, ...$ts]);
                $add('appointment_events', ['id' => $id('event'), 'appointment_id' => $id('appointment'), 'actor_type' => 'clinician', 'actor_id' => $clinician, 'to_status' => $status, 'created_at' => $date]);
                $add('encounters', ['id' => $id('encounter'), 'appointment_id' => $id('appointment'), 'diagnosis' => 'Synthetic', 'chief_complaint' => 'Synthetic', 'referral_source' => 'Synthetic', ...$ts]);
                $freeStart = gmdate('Y-m-d H:i:s', strtotime('2026-01-02 00:00:00 UTC') + ($i * 3600));
                $freeEnd = gmdate('Y-m-d H:i:s', strtotime($freeStart.' UTC') + 1800);
                $add('schedules', ['id' => $id('free-schedule'), 'clinician_id' => $clinician, 'start_at' => $freeStart, 'end_at' => $freeEnd, 'timezone' => 'UTC', ...$ts]);
                $add('slots', ['id' => $id('free-slot'), 'schedule_id' => $id('free-schedule'), 'clinician_id' => $clinician, 'start_at' => $freeStart, 'end_at' => $freeEnd, 'status' => 'FREE', 'is_hidden' => false, ...$ts]);
                $add('soaps', ['id' => $id('soap'), 'clinician_id' => $clinician, 'patient_id' => $patient, 'activity_plan' => 'Synthetic fixture', 'subjective_notes' => 'Synthetic fixture', ...$ts]);
                $add('notifications', ['id' => $id('notification'), 'user_id' => $patient, 'type' => 'appointment', 'title' => 'Synthetic', 'message' => 'Synthetic', 'delivery_key' => 'bench:'.$i, ...$ts]);
                $add('outbox_messages', ['id' => $id('outbox'), 'kind' => 'notification.broadcast', 'aggregate_id' => $id('appointment'), 'recipient_id' => $patient, 'delivery_key' => 'bench:'.$i, 'payload' => null, 'available_at' => $date, 'delivered_at' => $date, 'broadcasted_at' => $date, ...$ts]);
                $add('audit_exports', ['id' => $id('export'), 'actor_id' => $admin, 'format' => 'jsonl', 'status' => 'completed', 'filters' => '{}', ...$ts]);
                $add('slp_exercises', ['id' => $id('exercise'), 'owner_id' => $clinician, 'module' => 'fluency', 'scope' => 'private', ...$ts]);
                $configuration = json_encode(['patient_visible' => true, 'patient_audience' => 'all']);
                $add('slp_exercise_versions', ['id' => $id('version'), 'exercise_id' => $id('exercise'), 'revision' => 1, 'language' => 'en', 'task_type' => 'reading', 'status' => 'published', 'prompt_text' => 'Synthetic prompt', 'configuration' => $configuration, 'created_by' => $clinician, 'reviewed_by' => $clinician, ...$ts]);
                $add('slp_assets', ['id' => $id('asset'), 'owner_id' => $clinician, 'path' => 'synthetic/no-file-'.$i, 'mime_type' => 'audio/wav', 'bytes' => 1024, 'checksum' => hash('sha256', 'asset'.$i), ...$ts]);
                $add('slp_assignments', ['id' => $id('assignment'), 'patient_id' => $patient, 'clinician_id' => $clinician, 'exercise_version_id' => $id('version'), 'status' => 'active', 'configuration_snapshot' => $configuration, ...$ts]);
                $add('slp_consents', ['id' => $id('slp-consent'), 'subject_id' => $patient, 'actor_id' => $patient, 'purpose' => 'slp_recording', 'policy_version' => 'benchmark-v1', 'accepted_at' => $date, ...$ts]);
                $add('slp_attempts', ['id' => $id('attempt'), 'assignment_id' => $id('assignment'), 'consent_id' => $id('slp-consent'), 'status' => 'approved', 'submission_key' => 'synthetic-'.$i, ...$ts]);
                $add('slp_recordings', ['id' => $id('recording'), 'attempt_id' => $id('attempt'), 'path' => 'synthetic/no-audio-'.$i, 'mime_type' => 'audio/wav', 'bytes' => 1024, 'checksum' => hash('sha256', 'recording'.$i), 'duration_ms' => 1000, 'retention_until' => $end, ...$ts]);
                $add('slp_analysis_runs', ['id' => $id('run'), 'attempt_id' => $id('attempt'), 'status' => 'succeeded', 'result' => '{"synthetic":true}', ...$ts]);
                $add('slp_reviews', ['id' => $id('review'), 'attempt_id' => $id('attempt'), 'revision' => 1, 'reviewer_id' => $clinician, 'status' => 'approved', 'annotations' => '[]', 'metrics' => '{}', ...$ts]);
                $add('slp_reports', ['id' => $id('report'), 'review_id' => $id('review'), 'created_by' => $clinician, 'snapshot' => '{"synthetic":true}', ...$ts]);
                for ($j = 0; $j < 10; $j++) {
                    $add('audit_logs', ['id' => self::id('audit', $i * 10 + $j), 'actor_id' => $clinician, 'actor_role' => 'clinician', 'action' => $j === 0 ? 'soap.created' : 'appointment.viewed', 'entity_type' => $j === 0 ? 'soap' : 'appointment', 'entity_id' => $j === 0 ? $id('soap') : $id('appointment'), 'details' => '{}', 'created_at' => $date]);
                }
            }
            DB::transaction(function () use ($tables, &$counts): void {
                // A batch may start with the returning patient before any new users appear.
                foreach (array_replace(['users' => [], 'user_profiles' => []], $tables) as $table => $rows) {
                    foreach (array_chunk($rows, 100) as $chunk) {
                        DB::table($table)->insert($chunk);
                    }
                    $counts[$table] = ($counts[$table] ?? 0) + count($rows);
                }
            });
        }
        $counts['users'] += 2;
        $counts['user_profiles'] += 2;
        $counts['diagnoses'] = 1;

        return $counts;
    }
}
