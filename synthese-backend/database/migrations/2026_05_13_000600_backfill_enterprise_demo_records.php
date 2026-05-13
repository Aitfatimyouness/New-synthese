<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $centreId = DB::table('centres')->value('id');
        if ($centreId) {
            DB::table('users')->whereNull('centre_id')->update(['centre_id' => $centreId]);
        }

        $pairs = DB::table('formation_user')
            ->where('role', 'participant')
            ->limit(12)
            ->get(['formation_id', 'user_id']);

        foreach ($pairs as $pair) {
            DB::table('certificates')->updateOrInsert(
                ['formation_id' => $pair->formation_id, 'participant_id' => $pair->user_id, 'type' => 'convocation'],
                [
                    'reference' => 'CNV-'.$pair->formation_id.'-'.$pair->user_id,
                    'issued_at' => now()->toDateString(),
                    'status' => 'issued',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('certificates')->where('reference', 'like', 'CNV-%')->delete();
    }
};
