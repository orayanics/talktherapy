<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\SlotReadRequest;
use App\Http\Resources\SlotResource;
use App\Models\AuditLog;
use App\Models\Slot;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class SlotController extends Controller
{
    public function hide(Request $request, string $slot): SlotResource
    {
        $record = DB::transaction(function () use ($request, $slot): Slot {
            $record = Slot::query()->whereKey($slot)->lockForUpdate()->firstOrFail();
            Gate::authorize('hide', $record);

            if ($record->status !== 'FREE') {
                throw new ConflictHttpException('Only free slots can be hidden.');
            }

            if (! $record->is_hidden) {
                $record->update(['is_hidden' => true]);
                AuditLog::query()->create([
                    'actor_id' => $request->user()->id,
                    'actor_role' => UserRole::Clinician->value,
                    'action' => 'slot.hidden',
                    'entity_type' => 'slot',
                    'entity_id' => $record->id,
                    'request_id' => $request->attributes->get('request_id'),
                    'details' => [],
                ]);
            }

            return $record;
        }, attempts: 3);

        return SlotResource::make($record->load('clinician.profile.diagnosis'));
    }

    public function index(SlotReadRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = Slot::query()->with([
            'clinician:id,name,email_verified_at',
            'clinician.profile:user_id,role,status,diagnosis_id',
            'clinician.profile.diagnosis:id,label,value',
        ]);

        if ($user->profile->role === UserRole::Clinician) {
            $query->where('clinician_id', $user->id);
        } elseif ($user->profile->role === UserRole::Patient) {
            $query->where('status', 'FREE')
                ->where('is_hidden', false)
                ->where('start_at', '>', now())
                ->whereHas('clinician', fn (Builder $clinicians): Builder => $clinicians
                    ->whereNotNull('email_verified_at')
                    ->whereHas('profile', fn (Builder $profiles): Builder => $profiles
                        ->where('role', UserRole::Clinician->value)
                        ->where('status', 'active')));
        }

        if ($request->filled('date_from')) {
            $query->where('start_at', '>=', CarbonImmutable::parse($request->validated('date_from'), 'UTC')->startOfDay());
        }

        if ($request->filled('date_to')) {
            $query->where('start_at', '<=', CarbonImmutable::parse($request->validated('date_to'), 'UTC')->endOfDay());
        }

        if ($request->filled('clinician_id')) {
            $query->where('clinician_id', $request->validated('clinician_id'));
        }

        if ($request->filled('diagnosis_values')) {
            $query->whereHas('clinician.profile.diagnosis', fn (Builder $diagnoses): Builder => $diagnoses
                ->whereIn('value', $request->validated('diagnosis_values')));
        }

        $slots = $query->orderBy('start_at', $request->validated('sort', 'asc'))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return SlotResource::collection($slots);
    }

    public function show(SlotReadRequest $request, string $slot): SlotResource
    {
        $record = Slot::query()->with([
            'clinician:id,name,email_verified_at',
            'clinician.profile:user_id,role,status,diagnosis_id',
            'clinician.profile.diagnosis:id,label,value',
        ])->findOrFail($slot);
        Gate::authorize('view', $record);

        return SlotResource::make($record);
    }
}
