<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserAdminReadRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index(UserAdminReadRequest $request): AnonymousResourceCollection
    {
        $query = $this->filteredQuery($request, includeStatuses: true);
        $sortBy = $request->validated('sort_by', 'created_at');
        $sort = $request->validated('sort', 'desc');

        $users = $query->orderBy($sortBy, $sort)
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function counts(UserAdminReadRequest $request): JsonResponse
    {
        $query = $this->filteredQuery($request);

        return response()->json(['data' => ['counts' => [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->whereRelation('profile', 'status', 'pending')->count(),
            'active' => (clone $query)->whereRelation('profile', 'status', 'active')->count(),
            'suspended' => (clone $query)->whereRelation('profile', 'status', 'suspended')->count(),
        ]]]);
    }

    public function show(UserAdminReadRequest $request, string $user): UserResource
    {
        $requestedUser = User::query()->findOrFail($user);
        Gate::authorize('view', $requestedUser);

        return UserResource::make($requestedUser->loadMissing('profile'));
    }

    /** @return Builder<User> */
    private function filteredQuery(UserAdminReadRequest $request, bool $includeStatuses = false): Builder
    {
        $query = User::query()->with('profile');
        $search = $request->validated('search');

        if ($search !== null && $search !== '') {
            $query->where(fn (Builder $query): Builder => $query
                ->whereLike('name', "%{$search}%")
                ->orWhereLike('email', "%{$search}%"));
        }

        if ($request->filled('roles')) {
            $query->whereHas('profile', fn (Builder $query): Builder => $query->whereIn('role', $request->validated('roles')));
        }

        if ($includeStatuses && $request->filled('statuses')) {
            $query->whereHas('profile', fn (Builder $query): Builder => $query->whereIn('status', $request->validated('statuses')));
        }

        return $query;
    }
}
