<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ApiExceptionResponse
{
    public static function render(Response $response, Throwable $exception, Request $request): Response
    {
        if (! $request->is('api/*', 'login', 'logout', 'ready', 'up') && ! $request->expectsJson()) {
            return $response;
        }

        $status = $response->getStatusCode();
        [$code, $message] = match ($status) {
            401 => ['unauthenticated', 'Authentication required.'],
            403 => ['forbidden', 'This action is not allowed.'],
            404 => ['not_found', 'Resource not found.'],
            405 => ['method_not_allowed', 'Method not allowed.'],
            409 => ['conflict', 'The resource state conflicts with this request.'],
            413 => ['payload_too_large', 'The request is too large.'],
            419 => ['csrf_mismatch', 'Your session has expired. Refresh and try again.'],
            422 => ['validation_failed', 'The given data was invalid.'],
            429 => ['rate_limited', 'Too many requests. Please try again later.'],
            502 => ['invalid_upstream_response', 'The upstream service returned an invalid response.'],
            503 => ['service_unavailable', 'The service is unavailable.'],
            504 => ['upstream_timeout', 'The upstream service timed out.'],
            default => $status >= 500
                ? ['internal_error', 'Internal server error.']
                : ['invalid_request', 'The request could not be processed.'],
        };

        $payload = ['message' => $message, 'code' => $code,
            'request_id' => $request->attributes->get('request_id')];
        if ($exception instanceof ValidationException) {
            $payload['errors'] = $exception->errors();
        }

        $headers = $response->headers->all();
        unset($headers['content-type'], $headers['content-length']);

        return new JsonResponse($payload, $status, $headers);
    }
}
