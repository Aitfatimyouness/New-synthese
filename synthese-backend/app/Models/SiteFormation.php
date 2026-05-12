<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteFormation extends Model
{
    protected $table = 'sites_formation';
    protected $guarded = [];

    public function centre(): BelongsTo
    {
        return $this->belongsTo(Centre::class);
    }

    public function salles(): HasMany
    {
        return $this->hasMany(Salle::class);
    }
}
