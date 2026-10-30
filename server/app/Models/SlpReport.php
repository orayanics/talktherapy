<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['review_id', 'created_by', 'snapshot'])]
class SlpReport extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['snapshot' => 'array'];
    }
}
