<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\AppointmentEvent;
use App\Models\Encounter;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AppointmentInvariantTest extends TestCase
{
    use RefreshDatabase;

    public function test_rejected_history_remains_while_the_slot_can_be_claimed_again(): void
    {
        [$patient, $clinician, $slot] = $this->bookingRecords();
        $appointment = Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'PENDING',
        ]);
        AppointmentEvent::factory()->for($appointment)->create([
            'actor_id' => $clinician->id,
            'actor_type' => 'clinician',
            'from_status' => 'PENDING',
            'to_status' => 'REJECT',
        ]);
        $appointment->update(['status' => 'REJECT']);

        Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseCount('appointments', 2);
        $this->assertDatabaseCount('appointment_events', 1);
    }

    public function test_database_rejects_two_active_claims_for_one_slot(): void
    {
        [$patient, $clinician, $slot] = $this->bookingRecords();
        Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'ACCEPTED',
        ]);

        $this->expectException(QueryException::class);
        Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'PENDING',
        ]);
    }

    public function test_encounter_is_one_per_appointment_and_policy_requires_a_participant(): void
    {
        [$patient, $clinician, $slot] = $this->bookingRecords();
        $appointment = Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
        ]);
        Encounter::factory()->for($appointment)->create();

        $this->assertFalse(Gate::forUser($this->createUser(UserRole::Admin))->allows('view', $appointment));
        $this->assertTrue(Gate::forUser($patient)->allows('view', $appointment));
        $this->assertTrue(Gate::forUser($clinician)->allows('view', $appointment));

        $this->expectException(QueryException::class);
        Encounter::factory()->for($appointment)->create();
    }

    /** @return array{User, User, Slot} */
    private function bookingRecords(): array
    {
        $patient = $this->createUser(UserRole::Patient);
        $clinician = $this->createUser(UserRole::Clinician);
        $schedule = Schedule::factory()->create(['clinician_id' => $clinician->id]);
        $slot = Slot::factory()->for($schedule)->create(['clinician_id' => $clinician->id]);

        return [$patient, $clinician, $slot];
    }

    private function createUser(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
