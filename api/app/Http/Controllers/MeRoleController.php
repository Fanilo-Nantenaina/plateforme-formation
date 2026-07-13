<?php

namespace App\Http\Controllers;

use App\Http\Requests\JoinCenterRequest;
use App\Models\Role;
use Illuminate\Http\Request;

class MeRoleController extends Controller
{
    public function store(JoinCenterRequest $request)
    {
        $apprenant = Role::where('name', 'apprenant')->firstOrFail();

        $request->user()->roles()->syncWithoutDetaching([
            $apprenant->id => ['center_id' => $request->center_id],
        ]);

        return response()->json([
            'message' => 'Vous êtes maintenant apprenant de ce centre.',
        ], 201);
    }
}
