<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RequestEmailChangeRequest extends FormRequest
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
            'new_email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'current_password' => ['required', 'current_password:web'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['new_email' => mb_strtolower(trim((string) $this->input('new_email')))]);
    }
}
