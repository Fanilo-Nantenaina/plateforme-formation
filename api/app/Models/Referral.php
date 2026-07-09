<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $referrer_id
 * @property string $referred_id
 * @property string $center_id
 * @property bool $rewarded
 * @property \Illuminate\Support\Carbon|null $rewarded_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Center $center
 * @property-read \App\Models\Account $referred
 * @property-read \App\Models\Account $referrer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereCenterId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereReferredId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereReferrerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereRewarded($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereRewardedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Referral whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
