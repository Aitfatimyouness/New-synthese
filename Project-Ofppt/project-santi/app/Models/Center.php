<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Center extends Model
{
    protected $fillable = ['name', 'city', 'address', 'capacity', 'manager_name', 'phone'];

    public function sessions(): HasMany
    {
        return $this->hasMany(FormationSession::class);
    }
}
