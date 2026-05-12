<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\ActivityLog;
use App\Models\Centre;
use App\Models\Deplacement;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Hebergement;
use App\Models\OfpptNotification;
use App\Models\Permission;
use App\Models\Rapport;
use App\Models\Role;
use App\Models\Salle;
use App\Models\SiteFormation;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class OperationalController extends Controller
{
    private array $resources = [
        'users' => [User::class, ['roles'], ['name' => 'required|string|max:120', 'email' => 'required|email|max:160', 'password' => 'nullable|string|min:8', 'matricule' => 'nullable|string|max:40', 'phone' => 'nullable|string|max:40', 'profile_title' => 'nullable|string|max:120', 'status' => 'nullable|string']],
        'roles' => [Role::class, ['permissions'], ['name' => 'required|string|max:80', 'label' => 'required|string|max:120', 'description' => 'nullable|string']],
        'permissions' => [Permission::class, [], ['name' => 'required|string|max:100', 'label' => 'required|string|max:140']],
        'centres' => [Centre::class, [], ['code' => 'required|string|max:30', 'name' => 'required|string|max:160', 'region' => 'required|string|max:120', 'city' => 'required|string|max:80', 'address' => 'nullable|string']],
        'sites-formation' => [SiteFormation::class, ['centre'], ['centre_id' => 'nullable|exists:centres,id', 'name' => 'required|string|max:160', 'city' => 'required|string|max:80', 'address' => 'required|string', 'capacity' => 'required|integer|min:1', 'manager_name' => 'nullable|string|max:120']],
        'salles' => [Salle::class, ['siteFormation:id,name,city'], ['site_formation_id' => 'required|exists:sites_formation,id', 'name' => 'required|string|max:120', 'capacity' => 'required|integer|min:1', 'equipment' => 'nullable|string|max:255', 'status' => 'nullable|string|max:60']],
        'formations' => [Formation::class, ['centre', 'responsable', 'themes.documents', 'participants.roles'], ['title' => 'required|string|max:180', 'description' => 'required|string', 'start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date', 'status' => 'nullable|string|in:proposee,validee,planifiee,en_cours,terminee,annulee', 'type' => 'required|string|in:Formation technique CDC,Formation pédagogique SFP', 'category' => 'required|string', 'level' => 'nullable|string', 'capacity' => 'required|integer|min:1', 'progress' => 'nullable|integer|between:0,100', 'centre_id' => 'nullable|exists:centres,id', 'responsable_id' => 'nullable|exists:users,id', 'participant_ids' => 'array', 'animateur_ids' => 'array']],
        'themes' => [Theme::class, ['formation:id,title', 'animateur:id,name'], ['formation_id' => 'required|exists:formations,id', 'animateur_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:180', 'description' => 'nullable|string', 'start_date' => 'required|date', 'end_date' => 'required|date|after_or_equal:start_date', 'sort_order' => 'nullable|integer|min:1', 'progress' => 'nullable|integer|between:0,100']],
        'sessions' => [FormationSession::class, ['formation:id,title', 'theme:id,title', 'siteFormation', 'salle', 'animateur:id,name'], ['formation_id' => 'required|exists:formations,id', 'theme_id' => 'nullable|exists:themes,id', 'site_formation_id' => 'nullable|exists:sites_formation,id', 'salle_id' => 'nullable|exists:salles,id', 'animateur_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:180', 'starts_at' => 'required|date', 'ends_at' => 'required|date|after:starts_at', 'room' => 'nullable|string|max:80', 'status' => 'nullable|string', 'notes' => 'nullable|string']],
        'absences' => [Absence::class, ['user:id,name,matricule', 'formationSession.formation:id,title'], ['formation_session_id' => 'required|exists:formation_sessions,id', 'user_id' => 'required|exists:users,id', 'absence_date' => 'required|date', 'status' => 'required|string|in:present,absent,justifie,non_justifie', 'justification' => 'nullable|string']],
        'documents' => [Document::class, ['formation:id,title', 'theme:id,title'], ['formation_id' => 'nullable|exists:formations,id', 'theme_id' => 'nullable|exists:themes,id', 'title' => 'required|string|max:180', 'type' => 'required|string|max:60', 'file' => 'nullable|file|max:20480', 'archived' => 'nullable|boolean']],
        'hebergements' => [Hebergement::class, [], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'required|exists:users,id', 'hotel_name' => 'required|string|max:160', 'city' => 'required|string|max:80', 'check_in' => 'required|date', 'check_out' => 'required|date|after_or_equal:check_in', 'status' => 'nullable|string']],
        'deplacements' => [Deplacement::class, [], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'required|exists:users,id', 'from_city' => 'required|string|max:80', 'to_city' => 'required|string|max:80', 'travel_date' => 'required|date', 'transport_mode' => 'required|string|max:80', 'status' => 'nullable|string']],
        'evaluations' => [Evaluation::class, [], ['formation_id' => 'required|exists:formations,id', 'user_id' => 'nullable|exists:users,id', 'content_score' => 'required|integer|between:1,5', 'animation_score' => 'required|integer|between:1,5', 'logistics_score' => 'required|integer|between:1,5', 'impact_score' => 'required|integer|between:1,5', 'comment' => 'nullable|string']],
        'rapports' => [Rapport::class, [], ['title' => 'required|string|max:180', 'type' => 'required|string|max:80', 'filters' => 'nullable|array', 'metrics' => 'nullable|array']],
        'notifications' => [OfpptNotification::class, [], ['user_id' => 'nullable|exists:users,id', 'title' => 'required|string|max:160', 'message' => 'required|string', 'type' => 'nullable|string|max:60']],
    ];

    public function index(Request $request, string $resource)
    {
        [$model, $relations] = $this->definition($resource);
        $query = $model::query()->with($relations);
        $this->applyRoleScope($request, $resource, $query);

        foreach (['status', 'formation_id', 'user_id', 'theme_id', 'centre_id'] as $filter) {
            $query->when($request->filled($filter), fn ($q) => $q->where($filter, $request->$filter));
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search, $resource) {
                foreach ($this->searchColumns($resource) as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        return response()->json($query->latest()->paginate((int) $request->query('per_page', 10)));
    }

    public function store(Request $request, string $resource)
    {
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
        [$model, $relations] = $this->definition($resource);
        $query = $model::query()->with($relations);
        $this->applyRoleScope(request(), $resource, $query);

        return response()->json($query->findOrFail($id));
    }

    public function update(Request $request, int|string $id, string $resource)
    {
        [$model,, $rules] = $this->definition($resource);
        $record = $model::findOrFail($id);
        $data = $this->validated($request, $resource, $rules, $record);
        $this->assertNoPlanningConflict($resource, $data, $record->id);
        $record->update($data);
        $this->afterSave($request, $resource, $record);
        $this->log($request, 'mise à jour', $resource, $record);

        return response()->json($record->fresh($this->definition($resource)[1]));
    }

    public function destroy(Request $request, int|string $id, string $resource)
    {
        [$model] = $this->definition($resource);
        $record = $model::findOrFail($id);
        $this->authorizeDestroy($request, $resource);
        $record->delete();
        $this->log($request, 'suppression', $resource, $record);

        return response()->json(['message' => 'Suppression effectuée.']);
    }

    public function analytics()
    {
        return response()->json([
            'participation' => Formation::withCount('participants')->orderByDesc('participants_count')->limit(8)->get(['id', 'title']),
            'absences_by_status' => Absence::selectRaw('status, count(*) total')->groupBy('status')->get(),
            'progression' => Formation::select('title', 'progress', 'status')->orderByDesc('progress')->get(),
            'evaluations' => Evaluation::selectRaw('round(avg(content_score),1) contenu, round(avg(animation_score),1) animation, round(avg(logistics_score),1) logistique, round(avg(impact_score),1) impact')->first(),
        ]);
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
        ][$resource] ?? ['id'];
    }

    private function assertNoPlanningConflict(string $resource, array $data, ?int $ignoreId = null): void
    {
        if ($resource !== 'sessions') {
            return;
        }

        if (empty($data['site_formation_id']) && empty($data['animateur_id'])) {
            return;
        }

        $conflict = FormationSession::query()
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->where(function ($query) use ($data) {
                $hasCondition = false;
                if (! empty($data['salle_id'])) {
                    $query->where('salle_id', $data['salle_id']);
                    $hasCondition = true;
                }
                if (! empty($data['site_formation_id'])) {
                    $hasCondition
                        ? $query->orWhere('site_formation_id', $data['site_formation_id'])
                        : $query->where('site_formation_id', $data['site_formation_id']);
                    $hasCondition = true;
                }
                if (! empty($data['animateur_id'])) {
                    $hasCondition
                        ? $query->orWhere('animateur_id', $data['animateur_id'])
                        : $query->where('animateur_id', $data['animateur_id']);
                }
            })
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->exists();

        abort_if($conflict, 422, 'Conflit de planification détecté pour ce site ou cet animateur.');
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

        if ($resource === 'formations' && $request->user()?->hasRole('responsable_cdc')) {
            $data['status'] = 'proposee';
        }

        if ($resource === 'evaluations') {
            $data['user_id'] ??= $request->user()->id;
        }

        if ($resource === 'absences') {
            $data['recorded_by'] = $request->user()->id;
        }

        unset($data['participant_ids'], $data['animateur_ids'], $data['role_ids'], $data['permission_ids']);

        return $data;
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

        if (! $user || $user->hasRole('administrateur', 'responsable_cdc', 'responsable_formation', 'responsable_dr')) {
            return;
        }

        $formationIds = $user->formations()->pluck('formations.id');

        if ($resource === 'formations') {
            $query->whereIn('id', $formationIds);
        }

        if ($resource === 'themes') {
            $query->whereIn('formation_id', $formationIds);
        }

        if ($resource === 'sessions') {
            $query->whereIn('formation_id', $formationIds);
        }

        if ($resource === 'documents') {
            $query->whereIn('formation_id', $formationIds);
        }

        if ($resource === 'absences' && $user->hasRole('formateur_animateur')) {
            $sessionIds = FormationSession::where('animateur_id', $user->id)->pluck('id');
            $query->whereIn('formation_session_id', $sessionIds);
        }

        if ($resource === 'evaluations' && $user->hasRole('formateur_animateur')) {
            $query->whereIn('formation_id', $formationIds);
        }

        if ($resource === 'evaluations' && $user->hasRole('formateur_participant')) {
            $query->where('user_id', $user->id);
        }

        if (in_array($resource, ['absences', 'hebergements', 'deplacements'], true) && $user->hasRole('formateur_participant')) {
            $query->where('user_id', $user->id);
        }
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

        if ($user->hasRole('administrateur', 'responsable_cdc', 'responsable_formation', 'responsable_dr')) {
            return;
        }

        $formationIds = $user->formations()->pluck('formations.id');
        abort_unless($formationIds->contains($document->formation_id), 403, 'Accès document non autorisé.');
    }
}
