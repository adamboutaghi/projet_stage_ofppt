<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesScheduleVisibility;
use Illuminate\Http\Request;
use App\Models\Semaine;
use App\Services\ScheduleNotificationService;

class SemaineController extends Controller
{
    use HandlesScheduleVisibility;

    public function __construct(
        protected ScheduleNotificationService $notifications
    ) {}

    /** Liste publique : semaines publiées uniquement (étudiant / enseignant). */
    public function index()
    {
        $semaines = Semaine::published()
            ->orderByDesc('date_debut')
            ->get();

        return response()->json($semaines);
    }

    /** Liste admin : toutes les semaines (brouillons + publiées). */
    public function indexAdmin()
    {
        $semaines = Semaine::query()
            ->orderByDesc('date_debut')
            ->get();

        return response()->json($semaines);
    }

    public function show(Request $request, $id)
    {
        $semaine = Semaine::with([
            'seances' => function ($query) {
                $query->orderBy('jour', 'asc')
                      ->orderBy('heure_debut', 'asc');
            },
            'seances.groupe',
            'seances.cours',
        ])->findOrFail($id);

        $this->ensureSemaineVisible($request, $semaine);

        return response()->json($semaine);
    }

    public function semaineActuelle(Request $request)
    {
        $aujourdhui = now()->format('Y-m-d');

        $semaine = Semaine::queryVisibleTo($this->resolveApiUser($request))
            ->where('date_debut', '<=', $aujourdhui)
            ->where('date_fin', '>=', $aujourdhui)
            ->first();

        if (! $semaine) {
            $semaine = Semaine::queryVisibleTo($this->resolveApiUser($request))
                ->orderBy('date_debut', 'desc')
                ->first();
        }

        return response()->json($semaine);
    }

    public function emploi(Request $request, $id)
    {
        $semaine = Semaine::with(['seances.groupe', 'seances.cours'])
            ->findOrFail($id);

        $this->ensureSemaineVisible($request, $semaine);

        $visibleQuery = Semaine::queryVisibleTo($this->resolveApiUser($request));

        $semainePrecedente = (clone $visibleQuery)
            ->where('id', '<', $id)
            ->orderBy('id', 'desc')
            ->first();

        $semaineSuivante = (clone $visibleQuery)
            ->where('id', '>', $id)
            ->orderBy('id', 'asc')
            ->first();

        $groupes = [];

        foreach ($semaine->seances as $seance) {
            $groupeId = $seance->groupe->id;

            if (! isset($groupes[$groupeId])) {
                $groupes[$groupeId] = [
                    'id' => $seance->groupe->id,
                    'nom' => $seance->groupe->nom,
                    'filiere' => $seance->groupe->filiere,
                    'jours' => array_fill(0, 7, []),
                ];
            }

            $groupes[$groupeId]['jours'][$seance->jour][] = [
                'id' => $seance->id,
                'cours' => $seance->cours,
                'heure_debut' => $seance->heure_debut,
                'heure_fin' => $seance->heure_fin,
                'salle' => $seance->salle,
                'type' => $seance->type,
            ];
        }

        return response()->json([
            'id' => $semaine->id,
            'titre' => $semaine->titre,
            'date_debut' => $semaine->date_debut,
            'date_fin' => $semaine->date_fin,
            'est_publie' => $semaine->est_publie,
            'groupes' => array_values($groupes),
            'navigation' => [
                'precedente' => $semainePrecedente?->id,
                'suivante' => $semaineSuivante?->id,
            ],
        ]);
    }

    public function emploiMultiples(Request $request)
    {
        $request->validate([
            'semaines' => 'required|array',
            'semaines.*' => 'integer|exists:semaines,id',
        ]);

        $result = [];

        foreach ($request->semaines as $semaineId) {
            $semaine = Semaine::with(['seances.groupe', 'seances.cours'])
                ->find($semaineId);

            if (! $semaine) {
                continue;
            }

            if (! $semaine->est_publie && ! $this->isScheduleAdmin($request)) {
                continue;
            }

            $groupes = [];
            foreach ($semaine->seances as $seance) {
                $groupeId = $seance->groupe->id;
                if (! isset($groupes[$groupeId])) {
                    $groupes[$groupeId] = [
                        'id' => $seance->groupe->id,
                        'nom' => $seance->groupe->nom,
                        'filiere' => $seance->groupe->filiere,
                        'jours' => array_fill(0, 7, []),
                    ];
                }
                $groupes[$groupeId]['jours'][$seance->jour][] = [
                    'id' => $seance->id,
                    'cours' => $seance->cours,
                    'heure_debut' => $seance->heure_debut,
                    'heure_fin' => $seance->heure_fin,
                    'salle' => $seance->salle,
                    'type' => $seance->type,
                ];
            }

            $result[] = [
                'semaine' => $semaine,
                'groupes' => array_values($groupes),
            ];
        }

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
        ]);

        $semaine = Semaine::create([
            ...$validated,
            'est_publie' => false,
        ]);

        return response()->json($semaine, 201);
    }

    public function update(Request $request, $id)
    {
        $semaine = Semaine::findOrFail($id);
        $wasPublished = $semaine->est_publie;

        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|date|after_or_equal:date_debut',
        ]);

        $semaine->update($validated);
        $semaine->refresh();

        if ($wasPublished && $semaine->est_publie) {
            $this->notifications->notifyUpdated($semaine);
        }

        return response()->json($semaine);
    }

    public function publish($id)
    {
        $semaine = Semaine::findOrFail($id);

        if (! $semaine->est_publie) {
            $semaine->update(['est_publie' => true]);
            $this->notifications->notifyPublished($semaine->fresh());
        }

        return response()->json($semaine->fresh());
    }

    public function destroy($id)
    {
        $semaine = Semaine::findOrFail($id);
        $semaine->delete();

        return response()->json(['message' => 'Semaine supprimée']);
    }
}
