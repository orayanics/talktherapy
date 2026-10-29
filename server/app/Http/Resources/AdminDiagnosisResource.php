<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminDiagnosisResource extends DiagnosisResource
{
    public function toArray(Request $request): array
    {
        return [...parent::toArray($request), 'active' => (bool) ($this->active ?? true)];
    }
}
