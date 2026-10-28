<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class UserNotificationAvailable implements ShouldBroadcastNow
{
    use Dispatchable;

    public function __construct(public string $recipientId, public int $accessEpoch, public string $notificationId, public string $type) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("users.{$this->recipientId}.{$this->accessEpoch}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'UserNotificationAvailable';
    }

    /** @return array{notification_id: string, type: string} */
    public function broadcastWith(): array
    {
        return ['notification_id' => $this->notificationId, 'type' => $this->type];
    }
}
