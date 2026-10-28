<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Bookmark;
use App\Models\Content;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentBookmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_bookmark_put_and_delete_are_idempotent_and_scoped_to_the_actor(): void
    {
        $actor = $this->createMember();
        $other = $this->createMember('other@example.com');
        $content = Content::factory()->create();
        $otherBookmark = Bookmark::factory()->for($other)->for($content)->create();

        $this->actingAs($actor)->putJson("/api/v1/content/{$content->id}/bookmark")->assertNoContent();
        $this->putJson("/api/v1/content/{$content->id}/bookmark")->assertNoContent();
        $this->assertDatabaseCount('bookmarks', 2);
        $this->assertDatabaseHas('bookmarks', ['user_id' => $actor->id, 'content_id' => $content->id]);

        $this->getJson('/api/v1/bookmarks')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $content->id)
            ->assertJsonPath('data.0.is_bookmarked', true);

        $this->deleteJson("/api/v1/content/{$content->id}/bookmark")->assertNoContent();
        $this->deleteJson("/api/v1/content/{$content->id}/bookmark")->assertNoContent();
        $this->assertDatabaseCount('bookmarks', 1);
        $this->assertDatabaseHas('bookmarks', ['id' => $otherBookmark->id]);
    }

    public function test_other_users_bookmarks_do_not_appear_in_content_or_bookmarks_filter(): void
    {
        $reader = $this->createMember();
        $other = $this->createMember('other@example.com');
        $content = Content::factory()->create();
        Bookmark::factory()->for($other)->for($content)->create();

        $this->actingAs($reader)->getJson('/api/v1/content')
            ->assertOk()
            ->assertJsonPath('data.0.is_bookmarked', false);
        $this->getJson('/api/v1/bookmarks')->assertOk()->assertJsonCount(0, 'data');
    }

    private function createMember(string $email = 'member@example.com'): User
    {
        $user = User::factory()->create(['email' => $email, 'email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => UserRole::Patient, 'status' => UserStatus::Active]);

        return $user;
    }
}
