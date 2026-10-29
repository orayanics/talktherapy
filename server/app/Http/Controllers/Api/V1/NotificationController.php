<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Events\UserNotificationAvailable;
use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationReadRequest;
use App\Http\Requests\NotificationStoreRequest;
use App\Http\Resources\UserNotificationResource;
use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserNotification;
use App\Services\NotificationService;
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
        $legacy = $request->has('recipient_id') && ! $request->has('recipient_ids') && ! $request->has('roles') && $input['channels'] === ['in_app'] && ! $request->filled('subject');
        $recipientIds = collect($input['recipient_ids'] ?? (($input['recipient_id'] ?? null) ? [$input['recipient_id']] : []));
        if (! empty($input['roles'])) {
            $recipientIds = $recipientIds->merge(User::query()->whereHas('profile', fn ($query) => $query->whereIn('role', array_map(fn (UserRole|string $role): string => $role instanceof UserRole ? $role->value : $role, $input['roles']))->where('status', UserStatus::Active))->whereNotNull('email_verified_at')->pluck('id'));
        }
        $recipients = User::query()->with('profile')->whereIn('id', $recipientIds->unique())->get();
        abort_if($recipients->isEmpty() || $recipients->contains(fn (User $user): bool => $user->profile?->status !== UserStatus::Active || ! $user->hasVerifiedEmail()), 422, 'Recipients must be active and verified.');
        $created = DB::transaction(function () use ($request, $recipients, $input, $legacy): array {
            $notifications = [];
            foreach ($recipients as $recipient) {
                $key = 'notification:'.Str::uuid();
                if (in_array('in_app', $input['channels'], true)) {
                    $notification = UserNotification::query()->create(['user_id' => $recipient->id, 'type' => $input['type'], 'title' => $input['title'] ?? $input['subject'], 'message' => $input['message'], 'entity_type' => $input['entity_type'] ?? null, 'entity_id' => $input['entity_id'] ?? null, 'delivery_key' => $key]);
                    OutboxMessage::query()->create(['kind' => 'notification.broadcast', 'aggregate_id' => $notification->id, 'recipient_id' => $recipient->id, 'delivery_key' => "{$key}:broadcast", 'payload' => ['notification_id' => $notification->id], 'available_at' => now(), 'expires_at' => now()->addDays(30), 'delivered_at' => now()]);
                    $notifications[] = $notification;
                }
                if (in_array('email', $input['channels'], true)) {
                    app(NotificationService::class)->email($recipient, 'custom', ['subject' => $input['subject'], 'message' => $input['message']]);
                }
                AuditLog::query()->create(['actor_id' => $request->user()->id, 'actor_role' => $request->user()->profile->role->value, 'action' => 'notification.sent', 'entity_type' => 'notification', 'entity_id' => $recipient->id, 'request_id' => $request->attributes->get('request_id'), 'details' => $legacy ? ['recipient_id' => $recipient->id, 'type' => $input['type']] : ['recipient_id' => $recipient->id, 'channels' => $input['channels'], 'type' => $input['type']]]);
            }

            return $notifications;
        });

        // Custom broadcasts are user-initiated; publish immediately instead of waiting for the minute scanner.
        foreach ($created as $notification) {
            $recipient = $recipients->firstWhere('id', $notification->user_id);
            if ($recipient) {
                event(new UserNotificationAvailable($recipient->id, $recipient->session_version, $notification->id, $notification->type));
                OutboxMessage::query()
                    ->where('kind', 'notification.broadcast')
                    ->where('recipient_id', $recipient->id)
                    ->where('delivery_key', $notification->delivery_key.':broadcast')
                    ->update(['broadcasted_at' => now(), 'delivered_at' => now()]);
            }
        }

        if ($legacy && isset($created[0])) {
            return UserNotificationResource::make($created[0])->response()->setStatusCode(201);
        }

        return response()->json(['data' => ['recipients' => $recipients->count(), 'in_app' => count($created), 'email' => in_array('email', $input['channels'], true)]], 201);
    }

    public function preview(NotificationStoreRequest $request): JsonResponse
    {
        $input = $request->validated();
        $ids = collect($input['recipient_ids'] ?? (($input['recipient_id'] ?? null) ? [$input['recipient_id']] : []));
        if (! empty($input['roles'])) {
            $ids = $ids->merge(User::query()->whereHas('profile', fn ($query) => $query->whereIn('role', array_map(fn (UserRole|string $role): string => $role instanceof UserRole ? $role->value : $role, $input['roles']))->where('status', UserStatus::Active))->whereNotNull('email_verified_at')->pluck('id'));
        }

        return response()->json(['data' => ['recipients' => $ids->unique()->count(), 'channels' => $input['channels'], 'in_app' => ['title' => $input['title'] ?? $input['subject'] ?? '', 'message' => $input['message']], 'email' => ['subject' => $input['subject'] ?? '', 'message' => $input['message']]]]);
    }
}
