<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivationCodeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public readonly string $code, public readonly string $purpose = 'activation') {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('TalkTherapy email verification code')
            ->line('Use this code to verify your email address:')
            ->line($this->code)
            ->line('This code expires in 10 minutes. If you did not request it, ignore this email.');

        if ($this->purpose === 'email_change') {
            $message->action(
                'Confirm email address',
                rtrim((string) config('app.frontend_url'), '/').'/profile/email-change?code='.urlencode($this->code),
            );
        }

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
