<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\EmploiItem;
use Illuminate\Database\Eloquent\SoftDeletes;


class Groupe extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['nom', 'filiere'];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
  
}
