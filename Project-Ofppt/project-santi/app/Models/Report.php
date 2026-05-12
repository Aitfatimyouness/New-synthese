<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = ['generated_by', 'title', 'type', 'filters', 'content'];

    protected $casts = [
        'filters' => 'array',
        'content' => 'array',
    ];
}
