<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentityProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_active_user_can_update_only_their_name(): void
    {
        $user = User::factory()->create();
        UserProfile::factory()->for($user)->create();

        $this->actingAs($user)->patchJson('/api/v1/me', [
            'name' => ' New Name ', 'role' => 'superadmin', 'status' => 'suspended', 'diagnosis_id' => 'x',
        ])->assertUnprocessable()->assertJsonValidationErrors(['role', 'status', 'diagnosis_id']);
        $this->assertNotSame('New Name', $user->fresh()->name);

        $this->actingAs($user)->patchJson('/api/v1/me', ['name' => ' New Name '])->assertOk()
            ->assertJsonPath('data.name', 'New Name');
    }
}
