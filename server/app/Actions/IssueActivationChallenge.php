<?php

namespace App\Actions;

use App\Models\ActivationChallenge;
use App\Models\OutboxMessage;
use App\Models\User;

class IssueActivationChallenge
{
    public function handle(User $user, string $email, string $purpose = 'activation', ?string $newEmail = null): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addMinutes(10);

        ActivationChallenge::query()
            ->whereBelongsTo($user)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $challenge = ActivationChallenge::query()->create([
            'user_id' => $user->id,
            'email' => $email,
            'purpose' => $purpose,
            'code_digest' => hash_hmac('sha256', $code, (string) config('app.key')),
            'expires_at' => $expiresAt,
            'new_email' => $newEmail,
        ]);

        OutboxMessage::query()->create([
            'kind' => 'identity.'.$purpose,
            'aggregate_id' => $challenge->id,
            'recipient_id' => $user->id,
            'delivery_key' => 'identity:'.$purpose.':'.$challenge->id,
            'payload' => ['email' => $email, 'code' => $code, 'purpose' => $purpose],
            'available_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        return $code;
    }
}
