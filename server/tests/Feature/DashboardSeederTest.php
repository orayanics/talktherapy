<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\ClinicianPatient;
use App\Models\Schedule;
use App\Models\Slot;
use App\Models\SlpAttempt;
use App\Models\SlpRecording;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_seed_is_repeatable_and_covers_dashboard_states(): void
    {
        $today = CarbonImmutable::now()->startOfDay();
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertCount(7, Schedule::query()->get());
        $this->assertCount(7, Slot::query()->get());
        $this->assertCount(5, Appointment::query()->get());
        $this->assertCount(3, ClinicianPatient::query()->get());
        $this->assertCount(1, SlpAttempt::query()->get());
        $this->assertCount(1, SlpRecording::query()->get());
        $this->assertSame(2, Slot::query()->where('status', 'COMPLETED')->count());
        $this->assertSame(1, Slot::query()->where('status', 'PENDING')->count());
        $this->assertSame(2, Slot::query()->where('status', 'FREE')->count());

        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $this->actingAs($admin)
            ->getJson('/api/v1/dashboard/summary?date_from='.$today->subDays(3)->toDateString().'&date_to='.$today->addDays(3)->toDateString())
            ->assertOk()
            ->assertJsonPath('data.appointments.total', 5)
            ->assertJsonPath('data.appointments.rates.completed', 0.4);
    }
}
