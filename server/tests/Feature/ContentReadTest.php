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
use Tests\TestCase;

class ContentReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_content_reads_require_an_active_verified_member(): void
    {
        $this->getJson('/api/v1/content')->assertUnauthorized();

        $user = $this->createMember(verified: false);
        $this->actingAs($user)->getJson('/api/v1/content')->assertForbidden();
    }

    public function test_member_can_filter_and_paginate_content_with_safe_relations(): void
    {
        $author = $this->createMember(UserRole::Admin);
        $reader = $this->createMember();
        $adhd = Diagnosis::factory()->create(['label' => 'Attention support', 'value' => 'ADHD']);
        $other = Diagnosis::factory()->create(['label' => 'Autism support', 'value' => 'ASD']);
        $first = Content::factory()->for($author, 'author')->for($adhd)->create([
            'title' => 'Calm breathing',
            'description' => 'A guide to regulation',
        ]);
        Content::factory()->for($author, 'author')->for($adhd)->create([
            'title' => 'Grounding skills',
            'description' => 'Another regulation guide',
        ]);
        Content::factory()->for($author, 'author')->for($other)->create([
            'title' => 'Calm grounding',
            'description' => 'A regulation guide',
        ]);
        $tag = Tag::factory()->for($author, 'author')->create(['name' => 'Skills', 'slug' => 'skills']);
        $first->tags()->attach($tag);

        $this->actingAs($reader)
            ->getJson('/api/v1/content?search=regulation&diagnosis[]=ADHD&sort=asc&per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.id', $first->id)
            ->assertJsonPath('data.0.author.id', $author->id)
            ->assertJsonPath('data.0.author.name', $author->name)
            ->assertJsonPath('data.0.diagnosis.value', 'ADHD')
            ->assertJsonPath('data.0.tags.0.name', 'Skills')
            ->assertJsonPath('data.0.is_bookmarked', false)
            ->assertJsonMissingPath('data.0.author.email')
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_member_can_read_a_content_detail_and_unknown_content_is_not_found(): void
    {
        $author = $this->createMember(UserRole::Clinician);
        $reader = $this->createMember();
        $diagnosis = Diagnosis::factory()->create();
        $content = Content::factory()->for($author, 'author')->for($diagnosis)->create();

        $this->actingAs($reader)->getJson("/api/v1/content/{$content->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $content->id)
            ->assertJsonPath('data.body', $content->body)
            ->assertJsonPath('data.author.name', $author->name)
            ->assertJsonMissingPath('data.author.email');

        $this->getJson('/api/v1/content/00000000-0000-4000-8000-000000000000')->assertNotFound();
    }

    private function createMember(UserRole $role = UserRole::Patient, bool $verified = true): User
    {
        $user = User::factory()->create(['email_verified_at' => $verified ? now() : null]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
