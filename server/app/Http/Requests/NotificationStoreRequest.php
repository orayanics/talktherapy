<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class NotificationStoreRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['channels' => $this->input('channels', ['in_app']), 'type' => $this->input('type', 'system')]);
    }

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
                'nullable',
                'uuid',
                Rule::exists('user_profiles', 'user_id')->where('status', 'active'),
                Rule::exists('users', 'id')->whereNotNull('email_verified_at'),
            ],
            'recipient_ids' => ['nullable', 'array', 'min:1'],
            'recipient_ids.*' => ['uuid', Rule::exists('users', 'id')->whereNotNull('email_verified_at')],
            'roles' => ['nullable', 'array', 'min:1'],
            'roles.*' => [Rule::enum(UserRole::class)],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['string', Rule::in(['in_app', 'email'])],
            'type' => ['required', 'string', 'in:system'],
            'title' => ['required_if:channels,in_app', 'nullable', 'string', 'max:200'],
            'subject' => ['required_if:channels,email', 'nullable', 'string', 'max:200'],
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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('recipient_id') && ! $this->filled('recipient_ids') && ! $this->filled('roles')) {
                $validator->errors()->add('recipients', 'Select at least one user or role.');
            }
            if (($this->filled('recipient_id') || $this->filled('recipient_ids')) && $this->filled('roles')) {
                $validator->errors()->add('recipients', 'Choose users or a role, not both.');
            }
        });
    }
}
