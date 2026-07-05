<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['enrollment_id', 'public_code', 'status', 'issued_at'])]
class Certificate extends Model
{
    use HasUuids;
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }
}
