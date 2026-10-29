<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\ClinicianPatient;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AppointmentTransitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_clinician_accepts_once_and_receives_a_unique_room_id(): void
    {
        [$patient, $clinician, $appointment] = $this->appointment();

        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$appointment->id}/accept")
            ->assertOk()->assertJsonPath('data.status', 'ACCEPTED');
        $accepted = $appointment->fresh();
        $this->assertNotNull($accepted->confirmed_at);
        $this->assertNotNull($accepted->room_id);
        $this->assertDatabaseHas('slots', ['id' => $appointment->slot_id, 'status' => 'ACCEPTED']);
        $this->assertDatabaseHas('appointment_events', [
            'appointment_id' => $appointment->id,
            'actor_id' => $clinician->id,
            'from_status' => 'PENDING',
            'to_status' => 'ACCEPTED',
        ]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'appointment.accepted', 'entity_id' => $appointment->id]);
        $this->assertDatabaseHas('outbox_messages', ['aggregate_id' => $appointment->id, 'recipient_id' => $patient->id]);
        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$appointment->id}/accept")->assertConflict();
        $this->assertDatabaseCount('appointment_events', 1);
    }

    public function test_rejection_and_cancellation_enforce_exact_24_hour_boundary_and_slot_outcomes(): void
    {
        [$patient, $clinician, $appointment] = $this->appointmentAt('2027-01-02 12:00:00');
        $this->travelTo('2027-01-01 12:00:00');

        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$appointment->id}/reject", [
            'reason' => 'Unavailable',
        ])->assertOk()->assertJsonPath('data.status', 'REJECT');
        $this->assertDatabaseHas('slots', ['id' => $appointment->slot_id, 'status' => 'FREE', 'is_hidden' => false]);

        $second = $this->makeAppointment($patient, $clinician, '2027-01-02 12:00:00');
        $this->travelTo('2027-01-01 12:00:01');
        $this->actingAs($patient)->postJson("/api/v1/appointments/{$second->id}/cancel", ['reason' => 'Changed plans'])
            ->assertUnprocessable();
        $this->assertSame('PENDING', $second->fresh()->status);

        $this->travelTo('2027-01-01 12:00:00');
        $this->postJson("/api/v1/appointments/{$second->id}/cancel", ['reason' => 'Changed plans'])
            ->assertOk()->assertJsonPath('data.status', 'CANCELLED');
        $this->assertDatabaseHas('slots', ['id' => $second->slot_id, 'status' => 'CANCELLED']);
        $this->assertNotNull($second->fresh()->cancelled_at);
    }

    public function test_rejection_can_hide_slot_and_unrelated_actor_cannot_transition(): void
    {
        [$patient, $clinician, $appointment] = $this->appointment();
        $other = $this->createUser(UserRole::Clinician);

        $this->actingAs($other)->postJson("/api/v1/appointments/{$appointment->id}/accept")->assertNotFound();
        $this->assertSame('PENDING', $appointment->fresh()->status);
        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$appointment->id}/reject", [
            'reason' => 'Unavailable',
            'is_hidden' => true,
        ])->assertOk();
        $this->assertDatabaseHas('slots', ['id' => $appointment->slot_id, 'status' => 'REJECT', 'is_hidden' => true]);
        $this->assertSame(1, AuditLog::query()->where('action', 'appointment.rejected')->count());
    }

    public function test_completion_creates_unique_care_pair_and_preserves_first_completion(): void
    {
        [$patient, $clinician, $first] = $this->appointmentAt('2027-01-02 12:00:00', 'ACCEPTED');
        $first->update(['confirmed_at' => now(), 'room_id' => (string) Str::uuid()]);
        $this->travelTo('2027-01-03 12:00:00');

        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$first->id}/complete")
            ->assertOk()->assertJsonPath('data.status', 'COMPLETED');
        $firstCompletedAt = ClinicianPatient::query()->sole()->first_completed_at;
        $this->assertDatabaseHas('slots', ['id' => $first->slot_id, 'status' => 'COMPLETED']);

        $second = $this->makeAppointment($patient, $clinician, '2027-01-02 13:00:00', 'ACCEPTED');
        $second->update(['confirmed_at' => now(), 'room_id' => (string) Str::uuid()]);
        $this->actingAs($clinician)->postJson("/api/v1/appointments/{$second->id}/complete")->assertOk();

        $this->assertSame(1, ClinicianPatient::query()->count());
        $this->assertTrue($firstCompletedAt->equalTo(ClinicianPatient::query()->sole()->first_completed_at));
        $this->assertSame('COMPLETED', $second->fresh()->status);
    }

    private function appointment(): array
    {
        $patient = $this->createUser(UserRole::Patient);
        $clinician = $this->createUser(UserRole::Clinician);

        return [$patient, $clinician, $this->makeAppointment($patient, $clinician)];
    }

    private function appointmentAt(string $start, string $status = 'PENDING'): array
    {
        $patient = $this->createUser(UserRole::Patient);
        $clinician = $this->createUser(UserRole::Clinician);

        return [$patient, $clinician, $this->makeAppointment($patient, $clinician, $start, $status)];
    }

    private function makeAppointment(User $patient, User $clinician, ?string $start = null, string $status = 'PENDING'): Appointment
    {
        $schedule = Schedule::factory()->create(['clinician_id' => $clinician->id]);
        $slotStart = $start === null ? now()->addDays(3) : now()->parse($start);
        $slot = Slot::factory()->for($schedule)->create([
            'clinician_id' => $clinician->id,
            'start_at' => $slotStart,
            'end_at' => $slotStart->copy()->addHour(),
            'status' => $status,
        ]);

        return Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => $status,
        ]);
    }

    private function createUser(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
