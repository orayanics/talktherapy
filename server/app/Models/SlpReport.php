<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['review_id', 'created_by', 'snapshot', 'released_at', 'released_by'])]
class SlpReport extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['snapshot' => 'array', 'released_at' => 'immutable_datetime'];
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(SlpReview::class);
    }

    public function releaser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
