<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Mockery;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    public function test_registration_requires_login_before_accessing_protected_pages(): void
    {
        $user = new User(['name' => 'Test User', 'email' => 'test@example.com', 'password' => 'password']);
        $user->id = 1;

        $this->mock(CreatesNewUsers::class, function ($mock) use ($user): void {
            $mock->shouldReceive('create')->once()->andReturn($user);
        });

        $this->post(route('register.store'), [
            'name' => $user->name,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('login'))
            ->assertSessionHas('status', 'Account created successfully. Please sign in.');

        $this->assertGuest();
        $this->get(route('login'))->assertOk();
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_login_redirects_to_the_main_page(): void
    {
        $user = new User(['name' => 'Test User', 'email' => 'test@example.com', 'password' => 'password']);
        $user->id = 1;

        // Exercise the real login route without requiring a database driver.
        $provider = Mockery::mock(UserProvider::class);
        $provider->shouldReceive('retrieveByCredentials')->andReturn($user);
        $provider->shouldReceive('validateCredentials')->andReturnTrue();
        $provider->shouldReceive('rehashPasswordIfRequired');
        Auth::guard('web')->setProvider($provider);

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('events.index', absolute: false));

        $this->assertAuthenticated();
    }

    public function test_existing_sessions_redirect_from_auth_pages_to_the_main_page(): void
    {
        $user = new User(['name' => 'Test User', 'email' => 'test@example.com']);
        $user->id = 1;

        $this->actingAs($user);

        $this->get(route('login'))->assertRedirect(route('events.index'));
        $this->get(route('register'))->assertRedirect(route('events.index'));
        $this->get(route('home'))->assertOk();
    }
}
