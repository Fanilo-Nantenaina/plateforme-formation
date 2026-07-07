<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReferralRequest;
use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function store(StoreReferralRequest $request)
    {
        $referral = Referral::firstOrCreate(
            [
                'referred_id' => $request->referred_id,
                'center_id'   => $request->center_id,
            ],
            [
                'referrer_id' => $request->referrer_id,
                'rewarded'    => false,
            ]
        );

        return response()->json([
            'id'          => $referral->id,
            'referrer_id' => $referral->referrer_id,
            'referred_id' => $referral->referred_id,
            'center_id'   => $referral->center_id,
            'rewarded'    => $referral->rewarded,
        ], 201);
    }
}
