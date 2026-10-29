<?php

namespace App\Http\Requests;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', Appointment::class);
    }

    public function rules(): array
    {
        return [
            'encounter' => ['required', 'array:diagnosis,chief_complaint,referral_source,referral_url'],
            'encounter.diagnosis' => ['required', 'string', 'min:1', 'max:2000'],
            'encounter.chief_complaint' => ['required', 'string', 'min:1', 'max:2000'],
            'encounter.referral_source' => ['required', 'string', 'min:1', 'max:255'],
            'encounter.referral_url' => ['nullable', 'string', 'max:2048', 'url:http,https'],
        ];
    }
}
