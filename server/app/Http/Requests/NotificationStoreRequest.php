<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NotificationStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array($this->user()?->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_id' => [
                'required',
                'uuid',
                Rule::exists('user_profiles', 'user_id')->where('status', 'active'),
                Rule::exists('users', 'id')->whereNotNull('email_verified_at'),
            ],
            'type' => ['required', 'string', 'in:system'],
            'title' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:2000'],
            'entity_type' => ['nullable', 'required_with:entity_id', 'string', Rule::in(['appointment', 'soap'])],
            'entity_id' => [
                'required_with:entity_type',
                'nullable',
                'string',
                'max:191',
                Rule::when($this->input('entity_type') === 'soap', Rule::exists('soaps', 'id'), Rule::exists('appointments', 'id')),
            ],
        ];
    }
}
