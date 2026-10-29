<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SaveContent;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContentReadRequest;
use App\Http\Requests\ContentWriteRequest;
use App\Http\Resources\ContentResource;
use App\Models\Content;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(ContentReadRequest $request): AnonymousResourceCollection
    {
        return $this->listing($request);
    }

    public function bookmarks(ContentReadRequest $request): AnonymousResourceCollection
    {
        return $this->listing($request, true);
    }

    private function listing(ContentReadRequest $request, bool $onlyBookmarked = false): AnonymousResourceCollection
    {
        $query = $this->contentQuery($request);
        $search = $request->validated('search');

        if ($search !== null && $search !== '') {
            $query->where(fn (Builder $query): Builder => $query
                ->whereLike('title', "%{$search}%")
                ->orWhereLike('description', "%{$search}%"));
        }

        if ($request->filled('diagnosis')) {
            $query->whereHas('diagnosis', fn (Builder $query): Builder => $query
                ->whereIn('value', $request->validated('diagnosis')));
        }

        $bookmarkFilter = $request->validated('is_bookmarked');
        if ($onlyBookmarked || $bookmarkFilter === true) {
            $query->whereHas('bookmarks', fn (Builder $query): Builder => $query->where('user_id', $request->user()->id));
        } elseif ($bookmarkFilter === false) {
            $query->whereDoesntHave('bookmarks', fn (Builder $query): Builder => $query->where('user_id', $request->user()->id));
        }

        $contents = $query->orderBy('created_at', $request->validated('sort', 'desc'))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return ContentResource::collection($contents);
    }

    private function contentQuery(ContentReadRequest $request): Builder
    {
        return Content::query()->withExists([
            'bookmarks as is_bookmarked' => fn (Builder $query): Builder => $query->where('user_id', $request->user()->id),
        ])->with([
            'author:id,name',
            'diagnosis:id,label,value',
            'tags:id,name,slug',
        ]);
    }

    public function show(ContentReadRequest $request, string $content): ContentResource
    {
        $record = $this->contentQuery($request)->findOrFail($content);
        Gate::authorize('view', $record);

        return ContentResource::make($record);
    }

    public function store(ContentWriteRequest $request, SaveContent $saveContent): JsonResponse
    {
        $content = $saveContent->create(
            $request->user(),
            $request->validated(),
            $request->attributes->get('request_id'),
        );

        return ContentResource::make($content)->response()->setStatusCode(201);
    }

    public function update(ContentWriteRequest $request, string $content, SaveContent $saveContent): ContentResource
    {
        $record = Content::query()->findOrFail($content);
        Gate::authorize('update', $record);
        $updated = $saveContent->update(
            $request->user(),
            $record,
            $request->validated(),
            $request->attributes->get('request_id'),
        );

        return ContentResource::make($updated);
    }

    public function destroy(ContentWriteRequest $request, string $content, SaveContent $saveContent): Response
    {
        $record = Content::query()->findOrFail($content);
        Gate::authorize('delete', $record);
        $saveContent->delete($request->user(), $record, $request->attributes->get('request_id'));

        return response()->noContent();
    }
}
