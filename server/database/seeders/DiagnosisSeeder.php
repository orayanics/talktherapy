<?php

namespace Database\Seeders;

use App\Models\Diagnosis;
use Illuminate\Database\Seeder;

class DiagnosisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diagnoses = [
            ['value' => 'ASD', 'label' => 'Autism Spectrum Disorder'],
            ['value' => 'ADHD', 'label' => 'Attention-Deficit Hyperactivity Disorder'],
            ['value' => 'GDD', 'label' => 'Global Developmental Delay'],
            ['value' => 'CP', 'label' => 'Cerebral Palsy'],
            ['value' => 'DS', 'label' => 'Down Syndrome'],
            ['value' => 'HI', 'label' => 'Hearing Impairment'],
            ['value' => 'CLP', 'label' => 'Cleft Lip and/or Palate'],
            ['value' => 'STR', 'label' => 'Stroke'],
            ['value' => 'STUT', 'label' => 'Stuttering'],
            ['value' => 'APH', 'label' => 'Aphasia'],
            ['value' => 'OTH', 'label' => 'Others'],
        ];

        foreach ($diagnoses as $diagnosis) {
            Diagnosis::query()->updateOrCreate(
                ['id' => 'diagnosis-'.strtolower($diagnosis['value'])],
                $diagnosis,
            );
        }
    }
}
