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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_and_assigned_clinician_can_read_their_own_appointment_with_single_encounter(): void
    {
        [$patient, $clinician, $appointment] = $this->appointment();

        $this->actingAs($patient)->getJson("/api/v1/appointments/{$appointment->id}")
            ->assertOk()->assertJsonPath('data.encounter.diagnosis', 'Anxiety')
            ->assertJsonCount(1, 'data.events')
            ->assertJsonMissingPath('data.password');
        $this->actingAs($clinician)->getJson('/api/v1/appointments')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $appointment->id)
            ->assertJsonMissingPath('data.0.events')->assertJsonMissingPath('data.0.encounter');
    }

    public function test_unrelated_patient_admin_and_unassigned_clinician_receive_not_found(): void
    {
        [$patient, , $appointment] = $this->appointment();
        $anotherPatient = $this->createUser(UserRole::Patient);
        $otherClinician = $this->createUser(UserRole::Clinician);
        $admin = $this->createUser(UserRole::Admin);

        foreach ([$anotherPatient, $otherClinician, $admin] as $actor) {
            $this->actingAs($actor)->getJson("/api/v1/appointments/{$appointment->id}")->assertNotFound();
            if ($actor === $admin) {
                $this->getJson('/api/v1/appointments')->assertForbidden();
            } else {
                $this->getJson('/api/v1/appointments')->assertOk()->assertJsonCount(0, 'data');
            }
        }

        $this->actingAs($patient)->getJson('/api/v1/appointments')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_list_date_filters_apply_to_slot_date_with_bounded_pagination(): void
    {
        [$patient, $clinician] = $this->users();
        $first = $this->makeAppointment($patient, $clinician, '2027-01-03 10:00:00');
        $this->makeAppointment($patient, $clinician, '2027-01-04 10:00:00');

        $this->actingAs($patient)->getJson('/api/v1/appointments?date_from=2027-01-03&date_to=2027-01-03&per_page=1')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $first->id)
            ->assertJsonPath('meta.per_page', 1)->assertJsonPath('meta.total', 1);
    }

    private function appointment(): array
    {
        [$patient, $clinician] = $this->users();
        $appointment = $this->makeAppointment($patient, $clinician);
        Encounter::factory()->for($appointment)->create(['diagnosis' => 'Anxiety']);
        AppointmentEvent::factory()->for($appointment)->create(['actor_id' => $patient->id]);

        return [$patient, $clinician, $appointment];
    }

    private function users(): array
    {
        return [$this->createUser(UserRole::Patient), $this->createUser(UserRole::Clinician)];
    }

    private function makeAppointment(User $patient, User $clinician, ?string $start = null): Appointment
    {
        $schedule = Schedule::factory()->create(['clinician_id' => $clinician->id]);
        $slotStart = $start === null ? now()->addDays(3) : now()->parse($start);
        $slot = Slot::factory()->for($schedule)->create([
            'clinician_id' => $clinician->id,
            'start_at' => $slotStart,
            'end_at' => $slotStart->copy()->addHour(),
            'status' => 'PENDING',
        ]);

        return Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'PENDING',
        ]);
    }

    private function createUser(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
