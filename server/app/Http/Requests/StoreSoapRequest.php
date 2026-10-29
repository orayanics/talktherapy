<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSoapRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'activity_plan' => ['required', 'string', 'min:1', 'not_regex:/^\s*$/', 'max:20000'],
            'session_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'subjective_notes' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'objective_notes' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'assessment' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'recommendation' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'comments' => ['sometimes', 'nullable', 'string', 'max:20000'],
        ];
    }
}
