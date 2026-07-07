<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateVerificationController extends Controller
{
    public function show(string $code)
    {
        $certificate = Certificate::where('public_code', $code)
            ->with('enrollment.account', 'enrollment.training')
            ->first();

        if (! $certificate) {
            return response()->json(['message' => 'Certificat introuvable.'], 404);
        }

        return response()->json([
            'public_code' => $certificate->public_code,
            'valid'       => $certificate->status === 'valid',
            'status'      => $certificate->status,
            'apprenant'   => $certificate->enrollment->account->full_name,
            'formation'   => $certificate->enrollment->training->title,
            'issued_at'   => $certificate->issued_at,
            'revoked_at'  => $certificate->revoked_at,
        ]);
    }

    public function showPage(string $code)
    {
        $certificate = Certificate::where('public_code', $code)
            ->with('enrollment.account', 'enrollment.training')
            ->first();

        return view('verify', [
            'certificate' => $certificate,
        ]);
    }
}
