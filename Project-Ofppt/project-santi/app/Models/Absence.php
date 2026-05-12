<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $fillable = ['formation_session_id', 'user_id', 'marked_by', 'absence_date', 'type', 'reason'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(FormationSession::class, 'formation_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function marker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }
}
