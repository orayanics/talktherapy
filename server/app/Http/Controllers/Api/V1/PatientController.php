<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClinicalRecordReadRequest;
use App\Http\Resources\ClinicianPatientResource;
use App\Models\ClinicianPatient;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PatientController extends Controller
{
    public function index(ClinicalRecordReadRequest $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', ClinicianPatient::class);
        $query = ClinicianPatient::query()->with('patient:id,name')
            ->where('clinician_id', $request->user()->id);
        $search = trim((string) $request->validated('search', ''));
        if ($search !== '') {
            $query->whereHas('patient', fn (Builder $patient): Builder => $patient
                ->whereLike('name', "%{$search}%")
                ->orWhereLike('email', "%{$search}%"));
        }

        return ClinicianPatientResource::collection($query
            ->orderBy('first_completed_at', $request->validated('sort', 'desc'))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString());
    }
}
