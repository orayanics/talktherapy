<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationReadRequest;
use App\Http\Requests\NotificationStoreRequest;
use App\Http\Resources\UserNotificationResource;
use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function channel(NotificationReadRequest $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(['data' => [
            'channel' => "users.{$user->id}.{$user->session_version}",
        ]]);
    }

    public function index(NotificationReadRequest $request): AnonymousResourceCollection
    {
        $query = UserNotification::query()->where('user_id', $request->user()->id);
        if (($unread = $request->validated('unread')) !== null) {
            if ($unread) {
                $query->whereNull('read_at');
            } else {
                $query->whereNotNull('read_at');
            }
        }

        return UserNotificationResource::collection($query
            ->orderBy('created_at', $request->validated('sort', 'desc'))
            ->orderBy('id', $request->validated('sort', 'desc'))
            ->paginate($request->integer('per_page', 20))
            ->withQueryString());
    }

    public function read(NotificationReadRequest $request, string $notification): Response
    {
        $record = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($notification);
        Gate::authorize('view', $record);
        UserNotification::query()
            ->whereKey($record->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function store(NotificationStoreRequest $request): JsonResponse
    {
        $input = $request->validated();
        $recipient = User::query()->with('profile')->findOrFail($input['recipient_id']);
        abort_unless($recipient->profile?->status === UserStatus::Active && $recipient->hasVerifiedEmail(), 422);
        $deliveryKey = 'notification:'.Str::uuid();

        $notification = DB::transaction(function () use ($request, $recipient, $input, $deliveryKey): UserNotification {
            $notification = UserNotification::query()->create([
                'user_id' => $recipient->id,
                'type' => $input['type'],
                'title' => $input['title'],
                'message' => $input['message'],
                'entity_type' => $input['entity_type'] ?? null,
                'entity_id' => $input['entity_id'] ?? null,
                'delivery_key' => $deliveryKey,
            ]);
            OutboxMessage::query()->create([
                'kind' => 'notification.broadcast',
                'aggregate_id' => $notification->id,
                'recipient_id' => $recipient->id,
                'delivery_key' => "{$deliveryKey}:broadcast",
                'payload' => ['notification_id' => $notification->id],
                'available_at' => now(),
                'expires_at' => now()->addDays(30),
                'delivered_at' => now(),
            ]);
            AuditLog::query()->create([
                'actor_id' => $request->user()->id,
                'actor_role' => $request->user()->profile->role->value,
                'action' => 'notification.sent',
                'entity_type' => 'notification',
                'entity_id' => $notification->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['recipient_id' => $recipient->id, 'type' => $notification->type],
            ]);

            return $notification;
        });

        return UserNotificationResource::make($notification)->response()->setStatusCode(201);
    }
}
