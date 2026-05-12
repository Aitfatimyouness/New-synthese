<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['absence_date' => 'date'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function formationSession(): BelongsTo
    {
        return $this->belongsTo(FormationSession::class);
    }
}
