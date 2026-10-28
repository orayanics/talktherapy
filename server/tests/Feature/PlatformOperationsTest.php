<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PlatformOperationsTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_readiness_requires_an_operator_token_and_never_accepts_a_query_secret(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret']);
        $this->getJson('/ready')->assertUnauthorized();
        $this->getJson('/ready?token=test-readiness-secret')->assertUnauthorized();
        $this->withToken('wrong-token')->getJson('/ready')->assertUnauthorized();
    }

    public function test_unconfigured_readiness_is_closed(): void
    {
        config(['health.readiness_token' => '']);
        $this->getJson('/ready')->assertServiceUnavailable()->assertJsonPath('code', 'service_unavailable');
    }

    public function test_readiness_confirms_dependencies_without_exposing_configuration(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret']);
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertOk()
            ->assertExactJson(['status' => 'ready']);
    }

    public function test_database_failure_returns_safe_unready_response(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret']);
        DB::shouldReceive('connection')->andThrow(new \RuntimeException('private database credentials'));
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertServiceUnavailable()
            ->assertDontSee('private database credentials')->assertJsonPath('code', 'service_unavailable');
    }

    public function test_failed_cache_probe_is_unready(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret']);
        Cache::shouldReceive('put')->once()->andReturn(false);
        Cache::shouldReceive('pull')->once()->andReturn(null);
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertServiceUnavailable();
    }

    public function test_unavailable_queue_is_unready(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret']);
        Queue::shouldReceive('connection')->once()->andThrow(new \RuntimeException('private queue credentials'));
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertServiceUnavailable()
            ->assertDontSee('private queue credentials');
    }

    public function test_production_debug_configuration_is_unready(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret', 'app.debug' => true]);
        $this->app->instance('env', 'production');
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertServiceUnavailable();
    }

    public function test_liveness_does_not_start_a_database_session(): void
    {
        config(['session.driver' => 'database', 'database.connections.sqlite.database' => '/missing/readiness/database.sqlite']);
        $this->getJson('/up')->assertOk()->assertExactJson(['status' => 'ok']);
    }

    public function test_missing_encryption_key_is_unready_without_breaking_liveness(): void
    {
        config(['health.readiness_token' => 'test-readiness-secret', 'app.key' => '']);
        $this->getJson('/up')->assertOk();
        $this->withToken('test-readiness-secret')->getJson('/ready')->assertServiceUnavailable();
    }
}
