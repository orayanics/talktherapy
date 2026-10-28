<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'body' => $this->body,
            'author' => $this->whenLoaded('author', fn (): array => [
                'id' => $this->author->id,
                'name' => $this->author->name,
            ]),
            'diagnosis' => $this->whenLoaded('diagnosis', fn (): ?array => $this->diagnosis === null ? null : [
                'id' => $this->diagnosis->id,
                'label' => $this->diagnosis->label,
                'value' => $this->diagnosis->value,
            ]),
            'tags' => $this->whenLoaded('tags', fn (): array => $this->tags->map(fn ($tag): array => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ])->all()),
            'is_bookmarked' => (bool) ($this->is_bookmarked ?? false),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
