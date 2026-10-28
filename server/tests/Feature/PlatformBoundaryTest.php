<?php

namespace Tests\Feature;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tests\TestCase;

class PlatformBoundaryTest extends TestCase
{
    public function test_unknown_api_routes_return_safe_json_without_an_accept_header(): void
    {
        $response = $this->get('/api/v1/missing');

        $response->assertNotFound()->assertJsonPath('code', 'not_found');
        $this->assertTrue(Str::isUuid($response->json('request_id')));
        $response->assertHeader('X-Request-ID', $response->json('request_id'));
        $response->assertJsonMissingPath('exception');
    }

    public function test_server_errors_are_redacted_even_when_debug_is_enabled(): void
    {
        config(['app.debug' => true]);
        Log::spy();
        Route::get('/api/v1/test-error', fn () => throw new \RuntimeException('private clinical text'));

        $this->getJson('/api/v1/test-error')->assertStatus(500)
            ->assertJsonPath('message', 'Internal server error.')
            ->assertJsonPath('code', 'internal_error')
            ->assertDontSee('private clinical text')->assertJsonMissingPath('trace');
        Log::shouldHaveReceived('error')->with('API request failed.', ['exception_type' => \RuntimeException::class])->once();
    }

    public function test_validation_errors_keep_field_messages_in_the_common_contract(): void
    {
        Route::post('/api/v1/test-validation', function (Request $request) {
            $request->validate(['name' => ['required', 'string']]);
        });

        $this->postJson('/api/v1/test-validation', [])->assertUnprocessable()
            ->assertJsonPath('code', 'validation_failed')
            ->assertJsonStructure(['message', 'request_id', 'errors' => ['name']]);
    }

    public function test_authentication_and_rate_limit_errors_keep_status_and_retry_headers(): void
    {
        Route::get('/api/v1/test-auth', fn () => response()->noContent())->middleware('auth:sanctum');
        Route::get('/api/v1/test-limited', fn () => abort(429, 'unsafe detail', ['Retry-After' => '30']));

        $this->get('/api/v1/test-auth')->assertUnauthorized()->assertJsonPath('code', 'unauthenticated');
        $this->get('/api/v1/test-limited')->assertStatus(429)->assertHeader('Retry-After', '30')
            ->assertJsonPath('code', 'rate_limited')->assertDontSee('unsafe detail');
    }

    public function test_request_ids_are_server_generated_and_forwarded_ips_are_not_trusted_by_default(): void
    {
        Route::get('/api/v1/test-ip', fn (Request $request) => ['ip' => $request->ip()]);

        $response = $this->withHeaders(['X-Request-ID' => 'forged', 'X-Forwarded-For' => '203.0.113.5'])
            ->getJson('/api/v1/test-ip');

        $response->assertJsonPath('ip', '127.0.0.1');
        $this->assertNotSame('forged', $response->headers->get('X-Request-ID'));
        $this->assertTrue(Str::isUuid($response->headers->get('X-Request-ID')));
    }

    public function test_cors_allows_only_the_configured_frontend_origin(): void
    {
        $allowed = config('cors.allowed_origins')[0];
        $this->withHeaders(['Origin' => $allowed, 'Access-Control-Request-Method' => 'POST'])
            ->options('/api/v1/anything')->assertHeader('Access-Control-Allow-Origin', $allowed)
            ->assertHeader('Access-Control-Allow-Credentials', 'true');

        $denied = $this->withHeaders(['Origin' => 'https://untrusted.example', 'Access-Control-Request-Method' => 'POST'])
            ->options('/api/v1/anything');
        $this->assertNotSame('https://untrusted.example', $denied->headers->get('Access-Control-Allow-Origin'));
        $this->assertNotSame('*', $denied->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_liveness_has_a_minimal_json_response(): void
    {
        $this->getJson('/up')->assertOk()->assertExactJson(['status' => 'ok']);
    }

    public function test_explicitly_configured_proxies_supply_the_client_ip(): void
    {
        config(['trustedproxy.proxies' => ['127.0.0.1']]);
        Route::get('/api/v1/test-trusted-ip', fn (Request $request) => ['ip' => $request->ip()]);
        $this->withHeaders(['X-Forwarded-For' => '203.0.113.5'])->getJson('/api/v1/test-trusted-ip')
            ->assertOk()->assertJsonPath('ip', '203.0.113.5');
    }
}
