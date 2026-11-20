<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\RelationalBenchmark;
use App\Support\RelationalBenchmarkFixtures;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RelationalBenchmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_fixtures_include_available_slots_and_growing_patient_history(): void
    {
        $counts = (new RelationalBenchmarkFixtures)->seed(1);
        $patient = RelationalBenchmarkFixtures::id('patient', 0);

        $this->assertSame(8, $counts['users']);
        $this->assertSame(10, DB::table('slots')->where('status', 'FREE')->where('start_at', '>', '2026-01-01')->count());
        $this->assertSame(5, DB::table('notifications')->where('user_id', $patient)->count());
        $this->assertSame(5, DB::table('appointments')->where('patient_id', $patient)->count());
        $this->assertSame([], DB::select('PRAGMA foreign_key_check'));
    }

    public function test_runner_isolates_database_and_preserves_equivalent_results(): void
    {
        $connection = DB::connection();
        $config = config('database');
        $request = app('request');
        $result = (new RelationalBenchmark)->run([1], 1, 1, 0);

        $this->assertSame($config, config('database'));
        $this->assertSame($connection, DB::connection());
        $this->assertSame($request, app('request'));
        $this->assertSame(0, DB::table('users')->count());
        $this->assertCount(8, $result['scales'][0]['cases']);
        foreach ($result['scales'][0]['cases'] as $case) {
            $this->assertCount(2, $case['samples']);
            [$before, $after] = $case['samples'];
            $this->assertNull($before['error'], $case['name']);
            $this->assertNull($after['error'], $case['name']);
            $this->assertGreaterThan(0, $before['rows'], $case['name']);
            $this->assertSame($before['checksum'], $after['checksum'], $case['name']);
            $this->assertGreaterThan(0, $before['query_count']);
            $this->assertNotEmpty($case['plans']);
        }
    }

    public function test_fixture_batches_insert_new_patients_before_their_histories(): void
    {
        $counts = (new RelationalBenchmarkFixtures)->seed(11);

        $this->assertSame(58, $counts['users']);
        $this->assertSame(110, DB::table('appointments')->count());
        $this->assertSame(55, DB::table('notifications')->where('user_id', RelationalBenchmarkFixtures::id('patient', 0))->count());
        $this->assertSame([], DB::select('PRAGMA foreign_key_check'));
    }

    public function test_runner_refuses_production_before_opening_a_database(): void
    {
        $this->app->instance('env', 'production');
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('local or testing');
        (new RelationalBenchmark)->run([1], 1, 1, 0);
    }

    public function test_seed_failures_are_recorded_and_process_state_is_restored(): void
    {
        $this->travelTo(CarbonImmutable::parse('2027-03-04 05:06:07 UTC'));
        $originalNow = Date::getTestNow();
        $connection = DB::connection();
        $config = config('database');
        $user = User::factory()->create();
        $this->actingAs($user);
        $temporaryPath = null;
        $this->mock(RelationalBenchmarkFixtures::class, function ($mock) use (&$temporaryPath): void {
            $mock->shouldReceive('seed')->once()->andReturnUsing(function () use (&$temporaryPath): never {
                $temporaryPath = DB::connection()->getConfig('database');
                throw new \RuntimeException('Synthetic seed failure');
            });
        });

        $result = (new RelationalBenchmark)->run([1], 1, 1, 0);

        $this->assertSame($config, config('database'));
        $this->assertSame($connection, DB::connection());
        $this->assertSame($user, Auth::user());
        $this->assertSame($originalNow->toISOString(), Date::getTestNow()->toISOString());
        $this->assertSame('2027-03-04 05:06:07', CarbonImmutable::now('UTC')->format('Y-m-d H:i:s'));
        $this->assertFileDoesNotExist($temporaryPath);
        $this->assertSame('RuntimeException: Synthetic seed failure', $result['scales'][0]['errors'][0]['error']);
        foreach ($result['scales'][0]['cases'] as $case) {
            $this->assertCount(2, $case['samples']);
            $this->assertSame('RuntimeException: Synthetic seed failure', $case['samples'][0]['error']);
        }
    }

    public function test_command_refuses_existing_output_without_changing_it(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'relational-existing-');
        file_put_contents($path, 'keep this existing file');
        try {
            $this->artisan('app:benchmark-relational', ['--output' => $path])->assertExitCode(1);
            $this->assertSame('keep this existing file', file_get_contents($path));
        } finally {
            unlink($path);
        }
    }

    public function test_command_preserves_artifact_and_fails_for_unequal_results(): void
    {
        $path = sys_get_temp_dir().'/relational-mismatch-'.bin2hex(random_bytes(8)).'.json';
        $this->mock(RelationalBenchmark::class, function ($mock): void {
            $mock->shouldReceive('run')->once()->andReturn(['scales' => [['cases' => [['samples' => [
                ['block' => 0, 'pair' => 0, 'variant' => 'before', 'rows' => 1, 'checksum' => 'before', 'error' => null],
                ['block' => 0, 'pair' => 0, 'variant' => 'after', 'rows' => 1, 'checksum' => 'changed', 'error' => null],
            ]]]]]]);
        });
        try {
            $this->artisan('app:benchmark-relational', ['--output' => $path])->assertExitCode(1);
            $artifact = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
            $this->assertSame('changed', $artifact['scales'][0]['cases'][0]['samples'][1]['checksum']);
        } finally {
            if (is_file($path)) {
                unlink($path);
            }
        }
    }
}
