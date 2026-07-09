<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $account = Account::where('phone', $request->phone)->first();

        if (! $account || ! Hash::check($request->password, $account->password)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        $token = $account->createToken('web')->plainTextToken;

        return response()->json([
            'token'   => $token,
            'account' => new AccountResource($account),
        ]);
    }

    public function me(Request $request)
    {
        $account = $request->user()->load('roles');

        return response()->json([
            'account' => new AccountResource($account),
            'roles'   => $account->roles->map(fn($role) => [
                'name'      => $role->name,
                'center_id' => $role->pivot->center_id,
            ]),
        ]);
    }
}
