<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cour extends Model
{
    use SoftDeletes;

    protected $fillable = ['intitule', 'professeur'];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }
}
