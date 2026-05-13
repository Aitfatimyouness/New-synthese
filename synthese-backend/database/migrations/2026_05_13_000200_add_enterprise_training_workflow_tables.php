<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->text('decision_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['formation_id', 'participant_id']);
        });

        Schema::create('training_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('required_formation_id')->constrained('formations')->cascadeOnDelete();
            $table->string('rule')->default('completed');
            $table->timestamps();
            $table->unique(['formation_id', 'required_formation_id']);
        });

        Schema::create('participant_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('formation_session_id')->nullable()->constrained('formation_sessions')->nullOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedTinyInteger('trainer_score');
            $table->unsignedTinyInteger('training_score');
            $table->unsignedTinyInteger('logistics_score')->default(3);
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        Schema::create('pedagogical_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('formation_session_id')->nullable()->constrained('formation_sessions')->nullOnDelete();
            $table->foreignId('trainer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->string('competency');
            $table->unsignedTinyInteger('score');
            $table->unsignedTinyInteger('progression_delta')->default(0);
            $table->text('feedback')->nullable();
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('users')->cascadeOnDelete();
            $table->string('type')->default('certificate');
            $table->string('reference')->unique();
            $table->date('issued_at')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
            $table->unique(['formation_id', 'participant_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('pedagogical_evaluations');
        Schema::dropIfExists('participant_evaluations');
        Schema::dropIfExists('training_prerequisites');
        Schema::dropIfExists('enrollments');
    }
};
