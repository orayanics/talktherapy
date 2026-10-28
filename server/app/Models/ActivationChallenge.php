<?php

namespace App\Models;

use Database\Factories\ActivationChallengeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'email', 'purpose', 'code_digest', 'attempts', 'max_attempts', 'expires_at', 'consumed_at', 'new_email'])]
class ActivationChallenge extends Model
{
    /** @use HasFactory<ActivationChallengeFactory> */
    use HasFactory, HasUuids;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function matches(string $code): bool
    {
        return hash_equals($this->code_digest, hash_hmac('sha256', $code, (string) config('app.key')));
    }

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'max_attempts' => 'integer',
            'expires_at' => 'immutable_datetime',
            'consumed_at' => 'immutable_datetime',
        ];
    }
}
