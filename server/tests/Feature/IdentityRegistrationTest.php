<?php

namespace Tests\Feature;

use App\Models\ActivationChallenge;
use App\Models\ConsentEvidence;
use App\Models\Diagnosis;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class IdentityRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_registration_commits_unverified_account_consent_and_mail_intent(): void
    {
        Notification::fake();
        $diagnosis = Diagnosis::factory()->create();

        $this->postJson('/api/v1/registrations/patient', [
            'name' => '  Patient Name  ',
            'email' => ' Patient@Example.com ',
            'password' => 'Correct-Horse-9!',
            'password_confirmation' => 'Correct-Horse-9!',
            'diagnosis_id' => $diagnosis->id,
            'consent' => true,
        ])->assertCreated()->assertExactJson([
            'data' => [
                'email' => 'patient@example.com',
                'status' => 'pending',
            ],
        ]);

        $user = User::query()->where('email', 'patient@example.com')->sole();
        $this->assertSame('Patient Name', $user->name);
        $this->assertSame('patient', $user->profile->role->value);
        $this->assertSame('pending', $user->profile->status->value);
        $this->assertNull($user->email_verified_at);
        $this->assertSame($diagnosis->id, $user->profile->diagnosis_id);
        $this->assertTrue(ConsentEvidence::query()->whereBelongsTo($user)->exists());
        $this->assertTrue(ActivationChallenge::query()->whereBelongsTo($user)->where('purpose', 'activation')->exists());
        $this->assertTrue(OutboxMessage::query()->where('recipient_id', $user->id)->where('kind', 'identity.activation')->exists());
        Notification::assertSentTo($user, ActivationCodeNotification::class);
    }

    public function test_registration_rejects_invalid_taxonomy_and_role_or_status_injection(): void
    {
        $payload = [
            'name' => 'Patient Name',
            'email' => 'patient@example.com',
            'password' => 'Correct-Horse-9!',
            'password_confirmation' => 'Correct-Horse-9!',
            'diagnosis_id' => 'missing',
            'consent' => true,
            'role' => 'superadmin',
            'status' => 'active',
        ];

        $this->postJson('/api/v1/registrations/patient', $payload)->assertUnprocessable()
            ->assertJsonValidationErrors(['diagnosis_id', 'role', 'status']);
        $this->assertDatabaseCount('users', 0);
    }
}
