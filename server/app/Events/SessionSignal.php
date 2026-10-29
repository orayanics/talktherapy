<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionSignal implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    /** @param array<string, mixed> $payload */
    public function __construct(
        public string $appointmentId,
        public int $generation,
        public User $sender,
        public array $payload,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel("sessions.{$this->appointmentId}.{$this->generation}")];
    }

    public function broadcastAs(): string
    {
        return 'SessionSignal';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return [
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'sender_role' => $this->sender->profile?->role?->value,
            'target_peer_id' => $this->payload['target_peer_id'] ?? null,
            'generation' => $this->generation,
            'signal' => $this->payload,
        ];
    }
}
