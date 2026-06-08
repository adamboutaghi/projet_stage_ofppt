<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCanAccessSystem
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && ! $user->canAccessSystem()) {
            $user->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Ce compte n\'a plus accès au système.',
            ], 403);
        }

        return $next($request);
    }
}
