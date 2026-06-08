<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Semaine;
use App\Models\User;
use Illuminate\Support\Collection;

class ScheduleNotificationService
{
    public function notifyUpdated(Semaine $semaine): void
    {
        if ($semaine->est_publie) {
            $this->dispatch($semaine, Notification::TYPE_UPDATED);
        }
    }

    public function notifyPublished(Semaine $semaine): void
    {
        $this->dispatch($semaine, Notification::TYPE_PUBLISHED);
    }

    public function notifySeanceChange(int $semaineId): void
    {
        $semaine = Semaine::find($semaineId);
        if (! $semaine) {
            return;
        }

        if ($semaine->est_publie) {
            $this->dispatch($semaine, Notification::TYPE_UPDATED);
        }
    }

    /**
     * Même notification pour chaque utilisateur (étudiant ou enseignant), contenu identique.
     */
    protected function dispatch(Semaine $semaine, string $type): void
    {
        $copy = $this->copyForType($type, $semaine);

        foreach ($this->resolveRecipients() as $user) {
            $this->createNotification($user, $type, $copy, $semaine);
        }
    }

    protected function createNotification(User $user, string $type, array $copy, Semaine $semaine): void
    {
        Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $copy['title'],
            'message' => $copy['message'],
            'semaine_id' => $semaine->id,
        ]);
    }

    protected function copyForType(string $type, Semaine $semaine): array
    {
        $label = $semaine->titre;

        return match ($type) {
            Notification::TYPE_CREATED => [
                'title' => 'Un nouvel emploi du temps est disponible',
                'message' => "La semaine « {$label} » a été créée.",
            ],
            Notification::TYPE_PUBLISHED => [
                'title' => 'Un nouvel emploi du temps est disponible',
                'message' => "L'emploi du temps « {$label} » est maintenant publié.",
            ],
            default => [
                'title' => 'Votre emploi du temps a été mis à jour',
                'message' => "L'emploi du temps « {$label} » a été modifié.",
            ],
        };
    }

    /**
     * Étudiants + enseignants : chacun reçoit sa propre ligne en base (user_id distinct).
     */
    protected function resolveRecipients(): Collection
    {
        $students = User::query()
            ->whereIn('role', [User::ROLE_ETUDIANT, 'user'])
            ->get();

        $teachers = User::query()
            ->where('role', User::ROLE_ENSEIGNANT)
            ->get();

        return $students->merge($teachers)->unique('id')->values();
    }
}
