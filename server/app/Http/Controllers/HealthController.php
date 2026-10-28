<?php

namespace App\Http\Controllers;

use Illuminate\Encryption\Encrypter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class HealthController extends Controller
{
    public function live(): JsonResponse
    {
        return new JsonResponse(['status' => 'ok']);
    }

    public function ready(Request $request): JsonResponse
    {
        $secret = config('health.readiness_token');
        if (! is_string($secret) || $secret === '') {
            return $this->unavailable($request);
        }
        if (! hash_equals($secret, $request->bearerToken() ?? '')) {
            return new JsonResponse([
                'message' => 'Authentication required.',
                'code' => 'unauthenticated',
                'request_id' => $request->attributes->get('request_id'),
            ], 401);
        }

        try {
            if (app()->isProduction() && config('app.debug')) {
                return $this->unavailable($request);
            }

            $key = config('app.key');
            if (is_string($key) && str_starts_with($key, 'base64:')) {
                $key = base64_decode(substr($key, 7), true);
            }
            if (! is_string($key) || ! Encrypter::supported($key, config('app.cipher'))) {
                return $this->unavailable($request);
            }
            DB::connection()->getPdo();
            foreach (['users', 'audit_logs', 'outbox_messages'] as $table) {
                if (! Schema::hasTable($table)) {
                    return $this->unavailable($request);
                }
            }

            $probe = 'readiness:'.Str::uuid();
            Cache::put($probe, 'ok', 10);
            if (Cache::pull($probe) !== 'ok') {
                return $this->unavailable($request);
            }
            Queue::connection()->size();
        } catch (Throwable $exception) {
            Log::warning('Dependency readiness failed.', ['exception_type' => $exception::class]);

            return $this->unavailable($request);
        }

        return new JsonResponse(['status' => 'ready']);
    }

    private function unavailable(Request $request): JsonResponse
    {
        return new JsonResponse([
            'message' => 'The service is unavailable.',
            'code' => 'service_unavailable',
            'request_id' => $request->attributes->get('request_id'),
        ], 503);
    }
}
