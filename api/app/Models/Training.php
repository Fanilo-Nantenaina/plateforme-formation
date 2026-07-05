<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'description', 'center_id'])]
class Training extends Model
{
    public function center()
    {
        return $this->belongsTo(Center::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
