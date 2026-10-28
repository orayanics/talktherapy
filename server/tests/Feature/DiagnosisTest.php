<?php

namespace Tests\Feature;

use App\Models\Diagnosis;
use Database\Seeders\DiagnosisSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnosisTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_is_ordered_and_exposes_only_contract_fields(): void
    {
        Diagnosis::factory()->create(['id' => 'diagnosis-z', 'label' => 'Zulu', 'value' => 'Z', 'created_at' => now()->subDay()]);
        Diagnosis::factory()->create(['id' => 'diagnosis-a', 'label' => 'Alpha', 'value' => 'A', 'created_at' => now()]);

        $this->getJson('/api/v1/diagnoses')->assertOk()->assertExactJson([
            'data' => [
                ['id' => 'diagnosis-a', 'label' => 'Alpha', 'value' => 'A'],
                ['id' => 'diagnosis-z', 'label' => 'Zulu', 'value' => 'Z'],
            ],
        ]);
    }

    public function test_reference_seeding_is_idempotent_and_stable(): void
    {
        $this->seed(DiagnosisSeeder::class);
        $first = Diagnosis::query()->orderBy('id')->pluck('id', 'value');

        $this->seed(DiagnosisSeeder::class);

        $this->assertCount(11, $first);
        $this->assertSame($first->all(), Diagnosis::query()->orderBy('id')->pluck('id', 'value')->all());
        $this->assertSame('diagnosis-asd', $first['ASD']);
    }
}
