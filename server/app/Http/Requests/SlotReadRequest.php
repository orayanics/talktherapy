<?php

namespace App\Http\Requests;

use App\Models\Slot;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SlotReadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Slot::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'date_from' => ['sometimes', 'date_format:Y-m-d'],
            'date_to' => ['sometimes', 'date_format:Y-m-d'],
            'clinician_id' => ['sometimes', 'uuid', Rule::exists('users', 'id')],
            'diagnosis_values' => ['sometimes', 'array', 'max:20'],
            'diagnosis_values.*' => ['string', 'max:191', Rule::exists('diagnoses', 'value')],
            'sort' => ['sometimes', Rule::in(['asc', 'desc'])],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['date_from', 'date_to'])) {
                return;
            }

            $from = $this->input('date_from');
            $to = $this->input('date_to');
            if ($from !== null && $to !== null && $from > $to) {
                $validator->errors()->add('date_to', 'The end date must be on or after the start date.');
            }
        }];
    }
}
