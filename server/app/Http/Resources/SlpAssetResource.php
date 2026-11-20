<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mime_type' => $this->mime_type,
            'bytes' => $this->bytes,
            'license' => $this->license,
            'url' => url('/api/v1/slp/assets/'.$this->id),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
