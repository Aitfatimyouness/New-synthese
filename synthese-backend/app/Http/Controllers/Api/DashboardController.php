<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\OfpptNotification;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $role = $user->roles->first()?->name ?? 'formateur_participant';
        $ownFormationIds = $user->formations()->pluck('formations.id');

        $baseFormationQuery = in_array($role, ['formateur_participant', 'formateur_animateur'], true)
            ? Formation::whereIn('id', $ownFormationIds)
            : Formation::query();

        $stats = [
            'users' => User::count(),
            'formations' => (clone $baseFormationQuery)->count(),
            'sessions' => FormationSession::when($role === 'formateur_animateur', fn ($q) => $q->where('animateur_id', $user->id))->count(),
            'themes' => Theme::when($role === 'formateur_animateur', fn ($q) => $q->where('animateur_id', $user->id))->count(),
            'absences' => Absence::when($role === 'formateur_participant', fn ($q) => $q->where('user_id', $user->id))->count(),
            'documents' => Document::when($ownFormationIds->isNotEmpty(), fn ($q) => $q->whereIn('formation_id', $ownFormationIds))->count(),
            'evaluation_average' => round((float) Evaluation::avg('impact_score'), 1),
        ];

        return response()->json([
            'role' => $role,
            'stats' => $stats,
            'progression' => Formation::select('title', 'progress', 'status')->latest()->limit(8)->get(),
            'sessions' => FormationSession::with('formation:id,title')->orderBy('starts_at')->limit(8)->get(),
            'alerts' => Absence::with('user:id,name')->whereIn('status', ['absent', 'non_justifie'])->latest()->limit(6)->get(),
            'notifications' => OfpptNotification::whereNull('user_id')->orWhere('user_id', $user->id)->latest()->limit(6)->get(),
            'activity' => ActivityLog::with('user:id,name')->latest()->limit(8)->get(),
        ]);
    }
}
