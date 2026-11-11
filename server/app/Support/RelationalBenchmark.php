<?php

namespace App\Support;

use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\SlotController;
use App\Http\Controllers\Api\V1\SlpWorkflowController;
use App\Http\Controllers\Api\V1\SoapController;
use App\Http\Requests\AppointmentReadRequest;
use App\Http\Requests\AuditLogReadRequest;
use App\Http\Requests\ClinicalRecordReadRequest;
use App\Http\Requests\NotificationReadRequest;
use App\Http\Requests\SlotReadRequest;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class RelationalBenchmark
{
    public const INDEX = 'notifications_user_created_id_index';

    /** @return array<string, mixed> */
    public function run(array $scales, int $blocks = 10, int $pairs = 3, int $warmups = 2, bool $baseline = false): array
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Benchmarks require local or testing; production is refused.');
        }
        if ($scales === [] || count($scales) > 4 || count(array_unique($scales)) !== count($scales)
            || array_filter($scales, fn ($scale): bool => ! is_int($scale) || $scale < 1 || $scale > 1000)
            || $blocks < 1 || $blocks > 20 || $pairs < 1 || $pairs > 50 || $warmups < 0 || $warmups > 5) {
            throw new RuntimeException('Use 1–4 distinct scales from 1–1000, 1–20 blocks, 1–50 pairs and 0–5 warmups.');
        }

        $result = ['metadata' => [
            'php' => PHP_VERSION, 'laravel' => app()->version(), 'os' => php_uname(),
            'cpu' => is_readable('/proc/cpuinfo') ? (preg_match('/model name\s*:\s*(.+)/', file_get_contents('/proc/cpuinfo'), $cpu) ? $cpu[1] : 'unknown') : 'unknown',
            'memory_limit' => ini_get('memory_limit'), 'clock' => RelationalBenchmarkFixtures::CLOCK,
            'started_at' => gmdate(DATE_ATOM), 'blocks' => $blocks, 'pairs' => $pairs, 'warmups' => $warmups,
            'baseline_only' => $baseline, 'candidate_index' => self::INDEX.' ON notifications(user_id, created_at, id)',
            'protocol' => 'Fresh temporary SQLite file rebuilt per block in one PHP process; deterministic identical data; warm-cache direct controller/resource calls; treatment order alternates by block and pair. Migration, seed, validation, actor hydration, warmup, index builds and EXPLAIN excluded from wall_ms.',
            'base_cohort' => '10 relational episodes per scale unit: half grow patient 0 history and half add patients; 10 additional future FREE slots; 100 audit records.',
            'exclusions' => ['HTTP/middleware/session hydration', 'concurrent traffic/locking', 'PostgreSQL', 'Redis/queue/inference execution', 'real audio/files', 'index insert/update maintenance cost', 'uncontrolled machine load'],
        ], 'scales' => []];

        foreach ($scales as $scale) {
            $entry = ['scale' => $scale, 'blocks' => [], 'cases' => []];
            foreach ($this->cases() as $name => $case) {
                $entry['cases'][$name] = ['name' => $name, 'actor' => $case['actor'], 'path' => $case['path'], 'input' => $case['input'] ?? ['per_page' => 15], 'samples' => [], 'plans' => []];
            }
            for ($block = 0; $block < $blocks; $block++) {
                try {
                    $this->block($entry, $scale, $block, $pairs, $warmups, $baseline);
                } catch (Throwable $exception) {
                    $entry['errors'][] = ['block' => $block, 'error' => $exception::class.': '.$exception->getMessage()];
                    foreach ($entry['cases'] as &$case) {
                        for ($pair = 0; $pair < $pairs; $pair++) {
                            foreach ($baseline ? ['before'] : ['before', 'after'] as $variant) {
                                if (array_filter($case['samples'], fn (array $sample): bool => $sample['block'] === $block && $sample['pair'] === $pair && $sample['variant'] === $variant)) {
                                    continue;
                                }
                                $case['samples'][] = ['block' => $block, 'pair' => $pair, 'variant' => $variant, 'wall_ms' => null, 'sql_ms' => null, 'query_count' => null, 'rows' => null, 'checksum' => null, 'error' => $exception::class.': '.$exception->getMessage()];
                            }
                        }
                    }
                    unset($case);
                }
            }
            $entry['cases'] = array_values($entry['cases']);
            $result['scales'][] = $entry;
        }

        return $result;
    }

    /** @return array<string, array<string, mixed>> */
    private function cases(): array
    {
        return [
            'patient_availability' => ['actor' => 'patient', 'request' => SlotReadRequest::class, 'controller' => SlotController::class, 'path' => '/api/v1/slots'],
            'patient_notifications' => ['actor' => 'patient', 'request' => NotificationReadRequest::class, 'controller' => NotificationController::class, 'path' => '/api/v1/notifications'],
            'patient_appointments' => ['actor' => 'patient', 'request' => AppointmentReadRequest::class, 'controller' => AppointmentController::class, 'path' => '/api/v1/appointments'],
            'clinician_appointments' => ['actor' => 'clinician', 'request' => AppointmentReadRequest::class, 'controller' => AppointmentController::class, 'path' => '/api/v1/appointments'],
            'patient_soaps' => ['actor' => 'patient', 'request' => ClinicalRecordReadRequest::class, 'controller' => SoapController::class, 'path' => '/api/v1/soaps/patient/'.RelationalBenchmarkFixtures::id('patient', 0), 'args' => [RelationalBenchmarkFixtures::id('patient', 0)]],
            'clinician_roster' => ['actor' => 'clinician', 'request' => ClinicalRecordReadRequest::class, 'controller' => PatientController::class, 'path' => '/api/v1/patients'],
            'patient_assignments' => ['actor' => 'patient', 'request' => Request::class, 'controller' => SlpWorkflowController::class, 'method' => 'assignments', 'path' => '/api/v1/slp/assignments'],
            'admin_audit' => ['actor' => 'admin', 'request' => AuditLogReadRequest::class, 'controller' => AuditLogController::class, 'path' => '/api/v1/logs', 'input' => ['per_page' => 15, 'action' => 'soap.created']],
        ];
    }

    private function block(array &$entry, int $scale, int $block, int $pairs, int $warmups, bool $baseline): void
    {
        $originalConfig = config('database');
        $originalRequest = app('request');
        $originalNow = Date::getTestNow();
        $guard = Auth::guard();
        $originalUser = $guard->hasUser() ? $guard->user() : null;
        $path = tempnam(sys_get_temp_dir(), 'talktherapy-relational-');
        if ($path === false) {
            throw new RuntimeException('Cannot create temporary benchmark database.');
        }
        $name = 'relational_benchmark_'.bin2hex(random_bytes(8));
        try {
            config(["database.connections.{$name}" => ['driver' => 'sqlite', 'database' => $path, 'url' => null, 'prefix' => '', 'foreign_key_constraints' => true, 'journal_mode' => 'DELETE', 'synchronous' => 'FULL', 'busy_timeout' => 5000]]);
            DB::setDefaultConnection($name);
            Date::setTestNow(RelationalBenchmarkFixtures::CLOCK);
            if (Artisan::call('migrate', ['--database' => $name, '--force' => true, '--no-interaction' => true]) !== 0) {
                throw new RuntimeException('Temporary benchmark migrations failed.');
            }
            $connection = DB::connection($name);
            $connection->statement('DROP INDEX IF EXISTS '.self::INDEX);
            $counts = app(RelationalBenchmarkFixtures::class)->seed($scale);
            if ($connection->select('PRAGMA foreign_key_check') !== []) {
                throw new RuntimeException('Synthetic fixtures failed foreign-key validation.');
            }
            $manifest = ['block' => $block, 'counts' => $counts, 'foreign_key_check' => 'passed', 'sqlite' => $connection->selectOne('select sqlite_version() as version')->version, 'journal_mode' => $connection->selectOne('PRAGMA journal_mode')->journal_mode, 'page_size' => $connection->selectOne('PRAGMA page_size')->page_size, 'schema' => []];
            foreach (array_keys($counts) as $table) {
                $manifest['schema'][$table] = ['foreign_keys' => $connection->select("PRAGMA foreign_key_list(\"{$table}\")"), 'indexes' => $connection->select("PRAGMA index_list(\"{$table}\")")];
            }
            $actors = [];
            foreach (['patient', 'clinician', 'admin'] as $kind) {
                $actors[$kind] = User::with('profile')->findOrFail(RelationalBenchmarkFixtures::id($kind, 0));
            }
            $prepared = [];
            foreach ($this->cases() as $caseName => $case) {
                $request = $case['request']::create('http://localhost'.$case['path'], 'GET', $case['input'] ?? ['per_page' => 15]);
                $actor = $actors[$case['actor']];
                $guard->setUser($actor);
                $request->setUserResolver(fn (): User => $actor);
                app()->instance('request', $request);
                if ($request instanceof FormRequest) {
                    $request->setContainer(app())->setRedirector(app('redirect'));
                    $request->validateResolved();
                }
                $prepared[$caseName] = [$case, $request, $actor];
            }
            $warmed = [];
            for ($pair = 0; $pair < $pairs; $pair++) {
                $variants = $baseline ? ['before'] : (($block + $pair) % 2 === 0 ? ['before', 'after'] : ['after', 'before']);
                foreach ($variants as $variant) {
                    $connection->statement('DROP INDEX IF EXISTS '.self::INDEX);
                    if ($variant === 'after') {
                        $pages = $connection->selectOne('PRAGMA page_count')->page_count - $connection->selectOne('PRAGMA freelist_count')->freelist_count;
                        $start = hrtime(true);
                        $connection->statement('CREATE INDEX '.self::INDEX.' ON notifications (user_id, created_at, id)');
                        if (! isset($manifest['index_build'])) {
                            $manifest['index_build'] = ['wall_ms' => (hrtime(true) - $start) / 1e6, 'allocated_bytes' => ($connection->selectOne('PRAGMA page_count')->page_count - $connection->selectOne('PRAGMA freelist_count')->freelist_count - $pages) * $connection->selectOne('PRAGMA page_size')->page_size];
                        }
                    }
                    foreach ($prepared as $caseName => [$case, $request, $actor]) {
                        $guard->setUser($actor);
                        app()->instance('request', $request);
                        if (! isset($warmed[$variant])) {
                            for ($warmup = 0; $warmup < $warmups; $warmup++) {
                                $this->sample($case, $request);
                            }
                        }
                        $sample = $this->sample($case, $request);
                        $queries = $sample['queries'];
                        unset($sample['queries']);
                        $entry['cases'][$caseName]['samples'][] = ['block' => $block, 'pair' => $pair, 'variant' => $variant, ...$sample];
                        if ($pair === 0) {
                            $plans = [];
                            foreach ($queries as $query) {
                                $plans[] = [...$query, 'plan' => $connection->select('EXPLAIN QUERY PLAN '.$query['query'], $query['bindings'])];
                            }
                            $entry['cases'][$caseName]['plans'][] = ['block' => $block, 'variant' => $variant, 'queries' => $plans];
                        }
                    }
                    $warmed[$variant] = true;
                }
            }
            $entry['blocks'][] = $manifest;
        } finally {
            DB::purge($name);
            config(['database' => $originalConfig]);
            app()->instance('request', $originalRequest);
            $originalUser === null ? $guard->forgetUser() : $guard->setUser($originalUser);
            Date::setTestNow($originalNow);
            unlink($path);
        }
    }

    /** @return array<string, mixed> */
    private function sample(array $case, Request $request): array
    {
        $connection = DB::connection();
        $connection->flushQueryLog();
        $connection->enableQueryLog();
        $start = hrtime(true);
        $result = ['rows' => null, 'returned_rows' => null, 'checksum' => null, 'error' => null];
        try {
            $resource = app($case['controller'])->{$case['method'] ?? 'index'}($request, ...($case['args'] ?? []));
            $response = $resource->toResponse($request);
            $wall = (hrtime(true) - $start) / 1e6;
            $data = $response->getData(true);
            $result['rows'] = $data['meta']['total'];
            $result['returned_rows'] = count($data['data']);
            $result['checksum'] = hash('sha256', json_encode(['data' => $data['data'], 'total' => $result['rows']], JSON_THROW_ON_ERROR));
        } catch (Throwable $exception) {
            $wall = (hrtime(true) - $start) / 1e6;
            $result['error'] = $exception::class.': '.$exception->getMessage();
        } finally {
            $connection->disableQueryLog();
        }
        $queries = $connection->getQueryLog();

        return [...$result, 'wall_ms' => $wall, 'query_count' => count($queries), 'sql_ms' => array_sum(array_column($queries, 'time')), 'queries' => $queries];
    }
}
