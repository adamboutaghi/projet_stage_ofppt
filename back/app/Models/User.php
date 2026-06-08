<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // --- AJOUT AUTOMATIQUE DES ROLES AUTORISÉS ---

    public const ROLE_ETUDIANT = 'etudiant';
    public const ROLE_ENSEIGNANT = 'enseignant';
    public const ROLE_SUPER_ADMIN = 'super-admin';

    /**
     * Retourne la liste des rôles autorisés.
     *
     * @return array<int, string>
     */
    public static function roles(): array
    {
        return [
            self::ROLE_ETUDIANT,
            self::ROLE_ENSEIGNANT,
            self::ROLE_SUPER_ADMIN,
        ];
    }

    /**
     * Vérifie si l'utilisateur a un rôle valide.
     *
     * @return bool
     */
    public function hasValidRole(): bool
    {
        return in_array($this->role, self::roles());
    }

    /**
     * Vérifie si l'utilisateur peut accéder au système.
     * Le rôle "admin" est révoqué ; "user" reste accepté (anciens comptes étudiants).
     */
    public function canAccessSystem(): bool
    {
        if ($this->role === 'admin') {
            return false;
        }

        return $this->hasValidRole() || $this->role === 'user';
    }

    public function customNotifications()
    {
        return $this->hasMany(Notification::class);
    }
}