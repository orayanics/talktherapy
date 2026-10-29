<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuditLogReadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', User::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'action' => ['sometimes', 'nullable', 'string', 'max:100'],
            'entity' => ['sometimes', 'nullable', 'string', 'max:100'],
            'actor_role' => ['sometimes', 'nullable', Rule::enum(UserRole::class)],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date'],
            'sort' => ['sometimes', Rule::in(['asc', 'desc'])],
            'format' => ['sometimes', Rule::in(['csv', 'jsonl', 'xls'])],
            'batch_size' => ['sometimes', 'integer', 'min:1', 'max:1000'],
        ];
    }
}
