<?php

namespace App\Actions;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use DateTimeImmutable;
use DateTimeZone;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SaveSchedule
{
    /**
     * @param  array{start_at: string, end_at: string, recurrence_rule?: ?string, timezone: string}  $attributes
     */
    public function create(User $actor, array $attributes, ?string $requestId): Schedule
    {
        $startsAt = (new DateTimeImmutable($attributes['start_at']))->setTimezone(new DateTimeZone('UTC'));
        $endsAt = (new DateTimeImmutable($attributes['end_at']))->setTimezone(new DateTimeZone('UTC'));
        if ($startsAt <= now()) {
            throw new UnprocessableEntityHttpException('A schedule must start in the future.');
        }

        try {
            $occurrences = app(ExpandScheduleOccurrences::class)->expand(
                $startsAt,
                $endsAt,
                $attributes['recurrence_rule'] ?? null,
            );
        } catch (\InvalidArgumentException $exception) {
            throw new UnprocessableEntityHttpException($exception->getMessage(), $exception);
        }

        return DB::transaction(function () use ($actor, $attributes, $occurrences, $requestId, $startsAt, $endsAt): Schedule {
            $clinician = User::query()->whereKey($actor->id)->lockForUpdate()->with('profile')->firstOrFail();
            if ($clinician->email_verified_at === null
                || $clinician->profile?->role !== UserRole::Clinician
                || $clinician->profile->status !== UserStatus::Active) {
                throw new AuthorizationException;
            }

            if ($startsAt <= now()) {
                throw new UnprocessableEntityHttpException('A schedule must start in the future.');
            }

            $overlap = Slot::query()
                ->where('clinician_id', $clinician->id)
                ->where(function ($query) use ($occurrences): void {
                    foreach ($occurrences as $occurrence) {
                        $query->orWhere(function ($overlap) use ($occurrence): void {
                            $overlap->where('start_at', '<', $occurrence['end'])
                                ->where('end_at', '>', $occurrence['start']);
                        });
                    }
                })
                ->exists();

            if ($overlap) {
                throw new ConflictHttpException('The schedule overlaps existing availability.');
            }

            $schedule = Schedule::query()->create([
                'clinician_id' => $clinician->id,
                'start_at' => $startsAt,
                'end_at' => $endsAt,
                'recurrence_rule' => $attributes['recurrence_rule'] ?? null,
                'timezone' => 'UTC',
            ]);

            $schedule->slots()->createMany(array_map(fn (array $occurrence): array => [
                'clinician_id' => $clinician->id,
                'start_at' => $occurrence['start'],
                'end_at' => $occurrence['end'],
                'status' => 'FREE',
                'is_hidden' => false,
            ], $occurrences));

            AuditLog::query()->create([
                'actor_id' => $clinician->id,
                'actor_role' => UserRole::Clinician->value,
                'action' => 'schedule.created',
                'entity_type' => 'schedule',
                'entity_id' => $schedule->id,
                'request_id' => $requestId,
                'details' => ['occurrences' => count($occurrences)],
            ]);

            return $schedule->loadCount('slots');
        }, attempts: 3);
    }
}
