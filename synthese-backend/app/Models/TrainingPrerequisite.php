<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingPrerequisite extends Model
{
    protected $guarded = [];

    public function formation(): BelongsTo
    {
        return $this->belongsTo(Formation::class);
    }

    public function requiredFormation(): BelongsTo
    {
        return $this->belongsTo(Formation::class, 'required_formation_id');
    }
}
