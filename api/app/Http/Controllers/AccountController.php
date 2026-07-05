<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttachRoleRequest;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function store(StoreAccountRequest $request)
    {
        $account = Account::create($request->validated());

        return new AccountResource($account);
    }

    public function attachRole(AttachRoleRequest $request, Account $account)
    {
        $account->roles()->syncWithoutDetaching([
            $request->role_id => ['center_id' => $request->center_id],
        ]);

        return new AccountResource($account->load('roles'));
    }
}
