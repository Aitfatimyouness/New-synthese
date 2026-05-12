<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['formation_id', 'formation_session_id', 'uploaded_by', 'title', 'category', 'file_path', 'original_name', 'visible_roles', 'archived'];

    protected $casts = [
        'visible_roles' => 'array',
        'archived' => 'boolean',
    ];
}
