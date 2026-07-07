<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['referrer_id', 'referred_id', 'center_id', 'rewarded', 'rewarded_at'])]
class Referral extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'rewarded'    => 'boolean',
            'rewarded_at' => 'datetime',
        ];
    }

    public function referrer()
    {
        return $this->belongsTo(Account::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(Account::class, 'referred_id');
    }

    public function center()
    {
        return $this->belongsTo(Center::class);
    }
}
