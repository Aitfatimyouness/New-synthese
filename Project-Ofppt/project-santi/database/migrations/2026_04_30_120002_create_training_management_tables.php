<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('city');
            $table->string('address')->nullable();
            $table->integer('capacity')->default(0);
            $table->string('manager_name')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('themes', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('domain');
            $table->text('objectives')->nullable();
            $table->text('skills_targeted')->nullable();
            $table->integer('duration_hours')->default(7);
            $table->timestamps();
        });

        Schema::create('formations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('theme_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('planifiee');
            $table->string('target_profile')->nullable();
            $table->date('planned_start_date')->nullable();
            $table->date('planned_end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('formation_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('center_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('animator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code')->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('place')->nullable();
            $table->string('status')->default('planifiee');
            $table->integer('capacity')->default(20);
            $table->text('logistics_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('session_participants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('inscrit');
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->text('acquired_skills')->nullable();
            $table->text('impact_notes')->nullable();
            $table->timestamps();
            $table->unique(['formation_session_id', 'user_id']);
        });

        Schema::create('absences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('absence_date');
            $table->string('type')->default('non_justifiee');
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        Schema::create('accommodations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_session_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('hotel_name');
            $table->string('city');
            $table->date('check_in');
            $table->date('check_out');
            $table->decimal('cost', 10, 2)->default(0);
            $table->string('status')->default('reserve');
            $table->timestamps();
        });

        Schema::create('travels', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_session_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('origin');
            $table->string('destination');
            $table->string('transport_mode');
            $table->date('travel_date');
            $table->decimal('cost', 10, 2)->default(0);
            $table->string('status')->default('planifie');
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('formation_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('category')->default('support');
            $table->string('file_path')->nullable();
            $table->string('original_name')->nullable();
            $table->json('visible_roles')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });

        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('formation_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('score_content');
            $table->unsignedTinyInteger('score_animator');
            $table->unsignedTinyInteger('score_logistics');
            $table->text('feedback')->nullable();
            $table->text('skills_acquired')->nullable();
            $table->text('impact_expected')->nullable();
            $table->timestamps();
            $table->unique(['formation_session_id', 'participant_id']);
        });

        Schema::create('reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('type');
            $table->json('filters')->nullable();
            $table->json('content')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['reports', 'evaluations', 'documents', 'travels', 'accommodations', 'absences', 'session_participants', 'formation_sessions', 'formations', 'themes', 'centers'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
