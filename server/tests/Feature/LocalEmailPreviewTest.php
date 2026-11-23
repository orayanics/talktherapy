<?php

namespace Tests\Feature;

use App\Notifications\ActivationCodeNotification;
use App\Notifications\SystemNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LocalEmailPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_and_direct_samples_require_local_environment_and_enabled_flag(): void
    {
        foreach (['production', 'local'] as $environment) {
            $this->app->instance('env', $environment);
            foreach ([false, true] as $enabled) {
                config(['mail.previews' => $enabled]);
                $status = $environment === 'local' && $enabled ? 200 : 404;
                $this->get('/email-previews')->assertStatus($status);
                $this->get('/email-previews/activation')->assertStatus($status);
            }
        }
    }

    public function test_catalog_lists_and_renders_each_workflow_without_delivery_or_credentials(): void
    {
        $this->app->instance('env', 'local');
        config(['mail.previews' => true]);
        Mail::fake();
        Notification::fake();
        $catalog = $this->get('/email-previews')->assertOk();
        $catalog->assertSeeTextInOrder(['Appointments', 'Clinical records', 'Account', 'Custom notifications']);
        $samples = [
            'appointment_booked' => 'New TalkTherapy appointment request',
            'appointment_accepted' => 'TalkTherapy appointment accepted',
            'appointment_rejected' => 'TalkTherapy appointment declined',
            'appointment_cancelled' => 'TalkTherapy appointment cancelled',
            'appointment_completed' => 'TalkTherapy appointment completed',
            'soap_created' => 'New TalkTherapy clinical record',
            'soap_updated' => 'TalkTherapy clinical record updated',
            'activation' => 'TalkTherapy email verification code',
            'email_change' => 'TalkTherapy email verification code',
            'user_invited' => 'Your TalkTherapy account invitation',
            'user_suspended' => 'Your TalkTherapy account was suspended',
            'user_reactivated' => 'Your TalkTherapy account was reactivated',
            'password_reset' => 'Reset your password',
            'password_changed' => 'Your TalkTherapy password was changed',
            'custom' => 'Fictional workshop invitation',
        ];
        foreach ($samples as $sample => $subject) {
            $catalog->assertSee('/email-previews/'.$sample);
            $this->get('/email-previews/'.$sample)->assertOk()->assertSeeText($subject);
        }
        $this->get('/email-previews/unknown')->assertNotFound();
        Mail::assertNothingOutgoing();
        Notification::assertNothingSent();
        $this->assertDatabaseCount('outbox_messages', 0);
        $this->assertDatabaseCount('password_reset_tokens', 0);
        $this->assertDatabaseCount('activation_challenges', 0);
    }

    public function test_samples_show_the_delivery_layout_body_and_actions(): void
    {
        $this->app->instance('env', 'local');
        config(['mail.previews' => true]);
        $recipient = new \stdClass;
        $messages = [
            'activation' => new ActivationCodeNotification('123456'),
            'email_change' => new ActivationCodeNotification('123456', 'email_change'),
            'appointment_booked' => new SystemNotification('New TalkTherapy appointment request', 'A new appointment request is waiting for you in TalkTherapy.'),
            'user_invited' => new SystemNotification('Your TalkTherapy account invitation', 'Your TalkTherapy account has an update.'),
        ];
        foreach ($messages as $sample => $notification) {
            $mail = $notification->toMail($recipient);
            $this->get('/email-previews/'.$sample)->assertOk()
                ->assertSeeText($mail->subject)
                ->assertSee($mail->render()->toHtml());
        }
        $this->get('/email-previews/password_reset')->assertSee('Reset Password')->assertSee('example.invalid');
    }
}
