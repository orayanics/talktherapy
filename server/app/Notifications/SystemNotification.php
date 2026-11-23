<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    public function __construct(
        public readonly string $subject,
        public readonly string $body,
        public readonly string $template = 'custom-notifications',
        public readonly ?array $action = null,
    ) {}

    /**
     * @param  array{status?: string, reason?: ?string, subject?: string, message?: string, appointment_date?: string, appointment_time?: string, patient_name?: string, clinician_name?: string, session_type?: ?string, version?: int}  $context
     * @return array<string, mixed>
     */
    public static function workflowPayload(string $template, array $context): array
    {
        if (array_key_exists('message', $context)) {
            return $context;
        }

        $body = match ($template) {
            'appointment_booked' => 'A new appointment request is waiting for you in TalkTherapy.'.self::appointmentDetails($context),
            'appointment_accepted', 'appointment_rejected', 'appointment_cancelled', 'appointment_completed' => isset($context['status'])
                ? 'Your appointment status is now '.$context['status'].'.'.self::appointmentDetails($context).self::reasonDetails($context)
                : null,
            'soap_created' => 'A new clinical record is available in TalkTherapy.'.self::soapDetails($context),
            'soap_updated' => 'A clinical record was updated in TalkTherapy.'.self::soapDetails($context),
            'user_suspended' => isset($context['reason'])
                ? 'Your TalkTherapy account was suspended. Reason: '.$context['reason']
                : null,
            'user_reactivated' => 'Your TalkTherapy account was reactivated.',
            'password_changed' => 'Your TalkTherapy password was changed. If you did not make this change, contact support immediately.',
            default => null,
        };

        return $body === null ? $context : [...$context, 'message' => $body];
    }

    /** @param array<string, mixed> $context */
    private static function appointmentDetails(array $context): string
    {
        $details = [];
        if (isset($context['appointment_date'], $context['appointment_time'])) {
            $details[] = "\n\nDate: {$context['appointment_date']}\nTime: {$context['appointment_time']}";
        }
        if (isset($context['clinician_name'])) {
            $details[] = "Clinician: {$context['clinician_name']}";
        }
        if (isset($context['patient_name'])) {
            $details[] = "Patient: {$context['patient_name']}";
        }

        return $details === [] ? '' : "\n\n".implode("\n", $details);
    }

    /** @param array<string, mixed> $context */
    private static function reasonDetails(array $context): string
    {
        return isset($context['reason']) && $context['reason'] !== null ? "\nReason: {$context['reason']}" : '';
    }

    /** @param array<string, mixed> $context */
    private static function soapDetails(array $context): string
    {
        $details = [];
        if (isset($context['clinician_name'])) {
            $details[] = "Clinician: {$context['clinician_name']}";
        }
        if (isset($context['session_type']) && $context['session_type'] !== null) {
            $details[] = "Session type: {$context['session_type']}";
        }
        if (isset($context['version'])) {
            $details[] = "Version: {$context['version']}";
        }

        return $details === [] ? '' : "\n\n".implode("\n", $details);
    }

    /** @param array{subject?: string, message?: string} $payload */
    public static function fromOutbox(string $kind, array $payload): self
    {
        $subject = match ($kind) {
            'email.custom' => (string) ($payload['subject'] ?? 'TalkTherapy notification'),
            'email.appointment_booked' => 'New TalkTherapy appointment request',
            'email.appointment_accepted' => 'TalkTherapy appointment accepted',
            'email.appointment_rejected' => 'TalkTherapy appointment declined',
            'email.appointment_cancelled' => 'TalkTherapy appointment cancelled',
            'email.appointment_completed' => 'TalkTherapy appointment completed',
            'email.soap_created' => 'New TalkTherapy clinical record',
            'email.soap_updated' => 'TalkTherapy clinical record updated',
            'email.user_invited' => 'Your TalkTherapy account invitation',
            'email.user_suspended' => 'Your TalkTherapy account was suspended',
            'email.user_reactivated' => 'Your TalkTherapy account was reactivated',
            'email.password_changed' => 'Your TalkTherapy password was changed',
            default => 'TalkTherapy account update',
        };
        $body = (string) ($payload['message'] ?? 'Your TalkTherapy account has an update.');

        $path = match (true) {
            isset($payload['appointment_id']) => '/appointments?appointmentId='.rawurlencode($payload['appointment_id']),
            isset($payload['soap_id']) => '/records/'.rawurlencode($payload['soap_id']),
            default => null,
        };

        return new self($subject, $body, match (true) {
            str_starts_with($kind, 'email.appointment_') => 'appointments',
            str_starts_with($kind, 'email.soap_') => 'clinical-records',
            $kind === 'email.custom' => 'custom-notifications',
            default => 'account',
        }, $path === null ? null : [
            'label' => isset($payload['appointment_id']) ? 'View appointment' : 'View clinical record',
            'url' => rtrim((string) config('app.frontend_url'), '/').$path,
        ]);
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->subject)
            ->view('emails.'.$this->template, ['body' => $this->body, 'action' => $this->action]);
    }
}
