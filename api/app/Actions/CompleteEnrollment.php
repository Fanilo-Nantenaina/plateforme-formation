<?php

namespace App\Actions;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompleteEnrollment
{
    public function execute(Enrollment $enrollment): Certificate
    {
        return DB::transaction(function () use ($enrollment) {
            if ($enrollment->status === 'completed' && $enrollment->certificate) {
                return $enrollment->certificate;
            }

            $enrollment->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            return Certificate::create([
                'enrollment_id' => $enrollment->id,
                'public_code'   => (string) Str::uuid(),
                'status'        => 'valid',
                'issued_at'     => now(),
            ]);
        });
    }
}
