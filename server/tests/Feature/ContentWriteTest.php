<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Content;
use App\Models\Diagnosis;
use App\Models\Tag;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ContentWriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_content_with_normalized_author_scoped_tags(): void
    {
        $admin = $this->createAdmin();
        $diagnosis = Diagnosis::factory()->create();
        $otherUser = User::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/content', [
            'title' => 'Grounding strategies',
            'description' => 'Practical guidance',
            'body' => "# Notice\n\nContent body.",
            'diagnosis_id' => $diagnosis->id,
            'tag_names' => ['Grief & loss', 'grief loss', '  mindfulness  '],
            'author_id' => $otherUser->id,
        ])->assertCreated()
            ->assertJsonPath('data.author.id', $admin->id)
            ->assertJsonPath('data.diagnosis.id', $diagnosis->id)
            ->assertJsonCount(2, 'data.tags');

        $content = Content::query()->with('tags')->findOrFail($response->json('data.id'));
        $this->assertSame($admin->id, $content->author_id);
        $this->assertEqualsCanonicalizing(['grief-loss', 'mindfulness'], $content->tags->pluck('slug')->all());
        $this->assertSame(2, Tag::query()->where('author_id', $admin->id)->count());
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $admin->id, 'action' => 'content.created']);
    }

    public function test_invalid_content_or_tag_input_writes_nothing(): void
    {
        $admin = $this->createAdmin();

        $this->actingAs($admin)->postJson('/api/v1/content', [
            'title' => 'Bad tag',
            'description' => 'Description',
            'body' => 'Body',
            'tag_names' => ['!!!'],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('contents', 0);
        $this->assertDatabaseCount('tags', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_update_preserves_omitted_tags_and_author_and_delete_preserves_shared_tags(): void
    {
        $admin = $this->createAdmin();
        $otherAdmin = $this->createAdmin('other-admin@example.com');
        $diagnosis = Diagnosis::factory()->create();
        $content = Content::factory()->for($admin, 'author')->for($diagnosis)->create();
        $tag = Tag::factory()->for($admin, 'author')->create(['slug' => 'grounding']);
        $content->tags()->attach($tag);
        $this->actingAs($otherAdmin)->patchJson("/api/v1/content/{$content->id}", [
            'title' => 'Updated title',
        ])->assertOk()->assertJsonPath('data.title', 'Updated title');

        $this->assertSame($admin->id, $content->fresh()->author_id);
        $this->assertSame('Updated title', $content->fresh()->title);
        $this->assertDatabaseHas('content_tag', ['content_id' => $content->id, 'tag_id' => $tag->id]);

        $this->deleteJson("/api/v1/content/{$content->id}")->assertNoContent();

        $this->assertDatabaseMissing('contents', ['id' => $content->id]);
        $this->assertDatabaseMissing('content_tag', ['content_id' => $content->id]);
        $this->assertDatabaseHas('tags', ['id' => $tag->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'content.deleted', 'entity_id' => $content->id]);
    }

    #[DataProvider('unprivilegedRoles')]
    public function test_non_admin_roles_cannot_write_content(string $role): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);
        $content = Content::factory()->create();
        $originalTitle = $content->title;
        $payload = ['title' => 'Denied', 'description' => 'Denied', 'body' => 'Denied'];

        $this->actingAs($user)->postJson('/api/v1/content', $payload)->assertForbidden();
        $this->actingAs($user)->patchJson("/api/v1/content/{$content->id}", $payload)->assertForbidden();
        $this->actingAs($user)->deleteJson("/api/v1/content/{$content->id}")->assertForbidden();
        $this->assertSame($originalTitle, $content->fresh()->title);
    }

    /** @return array<string, array{string}> */
    public static function unprivilegedRoles(): array
    {
        return [
            'patient' => [UserRole::Patient->value],
            'clinician' => [UserRole::Clinician->value],
        ];
    }

    private function createAdmin(string $email = 'admin@example.com'): User
    {
        $user = User::factory()->create(['email' => $email, 'email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => UserRole::Admin, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
