<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $account = Account::where('phone', $request->phone)->first();

        if (! $account || ! Hash::check($request->password, $account->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        Auth::login($account);
        $request->session()->regenerate();

        return response()->json(['account' => new AccountResource($account)]);
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

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnecté.']);
    }
}
