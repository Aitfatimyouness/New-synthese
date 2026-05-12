<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role')->default('formateur_participant')->after('password');
            $table->string('phone')->nullable()->after('role');
            $table->string('direction')->nullable()->after('phone');
            $table->string('cdc')->nullable()->after('direction');
            $table->boolean('active')->default(true)->after('cdc');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['role', 'phone', 'direction', 'cdc', 'active']);
        });
    }
};
