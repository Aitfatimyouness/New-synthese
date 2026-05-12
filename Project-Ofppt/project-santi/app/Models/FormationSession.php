<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormationSession extends Model
{
    protected $fillable = ['formation_id', 'center_id', 'animator_id', 'code', 'start_date', 'end_date', 'place', 'status', 'capacity', 'logistics_notes'];

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    public function animator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'animator_id');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'session_participants')
            ->withPivot(['status', 'progress_percent', 'acquired_skills', 'impact_notes'])
            ->withTimestamps();
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}
