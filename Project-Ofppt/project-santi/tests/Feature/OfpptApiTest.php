<?php

namespace Tests\Feature;

use App\Models\Center;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OfpptApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_dashboard_crud_documents_reports_and_role_paths_work(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => 'admin@ofppt.test',
            'password' => 'password123',
        ])->assertOk()->json();

        $token = $login['token'];
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->withHeaders($headers)->getJson('/api/dashboard')->assertOk()->assertJsonStructure(['stats', 'alerts', 'my_path']);
        $this->withHeaders($headers)->getJson('/api/options')->assertOk()->assertJsonStructure(['roles', 'users', 'centers', 'themes', 'formations', 'sessions']);

        $theme = $this->withHeaders($headers)->postJson('/api/themes', [
            'title' => 'Cybersecurite industrielle',
            'domain' => 'Digital',
            'objectives' => 'Renforcer la securite des ateliers connectes',
            'skills_targeted' => 'Audit, durcissement, reaction',
            'duration_hours' => 14,
        ])->assertCreated()->json();

        $this->withHeaders($headers)->putJson("/api/themes/{$theme['id']}", [
            'title' => 'Cybersecurite industrielle avancee',
            'domain' => 'Digital',
            'objectives' => 'Renforcer la securite des ateliers connectes',
            'skills_targeted' => 'Audit, durcissement, reaction',
            'duration_hours' => 21,
        ])->assertOk();

        $center = Center::first();
        $animator = User::where('role', 'formateur_animateur')->first();
        $participant = User::where('role', 'formateur_participant')->first();
        $formation = Formation::first();

        $session = $this->withHeaders($headers)->postJson('/api/sessions', [
            'formation_id' => $formation->id,
            'center_id' => $center->id,
            'animator_id' => $animator->id,
            'code' => 'TEST-SESSION-001',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-02',
            'place' => 'Salle test',
            'status' => 'planifiee',
            'capacity' => 12,
            'participant_ids' => [$participant->id],
        ])->assertCreated()->json();

        $this->withHeaders($headers)->postJson('/api/absences', [
            'formation_session_id' => $session['id'],
            'user_id' => $participant->id,
            'absence_date' => '2026-07-01',
            'type' => 'retard',
            'reason' => 'Transport',
        ])->assertCreated();

        $this->withHeaders($headers)->postJson('/api/evaluations', [
            'formation_session_id' => $session['id'],
            'participant_id' => $participant->id,
            'score_content' => 5,
            'score_animator' => 4,
            'score_logistics' => 4,
            'feedback' => 'Tres utile',
            'skills_acquired' => 'Diagnostic',
            'impact_expected' => 'Application atelier',
        ])->assertCreated();

        Storage::fake('public');
        $document = $this->withHeaders($headers)->post('/api/documents', [
            'formation_id' => $formation->id,
            'formation_session_id' => $session['id'],
            'title' => 'Support test',
            'category' => 'support',
            'visible_roles' => ['admin', 'formateur_participant'],
            'file' => UploadedFile::fake()->create('support.pdf', 24, 'application/pdf'),
        ])->assertCreated()->json();

        $this->withHeaders($headers)->get("/api/documents/{$document['id']}/download")->assertOk();
        $this->withHeaders($headers)->postJson('/api/reports', ['title' => 'Rapport test', 'type' => 'global'])->assertCreated();
        $this->withHeaders($headers)->get('/api/reports/export.csv')->assertOk();
        $this->withHeaders($headers)->deleteJson("/api/themes/{$theme['id']}")->assertOk();

        $participantLogin = $this->postJson('/api/login', [
            'email' => 'participant@ofppt.test',
            'password' => 'password123',
        ])->assertOk()->json();

        $this->withHeaders(['Authorization' => "Bearer {$participantLogin['token']}"])
            ->getJson('/api/sessions')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }
}
