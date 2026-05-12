<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    protected $fillable = ['title', 'domain', 'objectives', 'skills_targeted', 'duration_hours'];

    public function formations(): HasMany
    {
        return $this->hasMany(Formation::class);
    }
}
