<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('matricule')->nullable()->unique()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->string('profile_title')->nullable()->after('phone');
            $table->string('status')->default('actif')->after('profile_title');
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });

        Schema::create('api_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name')->default('web');
            $table->string('token', 64)->unique();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('centres', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('region');
            $table->string('city');
            $table->string('address')->nullable();
            $table->timestamps();
        });

        Schema::create('sites_formation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->string('name');
            $table->string('city');
            $table->string('address');
            $table->unsignedInteger('capacity')->default(25);
            $table->string('manager_name')->nullable();
            $table->timestamps();
        });

        Schema::create('salles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_formation_id')->constrained('sites_formation')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('capacity')->default(20);
            $table->string('equipment')->nullable();
            $table->string('status')->default('disponible');
            $table->timestamps();
        });

        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_id')->nullable()->constrained('centres')->nullOnDelete();
            $table->foreignId('responsable_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('proposee');
            $table->string('type')->default('presentiel');
            $table->string('category');
            $table->string('level')->default('intermediaire');
            $table->unsignedInteger('capacity')->default(20);
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('formation_user', function (Blueprint $table) {
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role')->default('participant');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('status')->default('inscrit');
            $table->primary(['formation_id', 'user_id', 'role']);
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('animateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('sort_order')->default(1);
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamps();
        });

        Schema::create('formation_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('theme_id')->nullable()->constrained('themes')->nullOnDelete();
            $table->foreignId('site_formation_id')->nullable()->constrained('sites_formation')->nullOnDelete();
            $table->foreignId('salle_id')->nullable()->constrained('salles')->nullOnDelete();
            $table->foreignId('animateur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('room')->nullable();
            $table->string('status')->default('planifiee');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_session_id')->constrained('formation_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('absence_date');
            $table->string('status')->default('non_justifiee');
            $table->text('justification')->nullable();
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->nullable()->constrained('formations')->cascadeOnDelete();
            $table->foreignId('theme_id')->nullable()->constrained('themes')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('type')->default('support');
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });

        Schema::create('hebergements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('hotel_name');
            $table->string('city');
            $table->date('check_in');
            $table->date('check_out');
            $table->string('status')->default('reserve');
            $table->timestamps();
        });

        Schema::create('deplacements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('from_city');
            $table->string('to_city');
            $table->date('travel_date');
            $table->string('transport_mode')->default('train');
            $table->string('status')->default('planifie');
            $table->timestamps();
        });

        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('content_score');
            $table->unsignedTinyInteger('animation_score');
            $table->unsignedTinyInteger('logistics_score');
            $table->unsignedTinyInteger('impact_score');
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['formation_id', 'user_id']);
        });

        Schema::create('rapports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('type');
            $table->json('filters')->nullable();
            $table->json('metrics')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('systeme');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('module');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'activity_logs', 'notifications', 'rapports', 'evaluations', 'deplacements',
            'hebergements', 'documents', 'absences', 'formation_sessions', 'themes',
            'formation_user', 'formations', 'salles', 'sites_formation', 'centres', 'api_tokens',
            'role_user', 'permission_role', 'permissions', 'roles',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['matricule', 'phone', 'profile_title', 'status']);
        });
    }
};
