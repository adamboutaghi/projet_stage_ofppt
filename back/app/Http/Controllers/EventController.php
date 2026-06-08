<?php

namespace App\Http\Controllers;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::orderBy('date', 'asc')->get();
        return response()->json($events);
    }
    public function show($id)
    {
        $event = Event::find($id);
        if ($event) {
            return response()->json($event);
        } else {
            return response()->json(['message' => 'Event not found'], 404);
        }
    }

    public function store(Request $request)
{
    $request->validate([
        'titre' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'nullable|string',
        'date' => 'required|date',
        'heure' => 'nullable',
        'lieu' => 'nullable|string',
        'image' => 'nullable|image|max:2048'
    ]);

    $imagePath = $request->hasFile('image') ? $request->file('image')->store('events', 'public') : null;

    $event = Event::create([
        'titre' => $request->titre,
        'description' => $request->description,
        'type' => $request->type,
        'date' => $request->date,
        'heure' => $request->heure,
        'lieu' => $request->lieu,
        'image' => $imagePath,
    ]);

    return response()->json($event, 201);
}
public function update(Request $request, $id)
{
    $event = Event::find($id);
    if (!$event) {
        return response()->json(['message' => 'Event not found'], 404);
    }

    $request->validate([
        'titre' => 'sometimes|required|string|max:255',
        'description' => 'sometimes|nullable|string',
        'type' => 'sometimes|nullable|string',
        'date' => 'sometimes|required|date',
        'heure' => 'sometimes|nullable',
        'lieu' => 'sometimes|nullable|string',
        'image' => 'sometimes|nullable|image|max:2048'
    ]);

    if ($request->hasFile('image')) {
         // supprimer l'ancienne image si existante
    if ($event->image) {
        Storage::disk('public')->delete($event->image);
    }
        $imagePath = $request->file('image')->store('events', 'public');
        $event->image = $imagePath;
    }

    $event->update($request->only(['titre', 'description', 'type', 'date', 'heure', 'lieu']));

    return response()->json($event);

}

    public function destroy($id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
