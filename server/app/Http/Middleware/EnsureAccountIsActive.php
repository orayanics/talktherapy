<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user()?->refresh();

        abort_unless($user?->profile?->status === UserStatus::Active, 403);
        $sessionVersion = $request->hasSession()
            ? $request->session()->get('auth_session_version')
            : null;
        abort_if(
            $user->session_version > 0
                && $sessionVersion !== $user->session_version,
            403,
        );

        return $next($request);
    }
}
