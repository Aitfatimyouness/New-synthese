<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Salle extends Model
{
    protected $guarded = [];

    public function siteFormation(): BelongsTo
    {
        return $this->belongsTo(SiteFormation::class);
    }
}
