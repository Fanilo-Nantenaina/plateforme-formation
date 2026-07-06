<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\TrainingController;

Route::post('/accounts', [AccountController::class, 'store']);
Route::post('/accounts/{account}/roles', [AccountController::class, 'attachRole']);
Route::get('/trainings', [TrainingController::class, 'index']);
Route::post('/enrollments', [EnrollmentController::class, 'store']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
