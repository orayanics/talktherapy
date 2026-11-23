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
            'appointment_booked' => ['Booking', ['status' => 'PENDING', 'appointment_date' => 'Tuesday, June 16, 2026', 'appointment_time' => '10:00 AM – 11:00 AM', 'patient_name' => 'Jordan Lee', 'clinician_name' => 'Dr. Avery Smith']],
            'appointment_accepted' => ['Acceptance', ['status' => 'ACCEPTED', 'appointment_date' => 'Tuesday, June 16, 2026', 'appointment_time' => '10:00 AM – 11:00 AM', 'patient_name' => 'Jordan Lee', 'clinician_name' => 'Dr. Avery Smith']],
            'appointment_rejected' => ['Rejection', ['status' => 'REJECT', 'appointment_date' => 'Tuesday, June 16, 2026', 'appointment_time' => '10:00 AM – 11:00 AM', 'patient_name' => 'Jordan Lee', 'clinician_name' => 'Dr. Avery Smith', 'reason' => 'The requested time is unavailable.']],
            'appointment_cancelled' => ['Cancellation', ['status' => 'CANCELLED', 'appointment_date' => 'Tuesday, June 16, 2026', 'appointment_time' => '10:00 AM – 11:00 AM', 'patient_name' => 'Jordan Lee', 'clinician_name' => 'Dr. Avery Smith', 'reason' => 'Schedule conflict.']],
            'appointment_completed' => ['Completion', ['status' => 'COMPLETED', 'appointment_date' => 'Tuesday, June 16, 2026', 'appointment_time' => '10:00 AM – 11:00 AM', 'patient_name' => 'Jordan Lee', 'clinician_name' => 'Dr. Avery Smith']],
        ],
        'Clinical records' => [
            'soap_created' => ['SOAP created', ['clinician_name' => 'Dr. Avery Smith', 'session_type' => 'Initial evaluation', 'version' => 1]],
            'soap_updated' => ['SOAP updated', ['clinician_name' => 'Dr. Avery Smith', 'session_type' => 'Initial evaluation', 'version' => 2]],
        ],
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
        if (str_starts_with($sample, 'appointment_')) {
            $context['appointment_id'] = '00000000-0000-4000-8000-000000000001';
        } elseif (str_starts_with($sample, 'soap_')) {
            $context['soap_id'] = '00000000-0000-4000-8000-000000000002';
        }

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
