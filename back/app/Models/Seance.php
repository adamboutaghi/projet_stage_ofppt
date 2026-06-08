<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seance extends Model
{
    use SoftDeletes;

    protected $fillable = ['salle', 'jour', 'heure_debut', 'heure_fin','type', 'cours_id', 'groupe_id', 'semaine_id'];

    public function cours()
    {
        return $this->belongsTo(Cour::class);
    }
    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }
    public function semaine()
    {
        return $this->belongsTo(Semaine::class);
    }
}
