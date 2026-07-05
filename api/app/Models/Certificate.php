<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['enrollment_id', 'public_code', 'status', 'issued_at'])]
class Certificate extends Model
{
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }
}
