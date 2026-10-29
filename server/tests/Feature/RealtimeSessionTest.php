<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RealtimeSessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_receives_a_generation_bound_session_descriptor(): void
    {
        [$patient, , $appointment] = $this->acceptedAppointment();

        $this->actingAs($patient)->postJson("/api/v1/appointments/{$appointment->id}/session")
            ->assertOk()
            ->assertJsonPath('data.appointment_id', $appointment->id)
            ->assertJsonPath('data.generation', 0)
            ->assertJsonPath('data.channel', "sessions.{$appointment->id}.0")
            ->assertJsonMissingPath('data.token');
    }

    public function test_unrelated_user_cannot_get_a_session_descriptor(): void
    {
        [, , $appointment] = $this->acceptedAppointment();
        $other = $this->user(UserRole::Patient);

        $this->actingAs($other)->postJson("/api/v1/appointments/{$appointment->id}/session")
            ->assertNotFound();
    }

    public function test_signal_rejects_stale_generation_and_cross_room_target(): void
    {
        [$patient, $clinician, $appointment] = $this->acceptedAppointment();

        $this->actingAs($patient)->postJson("/api/v1/appointments/{$appointment->id}/signals", [
            'type' => 'ready', 'generation' => 1,
        ])->assertConflict();

        $other = $this->user(UserRole::Patient);
        $this->actingAs($patient)->postJson("/api/v1/appointments/{$appointment->id}/signals", [
            'type' => 'ready', 'generation' => 0, 'target_peer_id' => $other->id,
        ])->assertUnprocessable();

        $this->assertSame('ACCEPTED', $appointment->fresh()->status);
        $this->assertSame($clinician->id, $appointment->fresh()->clinician_id);
    }

    public function test_signal_validates_type_specific_payload_bounds(): void
    {
        [$patient, , $appointment] = $this->acceptedAppointment();

        $this->actingAs($patient)->postJson("/api/v1/appointments/{$appointment->id}/signals", [
            'type' => 'offer', 'generation' => 0,
        ])->assertUnprocessable();

        $this->actingAs($patient)->postJson("/api/v1/appointments/{$appointment->id}/signals", [
            'type' => 'chat_message', 'generation' => 0, 'text' => str_repeat('x', 2001),
        ])->assertUnprocessable();
    }

    private function acceptedAppointment(): array
    {
        $patient = $this->user(UserRole::Patient);
        $clinician = $this->user(UserRole::Clinician);
        $schedule = Schedule::factory()->create(['clinician_id' => $clinician->id]);
        $slot = Slot::factory()->for($schedule)->create([
            'clinician_id' => $clinician->id,
            'status' => 'ACCEPTED',
        ]);
        $appointment = Appointment::factory()->for($slot)->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'status' => 'ACCEPTED',
            'confirmed_at' => now(),
            'room_id' => (string) Str::uuid(),
        ]);

        return [$patient, $clinician, $appointment];
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->profile()->create(['role' => $role, 'status' => 'active']);

        return $user->load('profile');
    }
}
