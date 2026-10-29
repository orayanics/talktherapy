<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['actor_id', 'format', 'filters', 'status', 'path', 'error'])]
class AuditExport extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['filters' => 'array'];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
