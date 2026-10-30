<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['owner_id', 'path', 'mime_type', 'bytes', 'checksum', 'license'])]
class SlpAsset extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['bytes' => 'integer'];
    }
}
