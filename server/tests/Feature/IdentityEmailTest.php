<?php

namespace Tests\Feature;

use App\Models\ActivationChallenge;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class IdentityEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_email_is_not_applied_until_its_code_is_confirmed(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'old@example.com', 'password' => 'Current-Horse-9!']);
        UserProfile::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/v1/me/email-change', [
            'new_email' => ' NEW@example.com ', 'current_password' => 'Current-Horse-9!',
        ])->assertAccepted();
        $this->assertSame('old@example.com', $user->fresh()->email);
        $challenge = ActivationChallenge::query()->whereBelongsTo($user)->where('purpose', 'email_change')->sole();
        $code = '';
        Notification::assertSentOnDemand(ActivationCodeNotification::class, function ($notification, array $channels, object $notifiable) use (&$code): bool {
            $code = $notification->code;

            return $notifiable->routes['mail'] === 'new@example.com';
        });

        $this->actingAs($user)->postJson('/api/v1/email-change/confirm', ['otp_code' => $code])->assertOk();
        $this->assertSame('new@example.com', $user->fresh()->email);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNotNull($challenge->fresh()->consumed_at);
    }
}
