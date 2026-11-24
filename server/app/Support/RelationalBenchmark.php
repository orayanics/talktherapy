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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class RelationalBenchmark
{
    private const INDEX = 'benchmark_candidate_index';

    /** @return array<string, mixed> */
    public function run(array $scales, int $blocks = 12, int $pairs = 3, int $warmups = 2, array $shapes = ['wide', 'hot'], ?string $index = null, ?string $case = null): array
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Benchmarks require local or testing; production is refused.');
        }
        if ($scales === [] || count($scales) > 4 || count(array_unique($scales)) !== count($scales)
            || array_filter($scales, fn ($scale): bool => ! is_int($scale) || $scale < 1 || $scale > 1000)
            || $blocks < 1 || $blocks > 20 || $pairs < 1 || $pairs > 50 || $warmups < 0 || $warmups > 5) {
            throw new RuntimeException('Use 1–4 distinct scales from 1–1000, 1–20 blocks, 1–50 pairs and 0–5 warmups.');
        }
        if ($shapes === [] || array_diff($shapes, ['wide', 'hot']) !== [] || count(array_unique($shapes)) !== count($shapes)) {
            throw new RuntimeException('Use wide, hot, or both fixture shapes.');
        }

        $variants = $index === null ? ['before'] : ['before', 'after'];
        $cases = $this->cases();
        if ($case !== null) {
            if (! isset($cases[$case])) {
                throw new RuntimeException('Unknown case. Use one of: '.implode(', ', array_keys($cases)));
            }
            $cases = [$case => $cases[$case]];
        }

        $result = ['metadata' => [
            'php' => PHP_VERSION, 'laravel' => app()->version(), 'os' => php_uname(),
            'cpu' => is_readable('/proc/cpuinfo') ? (preg_match('/model name\s*:\s*(.+)/', file_get_contents('/proc/cpuinfo'), $cpu) ? $cpu[1] : 'unknown') : 'unknown',
            'memory_limit' => ini_get('memory_limit'), 'clock' => RelationalBenchmarkFixtures::CLOCK,
            'started_at' => gmdate(DATE_ATOM), 'blocks' => $blocks, 'pairs' => $pairs, 'warmups' => $warmups,
            'database' => 'MySQL / InnoDB', 'baseline_only' => $index === null, 'candidate_index' => $index,
            'protocol' => 'Fresh MySQL schema per block; identical deterministic fixtures; warm-cache controller/resource calls; treatment order alternates by block and pair. Migration, seed, validation, actor hydration, warmup, index builds and EXPLAIN excluded from wall_ms.',
            'base_cohort' => '10 linked episodes and 10 available slots per scale unit; 100 audit records. Wide adds patients and clinicians; hot concentrates the same episodes.',
            'exclusions' => ['HTTP/middleware/session hydration', 'concurrent traffic/locking', 'queue/inference execution', 'audio/files', 'index insert/update maintenance cost', 'uncontrolled machine load'],
        ], 'scales' => []];

        foreach ($shapes as $shape) {
            foreach ($scales as $scale) {
                $result['scales'][] = $this->profile($shape, $scale, $blocks, $pairs, $warmups, $variants, $index, $cases);
            }
        }

        return $result;
    }

    private function profile(string $shape, int $scale, int $blocks, int $pairs, int $warmups, array $variants, ?string $index, array $cases): array
    {
        $entry = ['shape' => $shape, 'scale' => $scale, 'blocks' => [], 'cases' => []];
        foreach ($cases as $name => $case) {
            $entry['cases'][$name] = ['name' => $name, 'actor' => $case['actor'], 'path' => $case['path'], 'input' => $case['input'] ?? ['per_page' => 15], 'samples' => [], 'plans' => []];
        }
        for ($block = 0; $block < $blocks; $block++) {
            try {
                $this->block($entry, $scale, $shape, $block, $pairs, $warmups, $variants, $index, $cases);
            } catch (Throwable $exception) {
                $entry['errors'][] = ['block' => $block, 'error' => $exception::class.': '.$exception->getMessage()];
                foreach ($entry['cases'] as &$case) {
                    for ($pair = 0; $pair < $pairs; $pair++) {
                        foreach ($variants as $variant) {
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

        return $entry;
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

    private function block(array &$entry, int $scale, string $shape, int $block, int $pairs, int $warmups, array $variants, ?string $index, array $cases): void
    {
        $originalConfig = config('database');
        $originalRequest = app('request');
        $originalNow = Date::getTestNow();
        $guard = Auth::guard();
        $originalUser = $guard->hasUser() ? $guard->user() : null;
        $name = null;
        try {
            $name = BenchmarkDatabase::create();
            DB::setDefaultConnection($name);
            Date::setTestNow(RelationalBenchmarkFixtures::CLOCK);
            BenchmarkDatabase::migrate($name);
            $connection = DB::connection($name);
            $counts = app(RelationalBenchmarkFixtures::class)->seed($scale, $shape);
            $manifest = ['block' => $block, 'counts' => $counts, 'mysql' => $connection->selectOne('SELECT VERSION() AS version, @@innodb_buffer_pool_size AS buffer_pool_bytes, @@foreign_key_checks AS foreign_key_checks'), 'schema' => []];
            $schema = $connection->getSchemaBuilder();
            foreach (array_keys($counts) as $table) {
                $manifest['schema'][$table] = ['foreign_keys' => $schema->getForeignKeys($table), 'indexes' => $schema->getIndexes($table)];
            }
            if ($index !== null) {
                [$indexTable, $columnList] = explode(':', $index, 2);
                $columns = explode(',', $columnList);
                $installed = collect($schema->getIndexes($indexTable))->first(
                    fn (array $candidate): bool => $candidate['columns'] === $columns && ! $candidate['unique'],
                );
                if ($installed === null) {
                    $start = hrtime(true);
                    $schema->table($indexTable, fn ($table) => $table->index($columns, self::INDEX));
                    $manifest['index_build'] = ['wall_ms' => (hrtime(true) - $start) / 1e6];
                }
                $grammar = $connection->getQueryGrammar();
                $connection->statement('ALTER TABLE '.$grammar->wrapTable($indexTable).' ALTER INDEX '.$grammar->wrap($installed['name'] ?? self::INDEX).' INVISIBLE');
            }
            BenchmarkDatabase::analyze(array_keys($counts));
            $connection->statement('SET SESSION max_execution_time = 10000');
            $actors = [];
            foreach (['patient', 'clinician', 'admin'] as $kind) {
                $actors[$kind] = User::with('profile')->findOrFail(RelationalBenchmarkFixtures::id($kind, 0));
            }
            $prepared = [];
            foreach ($cases as $caseName => $case) {
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
                $order = ($block + $pair) % 2 === 0 ? $variants : array_reverse($variants);
                foreach ($order as $variant) {
                    if ($index !== null) {
                        $connection->statement("SET SESSION optimizer_switch = 'use_invisible_indexes=".($variant === 'after' ? 'on' : 'off')."'");
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
                                $plans[] = [...$query, 'plan' => $connection->select('EXPLAIN ANALYZE FORMAT=TREE '.$query['query'], $query['bindings'])];
                            }
                            $entry['cases'][$caseName]['plans'][] = ['block' => $block, 'variant' => $variant, 'queries' => $plans];
                        }
                    }
                    $warmed[$variant] = true;
                }
            }
            $entry['blocks'][] = $manifest;
        } finally {
            try {
                if ($name !== null) {
                    BenchmarkDatabase::drop($name);
                }
            } finally {
                DB::purge(BenchmarkDatabase::ADMIN);
                config(['database' => $originalConfig]);
                app()->instance('request', $originalRequest);
                $originalUser === null ? $guard->forgetUser() : $guard->setUser($originalUser);
                Date::setTestNow($originalNow);
            }
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
