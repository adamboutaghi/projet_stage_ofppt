<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        try {
            $users = User::all();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single user
     */
    public function show($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => [
                'required',
                'email',
                Rule::unique('users')->whereNull('deleted_at') // 🔥 IGNORE soft deleted
            ],
            'password'  => 'required|min:8|confirmed',
            'role'      => 'nullable|in:etudiant,enseignant,super-admin'
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role ?? User::ROLE_ETUDIANT,
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user'    => $user,
            'token'   => $token
        ], 201);
    }

    /**
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'     => 'required|email',
            'password'  => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        if (! $user->canAccessSystem()) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte n\'a plus accès au système.'],
            ]);
        }

        // Supprimer anciens tokens
        $user->tokens()->delete();

        // Nouveau token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Enregistrer la session
        DB::table('sessions')->insert([
            'id'            => Str::uuid()->toString(),
            'user_id'       => $user->id,
            'ip_address'    => $request->ip(),
            'user_agent'    => $request->userAgent(),
            'payload'       => json_encode(['token' => $token]),
            'last_activity' => time()
        ]);

        return response()->json([
            'message' => 'Connecté avec succès',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user (admin editing)
     */
    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $request->validate([
        'name'  => 'nullable|string|max:255',
        'email' => [
            'nullable',
            'email',
            Rule::unique('users')
                ->ignore($user->id)
                ->whereNull('deleted_at')
        ],
        'role'  => 'nullable|in:etudiant,enseignant,super-admin',
        'password' => 'nullable|min:8|confirmed'
    ]);

    $data = $request->only(['name', 'email', 'role']);

    // 🔐 Mise à jour du mot de passe si fourni
    if ($request->filled('password')) {
        $data['password'] = Hash::make($request->password);
    }

    $user->update($data);

    return response()->json([
        'message' => 'Utilisateur mis à jour avec succès',
        'user' => $user
    ]);
}


    /**
     * Update authenticated user's password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Ancien mot de passe incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    /**
     * Delete user (admin)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        DB::table('sessions')->where('user_id', $id)->delete();
        $user->delete(); // Soft delete si SoftDeletes est activé

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Get all active sessions of authenticated user
     */
    public function getActiveSessions(Request $request)
    {
        $user = $request->user();

        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'session_id'    => $session->id,
                    'ip_address'    => $session->ip_address,
                    'user_agent'    => $session->user_agent,
                    'last_activity' => date('Y-m-d H:i:s', $session->last_activity),
                ];
            });

        return response()->json([
            'user_id'  => $user->id,
            'sessions' => $sessions
        ]);
    }

    /**
     * Delete authenticated user's account
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        DB::table('sessions')->where('user_id', $user->id)->delete();
        $user->delete();

        return response()->json([
            'message' => 'Compte supprimé (soft delete)'
        ]);
    }
}
