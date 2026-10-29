<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransitionAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $requiresReason = $this->routeIs('appointments.reject', 'appointments.cancel');

        return [
            'reason' => [$requiresReason ? 'required' : 'sometimes', 'string', 'min:1', 'max:2000'],
            'is_hidden' => [$this->routeIs('appointments.reject') ? 'sometimes' : 'prohibited', 'boolean'],
        ];
    }
}
