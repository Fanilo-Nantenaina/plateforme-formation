<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'city'])]
class Center extends Model
{
    public function trainings()
    {
        return $this->hasMany(Training::class);
    }
}
