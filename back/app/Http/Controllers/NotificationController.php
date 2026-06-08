<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->customNotifications()
            ->with('semaine:id,titre')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->map(fn (Notification $n) => $this->format($n));

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->customNotifications()->whereNull('read_at')->count(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread_count' => $request->user()->customNotifications()->whereNull('read_at')->count(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->customNotifications()
            ->where('id', $id)
            ->firstOrFail();

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json($this->format($notification->fresh()));
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->customNotifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Toutes les notifications ont été marquées comme lues',
            'unread_count' => 0,
        ]);
    }

    protected function format(Notification $n): array
    {
        return [
            'id' => $n->id,
            'type' => $n->type,
            'type_label' => $this->typeLabel($n->type),
            'title' => $n->title,
            'message' => $n->message,
            'semaine_id' => $n->semaine_id,
            'semaine_titre' => $n->semaine?->titre,
            'read_at' => $n->read_at?->toIso8601String(),
            'is_read' => $n->read_at !== null,
            'created_at' => $n->created_at?->toIso8601String(),
            'created_at_formatted' => $n->created_at?->format('d/m/Y H:i'),
        ];
    }

    protected function typeLabel(string $type): string
    {
        return match ($type) {
            Notification::TYPE_CREATED => 'Nouvel emploi du temps',
            Notification::TYPE_PUBLISHED => 'Publication',
            default => 'Mise à jour',
        };
    }
}
