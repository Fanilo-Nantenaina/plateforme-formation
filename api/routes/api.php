<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CertificateRevocationController;
use App\Http\Controllers\CertificateVerificationController;
use App\Http\Controllers\EnrollmentCompletionController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\TrainingEnrollmentsController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/accounts', [AccountController::class, 'store']);
Route::get('/verify/{code}', [CertificateVerificationController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/trainings', [TrainingController::class, 'index']);
    Route::get('/trainings/{training}/enrollments', [TrainingEnrollmentsController::class, 'index']);

    Route::post('/accounts/{account}/roles', [AccountController::class, 'attachRole']);
    Route::post('/enrollments', [EnrollmentController::class, 'store']);
    Route::post('/enrollments/{enrollment}/complete', [EnrollmentCompletionController::class, 'store']);
    Route::post('/referrals', [ReferralController::class, 'store']);
    Route::post('/certificates/{certificate}/revoke', [CertificateRevocationController::class, 'store']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
