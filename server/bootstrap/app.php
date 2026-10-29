<?php

use App\Exceptions\ApiExceptionResponse;
use App\Http\Controllers\HealthController;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\RequestContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        then: function (): void {
            require __DIR__.'/../routes/channels.php';
            Route::get('/up', [HealthController::class, 'live'])->name('health.live');
            Route::get('/ready', [HealthController::class, 'ready'])->name('health.ready');
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(RequestContext::class);
        $middleware->trimStrings(except: [fn (Request $request): bool => $request->is('api/v1/soaps/*')]);
        $middleware->statefulApi();
        $middleware->redirectGuestsTo(fn (): ?string => null);
        $middleware->alias(['account.active' => EnsureAccountIsActive::class]);
        $middleware->trustProxies(
            headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request): bool => $request->is('api/*', 'login', 'logout', 'ready', 'up') || $request->expectsJson());
        $exceptions->respond(fn (Response $response, Throwable $exception, Request $request): Response => ApiExceptionResponse::render($response, $exception, $request));
        $exceptions->report(function (Throwable $exception): ?bool {
            if (request()->is('api/*', 'login', 'logout', 'ready')) {
                Log::error('API request failed.', ['exception_type' => $exception::class]);

                return false;
            }

            return null;
        });
    })->create();
