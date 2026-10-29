<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SchedulingWriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_clinician_can_create_bounded_schedule_and_server_derives_ownership(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $otherClinician = $this->createUser(UserRole::Clinician);
        $start = now()->addDays(3)->startOfDay()->addHours(9);

        $response = $this->actingAs($clinician)->postJson('/api/v1/schedules', [
            'start_at' => $start->toISOString(),
            'end_at' => $start->copy()->addHour()->toISOString(),
            'recurrence_rule' => 'FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4',
            'timezone' => 'UTC',
            'clinician_id' => $otherClinician->id,
        ])->assertCreated()
            ->assertJsonPath('data.clinician_id', $clinician->id)
            ->assertJsonPath('data.timezone', 'UTC')
            ->assertJsonPath('data.slots_count', 4);

        $schedule = Schedule::query()->findOrFail($response->json('data.id'));
        $this->assertSame($clinician->id, $schedule->clinician_id);
        $this->assertDatabaseCount('slots', 4);
        $this->assertDatabaseHas('slots', [
            'schedule_id' => $schedule->id,
            'clinician_id' => $clinician->id,
            'status' => 'FREE',
            'is_hidden' => false,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $clinician->id,
            'action' => 'schedule.created',
            'entity_id' => $schedule->id,
        ]);
    }

    #[DataProvider('nonClinicianRoles')]
    public function test_non_clinicians_cannot_create_schedules(string $role): void
    {
        $user = $this->createUser(UserRole::from($role));
        $start = now()->addDays(3);

        $this->actingAs($user)->postJson('/api/v1/schedules', [
            'start_at' => $start->toISOString(),
            'end_at' => $start->copy()->addHour()->toISOString(),
            'timezone' => 'UTC',
        ])->assertForbidden();

        $this->assertDatabaseCount('schedules', 0);
        $this->assertDatabaseCount('slots', 0);
    }

    public static function nonClinicianRoles(): array
    {
        return [
            'patient' => ['patient'],
            'admin' => ['admin'],
            'superadmin' => ['superadmin'],
        ];
    }

    public function test_invalid_and_unbounded_schedules_write_nothing(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $start = now()->addDays(3);
        $payload = [
            'start_at' => $start->toISOString(),
            'end_at' => $start->copy()->addHour()->toISOString(),
            'timezone' => 'UTC',
        ];

        $this->actingAs($clinician)->postJson('/api/v1/schedules', [
            ...$payload,
            'recurrence_rule' => 'FREQ=DAILY',
        ])->assertUnprocessable()->assertJsonValidationErrors('recurrence_rule');

        $this->postJson('/api/v1/schedules', [
            ...$payload,
            'end_at' => $payload['start_at'],
        ])->assertUnprocessable()->assertJsonValidationErrors('end_at');

        $this->postJson('/api/v1/schedules', [
            ...$payload,
            'timezone' => 'America/New_York',
        ])->assertUnprocessable()->assertJsonValidationErrors('timezone');

        $this->postJson('/api/v1/schedules', [
            ...$payload,
            'start_at' => '2027-02-30T09:00:00.000Z',
        ])->assertUnprocessable()->assertJsonValidationErrors('start_at');

        $this->postJson('/api/v1/schedules', [
            ...$payload,
            'end_at' => $start->copy()->addHours(25)->toISOString(),
            'recurrence_rule' => 'FREQ=DAILY;COUNT=2',
        ])->assertUnprocessable()->assertJsonValidationErrors('recurrence_rule');

        $this->assertDatabaseCount('schedules', 0);
        $this->assertDatabaseCount('slots', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_past_schedules_are_rejected(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $start = now()->subDay();

        $this->actingAs($clinician)->postJson('/api/v1/schedules', [
            'start_at' => $start->toISOString(),
            'end_at' => $start->copy()->addHour()->toISOString(),
            'timezone' => 'UTC',
        ])->assertUnprocessable()->assertJsonValidationErrors('start_at');

        $this->assertDatabaseCount('schedules', 0);
    }

    public function test_partial_overlap_conflicts_and_preserves_the_original_schedule(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $start = now()->addDays(3)->startOfDay()->addHours(9);
        $first = [
            'start_at' => $start->toISOString(),
            'end_at' => $start->copy()->addHour()->toISOString(),
            'timezone' => 'UTC',
        ];

        $this->actingAs($clinician)->postJson('/api/v1/schedules', $first)->assertCreated();
        $this->postJson('/api/v1/schedules', [
            ...$first,
            'start_at' => $start->copy()->addMinutes(30)->toISOString(),
            'end_at' => $start->copy()->addHours(2)->toISOString(),
        ])->assertConflict();

        $this->assertDatabaseCount('schedules', 1);
        $this->assertDatabaseCount('slots', 1);
        $this->assertDatabaseCount('audit_logs', 1);
        $this->assertSame(1, Slot::query()->count());
    }

    public function test_database_rejects_zero_duration_schedules_and_slots(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $start = now()->addDays(3);
        $schedule = Schedule::factory()->create([
            'clinician_id' => $clinician->id,
            'start_at' => $start,
            'end_at' => $start->copy()->addHour(),
        ]);

        try {
            $schedule->update(['end_at' => $start]);
            $this->fail('The database accepted a zero-duration schedule.');
        } catch (QueryException) {
            $this->assertDatabaseHas('schedules', ['id' => $schedule->id]);
        }

        $this->expectException(QueryException::class);
        Slot::factory()->for($schedule)->create([
            'clinician_id' => $clinician->id,
            'start_at' => $start,
            'end_at' => $start,
        ]);
    }

    private function createUser(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
