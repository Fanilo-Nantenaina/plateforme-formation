<?php

namespace App\Http\Controllers;

use App\Actions\CompleteEnrollment;
use App\Http\Resources\CertificateResource;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentCompletionController extends Controller
{
    public function store(Enrollment $enrollment, CompleteEnrollment $action)
    {
        $certificate = $action->execute($enrollment);

        return new CertificateResource($certificate->load('enrollment.account', 'enrollment.training'));
    }
}
