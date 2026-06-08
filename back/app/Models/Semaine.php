<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Semaine extends Model
{
    use SoftDeletes;

    protected $fillable = ['titre', 'date_debut', 'date_fin', 'est_publie'];

    protected $casts = [
        'est_publie' => 'boolean',
    ];

    public function seances()
    {
        return $this->hasMany(Seance::class);
    }

    public function scopePublished($query)
    {
        return $query->where('est_publie', true);
    }

    /**
     * Semaines visibles : toutes pour super-admin, publiées uniquement pour les autres.
     */
    public static function queryVisibleTo(?User $user = null)
    {
        $query = static::query();

        if (($user?->role ?? null) !== User::ROLE_SUPER_ADMIN) {
            $query->published();
        }

        return $query;
    }
}
