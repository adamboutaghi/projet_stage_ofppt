<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    public const TYPE_CREATED = 'schedule_created';
    public const TYPE_UPDATED = 'schedule_updated';
    public const TYPE_PUBLISHED = 'schedule_published';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'semaine_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function semaine(): BelongsTo
    {
        return $this->belongsTo(Semaine::class);
    }
}
