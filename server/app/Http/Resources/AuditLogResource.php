<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actor_id' => $this->actor_id,
            'actor_email' => $this->actor?->email,
            'actor_role' => $this->actor_role,
            'action' => $this->action,
            'entity_type' => $this->entity_type,
            'entity_id' => $this->entity_id,
            'details' => is_array($this->details) ? $this->details : [],
            'request_id' => $this->request_id,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
