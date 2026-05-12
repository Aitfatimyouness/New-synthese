<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use App\Models\Absence;
use App\Models\Center;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\Formation;
use App\Models\FormationSession;
use App\Models\Report;
use App\Models\Role;
use App\Models\Theme;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CrudController extends Controller
{
    private array $map = [
        'users' => User::class,
        'centers' => Center::class,
        'themes' => Theme::class,
        'formations' => Formation::class,
        'sessions' => FormationSession::class,
        'absences' => Absence::class,
        'accommodations' => Accommodation::class,
        'travels' => Travel::class,
        'documents' => Document::class,
        'evaluations' => Evaluation::class,
        'reports' => Report::class,
    ];

    private array $readRoles = [
        'users' => ['admin'],
        'centers' => ['admin', 'responsable_dr', 'responsable_formation'],
        'themes' => ['admin', 'responsable_cdc', 'responsable_formation'],
        'formations' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
        'sessions' => ['admin', 'responsable_formation', 'responsable_dr', 'responsable_cdc', 'formateur_animateur', 'formateur_participant'],
        'absences' => ['admin', 'responsable_formation', 'responsable_dr', 'formateur_animateur', 'formateur_participant'],
        'accommodations' => ['admin', 'responsable_dr', 'responsable_formation', 'formateur_participant'],
        'travels' => ['admin', 'responsable_dr', 'responsable_formation', 'formateur_participant'],
        'documents' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr', 'formateur_participant', 'formateur_animateur'],
        'evaluations' => ['admin', 'responsable_formation', 'responsable_cdc', 'formateur_participant', 'formateur_animateur'],
        'reports' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
    ];

    private array $writeRoles = [
        'users' => ['admin'],
        'centers' => ['admin', 'responsable_dr', 'responsable_formation'],
        'themes' => ['admin', 'responsable_cdc', 'responsable_formation'],
        'formations' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
        'sessions' => ['admin', 'responsable_formation', 'responsable_dr', 'responsable_cdc'],
        'absences' => ['admin', 'responsable_formation', 'responsable_dr', 'formateur_animateur'],
        'accommodations' => ['admin', 'responsable_dr', 'responsable_formation'],
        'travels' => ['admin', 'responsable_dr', 'responsable_formation'],
        'documents' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr', 'formateur_animateur'],
        'evaluations' => ['admin', 'responsable_formation', 'responsable_cdc', 'formateur_participant', 'formateur_animateur'],
        'reports' => ['admin', 'responsable_cdc', 'responsable_formation', 'responsable_dr'],
    ];

    private array $with = [
        'formations' => ['theme', 'sessions'],
        'sessions' => ['formation.theme', 'center', 'animator', 'participants'],
        'absences' => ['session.formation', 'user', 'marker'],
        'evaluations' => ['session.formation', 'participant'],
    ];

    public function index(Request $request, string $resource)
    {
        $this->authorizeResource($request, $resource, 'read');
        $model = $this->model($resource);
        $query = $model::query();

        if (isset($this->with[$resource])) {
            $query->with($this->with[$resource]);
        }

        $this->scopeForRole($query, $request, $resource);

        if ($search = $request->query('search')) {
            $columns = [
                'users' => ['name', 'email', 'role'],
                'centers' => ['name', 'city'],
                'themes' => ['title', 'domain'],
                'formations' => ['title', 'status', 'target_profile'],
                'sessions' => ['code', 'place', 'status'],
                'absences' => ['type', 'reason'],
                'accommodations' => ['hotel_name', 'city', 'status'],
                'travels' => ['origin', 'destination', 'transport_mode', 'status'],
                'documents' => ['title', 'category'],
                'evaluations' => ['feedback', 'skills_acquired'],
                'reports' => ['title', 'type'],
            ][$resource] ?? [];
            $query->where(function (Builder $q) use ($search, $columns): void {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        return response()->json($query->latest()->paginate((int) $request->query('per_page', 50)));
    }

    public function show(Request $request, string $resource, int $id)
    {
        $this->authorizeResource($request, $resource, 'read');
        $query = $this->model($resource)::query();
        if (isset($this->with[$resource])) {
            $query->with($this->with[$resource]);
        }

        $item = $query->findOrFail($id);
        $this->authorizeRecord($request, $resource, $item);

        return response()->json($item);
    }

    public function store(Request $request, string $resource)
    {
        $this->authorizeResource($request, $resource, 'write');
        $data = $this->validated($request, $resource);

        if ($resource === 'documents') {
            $data = $this->handleDocumentUpload($request, $data);
        }

        if ($resource === 'users' && isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        if ($resource === 'absences') {
            $data['marked_by'] = $request->user()->id;
        }

        if ($resource === 'evaluations' && $request->user()->role === 'formateur_participant') {
            $data['participant_id'] = $request->user()->id;
        }

        if ($resource === 'reports') {
            $data['generated_by'] = $request->user()->id;
            $data['content'] = app(DashboardController::class)->reportPayload($data['type']);
        }

        $item = $this->model($resource)::create($data);

        if ($resource === 'sessions') {
            $this->syncParticipants($request, $item);
        }

        return response()->json($item->fresh($this->with[$resource] ?? []), 201);
    }

    public function update(Request $request, string $resource, int $id)
    {
        $this->authorizeResource($request, $resource, 'write');
        $item = $this->model($resource)::findOrFail($id);
        $this->authorizeRecord($request, $resource, $item);
        $data = $this->validated($request, $resource, $id);

        if ($resource === 'documents') {
            $data = $this->handleDocumentUpload($request, $data);
        }

        if ($resource === 'users') {
            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }

        if ($resource === 'reports') {
            $data['content'] = app(DashboardController::class)->reportPayload($data['type'] ?? $item->type);
        }

        $item->update($data);

        if ($resource === 'sessions') {
            $this->syncParticipants($request, $item);
        }

        return response()->json($item->fresh($this->with[$resource] ?? []));
    }

    public function destroy(Request $request, string $resource, int $id)
    {
        $this->authorizeResource($request, $resource, 'write');
        $item = $this->model($resource)::findOrFail($id);
        $this->authorizeRecord($request, $resource, $item);
        $item->delete();

        return response()->json(['message' => 'Element supprime.']);
    }

    public function options()
    {
        return response()->json([
            'roles' => Role::orderBy('label')->get(['key', 'label', 'description']),
            'users' => User::orderBy('name')->get(['id', 'name', 'email', 'role']),
            'centers' => Center::orderBy('name')->get(),
            'themes' => Theme::orderBy('title')->get(),
            'formations' => Formation::with('theme')->orderBy('title')->get(),
            'sessions' => FormationSession::with('formation')->orderByDesc('start_date')->get(),
        ]);
    }

    private function model(string $resource): string
    {
        abort_unless(isset($this->map[$resource]), 404, 'Ressource inconnue.');

        return $this->map[$resource];
    }

    private function authorizeResource(Request $request, string $resource, string $ability): void
    {
        $roles = $ability === 'write'
            ? ($this->writeRoles[$resource] ?? [])
            : ($this->readRoles[$resource] ?? []);

        abort_unless(in_array($request->user()->role, $roles, true), 403, 'Acces non autorise pour ce role.');
    }

    private function validated(Request $request, string $resource, ?int $id = null): array
    {
        $rules = [
            'users' => [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', Rule::unique('users')->ignore($id)],
                'password' => [$id ? 'nullable' : 'required', 'string', 'min:8'],
                'role' => ['required', Rule::in(User::ROLES)],
                'phone' => ['nullable', 'string', 'max:40'],
                'direction' => ['nullable', 'string', 'max:120'],
                'cdc' => ['nullable', 'string', 'max:120'],
                'active' => ['boolean'],
            ],
            'centers' => [
                'name' => ['required', 'string', 'max:160'],
                'city' => ['required', 'string', 'max:100'],
                'address' => ['nullable', 'string'],
                'capacity' => ['required', 'integer', 'min:0'],
                'manager_name' => ['nullable', 'string'],
                'phone' => ['nullable', 'string'],
            ],
            'themes' => [
                'title' => ['required', 'string'],
                'domain' => ['required', 'string'],
                'objectives' => ['nullable', 'string'],
                'skills_targeted' => ['nullable', 'string'],
                'duration_hours' => ['required', 'integer', 'min:1'],
            ],
            'formations' => [
                'theme_id' => ['required', 'exists:themes,id'],
                'title' => ['required', 'string'],
                'description' => ['nullable', 'string'],
                'status' => ['required', 'string'],
                'target_profile' => ['nullable', 'string'],
                'planned_start_date' => ['nullable', 'date'],
                'planned_end_date' => ['nullable', 'date', 'after_or_equal:planned_start_date'],
            ],
            'sessions' => [
                'formation_id' => ['required', 'exists:formations,id'],
                'center_id' => ['nullable', 'exists:centers,id'],
                'animator_id' => ['nullable', 'exists:users,id'],
                'code' => ['required', 'string', Rule::unique('formation_sessions')->ignore($id)],
                'start_date' => ['required', 'date'],
                'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                'place' => ['nullable', 'string'],
                'status' => ['required', 'string'],
                'capacity' => ['required', 'integer', 'min:1'],
                'logistics_notes' => ['nullable', 'string'],
                'participant_ids' => ['array'],
                'participant_ids.*' => ['integer', 'exists:users,id'],
            ],
            'absences' => [
                'formation_session_id' => ['required', 'exists:formation_sessions,id'],
                'user_id' => ['required', 'exists:users,id'],
                'absence_date' => ['required', 'date'],
                'type' => ['required', 'string'],
                'reason' => ['nullable', 'string'],
            ],
            'accommodations' => [
                'formation_session_id' => ['nullable', 'exists:formation_sessions,id'],
                'user_id' => ['nullable', 'exists:users,id'],
                'hotel_name' => ['required', 'string'],
                'city' => ['required', 'string'],
                'check_in' => ['required', 'date'],
                'check_out' => ['required', 'date', 'after_or_equal:check_in'],
                'cost' => ['required', 'numeric', 'min:0'],
                'status' => ['required', 'string'],
            ],
            'travels' => [
                'formation_session_id' => ['nullable', 'exists:formation_sessions,id'],
                'user_id' => ['nullable', 'exists:users,id'],
                'origin' => ['required', 'string'],
                'destination' => ['required', 'string'],
                'transport_mode' => ['required', 'string'],
                'travel_date' => ['required', 'date'],
                'cost' => ['required', 'numeric', 'min:0'],
                'status' => ['required', 'string'],
            ],
            'documents' => [
                'formation_id' => ['nullable', 'exists:formations,id'],
                'formation_session_id' => ['nullable', 'exists:formation_sessions,id'],
                'title' => ['required', 'string'],
                'category' => ['required', 'string'],
                'file' => ['nullable', 'file', 'max:10240'],
                'visible_roles' => ['nullable'],
                'archived' => ['boolean'],
            ],
            'evaluations' => [
                'formation_session_id' => ['required', 'exists:formation_sessions,id'],
                'participant_id' => ['nullable', 'exists:users,id'],
                'score_content' => ['required', 'integer', 'between:1,5'],
                'score_animator' => ['required', 'integer', 'between:1,5'],
                'score_logistics' => ['required', 'integer', 'between:1,5'],
                'feedback' => ['nullable', 'string'],
                'skills_acquired' => ['nullable', 'string'],
                'impact_expected' => ['nullable', 'string'],
            ],
            'reports' => [
                'title' => ['required', 'string'],
                'type' => ['required', 'string'],
                'filters' => ['nullable', 'array'],
            ],
        ];

        return $request->validate($rules[$resource]);
    }

    private function syncParticipants(Request $request, FormationSession $session): void
    {
        if (!$request->has('participant_ids')) {
            return;
        }

        $sync = collect($request->input('participant_ids', []))
            ->mapWithKeys(fn ($id) => [$id => ['status' => 'inscrit']])
            ->all();

        $session->participants()->sync($sync);
    }

    private function handleDocumentUpload(Request $request, array $data): array
    {
        $data['uploaded_by'] = $request->user()->id;

        if (isset($data['visible_roles']) && is_string($data['visible_roles'])) {
            $data['visible_roles'] = array_values(array_filter(array_map('trim', explode(',', $data['visible_roles']))));
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store('documents', 'public');
            $data['original_name'] = $file->getClientOriginalName();
        }

        unset($data['file']);

        return $data;
    }

    private function scopeForRole(Builder $query, Request $request, string $resource): void
    {
        $user = $request->user();

        if ($resource === 'documents' && $user->role !== 'admin') {
            $query->where('archived', false)
                ->where(function (Builder $q) use ($user): void {
                    $q->whereNull('visible_roles')
                        ->orWhereJsonContains('visible_roles', $user->role);
                });
        }

        if ($user->role === 'formateur_participant') {
            if ($resource === 'sessions') {
                $query->whereHas('participants', fn (Builder $q) => $q->where('users.id', $user->id));
            }
            if (in_array($resource, ['absences', 'evaluations', 'accommodations', 'travels'], true)) {
                $column = $resource === 'evaluations' ? 'participant_id' : 'user_id';
                $query->where($column, $user->id);
            }
        }

        if ($user->role === 'formateur_animateur' && in_array($resource, ['sessions', 'absences', 'evaluations'], true)) {
            if ($resource === 'sessions') {
                $query->where('animator_id', $user->id);
            } else {
                $query->whereHas('session', fn (Builder $q) => $q->where('animator_id', $user->id));
            }
        }
    }

    private function authorizeRecord(Request $request, string $resource, mixed $item): void
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return;
        }

        if ($resource === 'documents' && $item->archived && $user->role !== 'admin') {
            abort(403, 'Document archive reserve a l administration.');
        }
    }
}
