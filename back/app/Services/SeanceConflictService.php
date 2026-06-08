<?php

namespace App\Services;

use App\Models\Cour;
use App\Models\Seance;
use Illuminate\Database\Eloquent\Builder;

class SeanceConflictService
{
    public const MSG_SALLE = 'Cette salle est déjà occupée à cet horaire.';

    public const MSG_PROFESSEUR = 'Cet enseignant a déjà une séance dans cette période.';

    public const MSG_GROUPE = 'Ce groupe a déjà une séance à cet horaire.';

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, list<string>>
     */
    public function validate(array $attributes, ?int $excludeSeanceId = null): array
    {
        $errors = [];

        $heureDebut = $this->normalizeTime($attributes['heure_debut'] ?? null);
        $heureFin = $this->normalizeTime($attributes['heure_fin'] ?? null);

        if ($heureDebut === '' || $heureFin === '' || $heureDebut >= $heureFin) {
            return $errors;
        }

        $jour = (int) ($attributes['jour'] ?? 0);
        $semaineId = (int) ($attributes['semaine_id'] ?? 0);

        if ($semaineId <= 0) {
            return $errors;
        }

        $salle = trim((string) ($attributes['salle'] ?? ''));
        if ($salle !== '' && $this->hasRoomConflict($salle, $jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)) {
            $errors['salle'][] = self::MSG_SALLE;
        }

        $groupeId = (int) ($attributes['groupe_id'] ?? 0);
        if ($groupeId > 0 && $this->hasGroupeConflict($groupeId, $jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)) {
            $errors['groupe_id'][] = self::MSG_GROUPE;
        }

        $coursId = (int) ($attributes['cours_id'] ?? 0);
        if ($coursId > 0) {
            $professeur = Cour::query()->whereKey($coursId)->value('professeur');
            if (is_string($professeur) && trim($professeur) !== ''
                && $this->hasProfessorConflict($professeur, $jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)) {
                $errors['cours_id'][] = self::MSG_PROFESSEUR;
            }
        }

        return $errors;
    }

    protected function hasRoomConflict(
        string $salle,
        int $jour,
        int $semaineId,
        string $heureDebut,
        string $heureFin,
        ?int $excludeSeanceId
    ): bool {
        $normalizedSalle = strtolower(trim($salle));

        return $this->overlappingQuery($jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)
            ->whereNotNull('salle')
            ->where('salle', '!=', '')
            ->whereRaw('LOWER(TRIM(salle)) = ?', [$normalizedSalle])
            ->exists();
    }

    protected function hasGroupeConflict(
        int $groupeId,
        int $jour,
        int $semaineId,
        string $heureDebut,
        string $heureFin,
        ?int $excludeSeanceId
    ): bool {
        return $this->overlappingQuery($jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)
            ->where('groupe_id', $groupeId)
            ->exists();
    }

    protected function hasProfessorConflict(
        string $professeur,
        int $jour,
        int $semaineId,
        string $heureDebut,
        string $heureFin,
        ?int $excludeSeanceId
    ): bool {
        return $this->overlappingQuery($jour, $semaineId, $heureDebut, $heureFin, $excludeSeanceId)
            ->whereHas('cours', fn (Builder $q) => $q->where('professeur', $professeur))
            ->exists();
    }

    protected function overlappingQuery(
        int $jour,
        int $semaineId,
        string $heureDebut,
        string $heureFin,
        ?int $excludeSeanceId
    ): Builder {
        return Seance::query()
            ->where('jour', $jour)
            ->where('semaine_id', $semaineId)
            ->where('heure_debut', '<', $heureFin)
            ->where('heure_fin', '>', $heureDebut)
            ->when($excludeSeanceId, fn (Builder $q) => $q->where('id', '!=', $excludeSeanceId));
    }

    protected function normalizeTime(mixed $time): string
    {
        if ($time === null || $time === '') {
            return '';
        }

        $str = (string) $time;

        if (str_contains($str, ' ')) {
            $str = explode(' ', $str)[1] ?? $str;
        }

        return substr($str, 0, 5);
    }
}
