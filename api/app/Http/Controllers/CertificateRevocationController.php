<?php

namespace App\Http\Controllers;

use App\Http\Requests\RevokeCertificateRequest;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateRevocationController extends Controller
{
    public function store(RevokeCertificateRequest $request, Certificate $certificate)
    {
        $centerId = $certificate->enrollment->training->center_id;
        if (! $request->user()->hasRole('admin', $centerId)) {
            return response()->json(['message' => "Seul un administrateur du centre peut révoquer."], 403);
        }

        if ($certificate->status === 'revoked') {
            return response()->json([
                'message'     => 'Ce certificat est déjà révoqué.',
                'revoked_at'  => $certificate->revoked_at,
            ], 409);
        }

        $certificate->update([
            'status'            => 'revoked',
            'revoked_at'        => now(),
            'revocation_reason' => $request->reason,
        ]);

        return response()->json([
            'public_code'       => $certificate->public_code,
            'status'            => $certificate->status,
            'revoked_at'        => $certificate->revoked_at,
            'revocation_reason' => $certificate->revocation_reason,
        ]);
    }
}
