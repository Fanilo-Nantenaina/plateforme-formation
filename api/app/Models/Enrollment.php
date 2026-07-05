<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['account_id', 'training_id', 'status', 'completed_at'])]
class Enrollment extends Model
{
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }
}
