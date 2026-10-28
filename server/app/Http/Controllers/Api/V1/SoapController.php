<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\CreateSoap;
use App\Actions\UpdateSoap;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecordReadRequest;
use App\Http\Requests\StoreSoapRequest;
use App\Http\Requests\UpdateSoapRequest;
use App\Http\Resources\SoapResource;
use App\Models\ClinicianPatient;
use App\Models\Soap;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SoapController extends Controller
{
    public function index(ClinicalRecordReadRequest $request, string $patient): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Soap::class);
        $actor = $request->user();
        if ($actor->id !== $patient) {
            $related = $actor->profile?->role?->value === 'clinician'
                && ClinicianPatient::query()->where('clinician_id', $actor->id)->where('patient_id', $patient)->exists();
            abort_unless($related, 404);
        }

        $query = Soap::query()->with(['clinician:id,name', 'clinician.profile.diagnosis', 'patient:id,name'])
            ->where('patient_id', $patient);
        if ($actor->profile?->role?->value === 'clinician') {
            $query->where('clinician_id', $actor->id);
        }

        return SoapResource::collection($query
            ->orderBy('created_at', $request->validated('sort', 'desc'))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString());
    }

    public function store(StoreSoapRequest $request, string $patient, CreateSoap $create): JsonResponse
    {
        $soap = $create->create(
            $request->user(),
            User::query()->select(['id', 'name'])->with('profile')->findOrFail($patient),
            $request->validated(),
            $request->attributes->get('request_id'),
        );

        return SoapResource::make($soap)->response()->setStatusCode(201);
    }

    public function show(ClinicalRecordReadRequest $request, string $soap): SoapResource
    {
        $record = Soap::query()->with(['clinician:id,name', 'clinician.profile.diagnosis', 'patient:id,name'])->findOrFail($soap);
        abort_unless(Gate::allows('view', $record), 404);

        return SoapResource::make($record);
    }

    public function update(UpdateSoapRequest $request, string $soap, UpdateSoap $update): SoapResource
    {
        $record = Soap::query()->findOrFail($soap);
        abort_unless(Gate::allows('update', $record), 404);

        return SoapResource::make($update->update(
            $request->user(),
            $record,
            $request->validated(),
            $request->attributes->get('request_id'),
        ));
    }
}
