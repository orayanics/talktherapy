<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiagnosisRequest;
use App\Http\Resources\AdminDiagnosisResource;
use App\Http\Resources\DiagnosisResource;
use App\Models\Diagnosis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class DiagnosisController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Diagnosis::class);

        return DiagnosisResource::collection(Diagnosis::query()->where('active', true)->orderBy('label')->orderBy('id')->get());
    }

    public function indexAdmin(): AnonymousResourceCollection
    {
        abort_unless(in_array(request()->user()?->profile?->role?->value, ['admin', 'superadmin'], true), 403);

        return AdminDiagnosisResource::collection(Diagnosis::query()->orderBy('label')->orderBy('id')->get());
    }

    public function store(DiagnosisRequest $request): JsonResponse
    {
        Gate::authorize('create', Diagnosis::class);

        return AdminDiagnosisResource::make(Diagnosis::query()->create($request->validated()))->response()->setStatusCode(201);
    }

    public function update(DiagnosisRequest $request, Diagnosis $diagnosis): AdminDiagnosisResource
    {
        Gate::authorize('update', $diagnosis);
        $diagnosis->update($request->validated());

        return AdminDiagnosisResource::make($diagnosis->refresh());
    }

    public function destroy(Diagnosis $diagnosis): Response
    {
        Gate::authorize('delete', $diagnosis);
        $diagnosis->update(['active' => false]);

        return response()->noContent();
    }
}
