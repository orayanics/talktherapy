<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class UserAdminReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_when_the_actor_is_unauthenticated(): void
    {
        $this->getJson('/api/v1/users')->assertUnauthorized();
    }

    #[DataProvider('unprivilegedRoles')]
    public function test_returns_403_when_the_actor_is_not_an_administrator(string $role): void
    {
        $actor = $this->createUser($role);

        $this->actingAs($actor)->getJson('/api/v1/users')->assertForbidden();
    }

    public function test_returns_403_when_an_unprivileged_actor_requests_user_counts(): void
    {
        $actor = $this->createUser('patient');

        $this->actingAs($actor)->getJson('/api/v1/users/counts')->assertForbidden();
    }

    public function test_administrator_can_filter_sort_and_paginate_safe_user_fields(): void
    {
        $actor = $this->createUser('admin', name: 'Admin Actor');
        $first = $this->createUser('clinician', 'active', 'Alice Clinician');
        $this->createUser('clinician', 'active', 'Alicia Clinician');
        $this->createUser('clinician', 'suspended', 'Alison Clinician');
        $this->createUser('patient', 'active', 'Alice Patient');

        $response = $this->actingAs($actor)->getJson('/api/v1/users?search=ali&roles[]=clinician&statuses[]=active&sort_by=name&sort=asc&per_page=1');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $first->id)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.remember_token')
            ->assertJsonMissingPath('data.0.activation_challenges')
            ->assertJsonMissingPath('data.0.consent_evidence');
    }

    public function test_counts_apply_search_and_role_filters_with_explicit_status_buckets(): void
    {
        $actor = $this->createUser('superadmin', name: 'Admin Actor');
        $this->createUser('clinician', 'active', 'Team Active');
        $this->createUser('clinician', 'pending', 'Team Pending');
        $this->createUser('clinician', 'suspended', 'Team Suspended');
        $this->createUser('patient', 'active', 'Team Patient');
        $this->createUser('clinician', 'active', 'Other Clinician');

        $response = $this->actingAs($actor)->getJson('/api/v1/users/counts?search=team&roles[]=clinician');

        $response->assertOk()->assertExactJson([
            'data' => [
                'counts' => [
                    'total' => 3,
                    'pending' => 1,
                    'active' => 1,
                    'suspended' => 1,
                ],
            ],
        ]);
    }

    public function test_superadministrator_can_read_safe_user_detail(): void
    {
        $actor = $this->createUser('superadmin');
        $user = $this->createUser('patient', 'active', 'Patient Name');

        $response = $this->actingAs($actor)->getJson("/api/v1/users/{$user->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.name', 'Patient Name')
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');
    }

    public function test_user_can_read_their_own_safe_detail(): void
    {
        $user = $this->createUser('patient', name: 'Own Patient');

        $this->actingAs($user)->getJson("/api/v1/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.name', 'Own Patient')
            ->assertJsonMissingPath('data.password');
    }

    public function test_returns_404_for_an_unknown_user(): void
    {
        $actor = $this->createUser('admin');

        $this->actingAs($actor)
            ->getJson('/api/v1/users/00000000-0000-4000-8000-000000000000')
            ->assertNotFound();
    }

    public function test_unprivileged_actor_cannot_distinguish_existing_and_unknown_users(): void
    {
        $actor = $this->createUser('patient');
        $user = $this->createUser('clinician');

        $this->actingAs($actor)->getJson("/api/v1/users/{$user->id}")->assertForbidden();
        $this->actingAs($actor)
            ->getJson('/api/v1/users/00000000-0000-4000-8000-000000000000')
            ->assertForbidden();
    }

    #[DataProvider('invalidQueries')]
    public function test_returns_422_for_invalid_list_filters(string $query): void
    {
        $actor = $this->createUser('admin');

        $this->actingAs($actor)->getJson("/api/v1/users?{$query}")->assertUnprocessable();
    }

    /** @return array<string, array{string}> */
    public static function unprivilegedRoles(): array
    {
        return [
            'patient' => ['patient'],
            'clinician' => ['clinician'],
        ];
    }

    /** @return array<string, array{string}> */
    public static function invalidQueries(): array
    {
        return [
            'non-string search' => ['search[]=x'],
            'unknown role' => ['roles[]=owner'],
            'unknown status' => ['statuses[]=deleted'],
            'unsafe sort column' => ['sort_by=password'],
            'unsafe sort direction' => ['sort=sideways'],
            'oversized page' => ['per_page=101'],
        ];
    }

    private function createUser(
        string $role,
        string $status = 'active',
        ?string $name = null,
    ): User {
        $user = User::factory()->create(array_filter(['name' => $name]));
        UserProfile::factory()->for($user)->create(compact('role', 'status'));

        return $user;
    }
}
