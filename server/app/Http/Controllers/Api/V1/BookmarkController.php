<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookmarkRequest;
use App\Models\Bookmark;
use App\Models\Content;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class BookmarkController extends Controller
{
    public function store(BookmarkRequest $request, string $content): Response
    {
        Gate::authorize('create', Bookmark::class);
        $record = Content::query()->findOrFail($content);
        Gate::authorize('view', $record);

        DB::table('bookmarks')->insertOrIgnore([
            'id' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'content_id' => $record->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->noContent();
    }

    public function destroy(BookmarkRequest $request, string $content): Response
    {
        Gate::authorize('create', Bookmark::class);
        $record = Content::query()->findOrFail($content);
        Gate::authorize('view', $record);
        $bookmark = $request->user()->bookmarks()->whereBelongsTo($record)->first();

        if ($bookmark !== null) {
            Gate::authorize('delete', $bookmark);
            $bookmark->delete();
        }

        return response()->noContent();
    }
}
