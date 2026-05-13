<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Enrollment;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\OfpptNotification;
use App\Models\PedagogicalEvaluation;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $role = $user->roles->first()?->name ?? 'formateur_participant';
        $assignedFormationIds = FormationSession::where('animateur_id', $user->id)->pluck('formation_id')->unique()->values();
        $acceptedFormationIds = Enrollment::where('participant_id', $user->id)->where('status', 'accepted')->pluck('formation_id')
            ->merge($user->formations()->wherePivot('role', 'participant')->wherePivotIn('status', ['accepted', 'valide', 'validé', 'termine', 'terminee', 'completed'])->pluck('formations.id'))
            ->unique()
            ->values();

        $baseFormationQuery = match ($role) {
            'administrateur' => Formation::whereRaw('1 = 0'),
            'formateur_participant' => Formation::whereIn('id', $acceptedFormationIds),
            'formateur_animateur' => Formation::whereIn('id', $assignedFormationIds),
            default => Formation::query(),
        };
        if ($role === 'responsable_formation' && $user->centre_id) {
            $baseFormationQuery->where('centre_id', $user->centre_id);
        }

        $stats = [
            'users' => $role === 'administrateur' ? User::count() : 0,
            'formations' => (clone $baseFormationQuery)->count(),
            'sessions' => FormationSession::when($role === 'formateur_animateur', fn ($q) => $q->where('animateur_id', $user->id))
                ->when($role === 'formateur_participant', fn ($q) => $q->whereIn('formation_id', $acceptedFormationIds))
                ->when($role === 'administrateur', fn ($q) => $q->whereRaw('1 = 0'))
                ->count(),
            'themes' => Theme::whereIn('formation_id', (clone $baseFormationQuery)->pluck('id'))->count(),
            'absences' => Absence::when($role === 'formateur_participant', fn ($q) => $q->where('user_id', $user->id))
                ->when($role === 'formateur_animateur', fn ($q) => $q->whereIn('formation_session_id', FormationSession::where('animateur_id', $user->id)->pluck('id')))
                ->when($role === 'administrateur', fn ($q) => $q->whereRaw('1 = 0'))
                ->count(),
            'documents' => Document::whereIn('formation_id', (clone $baseFormationQuery)->pluck('id'))->count(),
            'evaluation_average' => in_array($role, ['administrateur'], true) ? 0 : round((float) Evaluation::whereIn('formation_id', (clone $baseFormationQuery)->pluck('id'))->avg('impact_score'), 1),
            'enrollments_pending' => $role === 'responsable_formation' ? Enrollment::where('status', 'pending')->count() : 0,
            'completion_rate' => round((float) (clone $baseFormationQuery)->avg('progress'), 1),
        ];

        $roleWorkspaces = [
            'administrateur' => ['users', 'security', 'settings', 'logs', 'monitoring'],
            'responsable_formation' => ['enrollments', 'sessions', 'attendance', 'logistics', 'reports'],
            'formateur_animateur' => ['assigned_sessions', 'attendance', 'pedagogical_evaluations', 'documents'],
            'responsable_cdc' => ['training_plans', 'quality', 'pedagogical_programs', 'impact'],
            'formateur_participant' => ['my_trainings', 'requests', 'documents', 'certificates'],
        ];

        return response()->json([
            'role' => $role,
            'stats' => $stats,
            'progression' => (clone $baseFormationQuery)->select('title', 'progress', 'status')->latest()->limit(8)->get(),
            'sessions' => FormationSession::with('formation:id,title')
                ->when($role === 'formateur_animateur', fn ($q) => $q->where('animateur_id', $user->id))
                ->when($role === 'formateur_participant', fn ($q) => $q->whereIn('formation_id', $acceptedFormationIds))
                ->when($role === 'administrateur', fn ($q) => $q->whereRaw('1 = 0'))
                ->orderBy('starts_at')->limit(8)->get(),
            'alerts' => Absence::with('user:id,name')
                ->when($role === 'formateur_participant', fn ($q) => $q->where('user_id', $user->id))
                ->when($role === 'formateur_animateur', fn ($q) => $q->whereIn('formation_session_id', FormationSession::where('animateur_id', $user->id)->pluck('id')))
                ->when($role === 'administrateur', fn ($q) => $q->whereRaw('1 = 0'))
                ->whereIn('status', ['absent', 'non_justifie'])->latest()->limit(6)->get(),
            'notifications' => OfpptNotification::whereNull('user_id')->orWhere('user_id', $user->id)->latest()->limit(6)->get(),
            'activity' => $role === 'administrateur' ? ActivityLog::with('user:id,name')->latest()->limit(8)->get() : collect(),
            'workspace' => $roleWorkspaces[$role] ?? $roleWorkspaces['formateur_participant'],
            'rankings' => [
                'best_trainer' => in_array($role, ['responsable_formation', 'responsable_cdc', 'responsable_dr'], true)
                    ? PedagogicalEvaluation::selectRaw('trainer_id, round(avg(score), 1) score')->with('trainer:id,name')->groupBy('trainer_id')->orderByDesc('score')->first()
                    : null,
                'top_theme' => Theme::whereIn('formation_id', (clone $baseFormationQuery)->pluck('id'))->orderByDesc('progress')->first(['id', 'title', 'progress']),
                'pending_enrollments' => $role === 'responsable_formation'
                    ? Enrollment::with(['formation:id,title', 'participant:id,name'])->where('status', 'pending')->latest()->limit(5)->get()
                    : collect(),
            ],
        ]);
    }
}
