<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    protected $fillable = ['formation_session_id', 'participant_id', 'score_content', 'score_animator', 'score_logistics', 'feedback', 'skills_acquired', 'impact_expected'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(FormationSession::class, 'formation_session_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }
}
