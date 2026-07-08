<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CertificateRevocationController;
use App\Http\Controllers\CertificateVerificationController;
use App\Http\Controllers\EnrollmentCompletionController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\TrainingController;

Route::post('/accounts', [AccountController::class, 'store']);
Route::post('/accounts/{account}/roles', [AccountController::class, 'attachRole']);
Route::get('/trainings', [TrainingController::class, 'index']);
Route::post('/enrollments', [EnrollmentController::class, 'store']);
Route::post('/enrollments/{enrollment}/complete', [EnrollmentCompletionController::class, 'store']);
Route::get('/verify/{code}', [CertificateVerificationController::class, 'show']);
Route::post('/referrals', [ReferralController::class, 'store']);
Route::post('/certificates/{certificate}/revoke', [CertificateRevocationController::class, 'store']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
