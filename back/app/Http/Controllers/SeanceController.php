<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HandlesScheduleVisibility;
use Illuminate\Http\Request;
use App\Models\Seance;
use App\Models\Semaine;
use App\Services\ScheduleNotificationService;
use App\Services\SeanceConflictService;

class SeanceController extends Controller
{
    use HandlesScheduleVisibility;

    public function __construct(
        protected ScheduleNotificationService $notifications,
        protected SeanceConflictService $conflicts
    ) {}

    public function index(Request $request)
    {
        $query = Seance::with(['semaine', 'groupe', 'cours'])
            ->orderBy('jour', 'asc')
            ->orderBy('heure_debut', 'asc');

        if (! $this->isScheduleAdmin($request)) {
            $query->whereHas('semaine', fn ($q) => $q->where('est_publie', true));
        }

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        $seance = Seance::with(['semaine', 'groupe', 'cours'])->findOrFail($id);
        $this->ensureSeanceVisible($request, $seance);

        return response()->json($seance);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'salle' => 'nullable|string|max:255',
            'jour' => 'required|integer|min:0|max:6',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
            'type' => 'required|string|in:cours,td,tp,exam',
            'cours_id' => 'required|exists:cours,id',
            'groupe_id' => 'required|exists:groupes,id',
            'semaine_id' => 'required|exists:semaines,id',
        ]);

        $conflictErrors = $this->conflicts->validate($validated);
        if ($conflictErrors !== []) {
            return $this->conflictResponse($conflictErrors);
        }

        $seance = Seance::create($validated);
        $this->notifications->notifySeanceChange((int) $seance->semaine_id);

        return response()->json($seance->load(['semaine', 'groupe', 'cours']), 201);
    }

    public function update(Request $request, $id)
    {
        $seance = Seance::findOrFail($id);

        $validated = $request->validate([
            'salle' => 'sometimes|nullable|string|max:255',
            'jour' => 'sometimes|integer|min:0|max:6',
            'heure_debut' => 'sometimes|date_format:H:i',
            'heure_fin' => 'sometimes|date_format:H:i|after:heure_debut',
            'type' => 'sometimes|string|in:cours,td,tp,exam',
            'cours_id' => 'sometimes|exists:cours,id',
            'groupe_id' => 'sometimes|exists:groupes,id',
            'semaine_id' => 'sometimes|exists:semaines,id',
        ]);

        $merged = array_merge(
            $seance->only(['salle', 'jour', 'heure_debut', 'heure_fin', 'type', 'cours_id', 'groupe_id', 'semaine_id']),
            $validated
        );

        $conflictErrors = $this->conflicts->validate($merged, (int) $seance->id);
        if ($conflictErrors !== []) {
            return $this->conflictResponse($conflictErrors);
        }

        $semaineId = (int) $seance->semaine_id;
        $seance->update($validated);
        $this->notifications->notifySeanceChange($semaineId);

        return response()->json($seance->load(['semaine', 'groupe', 'cours']));
    }

    public function destroy($id)
    {
        $seance = Seance::findOrFail($id);
        $semaineId = (int) $seance->semaine_id;
        $seance->delete();
        $this->notifications->notifySeanceChange($semaineId);

        return response()->json(['message' => 'Séance supprimée']);
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    protected function conflictResponse(array $errors)
    {
        return response()->json([
            'message' => 'Conflit détecté dans l\'emploi du temps.',
            'errors' => $errors,
        ], 422);
    }
}
