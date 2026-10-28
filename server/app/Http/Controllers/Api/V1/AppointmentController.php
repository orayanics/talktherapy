<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\BookAppointment;
use App\Actions\TransitionAppointment;
use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentReadRequest;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\TransitionAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Slot;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AppointmentController extends Controller
{
    public function index(AppointmentReadRequest $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Appointment::class);
        $user = $request->user();
        $query = Appointment::query()
            ->with(['slot:id,start_at,end_at,status', 'patient:id,name,email', 'clinician:id,name,email', 'clinician.profile:user_id,diagnosis_id', 'clinician.profile.diagnosis:id,label,value'])
            ->where(fn (Builder $appointments): Builder => $appointments
                ->where('patient_id', $user->id)
                ->orWhere('clinician_id', $user->id));

        if ($request->filled('date_from')) {
            $query->whereHas('slot', fn (Builder $slots): Builder => $slots->where('start_at', '>=', CarbonImmutable::parse($request->validated('date_from'), 'UTC')->startOfDay()));
        }
        if ($request->filled('date_to')) {
            $query->whereHas('slot', fn (Builder $slots): Builder => $slots->where('start_at', '<=', CarbonImmutable::parse($request->validated('date_to'), 'UTC')->endOfDay()));
        }

        return AppointmentResource::collection($query
            ->orderBy('booked_at', $request->validated('sort', 'desc'))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString());
    }

    public function show(AppointmentReadRequest $request, string $appointment): AppointmentResource
    {
        $record = Appointment::query()
            ->whereKey($appointment)
            ->where(fn (Builder $appointments): Builder => $appointments
                ->where('patient_id', $request->user()->id)
                ->orWhere('clinician_id', $request->user()->id))
            ->with(['slot', 'patient:id,name,email', 'clinician:id,name,email', 'clinician.profile:user_id,diagnosis_id', 'clinician.profile.diagnosis:id,label,value', 'encounter', 'events'])
            ->firstOrFail();
        Gate::authorize('view', $record);

        return AppointmentResource::make($record);
    }

    public function store(StoreAppointmentRequest $request, Slot $slot, BookAppointment $book): JsonResponse
    {
        $appointment = $book->book(
            $request->user(),
            $slot,
            $request->validated('encounter'),
            $request->attributes->get('request_id'),
        );

        return AppointmentResource::make($appointment)->response()->setStatusCode(201);
    }

    public function accept(TransitionAppointmentRequest $request, string $appointment, TransitionAppointment $transition): AppointmentResource
    {
        return AppointmentResource::make($transition->accept($request->user(), $appointment, $request->validated(), $request->attributes->get('request_id')));
    }

    public function reject(TransitionAppointmentRequest $request, string $appointment, TransitionAppointment $transition): AppointmentResource
    {
        return AppointmentResource::make($transition->reject($request->user(), $appointment, $request->validated(), $request->attributes->get('request_id')));
    }

    public function cancel(TransitionAppointmentRequest $request, string $appointment, TransitionAppointment $transition): AppointmentResource
    {
        return AppointmentResource::make($transition->cancel($request->user(), $appointment, $request->validated(), $request->attributes->get('request_id')));
    }

    public function complete(TransitionAppointmentRequest $request, string $appointment, TransitionAppointment $transition): AppointmentResource
    {
        return AppointmentResource::make($transition->complete($request->user(), $appointment, $request->validated(), $request->attributes->get('request_id')));
    }
}
