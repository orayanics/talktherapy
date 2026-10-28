<?php

namespace Tests\Feature;

use App\Actions\BookAppointment;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\Encounter;
use App\Models\OutboxMessage;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AppointmentBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_books_visible_future_slot_and_server_sets_ownership_and_side_effects(): void
    {
        [$patient, $clinician, $slot] = $this->bookingRecords();

        $response = $this->actingAs($patient)->postJson("/api/v1/slots/{$slot->id}/book", [
            'patient_id' => $clinician->id,
            'clinician_id' => $patient->id,
            'status' => 'ACCEPTED',
            'encounter' => [
                'diagnosis' => 'Anxiety',
                'chief_complaint' => 'Trouble sleeping',
                'referral_source' => 'Primary care',
                'referral_url' => 'https://example.org/referral',
            ],
        ])->assertCreated()->assertJsonPath('data.status', 'PENDING')
            ->assertJsonPath('data.patient.id', $patient->id)
            ->assertJsonPath('data.clinician.id', $clinician->id)
            ->assertJsonPath('data.encounter.referral_url', 'https://example.org/referral')
            ->assertHeader('X-Request-ID');

        $appointment = Appointment::query()->findOrFail($response->json('data.id'));
        $this->assertSame($patient->id, $appointment->patient_id);
        $this->assertSame($clinician->id, $appointment->clinician_id);
        $this->assertDatabaseHas('slots', ['id' => $slot->id, 'status' => 'PENDING']);
        $this->assertDatabaseHas('appointment_events', [
            'appointment_id' => $appointment->id,
            'actor_id' => $patient->id,
            'actor_type' => 'patient',
            'from_status' => null,
            'to_status' => 'PENDING',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'appointment.booked',
            'entity_id' => $appointment->id,
            'request_id' => $response->headers->get('X-Request-ID'),
        ]);
        $this->assertSame(2, OutboxMessage::query()->where('aggregate_id', $appointment->id)->count());
        $this->assertModelExists(Encounter::query()->where('appointment_id', $appointment->id)->firstOrFail());
    }

    #[DataProvider('nonPatientRoles')]
    public function test_non_patients_cannot_book_a_slot(string $role): void
    {
        [$patient, , $slot] = $this->bookingRecords();
        $actor = $role === 'clinician' ? $this->createUser(UserRole::Clinician) : $this->createUser(UserRole::from($role));

        $this->actingAs($actor)->postJson("/api/v1/slots/{$slot->id}/book", ['encounter' => $this->encounter()])
            ->assertForbidden();

        $this->assertDatabaseCount('appointments', 0);
        $this->assertDatabaseHas('slots', ['id' => $slot->id, 'status' => 'FREE']);
    }

    public static function nonPatientRoles(): array
    {
        return [
            'clinician' => ['clinician'],
            'admin' => ['admin'],
            'superadmin' => ['superadmin'],
        ];
    }

    public function test_invalid_intake_rolls_back_every_booking_write(): void
    {
        [$patient, , $slot] = $this->bookingRecords();

        $this->actingAs($patient)->postJson("/api/v1/slots/{$slot->id}/book", [
            'encounter' => [...$this->encounter(), 'referral_url' => 'javascript:alert(1)'],
        ])->assertUnprocessable()->assertJsonValidationErrors('encounter.referral_url');

        $this->assertDatabaseCount('appointments', 0);
        $this->assertDatabaseCount('encounters', 0);
        $this->assertDatabaseCount('appointment_events', 0);
        $this->assertDatabaseCount('audit_logs', 0);
        $this->assertDatabaseCount('outbox_messages', 0);
        $this->assertDatabaseHas('slots', ['id' => $slot->id, 'status' => 'FREE']);
    }

    public function test_hidden_or_past_slot_cannot_be_booked_and_an_already_claimed_slot_conflicts(): void
    {
        [$patient, , $slot] = $this->bookingRecords();

        $this->actingAs($patient)->postJson("/api/v1/slots/{$slot->id}/book", ['encounter' => $this->encounter()])
            ->assertCreated();
        $this->postJson("/api/v1/slots/{$slot->id}/book", ['encounter' => $this->encounter()])
            ->assertConflict();

        $hiddenSlot = $this->newSlot($slot->clinician_id, ['is_hidden' => true]);
        $this->postJson("/api/v1/slots/{$hiddenSlot->id}/book", ['encounter' => $this->encounter()])->assertNotFound();

        $pastSlot = $this->newSlot($slot->clinician_id, [
            'start_at' => now()->subMinute(),
            'end_at' => now()->addMinutes(59),
        ]);
        $this->postJson("/api/v1/slots/{$pastSlot->id}/book", ['encounter' => $this->encounter()])->assertConflict();
        $this->assertDatabaseCount('appointments', 1);
    }

    public function test_suspended_clinician_availability_cannot_be_booked(): void
    {
        [$patient, $clinician, $slot] = $this->bookingRecords();
        $clinician->profile->update(['status' => UserStatus::Suspended]);

        $this->actingAs($patient)->postJson("/api/v1/slots/{$slot->id}/book", ['encounter' => $this->encounter()])
            ->assertNotFound();

        $this->assertDatabaseCount('appointments', 0);
        $this->assertDatabaseHas('slots', ['id' => $slot->id, 'status' => 'FREE']);
    }

    public function test_outbox_failure_rolls_back_the_booking_transaction(): void
    {
        [$patient, , $slot] = $this->bookingRecords();
        DB::unprepared("CREATE TRIGGER fail_appointment_outbox BEFORE INSERT ON outbox_messages BEGIN SELECT RAISE(ABORT, 'outbox unavailable'); END");

        try {
            app(BookAppointment::class)->book($patient, $slot, $this->encounter(), null);
            $this->fail('The outbox failure should abort booking.');
        } catch (QueryException) {
            $this->assertDatabaseCount('appointments', 0);
            $this->assertDatabaseCount('encounters', 0);
            $this->assertDatabaseCount('appointment_events', 0);
            $this->assertDatabaseCount('audit_logs', 0);
            $this->assertDatabaseHas('slots', ['id' => $slot->id, 'status' => 'FREE']);
        }
    }

    private function bookingRecords(): array
    {
        $patient = $this->createUser(UserRole::Patient);
        $clinician = $this->createUser(UserRole::Clinician);

        return [$patient, $clinician, $this->newSlot($clinician->id)];
    }

    private function newSlot(string $clinicianId, array $attributes = []): Slot
    {
        $schedule = Schedule::factory()->create(['clinician_id' => $clinicianId]);

        return Slot::factory()->for($schedule)->create(['clinician_id' => $clinicianId, ...$attributes]);
    }

    private function createUser(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }

    private function encounter(): array
    {
        return [
            'diagnosis' => 'Anxiety',
            'chief_complaint' => 'Trouble sleeping',
            'referral_source' => 'Primary care',
            'referral_url' => null,
        ];
    }
}
