<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Account;
use App\Models\Enrollment;
use App\Models\Referral;
use App\Models\Training;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(StoreEnrollmentRequest $request)
    {
        $training = Training::findOrFail($request->training_id);
        $account  = Account::findOrFail($request->account_id);

        if (! $account->hasRole('apprenant', $training->center_id)) {
            return response()->json([
                'message' => "Ce compte n'a pas le rôle apprenant dans le centre de cette formation.",
            ], 403);
        }

        $enrollment = Enrollment::create([
            'account_id'  => $account->id,
            'training_id' => $training->id,
            'status'      => 'active',
        ]);

        $referral = Referral::where('referred_id', $account->id)
            ->where('center_id', $training->center_id)
            ->where('rewarded', false)
            ->first();

        if ($referral) {
            $referral->update([
                'rewarded'    => true,
                'rewarded_at' => now(),
            ]);
            // Ici : logique de récompense réelle (crédit, points…). Hors périmètre du test.
        }

        return new EnrollmentResource($enrollment);
    }
}
