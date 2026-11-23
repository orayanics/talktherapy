<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SystemNotification extends Notification
{
    public function __construct(public readonly string $subject, public readonly string $body) {}

    /**
     * @param  array{status?: string, reason?: string, subject?: string, message?: string}  $context
     * @return array{subject?: string, message: string}
     */
    public static function workflowPayload(string $template, array $context): array
    {
        if (isset($context['message'])) {
            return $context;
        }

        $body = match ($template) {
            'appointment_booked' => 'A new appointment request is waiting for you in TalkTherapy.',
            'appointment_accepted', 'appointment_rejected', 'appointment_cancelled', 'appointment_completed' => 'Your appointment status is now '.$context['status'].'.',
            'soap_created' => 'A new clinical record is available in TalkTherapy.',
            'soap_updated' => 'A clinical record was updated in TalkTherapy.',
            'user_suspended' => 'Your TalkTherapy account was suspended. Reason: '.$context['reason'],
            'user_reactivated' => 'Your TalkTherapy account was reactivated.',
            'password_changed' => 'Your TalkTherapy password was changed. If you did not make this change, contact support immediately.',
        };

        return ['message' => $body];
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

        return new self($subject, $body);
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)->subject($this->subject)->line($this->body);
    }
}
