<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
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
            ['name' => 'Patient User', 'email' => 'patient@example.com', 'role' => UserRole::Patient],
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
                ['role' => $attributes['role'], 'status' => UserStatus::Active],
            );
        }
    }
}
