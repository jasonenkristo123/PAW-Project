<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class EmailVerificationDisabledTest extends TestCase
{
    public function test_unverified_accounts_can_access_the_dashboard_and_profile(): void
    {
        $user = new User(['name' => 'Test User', 'email' => 'test@example.com']);
        $user->id = 1;

        $this->actingAs($user);

        $this->get(route('dashboard'))->assertOk();
        $this->get(route('profile.edit'))->assertOk();
    }

    public function test_registration_does_not_send_a_verification_notification(): void
    {
        Notification::fake();

        event(new Registered(new User(['email' => 'test@example.com'])));

        Notification::assertNothingSent();
    }

    public function test_verification_routes_are_disabled(): void
    {
        $this->assertFalse(Route::has('verification.notice'));
        $this->assertFalse(Route::has('verification.send'));
        $this->assertFalse(Route::has('verification.verify'));
    }

    public function test_guests_still_need_to_log_in(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }
}
