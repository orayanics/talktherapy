<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\DashboardSummaryRequest;
use App\Models\Appointment;
use App\Models\ClinicianPatient;
use App\Models\Slot;
use App\Models\SlpAssignment;
use App\Models\SlpAttempt;
use App\Models\UserProfile;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class DashboardSummaryController extends Controller
{
    public function __invoke(DashboardSummaryRequest $request): JsonResponse
    {
        $user = $request->user();
        $from = CarbonImmutable::parse($request->validated('date_from', now()->toDateString()), 'UTC')->startOfDay();
        $to = CarbonImmutable::parse($request->validated('date_to', now()->toDateString()), 'UTC')->endOfDay();

        $data = match ($user->profile?->role) {
            UserRole::Admin, UserRole::Superadmin => $this->admin($from, $to),
            UserRole::Clinician => $this->clinician($user->id, $from, $to),
            UserRole::Patient => $this->patient($user->id, $from, $to),
            default => abort(403),
        };

        return response()->json(['data' => [
            'role' => $user->profile?->role->value,
            'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString(), 'timezone' => 'UTC'],
            ...$data,
        ]]);
    }

    private function admin(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $periodAppointments = Appointment::query()->whereHas('slot', fn (Builder $slots): Builder => $slots->whereBetween('start_at', [$from, $to]));
        $appointmentCounts = $periodAppointments->clone()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status');
        $pending = Appointment::query()->where('status', 'PENDING');
        $eligibleSlots = Slot::query()->whereBetween('start_at', [$from, $to])->where('is_hidden', false);
        $occupiedSlots = (clone $eligibleSlots)->whereIn('status', ['PENDING', 'ACCEPTED', 'COMPLETED'])->count();
        $eligibleSlotCount = $eligibleSlots->count();

        return [
            'appointments' => [
                'period' => $this->counts($appointmentCounts, ['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED']),
                'total' => $this->total($appointmentCounts),
                'rates' => $this->rates($appointmentCounts),
                'pending' => ['count' => $pending->count(), 'oldest_at' => $pending->min('booked_at')],
            ],
            'slots' => [
                'booking_share' => ['occupied' => $occupiedSlots, 'eligible' => $eligibleSlotCount, 'rate' => $eligibleSlotCount > 0 ? round($occupiedSlots / $eligibleSlotCount, 4) : null],
                'available' => (clone $eligibleSlots)->where('status', 'FREE')->where('start_at', '>', now())->count(),
            ],
            'accounts' => [
                'awaiting_activation' => UserProfile::query()->where('status', 'pending')->count(),
                'suspended' => UserProfile::query()->where('status', 'suspended')->count(),
                'active_patients' => UserProfile::query()->where('role', UserRole::Patient->value)->where('status', 'active')->count(),
                'active_clinicians' => UserProfile::query()->where('role', UserRole::Clinician->value)->where('status', 'active')->count(),
            ],
        ];
    }

    private function clinician(string $userId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $periodAppointments = Appointment::query()->where('clinician_id', $userId)->whereHas('slot', fn (Builder $slots): Builder => $slots->whereBetween('start_at', [$from, $to]));
        $schedule = Appointment::query()->join('slots', 'appointments.slot_id', '=', 'slots.id')->where('appointments.clinician_id', $userId)->whereBetween('slots.start_at', [$from, $to])->selectRaw('DATE(slots.start_at) as day, count(*) as aggregate')->groupByRaw('DATE(slots.start_at)')->pluck('aggregate', 'day')->map(fn ($count): int => (int) $count)->all();
        $next = Appointment::query()->where('appointments.clinician_id', $userId)->where('appointments.status', 'ACCEPTED')->whereHas('slot', fn (Builder $slots): Builder => $slots->where('end_at', '>=', now()))->with(['slot', 'patient:id,name'])->join('slots', 'appointments.slot_id', '=', 'slots.id')->orderBy('slots.start_at')->orderBy('appointments.id')->select('appointments.*')->first();

        return [
            'appointments' => [
                'period' => $this->counts($periodAppointments->clone()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status'), ['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED']),
                'total' => $periodAppointments->count(),
                'rates' => $this->rates($periodAppointments->clone()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status')),
                'pending' => Appointment::query()->where('clinician_id', $userId)->where('status', 'PENDING')->count(),
                'schedule' => $schedule,
                'next' => $next ? ['id' => $next->id, 'start_at' => $next->slot->start_at?->toISOString(), 'end_at' => $next->slot->end_at?->toISOString(), 'status' => $next->status, 'patient' => ['id' => $next->patient->id, 'name' => $next->patient->name]] : null,
            ],
            'patients' => ['seen' => ClinicianPatient::query()->where('clinician_id', $userId)->count()],
            'practice' => ['active_assignments' => SlpAssignment::query()->where('clinician_id', $userId)->where('status', 'active')->count()],
        ];
    }

    private function patient(string $userId, CarbonImmutable $from, CarbonImmutable $to): array
    {
        $periodAppointments = Appointment::query()->where('patient_id', $userId)->whereHas('slot', fn (Builder $slots): Builder => $slots->whereBetween('start_at', [$from, $to]));
        $next = Appointment::query()->where('appointments.patient_id', $userId)->where('appointments.status', 'ACCEPTED')->whereHas('slot', fn (Builder $slots): Builder => $slots->where('end_at', '>=', now()))->with(['slot', 'clinician:id,name'])->join('slots', 'appointments.slot_id', '=', 'slots.id')->orderBy('slots.start_at')->orderBy('appointments.id')->select('appointments.*')->first();
        $weekStart = CarbonImmutable::now('UTC')->startOfWeek();
        $weekEnd = CarbonImmutable::now('UTC')->endOfWeek();

        return [
            'appointments' => [
                'period' => $this->counts($periodAppointments->clone()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status'), ['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED']),
                'total' => $periodAppointments->count(),
                'rates' => $this->rates($periodAppointments->clone()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status')),
                'pending' => Appointment::query()->where('patient_id', $userId)->where('status', 'PENDING')->count(),
                'next' => $next ? ['id' => $next->id, 'start_at' => $next->slot->start_at?->toISOString(), 'end_at' => $next->slot->end_at?->toISOString(), 'status' => $next->status, 'clinician' => ['id' => $next->clinician->id, 'name' => $next->clinician->name]] : null,
            ],
            'practice' => [
                'active_assignments' => SlpAssignment::query()->where('patient_id', $userId)->where('status', 'active')->count(),
                'submissions_this_week' => SlpAttempt::query()->whereHas('assignment', fn (Builder $assignments): Builder => $assignments->where('patient_id', $userId))->whereHas('recording', fn (Builder $recordings): Builder => $recordings->whereBetween('created_at', [$weekStart, $weekEnd]))->count(),
                'progress' => null,
            ],
        ];
    }

    private function counts($counts, array $statuses): array
    {
        return collect($statuses)->mapWithKeys(fn (string $status): array => [$status => (int) ($counts[$status] ?? 0)])->all();
    }

    private function total($counts): int
    {
        return (int) collect($counts)->sum();
    }

    private function rates($counts): array
    {
        $total = $this->total($counts);

        return [
            'completed' => $total > 0 ? round(((int) ($counts['COMPLETED'] ?? 0)) / $total, 4) : null,
            'cancelled' => $total > 0 ? round(((int) ($counts['CANCELLED'] ?? 0)) / $total, 4) : null,
        ];
    }
}
