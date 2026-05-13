<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
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
            'evaluations.read', 'logistique.read', 'logistique.write',
            'rapports.read', 'rapports.write', 'certificates.read', 'certificates.write',
            'notifications.read', 'imports.write',
        ],
        'responsable_dr' => [
            'formations.read', 'themes.read', 'planning.read',
            'absences.read', 'evaluations.read', 'logistique.read',
            'rapports.read', 'notifications.read',
        ],
        'formateur_participant' => [
            'formations.read', 'themes.read', 'planning.read', 'absences.read',
            'documents.read', 'enrollments.read', 'enrollments.write',
            'certificates.read', 'evaluations.read', 'evaluations.write',
            'notifications.read',
        ],
        'formateur_animateur' => [
            'formations.read', 'themes.read', 'planning.read',
            'absences.read', 'absences.write', 'documents.read', 'documents.write',
            'pedagogy.evaluate', 'notifications.read',
        ],
    ];

    public function up(): void
    {
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
        // Previous broad role grants are intentionally not restored automatically.
    }
};
