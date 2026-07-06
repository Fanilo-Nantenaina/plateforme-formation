<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Account;
use App\Models\Enrollment;
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

        return new EnrollmentResource($enrollment);
    }
}
