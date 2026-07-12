<?php

namespace App\Http\Controllers;

use App\Models\Training;
use Illuminate\Http\Request;

class TrainingEnrollmentsController extends Controller
{
    public function index(Training $training)
    {
        $enrollments = $training->enrollments()
            ->with(['account', 'certificate'])
            ->get()
            ->map(fn($e) => [
                'enrollment_id' => $e->id,
                'account_id'    => $e->account->id,
                'apprenant'     => $e->account->full_name,
                'status'        => $e->status,
                'public_code'   => $e->certificate?->public_code,
            ]);

        return response()->json(['data' => $enrollments]);
    }
}
