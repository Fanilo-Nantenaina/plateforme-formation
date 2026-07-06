<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['full_name', 'phone', 'password'])]
#[Hidden(['password'])]
class Account extends Authenticatable
{
    use HasUuids, HasApiTokens;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'account_role')
            ->withPivot('center_id')
            ->withTimestamps();
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function hasRole(string $roleName, ?string $centerId = null): bool
    {
        return $this->roles()
            ->where('roles.name', $roleName)
            ->when($centerId, fn($q) => $q->where('account_role.center_id', $centerId))
            ->exists();
    }
}
