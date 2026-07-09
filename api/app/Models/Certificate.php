<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $enrollment_id
 * @property string $public_code
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $revoked_at
 * @property string|null $revocation_reason
 * @property \Illuminate\Support\Carbon $issued_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Enrollment $enrollment
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereEnrollmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereIssuedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate wherePublicCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereRevocationReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereRevokedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Certificate whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
