<?php

use App\Http\Controllers\CertificateVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/verify/{code}', [CertificateVerificationController::class, 'showPage']);

Route::get('/', function () {
    return view('welcome');
});
