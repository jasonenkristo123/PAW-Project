<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function __construct(private StatefulGuard $guard) {}

    public function toResponse($request): Response
    {
        // Fortify signs in new users automatically; require an explicit login.
        $this->guard->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Account created. Please sign in.'], 201);
        }

        return to_route('login')->with('status', 'Account created successfully. Please sign in.');
    }
}
