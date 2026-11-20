<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Diagnosis;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class ReportingStatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $userRoles = collect(UserRole::cases())->mapWithKeys(fn (UserRole $role): array => [$role->value => 0]);
        $roles = User::query()->join('user_profiles', 'users.id', '=', 'user_profiles.user_id')->selectRaw('user_profiles.role, count(*) as aggregate')->groupBy('user_profiles.role')->pluck('aggregate', 'role');
        $diagnoses = Diagnosis::query()
            ->where('active', true)
            ->leftJoin('user_profiles', function (JoinClause $join): void {
                $join->on('diagnoses.id', '=', 'user_profiles.diagnosis_id')
                    ->where('user_profiles.role', UserRole::Patient->value);
            })
            ->select(['diagnoses.value', 'diagnoses.label'])
            ->selectRaw('count(user_profiles.user_id) as aggregate')
            ->groupBy('diagnoses.id', 'diagnoses.value', 'diagnoses.label')
            ->orderBy('diagnoses.label')
            ->get()
            ->map(fn (Diagnosis $diagnosis): array => [
                'value' => $diagnosis->value,
                'label' => $diagnosis->label,
                'count' => (int) $diagnosis->aggregate,
            ])
            ->all();
        $appointments = collect(['PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'])->mapWithKeys(fn (string $status): array => [$status => 0])->merge(Appointment::query()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status'));
        $slots = collect(['FREE', 'PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'])->mapWithKeys(fn (string $status): array => [$status => 0])->merge(Slot::query()->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status'));

        return response()->json(['data' => ['users' => ['total' => User::query()->count(), 'by_role' => $userRoles->merge($roles)->all(), 'by_diagnosis' => $diagnoses], 'appointments' => $appointments->all(), 'slots' => $slots->all()]]);
    }
}
