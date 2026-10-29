<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DiagnosisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
    }

    public function rules(): array
    {
        $diagnosis = $this->route('diagnosis');

        return [
            'id' => ['sometimes', 'required', 'string', 'max:191', Rule::unique('diagnoses', 'id')->ignore($diagnosis?->id)],
            'label' => ['required', 'string', 'max:255', Rule::unique('diagnoses', 'label')->ignore($diagnosis?->id)],
            'value' => ['required', 'string', 'max:32', Rule::unique('diagnoses', 'value')->ignore($diagnosis?->id)],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
