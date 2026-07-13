<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateAdminController extends Controller
{
    public function index(Request $request)
    {
        $adminCenterIds = $request->user()->roles()
            ->where('roles.name', 'admin')
            ->pluck('account_role.center_id');

        $certs = Certificate::whereHas(
            'enrollment.training',
            fn($q) => $q->whereIn('center_id', $adminCenterIds)
        )
            ->with(['enrollment.account', 'enrollment.training'])
            ->get()
            ->map(fn($c) => [
                'id'          => $c->id,
                'public_code' => $c->public_code,
                'status'      => $c->status,
                'apprenant'   => $c->enrollment->account->full_name,
                'formation'   => $c->enrollment->training->title,
                'issued_at'   => $c->issued_at,
                'revoked_at'  => $c->revoked_at,
            ]);

        return response()->json(['data' => $certs]);
    }
}
