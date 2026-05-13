<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\ActivityLog;
use App\Models\Centre;
use App\Models\Deplacement;
use App\Models\Document;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Hebergement;
use App\Models\OfpptNotification;
use App\Models\ParticipantEvaluation;
use App\Models\PedagogicalEvaluation;
use App\Models\Permission;
use App\Models\Rapport;
use App\Models\Role;
use App\Models\Salle;
use App\Models\SiteFormation;
use App\Models\Theme;
use App\Models\TrainingPrerequisite;
use App\Models\User;
use App\Services\SimplePdf;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class OperationalController extends Controller
{
    private array $resources = [
        'users' => [User::class, ['roles', 'centre'], ['name' => 'required|string|max:120', 'email' => 'required|email|max:160', 'password' => 'nullable|string|min:8', 'matricule' => 'nullable|string|max:40', 'phone' => 'nullable|string|max:40', 'profile_title' => 'nullable|string|max:120', 'status' => 'nullable|string', 'centre_id' => 'nullable|exists:centres,id']],
        'roles' => [Role::class, ['permissions'], ['name' => 'required|string|max:80', 'label' => 'required|string|max:120', 'description' => 'nullable|string']],
        'permissions' => [Permission::class, [], ['name' => 'required|string|max:100', 'label' => 'required|string|max:140']],
        'centres' => [Centre::class, [], ['code' => 'required|string|max:30', 'name' => 'required|string|max:160', 'region' => 'required|string|max:120', 'city' => 'required|string|max:80', 'address' => 'nullable|string']],
        'sites-formation' => [SiteFormation::class, ['centre'], ['centre_id' => 'nullable|exists:centres,id', 'name' => 'required|string|max:160', 'city' => 'required|string|max:80', 'address' => 'required|string', 'capacity' => 'required|integer|min:1', 'manager_name' => 'nullable|string|max:120']],
        'salles' => [Salle::class, ['siteFormation:id,name,city'], ['site_formation_id' => 'required|exists:sites_formation,id', 'name' => 'required|string|max:120', 'capacity' => 'required|integer|min:1', 'equipment' => 'nullable|string|max:255', 'status' => 'nullable|string|max:60']],
        'formations' => [Formation::class, ['centre', 'responsable', 'themes.documents', 'participants.roles', 'sessions.salle', 'enrollments.participant', 'prerequisites.requiredFormation'], ['title' => 'required|string|max:180', 'description' => 'required|string', 'start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date', 'status' => 'nullable|string|in:proposed,validated,in_progress,completed,cancelled,proposee,validee,planifiee,en_cours,terminee,annulee', 'type' => 'required|string|max:120', 'category' => 'required|string', 'level' => 'nullable|string', 'capacity' => 'required|integer|min:1', 'progress' => 'nullable|integer|between:0,100', 'centre_id' => 'nullable|exists:centres,id', 'responsable_id' => 'nullable|exists:users,id', 'participant_ids' => 'array', 'animateur_ids' => 'array']],
        'themes' => [Theme::class, ['formation:id,title,status,progress,capacity', 'formation.participants:id,name', 'animateur:id,name'], ['formation_id' => 'required|exists:formations,id', 'animateur_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:180', 'description' => 'nullable|string', 'start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date', 'sort_order' => 'nullable|integer|min:1', 'progress' => 'nullable|integer|between:0,100']],
        'sessions' => [FormationSession::class, ['formation:id,title,capacity', 'theme:id,title', 'siteFormation', 'salle', 'animateur:id,name'], ['formation_id' => 'required|exists:formations,id', 'theme_id' => 'nullable|exists:themes,id', 'site_formation_id' => 'nullable|exists:sites_formation,id', 'salle_id' => 'nullable|exists:salles,id', 'animateur_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:180', 'starts_at' => 'required|date', 'ends_at' => 'required|date|after:starts_at', 'room' => 'nullable|string|max:80', 'status' => 'nullable|string|in:scheduled,ongoing,completed,planifiee,en_cours,terminee', 'notes' => 'nullable|string']],
        'absences' => [Absence::class, ['user:id,name,matricule', 'formationSession.formation:id,title'], ['formation_session_id' => 'required|exists:formation_sessions,id', 'user_id' => 'required|exists:users,id', 'absence_date' => 'required|date', 'status' => 'required|string|in:present,absent,justifie,non_justifie', 'justification' => 'nullable|string']],
        'documents' => [Document::class, ['formation:id,title', 'theme:id,title'], ['formation_id' => 'nullable|exists:formations,id', 'theme_id' => 'nullable|exists:themes,id', 'title' => 'required|string|max:180', 'type' => 'required|string|max:60', 'file' => 'nullable|file|max:20480', 'archived' => 'nullable|boolean']],
        'hebergements' => [Hebergement::class, ['formation:id,title', 'user:id,name'], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'required|exists:users,id', 'hotel_name' => 'required|string|max:160', 'city' => 'required|string|max:80', 'check_in' => 'required|date', 'check_out' => 'required|date|after_or_equal:check_in', 'status' => 'nullable|string']],
        'deplacements' => [Deplacement::class, ['formation:id,title', 'user:id,name'], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'required|exists:users,id', 'from_city' => 'required|string|max:80', 'to_city' => 'required|string|max:80', 'travel_date' => 'required|date', 'transport_mode' => 'required|string|max:80', 'status' => 'nullable|string']],
        'evaluations' => [Evaluation::class, ['formation:id,title', 'user:id,name'], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'nullable|exists:users,id', 'content_score' => 'required|integer|between:1,5', 'animation_score' => 'required|integer|between:1,5', 'logistics_score' => 'required|integer|between:1,5', 'impact_score' => 'required|integer|between:1,5', 'comment' => 'nullable|string']],
        'rapports' => [Rapport::class, [], ['title' => 'required|string|max:180', 'type' => 'required|string|max:80', 'filters' => 'nullable|array', 'metrics' => 'nullable|array']],
        'notifications' => [OfpptNotification::class, [], ['user_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:160', 'message' => 'required|string', 'type' => 'nullable|string|max:60']],
        'enrollments' => [Enrollment::class, ['formation:id,title,capacity,status', 'participant:id,name,matricule', 'reviewedBy:id,name'], ['formation_id' => 'required|exists:formations,id', 'participant_id' => 'nullable|exists:users,id', 'status' => 'nullable|string|in:pending,accepted,rejected,archived', 'decision_note' => 'nullable|string']],
        'prerequisites' => [TrainingPrerequisite::class, ['formation:id,title', 'requiredFormation:id,title'], ['formation_id' => 'required|exists:formations,id', 'required_formation_id' => 'required|exists:formations,id|different:formation_id', 'rule' => 'nullable|string|in:completed,accepted']],
        'participant-evaluations' => [ParticipantEvaluation::class, ['formation:id,title', 'session:id,title', 'participant:id,name', 'trainer:id,name'], ['formation_id' => 'required|exists:formations,id', 'formation_session_id' => 'nullable|exists:formation_sessions,id', 'participant_id' => 'nullable|exists:users,id', 'trainer_id' => 'nullable|exists:users,id', 'trainer_score' => 'required|integer|between:1,5', 'training_score' => 'required|integer|between:1,5', 'logistics_score' => 'nullable|integer|between:1,5', 'comment' => 'nullable|string']],
        'pedagogical-evaluations' => [PedagogicalEvaluation::class, ['formation:id,title', 'session:id,title', 'trainer:id,name', 'participant:id,name'], ['formation_id' => 'required|exists:formations,id', 'formation_session_id' => 'nullable|exists:formation_sessions,id', 'trainer_id' => 'nullable|exists:users,id', 'participant_id' => 'required|exists:users,id', 'competency' => 'required|string|max:160', 'score' => 'required|integer|between:1,5', 'progression_delta' => 'nullable|integer|between:0,100', 'feedback' => 'nullable|string']],
        'certificates' => [Certificate::class, ['formation:id,title', 'participant:id,name,matricule'], ['formation_id' => 'required|exists:formations,id', 'participant_id' => 'required|exists:users,id', 'type' => 'nullable|string|in:certificate,convocation', 'reference' => 'nullable|string|max:80', 'issued_at' => 'nullable|date', 'status' => 'nullable|string|in:draft,issued,revoked,archived']],
        'logs' => [ActivityLog::class, ['user:id,name'], ['action' => 'required|string|max:120', 'module' => 'required|string|max:120', 'description' => 'nullable|string']],
    ];

    public function index(Request $request, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'read');
        [$model, $relations] = $this->definition($resource);
        $query = $model::query()->with($relations);
        if ($resource === 'formations') {
            $query->withCount(['participants', 'themes', 'sessions']);
        }
        if ($resource === 'themes') {
            $query->withCount('documents');
        }
        $this->applyRoleScope($request, $resource, $query);

        foreach (['status', 'formation_id', 'user_id', 'theme_id', 'centre_id'] as $filter) {
            $query->when($request->filled($filter), fn ($q) => $q->where($filter, $request->$filter));
        }

        $query->when($request->filled('date_from'), fn ($q) => $q->where($this->dateColumn($resource), '>=', $request->date_from));
        $query->when($request->filled('date_to'), fn ($q) => $q->where($this->dateColumn($resource), '<=', $request->date_to));
        $query->when($resource === 'documents' && $request->filled('archived'), fn ($q) => $q->where('archived', filter_var($request->archived, FILTER_VALIDATE_BOOLEAN)));

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search, $resource) {
                foreach ($this->searchColumns($resource) as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        return response()->json($query->latest()->paginate((int) $request->query('per_page', 10)));
    }

    public function globalSearch(Request $request)
    {
        $term = trim((string) $request->query('q', ''));
        abort_if(strlen($term) < 2, 422, 'Recherche globale: saisissez au moins 2 caracteres.');

        $resources = collect(['formations', 'sessions', 'documents', 'enrollments', 'certificates', 'users'])
            ->filter(fn ($resource) => $this->roleResourceAllowed($request->user(), $resource, 'read'))
            ->values();
        $results = collect();

        foreach ($resources as $resource) {
            [$model, $relations] = $this->definition($resource);
            $query = $model::query()->with($relations);
            $this->applyRoleScope($request, $resource, $query);
            $query->where(function ($q) use ($term, $resource) {
                foreach ($this->searchColumns($resource) as $column) {
                    if (! str_contains($column, '.')) {
                        $q->orWhere($column, 'like', "%{$term}%");
                    }
                }
            });

            $query->limit(5)->get()->each(function ($row) use ($resource, $results) {
                $results->push([
                    'resource' => $resource,
                    'id' => $row->getKey(),
                    'title' => $row->title ?? $row->name ?? $row->reference ?? "#{$row->getKey()}",
                    'status' => $row->status ?? null,
                ]);
            });
        }

        return response()->json(['data' => $results->values()]);
    }

    public function calendar(Request $request)
    {
        $this->authorizeRoleResource($request, 'sessions', 'read');
        $query = FormationSession::with(['formation:id,title,centre_id', 'salle:id,name,capacity', 'siteFormation:id,name,city', 'animateur:id,name']);
        $this->applyRoleScope($request, 'sessions', $query);

        $query->when($request->filled('date_from'), fn ($q) => $q->where('starts_at', '>=', $request->date_from));
        $query->when($request->filled('date_to'), fn ($q) => $q->where('starts_at', '<=', $request->date_to));

        return response()->json(['data' => $query->orderBy('starts_at')->limit(120)->get()]);
    }

    public function store(Request $request, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'write');
        [$model,, $rules] = $this->definition($resource);
        $data = $this->validated($request, $resource, $rules);
        $this->assertNoPlanningConflict($resource, $data);
        $record = $model::create($data);
        $this->afterSave($request, $resource, $record);
        $this->log($request, 'création', $resource, $record);

        return response()->json($record->fresh($this->definition($resource)[1]), 201);
    }

    public function show(int|string $id, string $resource)
    {
        $this->authorizeRoleResource(request(), $resource, 'read');
        [$model, $relations] = $this->definition($resource);
        $query = $model::query()->with($relations);
        $this->applyRoleScope(request(), $resource, $query);

        return response()->json($this->sanitizeRecord(request(), $resource, $query->findOrFail($id)));
    }

    public function update(Request $request, int|string $id, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'write');
        abort_if($resource === 'enrollments' && $request->user()?->hasRole('formateur_participant'), 403, 'Seul le responsable de formation peut traiter une inscription.');
        [$model,, $rules] = $this->definition($resource);
        $query = $model::query();
        $this->applyRoleScope($request, $resource, $query);
        $record = $query->findOrFail($id);
        $data = $this->validated($request, $resource, $rules, $record);
        $this->assertNoPlanningConflict($resource, $data, $record->id);
        $record->update($data);
        $this->afterSave($request, $resource, $record);
        $this->log($request, 'mise à jour', $resource, $record);

        return response()->json($record->fresh($this->definition($resource)[1]));
    }

    public function destroy(Request $request, int|string $id, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'delete');
        [$model] = $this->definition($resource);
        $query = $model::query();
        $this->applyRoleScope($request, $resource, $query);
        $record = $query->findOrFail($id);
        $this->authorizeDestroy($request, $resource);
        $record->delete();
        $this->log($request, 'suppression', $resource, $record);

        return response()->json(['message' => 'Suppression effectuée.']);
    }

    public function analytics(?Request $request = null)
    {
        $request ??= request();
        $this->authorizeRoleResource($request, 'rapports', 'read');

        $formationQuery = Formation::query();
        $absenceQuery = Absence::query();
        $evaluationQuery = Evaluation::query();
        $this->applyRoleScope($request, 'formations', $formationQuery);
        $this->applyRoleScope($request, 'absences', $absenceQuery);
        $this->applyRoleScope($request, 'evaluations', $evaluationQuery);
        $formationIds = (clone $formationQuery)->pluck('id');

        $totalTrainings = $formationIds->count();
        $totalParticipants = \DB::table('formation_user')->whereIn('formation_id', $formationIds)->where('role', 'participant')->count();
        $totalTrainers = \DB::table('formation_user')->whereIn('formation_id', $formationIds)->where('role', 'animateur')->distinct('user_id')->count('user_id');
        $attendanceTotal = (clone $absenceQuery)->count();
        $absenceCount = (clone $absenceQuery)->whereIn('status', ['absent', 'non_justifie'])->count();
        $presentCount = (clone $absenceQuery)->where('status', 'present')->count();
        $averageProgress = round((float) (clone $formationQuery)->avg('progress'), 1);
        $validatedParticipants = \DB::table('formation_user')->whereIn('formation_id', $formationIds)->whereIn('status', ['valide', 'validé', 'termine', 'terminee'])->count();
        $evaluationAverage = (clone $evaluationQuery)->selectRaw('round(avg((content_score + animation_score + logistics_score + impact_score) / 4), 1) average')->value('average') ?? 0;

        return response()->json([
            'summary' => [
                'trainings' => $totalTrainings,
                'participants' => $totalParticipants,
                'trainers' => $totalTrainers,
                'attendance_rate' => $attendanceTotal ? round(($presentCount / $attendanceTotal) * 100, 1) : 100,
                'absence_rate' => $attendanceTotal ? round(($absenceCount / $attendanceTotal) * 100, 1) : 0,
                'validated_participants' => $validatedParticipants,
                'average_progress' => $averageProgress,
                'satisfaction' => (float) $evaluationAverage,
            ],
            'participation' => (clone $formationQuery)->withCount('participants')->orderByDesc('participants_count')->limit(8)->get(['id', 'title']),
            'absences_by_status' => (clone $absenceQuery)->selectRaw('status, count(*) total')->groupBy('status')->get(),
            'progression' => (clone $formationQuery)->select('title', 'progress', 'status')->orderByDesc('progress')->get(),
            'evaluations' => (clone $evaluationQuery)->selectRaw('round(avg(content_score),1) contenu, round(avg(animation_score),1) animation, round(avg(logistics_score),1) logistique, round(avg(impact_score),1) impact')->first(),
            'top_trainings' => (clone $formationQuery)->withCount('participants')->orderByDesc('progress')->limit(5)->get(['id', 'title', 'progress']),
        ]);
    }

    public function exportCsv(Request $request, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'export');
        [$model, $relations] = $this->definition($resource);
        $query = $model::query()->with($relations);
        $this->applyRoleScope($request, $resource, $query);
        $rows = $query->latest()->limit(2000)->get();
        $columns = $this->exportColumns($resource);

        return response()->streamDownload(function () use ($rows, $columns) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, array_values($columns));
            foreach ($rows as $row) {
                fputcsv($handle, array_map(fn ($column) => data_get($row, $column), array_keys($columns)));
            }
            fclose($handle);
        }, "{$resource}-export.csv", ['Content-Type' => 'text/csv']);
    }

    public function importCsv(Request $request, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'import');
        abort_unless(in_array($resource, ['users', 'formations', 'salles', 'sites-formation'], true), 422, 'Import CSV non active pour ce module.');
        $request->validate(['file' => 'required|file|max:10240']);
        [$model,, $rules] = $this->definition($resource);
        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $headers = fgetcsv($handle) ?: [];
        $created = 0;

        while (($line = fgetcsv($handle)) !== false) {
            $payload = array_filter(array_combine($headers, $line) ?: [], fn ($value) => $value !== '');
            $validator = validator($payload, array_intersect_key($rules, $payload));
            if ($validator->fails()) {
                continue;
            }
            $model::create($payload);
            $created++;
        }

        fclose($handle);
        $this->log($request, 'import', $resource, new $model());

        return response()->json(['message' => "Import termine: {$created} lignes creees."]);
    }

    public function certificatePdf(Request $request, int $id)
    {
        $certificate = Certificate::with(['formation', 'participant'])->findOrFail($id);
        $this->applyCertificateAccess($request, $certificate);
        $title = $certificate->type === 'convocation' ? 'Convocation OFPPT' : 'Certificat OFPPT';
        $pdf = SimplePdf::structured([
            'title' => $title,
            'subtitle' => 'Document officiel OFPPT',
            'metadata' => [
                'Reference' => $certificate->reference,
                'Type' => ucfirst((string) $certificate->type),
                'Statut' => ucfirst((string) $certificate->status),
                'Date' => $certificate->issued_at ?? now()->toDateString(),
            ],
            'sections' => [
                ['title' => 'Participant', 'rows' => [
                    ['Nom complet', $certificate->participant?->name],
                    ['Matricule', $certificate->participant?->matricule ?? '-'],
                ]],
                ['title' => 'Formation', 'rows' => [
                    ['Intitule', $certificate->formation?->title],
                    ['Reference formation', $certificate->formation_id],
                ]],
                ['title' => 'Objet du document', 'rows' => [], 'paragraph' => $certificate->type === 'convocation'
                    ? 'Le participant est convoque a prendre part au parcours de formation indique ci-dessus selon la planification communiquee par l etablissement.'
                    : 'Ce document atteste la participation au parcours de formation indique ci-dessus dans le cadre du dispositif OFPPT.'],
            ],
            'signature' => true,
        ]);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$certificate->reference.'.pdf"',
        ]);
    }

    public function reportPdf(Request $request, ?int $id = null)
    {
        $this->authorizeRoleResource($request, 'rapports', 'export');
        $report = $id ? Rapport::findOrFail($id) : null;
        $analytics = $this->analytics($request)->getData(true);
        $summary = $analytics['summary'] ?? [];
        $evaluations = $analytics['evaluations'] ?? [];
        $topTrainings = collect($analytics['top_trainings'] ?? [])->take(5);
        $progression = collect($analytics['progression'] ?? [])->take(8);

        $title = $report?->title ?: 'Rapport global OFPPT';
        $pdf = SimplePdf::structured([
            'title' => $title,
            'subtitle' => 'Synthese structuree des indicateurs de formation',
            'metadata' => [
                'Type' => $report?->type ?: 'global',
                'Date rapport' => now()->toDateString(),
                'Auteur' => $request->user()?->name,
                'Portee' => 'Donnees autorisees',
            ],
            'sections' => [
                ['title' => 'Indicateurs generaux', 'rows' => [
                    ['Nombre de formations', $summary['trainings'] ?? 0],
                    ['Nombre de participants', $summary['participants'] ?? 0],
                    ['Nombre de formateurs', $summary['trainers'] ?? 0],
                    ['Participants valides', $summary['validated_participants'] ?? 0],
                ]],
                ['title' => 'Presence et progression', 'rows' => [
                    ['Taux de presence', ($summary['attendance_rate'] ?? 0).'%'],
                    ['Taux absence', ($summary['absence_rate'] ?? 0).'%'],
                    ['Progression moyenne', ($summary['average_progress'] ?? 0).'%'],
                    ['Satisfaction moyenne', ($summary['satisfaction'] ?? 0).'/5'],
                ]],
                ['title' => 'Evaluations', 'rows' => [
                    ['Contenu', ($evaluations['contenu'] ?? 0).'/5'],
                    ['Animation', ($evaluations['animation'] ?? 0).'/5'],
                    ['Logistique', ($evaluations['logistique'] ?? 0).'/5'],
                    ['Impact', ($evaluations['impact'] ?? 0).'/5'],
                ]],
                ['title' => 'Formations les plus avancees', 'rows' => $topTrainings->map(fn ($item) => [
                    data_get($item, 'title', '-'),
                    (data_get($item, 'progress', 0)).'% progression',
                ])->all()],
                ['title' => 'Progression par formation', 'rows' => $progression->map(fn ($item) => [
                    data_get($item, 'title', '-'),
                    (data_get($item, 'progress', 0)).'% - '.data_get($item, 'status', '-'),
                ])->all()],
            ],
            'signature' => false,
        ]);

        $filename = $report ? 'rapport-'.$report->id.'.pdf' : 'rapports-ofppt.pdf';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function archive(Request $request, int|string $id, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'archive');
        [$model] = $this->definition($resource);
        $query = $model::query();
        $this->applyRoleScope($request, $resource, $query);
        $record = $query->findOrFail($id);

        if ($resource === 'documents') {
            $record->update(['archived' => true]);
        } elseif (in_array(\Illuminate\Database\Eloquent\SoftDeletes::class, class_uses_recursive($model), true)) {
            $record->delete();
        } elseif (array_key_exists('status', $record->getAttributes())) {
            $record->update(['status' => 'archived']);
        }

        $this->log($request, 'archivage', $resource, $record);

        return response()->json(['message' => 'Element archive.']);
    }

    public function restore(Request $request, int|string $id, string $resource)
    {
        $this->authorizeRoleResource($request, $resource, 'archive');
        [$model] = $this->definition($resource);
        $query = $model::query();
        if (in_array(\Illuminate\Database\Eloquent\SoftDeletes::class, class_uses_recursive($model), true)) {
            $query->withTrashed();
        }
        $this->applyRoleScope($request, $resource, $query);
        $record = $query->findOrFail($id);

        if (method_exists($record, 'restore') && $record->trashed()) {
            $record->restore();
        } elseif ($resource === 'documents') {
            $record->update(['archived' => false]);
        } elseif ($resource === 'certificates' && array_key_exists('status', $record->getAttributes()) && $record->status === 'archived') {
            $record->update(['status' => 'draft']);
        } elseif ($resource === 'enrollments' && array_key_exists('status', $record->getAttributes()) && $record->status === 'archived') {
            $record->update(['status' => 'pending']);
        } elseif (array_key_exists('status', $record->getAttributes()) && $record->status === 'archived') {
            $record->update(['status' => 'active']);
        }

        $this->log($request, 'restauration', $resource, $record);

        return response()->json(['message' => 'Element restaure.']);
    }

    private function definition(string $resource): array
    {
        abort_unless(isset($this->resources[$resource]), 404, 'Module introuvable.');

        return $this->resources[$resource];
    }

    private function searchColumns(string $resource): array
    {
        return [
            'users' => ['name', 'email', 'matricule', 'profile_title'],
            'roles' => ['name', 'label', 'description'],
            'permissions' => ['name', 'label'],
            'centres' => ['code', 'name', 'region', 'city'],
            'sites-formation' => ['name', 'city', 'address', 'manager_name'],
            'salles' => ['name', 'equipment', 'status'],
            'formations' => ['title', 'description', 'category', 'status', 'type', 'level'],
            'themes' => ['title', 'description'],
            'sessions' => ['title', 'room', 'status', 'notes'],
            'absences' => ['status', 'justification'],
            'documents' => ['title', 'type', 'file_name'],
            'hebergements' => ['hotel_name', 'city', 'status'],
            'deplacements' => ['from_city', 'to_city', 'transport_mode', 'status'],
            'evaluations' => ['comment'],
            'rapports' => ['title', 'type'],
            'notifications' => ['title', 'message', 'type'],
            'enrollments' => ['status', 'decision_note'],
            'prerequisites' => ['rule'],
            'participant-evaluations' => ['comment'],
            'pedagogical-evaluations' => ['competency', 'feedback'],
            'certificates' => ['type', 'reference', 'status'],
            'logs' => ['action', 'module', 'description'],
        ][$resource] ?? ['id'];
    }

    private function dateColumn(string $resource): string
    {
        return [
            'sessions' => 'starts_at',
            'absences' => 'absence_date',
            'hebergements' => 'check_in',
            'deplacements' => 'travel_date',
            'certificates' => 'issued_at',
            'formations' => 'start_date',
        ][$resource] ?? 'created_at';
    }

    private function exportColumns(string $resource): array
    {
        return [
            'users' => ['name' => 'Full name', 'email' => 'Email', 'matricule' => 'Matricule', 'profile_title' => 'Function', 'status' => 'Status', 'centre.name' => 'Center'],
            'formations' => ['title' => 'Training', 'type' => 'Type', 'category' => 'Category', 'level' => 'Level', 'status' => 'Status', 'start_date' => 'Start date', 'end_date' => 'End date', 'capacity' => 'Capacity', 'progress' => 'Progression', 'centre.name' => 'Center', 'responsable.name' => 'Manager'],
            'sessions' => ['title' => 'Session', 'formation.title' => 'Training', 'siteFormation.name' => 'Site', 'salle.name' => 'Room', 'animateur.name' => 'Trainer', 'starts_at' => 'Starts at', 'ends_at' => 'Ends at', 'status' => 'Status'],
            'enrollments' => ['formation.title' => 'Training', 'participant.name' => 'Participant', 'participant.matricule' => 'Matricule', 'status' => 'Enrollment status', 'reviewedBy.name' => 'Reviewed by', 'reviewed_at' => 'Reviewed at', 'decision_note' => 'Decision note'],
            'absences' => ['formationSession.title' => 'Session', 'formationSession.formation.title' => 'Training', 'user.name' => 'Participant', 'absence_date' => 'Date', 'status' => 'Attendance status', 'justification' => 'Justification'],
            'documents' => ['title' => 'Document', 'type' => 'Type', 'formation.title' => 'Training', 'theme.title' => 'Theme', 'file_name' => 'File name', 'archived' => 'Archived'],
            'certificates' => ['reference' => 'Reference', 'type' => 'Type', 'formation.title' => 'Training', 'participant.name' => 'Participant', 'participant.matricule' => 'Matricule', 'issued_at' => 'Issued at', 'status' => 'Status'],
            'rapports' => ['title' => 'Report', 'type' => 'Type', 'created_at' => 'Created at'],
            'logs' => ['created_at' => 'Date', 'user.name' => 'User', 'action' => 'Action', 'module' => 'Module', 'description' => 'Description'],
        ][$resource] ?? collect($this->definition($resource)[2])
            ->keys()
            ->reject(fn ($column) => str_contains($column, '|') || str_contains($column, '.'))
            ->mapWithKeys(fn ($column) => [$column => str_replace('_', ' ', ucfirst($column))])
            ->all();
    }

    private function assertNoPlanningConflict(string $resource, array $data, ?int $ignoreId = null): void
    {
        if ($resource !== 'sessions') {
            return;
        }

        $overlappingSessions = FormationSession::query()
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at']);

        $trainerConflict = ! empty($data['animateur_id']) && (clone $overlappingSessions)
            ->where('animateur_id', $data['animateur_id'])
            ->exists();

        abort_if($trainerConflict, 422, 'Conflit de planning: cet animateur est deja affecte a une session sur ce creneau.');

        $roomConflict = ! empty($data['salle_id']) && (clone $overlappingSessions)
            ->where('salle_id', $data['salle_id'])
            ->exists();

        abort_if($roomConflict, 422, 'Conflit de planning: cette salle est deja reservee sur ce creneau.');

        if (! empty($data['salle_id'])) {
            $room = Salle::find($data['salle_id']);
            $acceptedParticipants = Enrollment::where('formation_id', $data['formation_id'])
                ->where('status', 'accepted')
                ->count();
            $legacyParticipants = \DB::table('formation_user')
                ->where('formation_id', $data['formation_id'])
                ->where('role', 'participant')
                ->count();
            $participants = max($acceptedParticipants, $legacyParticipants);

            abort_if($room && $participants > $room->capacity, 422, 'Capacite salle insuffisante pour les participants acceptes.');
        }

        $participantIds = Enrollment::where('formation_id', $data['formation_id'])
            ->where('status', 'accepted')
            ->pluck('participant_id')
            ->merge(\DB::table('formation_user')
                ->where('formation_id', $data['formation_id'])
                ->where('role', 'participant')
                ->pluck('user_id'))
            ->unique();

        if ($participantIds->isNotEmpty()) {
            $participantFormationIds = \DB::table('formation_user')
                ->whereIn('user_id', $participantIds)
                ->where('formation_id', '!=', $data['formation_id'])
                ->pluck('formation_id');

            $participantConflict = (clone $overlappingSessions)
                ->whereIn('formation_id', $participantFormationIds)
                ->exists();

            abort_if($participantConflict, 422, 'Conflit de planning: au moins un participant accepte a deja une session sur ce creneau.');
        }
    }

    private function validated(Request $request, string $resource, array $rules, ?Model $record = null): array
    {
        if ($resource === 'users') {
            $rules['email'] = ['required', 'email', 'max:160', Rule::unique('users')->ignore($record?->id)];
        }

        $data = $request->validate($rules);

        if ($resource === 'users' && empty($data['password'])) {
            unset($data['password']);
        } elseif ($resource === 'users') {
            $data['password'] = Hash::make($data['password']);
        }

        if ($resource === 'documents' && $request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_name'] = $file->getClientOriginalName();
            $data['mime_type'] = $file->getMimeType();
            $data['file_path'] = $file->store('documents', 'public');
            $data['uploaded_by'] = $request->user()->id;
            unset($data['file']);
        }

        if ($resource === 'documents' && $request->user()?->hasRole('formateur_animateur')) {
            $allowedFormationIds = $this->assignedFormationIds($request->user());
            abort_unless($allowedFormationIds->contains((int) ($data['formation_id'] ?? 0)), 403, 'Document hors formations assignees.');
        }

        if ($resource === 'formations' && $request->user()?->hasRole('responsable_cdc')) {
            $data['status'] = 'proposee';
        }

        if ($resource === 'evaluations') {
            $data['user_id'] ??= $request->user()->id;
            if ($request->user()?->hasRole('formateur_participant')) {
                $data['user_id'] = $request->user()->id;
                abort_unless($this->acceptedFormationIds($request->user())->contains((int) $data['formation_id']), 403, 'Evaluation hors formations acceptees.');
            }
        }

        if ($resource === 'enrollments') {
            $data['participant_id'] ??= $request->user()->id;
            if ($request->user()?->hasRole('formateur_participant')) {
                abort_if($record && $record->status !== 'pending', 403, 'Une decision deja traitee ne peut pas etre modifiee par le participant.');
                $data['participant_id'] = $request->user()->id;
                $data['status'] = 'pending';
                unset($data['decision_note']);
            }
            $existingStatus = $record ? null : Enrollment::where('formation_id', $data['formation_id'])
                ->where('participant_id', $data['participant_id'])
                ->value('status');

            abort_if($existingStatus, 422, 'Une demande existe deja pour cette formation.');
            $this->assertPrerequisitesMet($data['formation_id'], $data['participant_id']);
        }

        if ($resource === 'participant-evaluations') {
            $data['participant_id'] ??= $request->user()->id;
            if ($request->user()?->hasRole('formateur_participant')) {
                $data['participant_id'] = $request->user()->id;
                abort_unless($this->acceptedFormationIds($request->user())->contains((int) $data['formation_id']), 403, 'Evaluation hors formations acceptees.');
            }
        }

        if ($resource === 'pedagogical-evaluations') {
            $data['trainer_id'] ??= $request->user()->id;
            if ($request->user()?->hasRole('formateur_animateur')) {
                $data['trainer_id'] = $request->user()->id;
                abort_unless($this->assignedFormationIds($request->user())->contains((int) $data['formation_id']), 403, 'Evaluation hors formations assignees.');
                if (! empty($data['formation_session_id'])) {
                    abort_unless(FormationSession::whereKey($data['formation_session_id'])
                        ->where('animateur_id', $request->user()->id)
                        ->where('formation_id', $data['formation_id'])
                        ->exists(), 403, 'Session non assignee.');
                }
            }
        }

        if ($resource === 'certificates') {
            $data['reference'] ??= 'OFPPT-'.now()->format('Ymd').'-'.strtoupper(substr(md5(json_encode($data).microtime()), 0, 8));
        }

        if ($resource === 'absences') {
            $data['recorded_by'] = $request->user()->id;
        }

        if ($resource === 'rapports') {
            $data['created_by'] = $request->user()->id;
        }

        unset($data['participant_ids'], $data['animateur_ids'], $data['role_ids'], $data['permission_ids']);

        return $data;
    }

    private function assertPrerequisitesMet(int $formationId, int $participantId): void
    {
        $requiredIds = TrainingPrerequisite::where('formation_id', $formationId)->pluck('required_formation_id');

        if ($requiredIds->isEmpty()) {
            return;
        }

        $completedIds = \DB::table('formation_user')
            ->where('user_id', $participantId)
            ->whereIn('formation_id', $requiredIds)
            ->whereIn('status', ['completed', 'terminee', 'termine', 'valide', 'validé'])
            ->pluck('formation_id');

        abort_if($requiredIds->diff($completedIds)->isNotEmpty(), 422, 'Prerequis non valides pour cette formation.');
    }

    public function downloadDocument(Request $request, int $id)
    {
        $document = Document::findOrFail($id);
        $this->authorizeDocumentAccess($request, $document);

        abort_if(! $document->file_path || ! Storage::disk('public')->exists($document->file_path), 404, 'Fichier introuvable.');

        return Storage::disk('public')->download($document->file_path, $document->file_name ?: $document->title);
    }

    public function previewDocument(Request $request, int $id)
    {
        $document = Document::findOrFail($id);
        $this->authorizeDocumentAccess($request, $document);

        abort_if(! $document->file_path || ! Storage::disk('public')->exists($document->file_path), 404, 'Fichier introuvable.');

        return Storage::disk('public')->response($document->file_path, $document->file_name ?: $document->title);
    }

    private function applyRoleScope(Request $request, string $resource, $query): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        if ($user->hasRole('responsable_formation') && $user->centre_id) {
            $this->applyCenterScope($resource, $query, $user->centre_id);

            return;
        }

        if ($user->hasRole('responsable_cdc')) {
            if (in_array($resource, ['formations', 'themes', 'evaluations', 'participant-evaluations', 'pedagogical-evaluations', 'rapports'], true)) {
                return;
            }
        }

        if ($user->hasRole('responsable_dr')) {
            if ($user->centre_id) {
                $this->applyCenterScope($resource, $query, $user->centre_id);
            }
            return;
        }

        $assignedFormationIds = $this->assignedFormationIds($user);
        $acceptedFormationIds = $this->acceptedFormationIds($user);

        if ($resource === 'formations' && $user->hasRole('formateur_participant')) {
            if ($user->centre_id) {
                $query->where('centre_id', $user->centre_id);
            }
            $query->whereNotIn('status', ['cancelled', 'annulee']);

            return;
        }

        if ($resource === 'formations' && $user->hasRole('formateur_animateur')) {
            $query->whereIn('id', $assignedFormationIds);
        }

        if ($resource === 'themes' && $user->hasRole('formateur_animateur')) {
            $query->whereIn('formation_id', $assignedFormationIds);
        }

        if ($resource === 'sessions') {
            if ($user->hasRole('formateur_animateur')) {
                $query->where('animateur_id', $user->id);
            } elseif ($user->hasRole('formateur_participant')) {
                $query->whereIn('formation_id', $acceptedFormationIds);
            }
        }

        if ($resource === 'documents') {
            if ($user->hasRole('formateur_animateur')) {
                $query->whereIn('formation_id', $assignedFormationIds);
            } elseif ($user->hasRole('formateur_participant')) {
                $query->whereIn('formation_id', $acceptedFormationIds);
            }
        }

        if ($resource === 'absences' && $user->hasRole('formateur_animateur')) {
            $sessionIds = FormationSession::where('animateur_id', $user->id)->pluck('id');
            $query->whereIn('formation_session_id', $sessionIds);
        }

        if ($resource === 'evaluations' && $user->hasRole('formateur_participant')) {
            $query->where('user_id', $user->id);
        }

        if ($resource === 'enrollments' && $user->hasRole('formateur_participant')) {
            $query->where('participant_id', $user->id);
        }

        if ($resource === 'participant-evaluations' && $user->hasRole('formateur_participant')) {
            $query->where('participant_id', $user->id);
        }

        if ($resource === 'pedagogical-evaluations' && $user->hasRole('formateur_animateur')) {
            $query->where('trainer_id', $user->id);
        }

        if ($resource === 'certificates' && $user->hasRole('formateur_participant')) {
            $query->where('participant_id', $user->id);
        }

        if ($resource === 'absences' && $user->hasRole('formateur_participant')) {
            $query->where('user_id', $user->id);
        }
    }

    private function applyCenterScope(string $resource, $query, int $centreId): void
    {
        if (in_array($resource, ['formations'], true)) {
            $query->where('centre_id', $centreId);
        }

        if (in_array($resource, ['themes', 'sessions', 'documents', 'enrollments', 'participant-evaluations', 'pedagogical-evaluations', 'certificates', 'hebergements', 'deplacements'], true)) {
            $query->whereHas('formation', fn ($q) => $q->where('centre_id', $centreId));
        }

        if ($resource === 'absences') {
            $query->whereHas('formationSession.formation', fn ($q) => $q->where('centre_id', $centreId));
        }

        if ($resource === 'evaluations') {
            $query->whereHas('formation', fn ($q) => $q->where('centre_id', $centreId));
        }

        if ($resource === 'sites-formation') {
            $query->where('centre_id', $centreId);
        }

        if ($resource === 'salles') {
            $query->whereHas('siteFormation', fn ($q) => $q->where('centre_id', $centreId));
        }

        if ($resource === 'users') {
            $query->where('centre_id', $centreId);
        }
    }

    private function roleResourceAllowed(?User $user, string $resource, string $ability): bool
    {
        if (! $user) {
            return false;
        }

        $role = $user->roles->first()?->name;
        $read = [
            'administrateur' => ['users', 'roles', 'permissions', 'logs'],
            'responsable_formation' => ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates', 'rapports', 'evaluations', 'participant-evaluations'],
            'responsable_cdc' => ['formations', 'themes', 'rapports', 'evaluations', 'participant-evaluations', 'pedagogical-evaluations'],
            'responsable_dr' => ['formations', 'themes', 'sessions', 'absences', 'hebergements', 'deplacements', 'evaluations', 'rapports'],
            'formateur_animateur' => ['formations', 'themes', 'sessions', 'absences', 'documents', 'pedagogical-evaluations'],
            'formateur_participant' => ['formations', 'sessions', 'absences', 'documents', 'enrollments', 'evaluations', 'participant-evaluations', 'certificates'],
        ];
        $write = [
            'administrateur' => ['users', 'roles', 'permissions'],
            'responsable_formation' => ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates'],
            'responsable_cdc' => ['formations', 'themes', 'rapports'],
            'responsable_dr' => [],
            'formateur_animateur' => ['absences', 'documents', 'pedagogical-evaluations'],
            'formateur_participant' => ['enrollments', 'evaluations', 'participant-evaluations'],
        ];
        $export = [
            'administrateur' => ['users', 'roles', 'permissions', 'logs'],
            'responsable_formation' => ['formations', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates', 'rapports'],
            'responsable_cdc' => ['formations', 'themes', 'rapports', 'evaluations'],
            'responsable_dr' => ['formations', 'sessions', 'absences', 'hebergements', 'deplacements', 'evaluations', 'rapports'],
            'formateur_animateur' => [],
            'formateur_participant' => [],
        ];
        $import = [
            'administrateur' => ['users'],
            'responsable_formation' => ['formations', 'sites-formation', 'salles'],
            'responsable_cdc' => ['formations'],
            'responsable_dr' => [],
            'formateur_animateur' => [],
            'formateur_participant' => [],
        ];
        $archive = [
            'administrateur' => ['users', 'roles', 'permissions'],
            'responsable_formation' => ['formations', 'themes', 'sessions', 'enrollments', 'absences', 'hebergements', 'deplacements', 'sites-formation', 'salles', 'certificates'],
            'responsable_cdc' => ['formations', 'themes', 'rapports'],
            'responsable_dr' => [],
            'formateur_animateur' => ['documents'],
            'formateur_participant' => [],
        ];

        return match ($ability) {
            'read' => in_array($resource, $read[$role] ?? [], true),
            'write' => in_array($resource, $write[$role] ?? [], true),
            'delete' => in_array($resource, $write[$role] ?? [], true),
            'archive' => in_array($resource, $archive[$role] ?? [], true),
            'export' => in_array($resource, $export[$role] ?? [], true),
            'import' => in_array($resource, $import[$role] ?? [], true),
            default => false,
        };
    }

    private function authorizeRoleResource(Request $request, string $resource, string $ability): void
    {
        abort_unless($this->roleResourceAllowed($request->user(), $resource, $ability), 403, 'Acces role non autorise pour cette ressource.');
    }

    private function assignedFormationIds(User $user)
    {
        return FormationSession::where('animateur_id', $user->id)
            ->pluck('formation_id')
            ->merge($user->formations()->wherePivot('role', 'animateur')->pluck('formations.id'))
            ->unique()
            ->values();
    }

    private function acceptedFormationIds(User $user)
    {
        return Enrollment::where('participant_id', $user->id)
            ->where('status', 'accepted')
            ->pluck('formation_id')
            ->merge($user->formations()
                ->wherePivot('role', 'participant')
                ->wherePivotIn('status', ['accepted', 'valide', 'validé', 'termine', 'terminee', 'completed'])
                ->pluck('formations.id'))
            ->unique()
            ->values();
    }

    private function sanitizeRecord(Request $request, string $resource, Model $record): Model
    {
        $user = $request->user();

        if ($resource === 'formations' && $user?->hasRole('formateur_participant')) {
            $acceptedIds = $this->acceptedFormationIds($user);
            $record->unsetRelation('participants');
            $record->unsetRelation('enrollments');
            if (! $acceptedIds->contains($record->id)) {
                $record->setRelation('sessions', collect());
                $record->setRelation('certificates', collect());
            }
        }

        if ($resource === 'formations' && $user?->hasRole('formateur_animateur')) {
            $participants = $record->relationLoaded('participants')
                ? $record->participants->filter(fn ($participant) => $participant->pivot?->role === 'participant')->values()
                : collect();
            $record->setRelation('participants', $participants);
            $record->unsetRelation('enrollments');
        }

        return $record;
    }

    private function afterSave(Request $request, string $resource, Model $record): void
    {
        if ($resource === 'formations') {
            $sync = [];
            foreach ($request->input('participant_ids', []) as $id) {
                $sync[$id] = ['role' => 'participant', 'progress' => 0, 'status' => 'inscrit'];
            }
            foreach ($request->input('animateur_ids', []) as $id) {
                $sync[$id] = ['role' => 'animateur', 'progress' => 0, 'status' => 'affecte'];
            }
            if ($sync) {
                $record->participants()->sync($sync);
            }
        }

        if ($resource === 'roles') {
            $record->permissions()->sync($request->input('permission_ids', []));
        }

        if ($resource === 'users') {
            $record->roles()->sync($request->input('role_ids', []));
        }

        if ($resource === 'enrollments') {
            if (in_array($record->status, ['accepted', 'rejected'], true) && ! $record->reviewed_by) {
                $record->forceFill([
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                ])->save();
            }

            if ($record->status === 'accepted') {
                $record->formation->participants()->syncWithoutDetaching([
                    $record->participant_id => ['role' => 'participant', 'progress' => 0, 'status' => 'accepted'],
                ]);
            }

            OfpptNotification::create([
                'user_id' => $record->participant_id,
                'title' => $record->status === 'accepted' ? 'Inscription acceptee' : ($record->status === 'rejected' ? 'Inscription rejetee' : 'Demande recue'),
                'message' => "Statut de votre demande: {$record->status}",
                'type' => 'enrollment',
            ]);

            $participant = $record->participant;
            if ($participant?->email) {
                try {
                    Mail::raw("Bonjour {$participant->name},\n\nVotre demande d'inscription pour {$record->formation?->title} est maintenant: {$record->status}.\n\nOFPPT Training Platform", function ($message) use ($participant) {
                        $message->to($participant->email)->subject('Notification inscription OFPPT');
                    });
                } catch (\Throwable $exception) {
                    ActivityLog::create([
                        'user_id' => $request->user()?->id,
                        'action' => 'email_failed',
                        'module' => 'notifications',
                        'description' => $exception->getMessage(),
                    ]);
                }
            }
        }

        if ($resource === 'pedagogical-evaluations') {
            $current = \DB::table('formation_user')
                ->where('formation_id', $record->formation_id)
                ->where('user_id', $record->participant_id)
                ->where('role', 'participant')
                ->value('progress') ?? 0;
            $next = min(100, max(0, (int) $current + (int) $record->progression_delta));

            \DB::table('formation_user')
                ->where('formation_id', $record->formation_id)
                ->where('user_id', $record->participant_id)
                ->where('role', 'participant')
                ->update(['progress' => $next]);

            $this->recalculateFormationProgress($record->formation_id);
        }
    }

    private function recalculateFormationProgress(int $formationId): void
    {
        $attendanceRate = Absence::whereHas('formationSession', fn ($q) => $q->where('formation_id', $formationId))->count()
            ? (Absence::whereHas('formationSession', fn ($q) => $q->where('formation_id', $formationId))->where('status', 'present')->count()
                / max(1, Absence::whereHas('formationSession', fn ($q) => $q->where('formation_id', $formationId))->count())) * 100
            : 100;

        $evaluationAverage = PedagogicalEvaluation::where('formation_id', $formationId)->avg('score');
        $sessionCompletion = FormationSession::where('formation_id', $formationId)->count()
            ? (FormationSession::where('formation_id', $formationId)->whereIn('status', ['completed', 'terminee'])->count()
                / max(1, FormationSession::where('formation_id', $formationId)->count())) * 100
            : 0;

        $scoreProgress = $evaluationAverage ? ($evaluationAverage / 5) * 100 : 0;
        Formation::whereKey($formationId)->update([
            'progress' => (int) round(($attendanceRate * .35) + ($sessionCompletion * .35) + ($scoreProgress * .30)),
        ]);
    }

    private function log(Request $request, string $action, string $module, Model $record): void
    {
        ActivityLog::create([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'module' => $module,
            'description' => "{$action} {$module} #{$record->getKey()}",
        ]);
    }

    private function authorizeDestroy(Request $request, string $resource): void
    {
        $user = $request->user();

        abort_if(in_array($resource, ['formations', 'themes', 'sessions', 'absences', 'documents', 'evaluations', 'rapports'], true), 403, 'Suppression non autorisee pour ce module metier.');
    }

    private function authorizeDocumentAccess(Request $request, Document $document): void
    {
        $user = $request->user();

        abort_if($user->hasRole('administrateur'), 403, 'Les administrateurs systeme ne disposent pas automatiquement des fichiers pedagogiques.');

        if ($user->hasRole('responsable_cdc', 'responsable_formation', 'responsable_dr')) {
            return;
        }

        $formationIds = $user->formations()->pluck('formations.id');
        abort_unless($formationIds->contains($document->formation_id), 403, 'Accès document non autorisé.');
    }

    private function applyCertificateAccess(Request $request, Certificate $certificate): void
    {
        $user = $request->user();

        if ($user->hasRole('administrateur')) {
            abort(403, 'Les administrateurs systeme ne telechargent pas les certificats pedagogiques par defaut.');
        }

        if ($user->hasRole('responsable_cdc', 'responsable_formation', 'responsable_dr')) {
            if ($user->hasRole('responsable_formation') && $user->centre_id) {
                abort_unless((int) $certificate->formation?->centre_id === (int) $user->centre_id, 403, 'Certificat hors centre.');
            }

            return;
        }

        abort_unless((int) $certificate->participant_id === (int) $user->id, 403, 'Certificat non autorise.');
    }
}

