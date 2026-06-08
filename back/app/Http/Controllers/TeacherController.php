<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use App\Models\Seance;
use App\Models\Semaine;
use App\Models\User;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->role !== User::ROLE_ENSEIGNANT) {
            return response()->json(['message' => 'Réservé aux enseignants'], 403);
        }

        $professeur = $this->resolveProfessorName($user);

        return response()->json([
            'name' => $user->name,
            'professeur' => $professeur,
        ]);
    }

    /**
     * Filtres pour l'espace enseignant : professeurs (table cours) + semaines publiées.
     */
    public function filters(Request $request)
    {
        $user = $request->user();
        $professeurs = $this->professeursFromCours();
        $semaines = $this->publishedSemainesList();

        $defaultProfesseur = null;
        if ($user?->role === User::ROLE_ENSEIGNANT) {
            $defaultProfesseur = $this->resolveProfessorName($user);
        }

        $defaultSemaineId = $this->resolveDefaultSemaineId($semaines);

        return response()->json([
            'professeurs' => $professeurs,
            'semaines' => $semaines,
            'default_professeur' => $defaultProfesseur,
            'default_semaine_id' => $defaultSemaineId,
        ]);
    }

    public function professeurs()
    {
        return response()->json($this->professeursFromCours());
    }

    public function semaines()
    {
        return response()->json($this->publishedSemainesList());
    }

    public function schedule(Request $request)
    {
        $validated = $request->validate([
            'professeur' => 'required|string|max:255',
            'semaine_id' => 'required|integer|exists:semaines,id',
        ]);

        $prof = trim($validated['professeur']);
        $semaineId = (int) $validated['semaine_id'];

        $semaine = Semaine::published()->find($semaineId);

        if (! $semaine) {
            return response()->json(['message' => 'Emploi du temps non publié ou introuvable'], 404);
        }

        if (! $this->professeurExistsInCours($prof)) {
            return response()->json(['message' => 'Professeur introuvable'], 404);
        }

        return response()->json([
            'professeur' => $prof,
            'semaine' => $semaine->only(['id', 'titre', 'date_debut', 'date_fin']),
            'schedule' => $this->buildSchedule($semaineId, $prof),
        ]);
    }

    public function mySchedule(Request $request)
    {
        $user = $request->user();

        if ($user->role !== User::ROLE_ENSEIGNANT) {
            return response()->json(['message' => 'Réservé aux enseignants'], 403);
        }

        $semaineId = $request->query('semaine_id');
        $prof = $this->resolveProfessorName($user);

        if (! $prof) {
            return response()->json([
                'message' => 'Aucun cours associé à votre profil. Contactez l\'administration.',
                'schedule' => [],
            ], 200);
        }

        if (! $semaineId) {
            return response()->json(['message' => 'Semaine requise'], 400);
        }

        $semaine = Semaine::published()->find($semaineId);

        if (! $semaine) {
            return response()->json(['message' => 'Emploi du temps non disponible'], 404);
        }

        return response()->json([
            'professeur' => $prof,
            'semaine' => $semaine->only(['id', 'titre', 'date_debut', 'date_fin']),
            'schedule' => $this->buildSchedule((int) $semaineId, $prof),
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $prof = $request->query('professeur');

        if ($user?->role === User::ROLE_ENSEIGNANT) {
            $prof = $this->resolveProfessorName($user) ?? $prof;
        }

        if (! $prof) {
            return response()->json(['message' => 'Professeur requis'], 400);
        }

        $seances = Seance::query()
            ->whereHas('cours', fn ($q) => $q->where('professeur', $prof))
            ->whereHas('semaine', fn ($q) => $q->where('est_publie', true))
            ->with(['cours', 'groupe'])
            ->get();

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        $recent = $seances
            ->sortByDesc('id')
            ->take(5)
            ->map(function ($s) use ($jours) {
                return [
                    'cours' => $s->cours->intitule ?? '—',
                    'groupe' => $s->groupe->nom ?? '—',
                    'jour' => $jours[$s->jour] ?? (string) $s->jour,
                    'salle' => $s->salle ?? '—',
                ];
            })
            ->values();

        return response()->json([
            'cours_count' => $seances->pluck('cours_id')->unique()->count(),
            'groupes_count' => $seances->pluck('groupe_id')->unique()->count(),
            'seances_count' => $seances->count(),
            'recent_cours' => $recent,
        ]);
    }

    protected function professeursFromCours(): array
    {
        return Cour::query()
            ->select('professeur')
            ->whereNotNull('professeur')
            ->where('professeur', '!=', '')
            ->distinct()
            ->orderBy('professeur')
            ->pluck('professeur')
            ->map(fn ($p) => trim((string) $p))
            ->filter()
            ->values()
            ->all();
    }

    protected function professeurExistsInCours(string $prof): bool
    {
        return Cour::query()->where('professeur', $prof)->exists();
    }

    protected function publishedSemainesList(): array
    {
        return Semaine::published()
            ->orderByDesc('date_debut')
            ->get(['id', 'titre', 'date_debut', 'date_fin'])
            ->map(fn ($s) => $s->only(['id', 'titre', 'date_debut', 'date_fin']))
            ->values()
            ->all();
    }

    protected function resolveDefaultSemaineId(array $semaines): ?int
    {
        if ($semaines === []) {
            return null;
        }

        $actuelle = Semaine::published()
            ->where('date_debut', '<=', now()->toDateString())
            ->where('date_fin', '>=', now()->toDateString())
            ->orderByDesc('date_debut')
            ->first();

        if ($actuelle) {
            return $actuelle->id;
        }

        return $semaines[0]['id'] ?? null;
    }

    protected function buildSchedule(int $semaineId, string $prof): array
    {
        $semaine = Semaine::published()->find($semaineId);

        if (! $semaine) {
            return [];
        }

        $seances = Seance::query()
            ->where('semaine_id', $semaine->id)
            ->whereHas('cours', fn ($q) => $q->where('professeur', $prof))
            ->with(['cours:id,intitule,professeur', 'groupe:id,nom'])
            ->orderBy('jour')
            ->orderBy('heure_debut')
            ->get();

        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        return $seances->map(function ($s) use ($jours) {
            return [
                'id' => $s->id,
                'jour' => $jours[$s->jour] ?? $s->jour,
                'heure' => substr((string) $s->heure_debut, 0, 5).' - '.substr((string) $s->heure_fin, 0, 5),
                'cours' => $s->cours->intitule ?? '—',
                'groupe' => $s->groupe->nom ?? '—',
                'salle' => $s->salle,
                'type' => $s->type,
            ];
        })->values()->all();
    }

    protected function resolveProfessorName(User $user): ?string
    {
        $profs = collect($this->professeursFromCours());

        if ($profs->isEmpty()) {
            return null;
        }

        $name = mb_strtolower(trim($user->name ?? ''));

        foreach ($profs as $prof) {
            $p = mb_strtolower(trim($prof));
            if ($name === $p || str_contains($name, $p) || str_contains($p, $name)) {
                return $prof;
            }
        }

        return null;
    }
}
