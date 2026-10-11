<?php

namespace App\Http\Responses;

use App\Models\User;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        if ($request->user()?->role === User::ROLE_ADMIN) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return redirect()->intended(config('fortify.home', '/events'));
    }
}

