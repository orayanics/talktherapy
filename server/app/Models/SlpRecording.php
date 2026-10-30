<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['attempt_id', 'path', 'mime_type', 'bytes', 'checksum', 'duration_ms', 'retention_until'])]
class SlpRecording extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['bytes' => 'integer', 'duration_ms' => 'integer', 'retention_until' => 'immutable_datetime'];
    }
}
