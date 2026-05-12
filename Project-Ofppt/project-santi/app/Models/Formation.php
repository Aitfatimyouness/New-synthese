<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Formation extends Model
{
    protected $fillable = ['theme_id', 'title', 'description', 'status', 'target_profile', 'planned_start_date', 'planned_end_date'];

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(FormationSession::class);
    }
}
