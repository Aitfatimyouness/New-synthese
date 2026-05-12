<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    protected $table = 'rapports';
    protected $guarded = [];

    protected function casts(): array
    {
        return ['filters' => 'array', 'metrics' => 'array'];
    }
}
