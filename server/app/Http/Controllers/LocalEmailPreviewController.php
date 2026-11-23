<?php

namespace App\Http\Controllers;

use App\Notifications\ActivationCodeNotification;
use App\Notifications\SystemNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\View\View;
use Illuminate\Notifications\Messages\MailMessage;
use stdClass;

class LocalEmailPreviewController extends Controller
{
    private const GROUPS = [
        'Appointments' => [
            'appointment_booked' => 'Booking',
            'appointment_accepted' => 'Acceptance',
            'appointment_rejected' => 'Rejection',
            'appointment_cancelled' => 'Cancellation',
            'appointment_completed' => 'Completion',
        ],
        'Clinical records' => ['soap_created' => 'SOAP created', 'soap_updated' => 'SOAP updated'],
        'Account' => [
            'activation' => 'Account activation',
            'email_change' => 'Email change',
            'user_invited' => 'Account invitation',
            'user_suspended' => 'Suspension',
            'user_reactivated' => 'Reactivation',
            'password_reset' => 'Password reset',
            'password_changed' => 'Password change',
        ],
        'Custom notifications' => ['custom' => 'Custom notification'],
    ];

    public function __invoke(?string $sample = null): View
    {
        abort_unless(app()->environment('local') && config('mail.previews') === true, 404);
        abort_if($sample !== null && ! array_key_exists($sample, array_merge(...array_values(self::GROUPS))), 404);

        $message = $sample === null ? null : $this->sample($sample);

        return view('email-previews', [
            'groups' => self::GROUPS,
            'subject' => $message?->subject,
            'html' => $message?->render()->toHtml(),
        ]);
    }

    private function sample(string $sample): MailMessage
    {
        $notification = match ($sample) {
            'activation', 'email_change' => new ActivationCodeNotification('123456', $sample),
            'password_reset' => new class('fictional-token') extends ResetPassword
            {
                protected function resetUrl(mixed $notifiable): string
                {
                    return 'https://example.invalid/reset-password/'.$this->token;
                }
            },
            default => SystemNotification::fromOutbox('email.'.$sample, match ($sample) {
                'appointment_booked' => ['message' => 'A new appointment request is waiting for you in TalkTherapy.'],
                'appointment_accepted' => ['message' => 'Your appointment status is now ACCEPTED.'],
                'appointment_rejected' => ['message' => 'Your appointment status is now REJECT.'],
                'appointment_cancelled' => ['message' => 'Your appointment status is now CANCELLED.'],
                'appointment_completed' => ['message' => 'Your appointment status is now COMPLETED.'],
                'soap_created' => ['message' => 'A new clinical record is available in TalkTherapy.'],
                'soap_updated' => ['message' => 'A clinical record was updated in TalkTherapy.'],
                'user_invited' => [],
                'user_suspended' => ['message' => 'Your TalkTherapy account was suspended. Reason: Fictional review.'],
                'user_reactivated' => ['message' => 'Your TalkTherapy account was reactivated.'],
                'password_changed' => ['message' => 'Your TalkTherapy password was changed. If you did not make this change, contact support immediately.'],
                'custom' => ['subject' => 'Fictional workshop invitation', 'message' => 'Join the sample workshop on Friday.'],
            }),
        };

        return $notification->toMail(new stdClass);
    }
}
