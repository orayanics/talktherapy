<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Diagnosis;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Sudo User', 'email' => 'sudo@example.com', 'role' => UserRole::Superadmin],
            ['name' => 'Admin User', 'email' => 'admin@example.com', 'role' => UserRole::Admin],
            ['name' => 'Clinician User', 'email' => 'clinician@example.com', 'role' => UserRole::Clinician],
            ['name' => 'Aphasia Patient', 'email' => 'patient.aphasia@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'APH'],
            ['name' => 'Stuttering Patient', 'email' => 'patient.stuttering@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'STUT'],
            ['name' => 'Autism Patient', 'email' => 'patient.autism@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'ASD'],
            ['name' => 'ADHD Patient', 'email' => 'patient.adhd@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'ADHD'],
            ['name' => 'GDD Patient', 'email' => 'patient.gdd@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'GDD'],
            ['name' => 'Down Patient', 'email' => 'patient.down@example.com', 'role' => UserRole::Patient, 'diagnosis' => 'DS'],
        ];

        foreach ($users as $attributes) {
            $user = User::query()->updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ],
            );

            UserProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'role' => $attributes['role'],
                    'status' => UserStatus::Active,
                    'diagnosis_id' => isset($attributes['diagnosis'])
                        ? Diagnosis::query()->where('value', $attributes['diagnosis'])->value('id')
                        : null,
                ],
            );
        }
    }
}
