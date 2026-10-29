<?php

namespace App\Http\Requests;

use App\Models\Content;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentWriteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Content::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'title' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:255'],
            'description' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:2000'],
            'body' => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100000'],
            'diagnosis_id' => ['sometimes', 'nullable', 'string', Rule::exists('diagnoses', 'id')],
            'tag_names' => ['sometimes', 'array', 'max:3'],
            'tag_names.*' => [
                'required',
                'string',
                'max:50',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (is_string($value) && Str::slug(trim($value)) === '') {
                        $fail('Each tag must contain at least one letter or number.');
                    }
                },
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_array($tagNames = $this->input('tag_names'))) {
            $this->merge(['tag_names' => array_map(
                static fn (mixed $tagName): mixed => is_string($tagName) ? trim($tagName) : $tagName,
                $tagNames,
            )]);
        }
    }
}
