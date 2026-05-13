<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $permissions = [
        'enrollments.read' => 'Consulter inscriptions',
        'enrollments.write' => 'Gerer inscriptions',
        'pedagogy.evaluate' => 'Evaluer pedagogiquement',
        'certificates.read' => 'Consulter certificats',
        'certificates.write' => 'Emettre certificats',
        'logs.read' => 'Consulter logs',
        'security.manage' => 'Gerer securite',
        'settings.write' => 'Parametrer plateforme',
        'imports.write' => 'Importer donnees Excel',
    ];

    private array $rolePermissions = [
        'administrateur' => [
            'users.read', 'users.write', 'roles.read', 'roles.write',
            'logs.read', 'security.manage', 'settings.write', 'imports.write',
        ],
        'responsable_cdc' => [
            'formations.read', 'formations.write', 'themes.read', 'themes.write',
            'evaluations.read', 'pedagogy.evaluate',
            'rapports.read', 'rapports.write', 'notifications.read', 'imports.write',
        ],
        'responsable_formation' => [
            'formations.read', 'formations.write', 'themes.read', 'planning.read', 'planning.write',
            'enrollments.read', 'enrollments.write', 'absences.read', 'absences.write',
            'documents.read', 'evaluations.read', 'logistique.read', 'logistique.write',
            'rapports.read', 'rapports.write', 'certificates.read', 'certificates.write',
            'notifications.read', 'imports.write',
        ],
        'formateur_participant' => [
            'formations.read', 'themes.read', 'planning.read', 'documents.read', 'absences.read',
            'enrollments.read', 'enrollments.write', 'certificates.read',
            'evaluations.read', 'evaluations.write', 'notifications.read',
        ],
        'formateur_animateur' => [
            'formations.read', 'themes.read', 'planning.read',
            'absences.read', 'absences.write', 'documents.read', 'documents.write',
            'evaluations.read', 'pedagogy.evaluate', 'notifications.read',
        ],
    ];

    public function up(): void
    {
        foreach ($this->permissions as $name => $label) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name],
                ['label' => $label, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        foreach ($this->rolePermissions as $roleName => $permissionNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');

            if (! $roleId) {
                continue;
            }

            DB::table('permission_role')->where('role_id', $roleId)->delete();

            $permissionIds = DB::table('permissions')->whereIn('name', $permissionNames)->pluck('id');
            foreach ($permissionIds as $permissionId) {
                DB::table('permission_role')->insert([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')->whereIn('name', array_keys($this->permissions))->pluck('id');
        DB::table('permission_role')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
    }
};
