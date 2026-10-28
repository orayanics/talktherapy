<?php

use App\Http\Controllers\Api\V1\AdminUserProvisionController;
use App\Http\Controllers\Api\V1\AdminUserStatusController;
use App\Http\Controllers\Api\V1\DiagnosisController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Auth\ActivationController;
use App\Http\Controllers\Auth\EmailChangeController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Auth\SessionController;
use Illuminate\Support\Facades\Route;

Route::get('/diagnoses', DiagnosisController::class)->name('diagnoses.index');
Route::post('/registrations/patient', [RegistrationController::class, 'storePatient'])
    ->middleware('throttle:registration')->name('registrations.patient');
Route::post('/activation/otp/verify', [ActivationController::class, 'verify'])->middleware('throttle:activation');
Route::post('/activation/otp/resend', [ActivationController::class, 'resend'])->middleware('throttle:activation-resend');
Route::post('/activation', [ActivationController::class, 'activate'])->middleware('throttle:activation');
Route::post('/forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:3,1');
Route::post('/reset-password', [PasswordController::class, 'reset'])->middleware('throttle:5,1');

Route::middleware(['auth:sanctum', 'account.active', 'verified'])->group(function (): void {
    Route::get('/me', [SessionController::class, 'show'])->name('me.show');
    Route::patch('/me', [ProfileController::class, 'update']);
    Route::post('/me/password', [PasswordController::class, 'change']);
    Route::post('/me/email-change', [EmailChangeController::class, 'request'])->middleware('throttle:3,1');
    Route::post('/email-change/confirm', [EmailChangeController::class, 'confirm'])->middleware('throttle:10,1');
    Route::get('/users/counts', [UserController::class, 'counts']);
    Route::post('/users', AdminUserProvisionController::class);
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{user}/status', AdminUserStatusController::class);
    Route::get('/users/{user}', [UserController::class, 'show']);
});
