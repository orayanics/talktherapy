<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\Content;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaveContent
{
    /** @param array<string, mixed> $attributes */
    public function create(User $actor, array $attributes, ?string $requestId): Content
    {
        return DB::transaction(function () use ($actor, $attributes, $requestId): Content {
            $content = Content::query()->create([
                ...Arr::only($attributes, ['title', 'description', 'body', 'diagnosis_id']),
                'author_id' => $actor->id,
            ]);

            if (array_key_exists('tag_names', $attributes)) {
                $this->syncTags($content, $attributes['tag_names']);
            }

            $this->audit($actor, $content, 'content.created', $requestId);

            return $content->load(['author:id,name', 'diagnosis:id,label,value', 'tags:id,name,slug']);
        });
    }

    /** @param array<string, mixed> $attributes */
    public function update(User $actor, Content $content, array $attributes, ?string $requestId): Content
    {
        return DB::transaction(function () use ($actor, $attributes, $content, $requestId): Content {
            $lockedContent = Content::query()->lockForUpdate()->findOrFail($content->id);
            $lockedContent->update(Arr::only($attributes, ['title', 'description', 'body', 'diagnosis_id']));

            if (array_key_exists('tag_names', $attributes)) {
                $this->syncTags($lockedContent, $attributes['tag_names']);
            }

            $this->audit($actor, $lockedContent, 'content.updated', $requestId);

            return $lockedContent->load(['author:id,name', 'diagnosis:id,label,value', 'tags:id,name,slug']);
        });
    }

    public function delete(User $actor, Content $content, ?string $requestId): void
    {
        DB::transaction(function () use ($actor, $content, $requestId): void {
            $lockedContent = Content::query()->lockForUpdate()->findOrFail($content->id);
            $this->audit($actor, $lockedContent, 'content.deleted', $requestId);
            $lockedContent->delete();
        });
    }

    /** @param list<string> $names */
    private function syncTags(Content $content, array $names): void
    {
        $now = now();
        $tags = [];

        foreach ($names as $name) {
            $slug = Str::slug($name);
            $tags[$slug] ??= [
                'id' => (string) Str::uuid(),
                'author_id' => $content->author_id,
                'name' => $name,
                'slug' => $slug,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($tags === []) {
            $content->tags()->sync([]);

            return;
        }

        Tag::query()->upsert(array_values($tags), ['author_id', 'slug'], ['updated_at']);
        $tagIds = Tag::query()->where('author_id', $content->author_id)
            ->whereIn('slug', array_keys($tags))->pluck('id')->all();
        $content->tags()->sync($tagIds);
    }

    private function audit(User $actor, Content $content, string $action, ?string $requestId): void
    {
        AuditLog::query()->create([
            'actor_id' => $actor->id,
            'actor_role' => $actor->profile->role->value,
            'action' => $action,
            'entity_type' => 'content',
            'entity_id' => $content->id,
            'request_id' => $requestId,
            'details' => [],
        ]);
    }
}
