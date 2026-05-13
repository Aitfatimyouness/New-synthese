<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $reviewerId = DB::table('role_user')
            ->join('roles', 'roles.id', '=', 'role_user.role_id')
            ->where('roles.name', 'responsable_formation')
            ->value('role_user.user_id');

        $memberships = DB::table('formation_user')
            ->where('role', 'participant')
            ->get(['formation_id', 'user_id', 'status']);

        foreach ($memberships as $membership) {
            DB::table('enrollments')->updateOrInsert(
                ['formation_id' => $membership->formation_id, 'participant_id' => $membership->user_id],
                [
                    'reviewed_by' => $reviewerId,
                    'status' => in_array($membership->status, ['rejected', 'rejete'], true) ? 'rejected' : 'accepted',
                    'decision_note' => 'Backfilled from existing training membership.',
                    'reviewed_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('enrollments')->where('decision_note', 'Backfilled from existing training membership.')->delete();
    }
};
