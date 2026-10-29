<?php

namespace App\Services;

use App\Models\OutboxMessage;
use App\Models\User;
use Illuminate\Support\Str;

class NotificationService
{
    public function inApp(User $recipient, string $type, string $title, string $message, ?string $entityType = null, ?string $entityId = null): void
    {
        $key = 'notification:'.Str::uuid();
        OutboxMessage::query()->create([
            'kind' => 'notification.broadcast',
            'aggregate_id' => $entityId ?? $recipient->id,
            'recipient_id' => $recipient->id,
            'delivery_key' => "{$key}:broadcast",
            'payload' => compact('type', 'title', 'message', 'entityType', 'entityId'),
            'available_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);
    }

    public function email(User $recipient, string $template, array $payload = []): void
    {
        OutboxMessage::query()->create([
            'kind' => 'email.'.$template,
            'aggregate_id' => $recipient->id,
            'recipient_id' => $recipient->id,
            'delivery_key' => 'email:'.$template.':'.$recipient->id.':'.Str::uuid(),
            'payload' => $payload,
            'available_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);
    }
}
