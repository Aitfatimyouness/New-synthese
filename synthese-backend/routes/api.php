<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OperationalController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth.api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', DashboardController::class);
    Route::get('/analytics', [OperationalController::class, 'analytics'])->middleware('permission:rapports.read');
    Route::get('/global-search', [OperationalController::class, 'globalSearch']);
    Route::get('/calendar', [OperationalController::class, 'calendar'])->middleware('permission:planning.read');
    Route::get('/certificates/{id}/pdf', [OperationalController::class, 'certificatePdf'])->middleware('permission:certificates.read');
    Route::get('/rapports/pdf', [OperationalController::class, 'reportPdf'])->middleware('permission:rapports.read');
    Route::get('/rapports/{id}/pdf', [OperationalController::class, 'reportPdf'])->middleware('permission:rapports.read');

    $resources = [
        'users' => ['users.read', 'users.write'],
        'roles' => ['roles.read', 'roles.write'],
        'permissions' => ['roles.read', 'roles.write'],
        'centres' => ['centres.read', 'centres.write'],
        'sites-formation' => ['logistique.read', 'logistique.write'],
        'salles' => ['logistique.read', 'logistique.write'],
        'formations' => ['formations.read', 'formations.write'],
        'themes' => ['themes.read', 'themes.write'],
        'sessions' => ['planning.read', 'planning.write'],
        'absences' => ['absences.read', 'absences.write'],
        'documents' => ['documents.read', 'documents.write'],
        'hebergements' => ['logistique.read', 'logistique.write'],
        'deplacements' => ['logistique.read', 'logistique.write'],
        'evaluations' => ['evaluations.read', 'evaluations.write'],
        'rapports' => ['rapports.read', 'rapports.write'],
        'notifications' => ['notifications.read', 'notifications.write'],
        'enrollments' => ['enrollments.read', 'enrollments.write'],
        'prerequisites' => ['formations.read', 'formations.write'],
        'participant-evaluations' => ['evaluations.read', 'evaluations.write'],
        'pedagogical-evaluations' => ['pedagogy.evaluate', 'pedagogy.evaluate'],
        'certificates' => ['certificates.read', 'certificates.write'],
        'logs' => ['logs.read', 'logs.read'],
    ];

    foreach ($resources as $resource => [$readPermission, $writePermission]) {
        Route::get("/{$resource}", [OperationalController::class, 'index'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$readPermission}");
        Route::post("/{$resource}", [OperationalController::class, 'store'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$writePermission}");
        Route::get("/{$resource}/export/csv", [OperationalController::class, 'exportCsv'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$readPermission}");
        Route::post("/{$resource}/import/csv", [OperationalController::class, 'importCsv'])
            ->defaults('resource', $resource)
            ->middleware("permission:imports.write");
        Route::get("/{$resource}/{id}", [OperationalController::class, 'show'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$readPermission}");
        Route::put("/{$resource}/{id}", [OperationalController::class, 'update'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$writePermission}");
        Route::delete("/{$resource}/{id}", [OperationalController::class, 'destroy'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$writePermission}");
        Route::post("/{$resource}/{id}/archive", [OperationalController::class, 'archive'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$writePermission}");
        Route::post("/{$resource}/{id}/restore", [OperationalController::class, 'restore'])
            ->defaults('resource', $resource)
            ->middleware("permission:{$writePermission}");
    }

    Route::get('/documents/{id}/download', [OperationalController::class, 'downloadDocument'])->middleware('permission:documents.read');
    Route::get('/documents/{id}/preview', [OperationalController::class, 'previewDocument'])->middleware('permission:documents.read');
});
