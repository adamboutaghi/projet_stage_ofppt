<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Groupe;

class GroupeController extends Controller
{
    /**
     * Liste de tous les groupes
     */
    public function index()
    {
        $groupes = Groupe::all();
        return response()->json($groupes);
    }

    /**
     * Afficher un groupe spécifique
     */
    public function show($id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Groupe not found'], 404);
        }

        return response()->json($groupe);
    }

    /**
     * Créer un groupe
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'filiere' => 'nullable|string|max:255',
        ]);

        $groupe = Groupe::create($request->all());

        return response()->json($groupe, 201);
    }

    /**
     * Modifier un groupe
     */
    public function update(Request $request, $id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Groupe not found'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'filiere' => 'sometimes|nullable|string|max:255',
        ]);

        $groupe->update($request->all());

        return response()->json($groupe);
    }

    /**
     * Supprimer un groupe
     */
    public function destroy($id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json(['message' => 'Groupe not found'], 404);
        }

        $groupe->delete();

        return response()->json(['message' => 'Groupe deleted successfully']);
    }
}
