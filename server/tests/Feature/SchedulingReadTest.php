<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Diagnosis;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\User;
use App\Models\UserProfile;
use App\Policies\SlotPolicy;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchedulingReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinician_reads_own_hidden_and_historical_slots_only(): void
    {
        $clinician = $this->createUser(UserRole::Clinician);
        $otherClinician = $this->createUser(UserRole::Clinician);
        $hiddenPast = $this->createSlot($clinician, now()->subDays(2), status: 'CANCELLED', hidden: true);
        $visibleFuture = $this->createSlot($clinician, now()->addDays(2));
        $this->createSlot($otherClinician, now()->addDays(1));

        $this->actingAs($clinician)->getJson('/api/v1/slots?sort=asc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $hiddenPast->id)
            ->assertJsonPath('data.0.is_hidden', true)
            ->assertJsonPath('data.1.id', $visibleFuture->id)
            ->assertJsonPath('data.1.clinician.id', $clinician->id)
            ->assertJsonMissingPath('data.1.clinician.email');
    }

    public function test_patient_reads_only_future_free_visible_slots_and_can_filter_diagnosis_and_range(): void
    {
        $patient = $this->createUser(UserRole::Patient);
        $adhd = Diagnosis::factory()->create(['value' => 'ADHD']);
        $asd = Diagnosis::factory()->create(['value' => 'ASD']);
        $clinician = $this->createUser(UserRole::Clinician, diagnosis: $adhd);
        $otherClinician = $this->createUser(UserRole::Clinician, diagnosis: $asd);
        $date = CarbonImmutable::now('UTC')->addDays(5)->startOfDay()->addHours(9);
        $available = $this->createSlot($clinician, $date);
        $this->createSlot($clinician, $date->subDay());
        $this->createSlot($clinician, $date->addDay());
        $this->createSlot($clinician, $date->addDay(), hidden: true);
        $this->createSlot($clinician, $date->addDays(2), status: 'PENDING');
        $this->createSlot($clinician, CarbonImmutable::now('UTC')->subDay());
        $this->createSlot($otherClinician, $date->addDays(3));

        $this->actingAs($patient)
            ->getJson('/api/v1/slots?date_from='.$date->toDateString().'&date_to='.$date->toDateString().'&clinician_id='.$clinician->id.'&diagnosis_values[]=ADHD')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $available->id)
            ->assertJsonPath('data.0.clinician.diagnosis.value', 'ADHD')
            ->assertJsonMissingPath('data.0.is_hidden')
            ->assertJsonMissingPath('data.0.clinician.email');
    }

    public function test_patient_does_not_see_slots_from_inactive_or_unverified_clinicians(): void
    {
        $patient = $this->createUser(UserRole::Patient);
        $activeClinician = $this->createUser(UserRole::Clinician);
        $suspendedClinician = $this->createUser(UserRole::Clinician, status: UserStatus::Suspended);
        $unverifiedClinician = $this->createUser(UserRole::Clinician, verified: false);
        $activeSlot = $this->createSlot($activeClinician, now()->addDays(3));
        $this->createSlot($suspendedClinician, now()->addDays(3));
        $this->createSlot($unverifiedClinician, now()->addDays(3));

        $this->actingAs($patient)->getJson('/api/v1/slots')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $activeSlot->id);
    }

    public function test_patient_cannot_read_hidden_slot_and_clinician_cannot_read_another_clinicians_slot(): void
    {
        $patient = $this->createUser(UserRole::Patient);
        $clinician = $this->createUser(UserRole::Clinician);
        $otherClinician = $this->createUser(UserRole::Clinician);
        $hidden = $this->createSlot($clinician, now()->addDays(3), hidden: true);
        $otherClinicianSlot = $this->createSlot($otherClinician, now()->addDays(4));

        $this->actingAs($patient)->getJson("/api/v1/slots/{$hidden->id}")->assertForbidden();
        $this->actingAs($clinician)->getJson("/api/v1/slots/{$otherClinicianSlot->id}")->assertForbidden();
    }

    public function test_only_active_verified_patients_and_clinicians_can_list_slots(): void
    {
        $admin = $this->createUser(UserRole::Admin);
        $unverified = $this->createUser(UserRole::Patient, verified: false);
        $suspended = $this->createUser(UserRole::Patient, status: UserStatus::Suspended);
        $slot = $this->createSlot($this->createUser(UserRole::Clinician), now()->addDays(3));

        $this->actingAs($admin)->getJson('/api/v1/slots')->assertForbidden();
        $this->actingAs($unverified)->getJson('/api/v1/slots')->assertForbidden();
        $this->actingAs($suspended)->getJson('/api/v1/slots')->assertForbidden();

        $this->assertTrue(app(SlotPolicy::class)->view($this->createUser(UserRole::Patient), $slot->load('clinician.profile')));
    }

    public function test_date_range_rejects_an_upper_bound_before_the_lower_bound(): void
    {
        $patient = $this->createUser(UserRole::Patient);

        $this->actingAs($patient)->getJson('/api/v1/slots?date_from=2027-02-02&date_to=2027-02-01')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('date_to');
    }

    private function createSlot(User $clinician, DateTimeInterface $startsAt, string $status = 'FREE', bool $hidden = false): Slot
    {
        $start = CarbonImmutable::instance($startsAt)->utc();
        $end = $start->addHour();
        $schedule = Schedule::factory()->create([
            'clinician_id' => $clinician->id,
            'start_at' => $start,
            'end_at' => $end,
        ]);

        return Slot::factory()->for($schedule)->create([
            'clinician_id' => $clinician->id,
            'start_at' => $start,
            'end_at' => $end,
            'status' => $status,
            'is_hidden' => $hidden,
        ]);
    }

    private function createUser(
        UserRole $role,
        bool $verified = true,
        UserStatus $status = UserStatus::Active,
        ?Diagnosis $diagnosis = null,
    ): User {
        $user = User::factory()->create(['email_verified_at' => $verified ? now() : null]);
        UserProfile::factory()->for($user)->create([
            'role' => $role,
            'status' => $status,
            'diagnosis_id' => $diagnosis?->id,
        ]);

        return $user->load('profile');
    }
}
