<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Center;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'role' => $user->role,
            'stats' => [
                'formations' => Formation::count(),
                'sessions' => FormationSession::count(),
                'participants' => User::whereIn('role', ['formateur_participant', 'formateur_animateur'])->count(),
                'absences' => Absence::count(),
                'documents' => Document::where('archived', false)->count(),
                'average_evaluation' => round(Evaluation::avg('score_content') ?: 0, 2),
            ],
            'alerts' => [
                'absence_risk' => Absence::selectRaw('user_id, count(*) as total')->with('user:id,name,email')->groupBy('user_id')->having('total', '>=', 2)->get(),
                'upcoming_sessions' => FormationSession::with('formation', 'center')->whereDate('start_date', '>=', now())->orderBy('start_date')->limit(5)->get(),
            ],
            'my_path' => $user->sessionsAsParticipant()->with('formation.theme', 'center')->get(),
            'recent_documents' => Document::latest()->limit(6)->get(),
        ]);
    }

    public function analytics()
    {
        return response()->json($this->reportPayload('global'));
    }

    public function reportPayload(string $type): array
    {
        return [
            'type' => $type,
            'generated_at' => now()->toDateTimeString(),
            'participation' => [
                'sessions_total' => FormationSession::count(),
                'participants_total' => \DB::table('session_participants')->count(),
                'by_status' => \DB::table('session_participants')->selectRaw('status, count(*) as total')->groupBy('status')->get(),
            ],
            'progression' => \DB::table('session_participants')
                ->join('users', 'users.id', '=', 'session_participants.user_id')
                ->selectRaw('users.name, avg(progress_percent) as progress')
                ->groupBy('users.name')
                ->orderByDesc('progress')
                ->limit(20)
                ->get(),
            'evaluations' => [
                'count' => Evaluation::count(),
                'content' => round(Evaluation::avg('score_content') ?: 0, 2),
                'animator' => round(Evaluation::avg('score_animator') ?: 0, 2),
                'logistics' => round(Evaluation::avg('score_logistics') ?: 0, 2),
            ],
            'catalog' => [
                'themes' => Theme::count(),
                'centers' => Center::count(),
                'documents_active' => Document::where('archived', false)->count(),
            ],
            'absences' => [
                'total' => Absence::count(),
                'by_type' => Absence::selectRaw('type, count(*) as total')->groupBy('type')->get(),
            ],
        ];
    }

    public function exportCsv(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Indicateur', 'Valeur']);
            $payload = $this->reportPayload('export');
            fputcsv($out, ['Formations', Formation::count()]);
            fputcsv($out, ['Sessions', $payload['participation']['sessions_total']]);
            fputcsv($out, ['Participations', $payload['participation']['participants_total']]);
            fputcsv($out, ['Absences', $payload['absences']['total']]);
            fputcsv($out, ['Evaluation contenu moyenne', $payload['evaluations']['content']]);
            fclose($out);
        }, 'rapport-ofppt.csv', ['Content-Type' => 'text/csv']);
    }
}
