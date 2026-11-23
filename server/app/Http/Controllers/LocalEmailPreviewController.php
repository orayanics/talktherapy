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
            'appointment_booked' => ['Booking'],
            'appointment_accepted' => ['Acceptance', ['status' => 'ACCEPTED']],
            'appointment_rejected' => ['Rejection', ['status' => 'REJECT']],
            'appointment_cancelled' => ['Cancellation', ['status' => 'CANCELLED']],
            'appointment_completed' => ['Completion', ['status' => 'COMPLETED']],
        ],
        'Clinical records' => ['soap_created' => ['SOAP created'], 'soap_updated' => ['SOAP updated']],
        'Account' => [
            'activation' => ['Account activation'],
            'email_change' => ['Email change'],
            'user_invited' => ['Account invitation'],
            'user_suspended' => ['Suspension', ['reason' => 'Fictional review.']],
            'user_reactivated' => ['Reactivation'],
            'password_reset' => ['Password reset'],
            'password_changed' => ['Password change'],
        ],
        'Custom notifications' => ['custom' => ['Custom notification', ['subject' => 'Fictional workshop invitation', 'message' => 'Join the sample workshop on Friday.']]],
    ];

    public function __invoke(?string $sample = null): View
    {
        abort_unless(app()->environment('local') && config('mail.previews') === true, 404);
        $samples = array_merge(...array_values(self::GROUPS));
        abort_if($sample !== null && ! isset($samples[$sample]), 404);

        $message = $sample === null ? null : $this->sample($sample, $samples[$sample][1] ?? []);

        return view('email-previews', [
            'groups' => self::GROUPS,
            'subject' => $message?->subject,
            'html' => $message?->render(),
        ]);
    }

    private function sample(string $sample, array $context): MailMessage
    {
        $notification = match ($sample) {
            'activation', 'user_invited' => new ActivationCodeNotification('123456'),
            'email_change' => new ActivationCodeNotification('123456', 'email_change'),
            'password_reset' => new class('fictional-token') extends ResetPassword
            {
                protected function resetUrl(mixed $notifiable): string
                {
                    return 'https://example.invalid/reset-password/'.$this->token;
                }
            },
            default => SystemNotification::fromOutbox('email.'.$sample, SystemNotification::workflowPayload($sample, $context)),
        };

        return $notification->toMail(new stdClass);
    }
}
