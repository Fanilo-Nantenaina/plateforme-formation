<?php

namespace App\Http\Controllers;

use App\Http\Resources\TrainingResource;
use App\Models\Training;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    public function index()
    {
        return TrainingResource::collection(Training::all());
    }
}
