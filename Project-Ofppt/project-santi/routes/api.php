<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrudController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentDownloadController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'dashboard']);
    Route::get('/analytics', [DashboardController::class, 'analytics']);
    Route::get('/reports/export.csv', [DashboardController::class, 'exportCsv']);
    Route::get('/options', [CrudController::class, 'options']);
    Route::get('/documents/{document}/download', DocumentDownloadController::class);

    $resources = 'users|centers|themes|formations|sessions|absences|accommodations|travels|documents|evaluations|reports';
    Route::get('/{resource}', [CrudController::class, 'index'])->where('resource', $resources);
    Route::post('/{resource}', [CrudController::class, 'store'])->where('resource', $resources);
    Route::get('/{resource}/{id}', [CrudController::class, 'show'])->where('resource', $resources)->whereNumber('id');
    Route::post('/{resource}/{id}', [CrudController::class, 'update'])->where('resource', $resources)->whereNumber('id');
    Route::match(['put', 'patch'], '/{resource}/{id}', [CrudController::class, 'update'])->where('resource', $resources)->whereNumber('id');
    Route::delete('/{resource}/{id}', [CrudController::class, 'destroy'])->where('resource', $resources)->whereNumber('id');
});
