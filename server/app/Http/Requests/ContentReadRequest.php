<?php

namespace App\Http\Requests;

use App\Models\Content;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContentReadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Content::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'diagnosis' => ['sometimes', 'array'],
            'diagnosis.*' => ['string', 'max:32', Rule::exists('diagnoses', 'value')],
            'is_bookmarked' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', Rule::in(['asc', 'desc'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($search = $this->input('search'))) {
            $this->merge(['search' => trim($search)]);
        }

        if (in_array($this->input('is_bookmarked'), ['true', 'false'], true)) {
            $this->merge(['is_bookmarked' => $this->input('is_bookmarked') === 'true']);
        }
    }
}
