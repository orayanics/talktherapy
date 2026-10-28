<?php

namespace Tests\Feature;

use App\Models\ActivationChallenge;
use App\Models\Diagnosis;
use App\Models\User;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class IdentityActivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_valid_code_verifies_then_activates_an_unverified_patient_once(): void
    {
        [$user, $code] = $this->registerPatient();

        $this->postJson('/api/v1/activation/otp/verify', ['email' => $user->email, 'otp_code' => $code])
            ->assertOk()->assertExactJson(['data' => ['role' => 'patient']]);
        $this->assertNull($user->fresh()->email_verified_at);

        $this->postJson('/api/v1/activation', ['email' => $user->email, 'otp_code' => $code])
            ->assertOk()->assertJsonPath('data.status', 'active');
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertSame('active', $user->fresh()->profile->status->value);

        $this->postJson('/api/v1/activation', ['email' => $user->email, 'otp_code' => $code])
            ->assertUnprocessable();
    }

    public function test_wrong_expired_and_exhausted_codes_are_rejected(): void
    {
        [$user] = $this->registerPatient();

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/v1/activation/otp/verify', ['email' => $user->email, 'otp_code' => '000000'])
                ->assertUnprocessable();
        }
        $this->assertSame(5, ActivationChallenge::query()->whereBelongsTo($user)->latest()->firstOrFail()->attempts);

        [$expiredUser, $expiredCode] = $this->registerPatient('expired@example.com');
        ActivationChallenge::query()->whereBelongsTo($expiredUser)->update(['expires_at' => now()->subSecond()]);
        $this->postJson('/api/v1/activation/otp/verify', ['email' => $expiredUser->email, 'otp_code' => $expiredCode])
            ->assertUnprocessable();
    }

    public function test_resend_is_generic_for_unknown_and_active_accounts(): void
    {
        $this->postJson('/api/v1/activation/otp/resend', ['email' => 'unknown@example.com'])->assertAccepted();
        $user = User::factory()->create(['email' => 'active@example.com']);

        $this->postJson('/api/v1/activation/otp/resend', ['email' => $user->email])->assertAccepted();
        $this->assertDatabaseCount('activation_challenges', 0);
    }

    /** @return array{User, string} */
    private function registerPatient(string $email = 'patient@example.com'): array
    {
        Notification::fake();
        $diagnosis = Diagnosis::factory()->create();
        $this->postJson('/api/v1/registrations/patient', [
            'name' => 'Patient', 'email' => $email, 'password' => 'Correct-Horse-9!',
            'password_confirmation' => 'Correct-Horse-9!', 'diagnosis_id' => $diagnosis->id, 'consent' => true,
        ])->assertCreated();
        $user = User::query()->where('email', $email)->sole();
        $code = '';
        Notification::assertSentTo($user, ActivationCodeNotification::class, function (ActivationCodeNotification $notification) use (&$code): bool {
            $code = $notification->code;

            return true;
        });

        return [$user, $code];
    }
}
