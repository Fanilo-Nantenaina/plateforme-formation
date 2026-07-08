<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['enrollment_id', 'public_code', 'status', 'issued_at', 'revoked_at', 'revocation_reason'])]
class Certificate extends Model
{
    use HasUuids;
    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    protected function casts(): array
    {
        return [
            'issued_at'  => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }
}
