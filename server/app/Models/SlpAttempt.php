<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['assignment_id', 'consent_id', 'status', 'submission_key'])]
class SlpAttempt extends Model
{
    use HasUuids;

    public function scopeReviewable(Builder $query): Builder
    {
        return $query->whereHas('consent', fn ($q) => $q->whereNull('withdrawn_at'))
            ->where(fn ($q) => $q->where('status', 'awaiting_review')->orWhere(fn ($manual) => $manual
                ->whereIn('status', ['queued', 'failed'])
                ->whereHas('recording', fn ($audio) => $audio->where(fn ($expiry) => $expiry->whereNull('retention_until')->orWhere('retention_until', '>', now())))));
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(SlpAssignment::class);
    }

    public function consent(): BelongsTo
    {
        return $this->belongsTo(SlpConsent::class);
    }

    public function recording(): HasOne
    {
        return $this->hasOne(SlpRecording::class, 'attempt_id');
    }

    public function analysis(): HasOne
    {
        return $this->hasOne(SlpAnalysisRun::class, 'attempt_id')->latestOfMany();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(SlpReview::class, 'attempt_id');
    }
}
