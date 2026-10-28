<?php

namespace Tests\Feature;

use App\Models\ActivationChallenge;
use App\Models\AuditLog;
use App\Models\ConsentEvidence;
use App\Models\Diagnosis;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthorizationPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_diagnoses_are_publicly_readable_but_not_mutable(): void
    {
        $diagnosis = new Diagnosis;

        $this->assertTrue(Gate::allows('viewAny', Diagnosis::class));
        $this->assertTrue(Gate::allows('view', $diagnosis));
        $this->assertFalse(Gate::allows('create', Diagnosis::class));
    }

    #[DataProvider('privilegedRoles')]
    public function test_administrators_can_view_all_users_but_cannot_update_them(string $role): void
    {
        $actor = $this->createUser($role);
        $otherUser = $this->createUser('patient');

        $this->assertTrue($actor->can('viewAny', User::class));
        $this->assertTrue($actor->can('view', $otherUser));
        $this->assertTrue($actor->can('view', $otherUser->profile));
        $this->assertFalse($actor->can('update', $otherUser));
    }

    public function test_user_can_only_view_and_update_their_own_account_and_profile(): void
    {
        $actor = $this->createUser('patient');
        $otherUser = $this->createUser('patient');

        $this->assertTrue($actor->can('view', $actor));
        $this->assertTrue($actor->can('update', $actor));
        $this->assertTrue($actor->can('view', $actor->profile));
        $this->assertTrue($actor->can('update', $actor->profile));
        $this->assertFalse($actor->can('viewAny', User::class));
        $this->assertFalse($actor->can('view', $otherUser));
        $this->assertFalse($actor->can('update', $otherUser));
        $this->assertFalse($actor->can('view', $otherUser->profile));
        $this->assertFalse($actor->can('update', $otherUser->profile));
    }

    /** @param class-string<Model> $modelClass */
    #[DataProvider('internalModels')]
    public function test_internal_models_deny_direct_access_by_default(string $modelClass): void
    {
        $actor = $this->createUser('superadmin');

        $this->assertFalse($actor->can('viewAny', $modelClass));
        $this->assertFalse($actor->can('view', new $modelClass));
        $this->assertFalse($actor->can('create', $modelClass));
    }

    /** @return array<string, array{string}> */
    public static function privilegedRoles(): array
    {
        return [
            'admin' => ['admin'],
            'superadmin' => ['superadmin'],
        ];
    }

    /** @return array<string, array{class-string<Model>}> */
    public static function internalModels(): array
    {
        return [
            'activation challenge' => [ActivationChallenge::class],
            'audit log' => [AuditLog::class],
            'consent evidence' => [ConsentEvidence::class],
            'outbox message' => [OutboxMessage::class],
        ];
    }

    private function createUser(string $role): User
    {
        $user = User::factory()->create();
        UserProfile::factory()->for($user)->create(['role' => $role]);

        return $user;
    }
}
