<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuperAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'super-admin') {
            return response()->json([
                'message' => 'Accès refusé. Super-admin requis.'
            ], 403);
        }

        return $next($request);
    }
}
