<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use Illuminate\Http\Request;

class CourController extends Controller
{
  
    public function index()
    {
        $cours = Cour::all();
        return response()->json($cours);
    }


    public function show($id)
    {
        $cour = Cour::findOrFail($id);
        return response()->json($cour);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'intitule' => 'required|string|max:255',
            'professeur' => 'required|string|max:255'
        ]);

        $cour = Cour::create($validated);

        return response()->json($cour, 201);
    }

    // Met à jour un cours
    public function update(Request $request, $id)
    {
        $cour = Cour::findOrFail($id);

        $validated = $request->validate([
            'intitule' => 'sometimes|string|max:255',
            'professeur' => 'sometimes|string|max:255'
        ]);

        $cour->update($validated);

        return response()->json($cour);
    }

    // Supprime un cours
    public function destroy($id)
    {
        $cour = Cour::findOrFail($id);
        $cour->delete();

        return response()->json(['message' => 'Cours supprimé']);
    }
}
