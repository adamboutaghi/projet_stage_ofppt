<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Semaine;
use App\Models\Seance;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

trait HandlesScheduleVisibility
{
    /**
     * Résout l'utilisateur même sur les routes publiques (token Bearer Sanctum).
     */
    protected function resolveApiUser(Request $request): ?User
    {
        $user = $request->user();

        if ($user) {
            return $user;
        }

        $token = $request->bearerToken();

        if (! $token) {
            return null;
        }

        return PersonalAccessToken::findToken($token)?->tokenable;
    }

    protected function isScheduleAdmin(?Request $request = null): bool
    {
        $request = $request ?? request();

        return $this->resolveApiUser($request)?->role === User::ROLE_SUPER_ADMIN;
    }

    protected function ensureSemaineVisible(Request $request, Semaine $semaine): void
    {
        if (! $semaine->est_publie && ! $this->isScheduleAdmin($request)) {
            abort(404, 'Emploi du temps non disponible');
        }
    }

    protected function ensureSeanceVisible(Request $request, Seance $seance): void
    {
        $seance->loadMissing('semaine');
        if ($seance->semaine) {
            $this->ensureSemaineVisible($request, $seance->semaine);
        }
    }
}
