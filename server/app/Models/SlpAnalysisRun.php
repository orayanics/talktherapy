<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['attempt_id', 'status', 'schema_version', 'failure_code', 'result'])]
class SlpAnalysisRun extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['result' => 'array'];
    }
}
