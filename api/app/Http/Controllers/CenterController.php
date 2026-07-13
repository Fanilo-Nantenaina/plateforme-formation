<?php

namespace App\Http\Controllers;

use App\Models\Center;
use Illuminate\Http\Request;

class CenterController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Center::get(['id', 'name', 'city']),
        ]);
    }
}
