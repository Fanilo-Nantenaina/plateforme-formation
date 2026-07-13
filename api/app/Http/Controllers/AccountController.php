<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttachRoleRequest;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Models\Role;
use Illuminate\Http\Request;

class AccountController extends Controller
{

    public function index(Request $request)
    {
        return response()->json([
            'data' => Account::where('id', '!=', $request->user()->id)
                ->get(['id', 'full_name']),
        ]);
    }
    public function store(StoreAccountRequest $request)
    {
        $account = Account::create($request->validated());

        return new AccountResource($account);
    }

    public function attachRole(AttachRoleRequest $request, Account $account)
    {
        if (! $request->user()->hasRole('admin', $request->center_id)) {
            return response()->json(['message' => "Seul un administrateur du centre peut attribuer des rôles."], 403);
        }

        $role = Role::where('name', $request->role)->firstOrFail();

        $account->roles()->syncWithoutDetaching([
            $role->id => ['center_id' => $request->center_id],
        ]);

        return new AccountResource($account->load('roles'));
    }
}
