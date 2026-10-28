<?php

namespace Tests\Feature;

use App\Enums\UserStatus;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeds_repeatable_active_users_for_each_role_with_the_default_password(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $users = User::query()->with('profile')->get()->keyBy('email');

        $this->assertCount(4, $users);
        $this->assertSame('superadmin', $users['sudo@example.com']->profile->role->value);
        $this->assertSame('admin', $users['admin@example.com']->profile->role->value);
        $this->assertSame('clinician', $users['clinician@example.com']->profile->role->value);
        $this->assertSame('patient', $users['patient@example.com']->profile->role->value);

        foreach ($users as $user) {
            $this->assertSame(UserStatus::Active, $user->profile->status);
            $this->assertNotNull($user->email_verified_at);
            $this->assertTrue(Hash::check('password', $user->password));
        }
    }
}
