<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MeEnrollmentsController extends Controller
{
    public function index(Request $request)
    {
        $enrollments = $request->user()->enrollments()
            ->with(['training', 'certificate'])
            ->get()
            ->map(fn($e) => [
                'enrollment_id' => $e->id,
                'training_id'   => $e->training_id,
                'training'      => $e->training->title,
                'status'        => $e->status,
                'completed_at'  => $e->completed_at,
                'public_code'   => $e->certificate?->public_code,
            ]);

        return response()->json(['data' => $enrollments]);
    }
}
