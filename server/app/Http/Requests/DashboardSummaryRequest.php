<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class DashboardSummaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_from' => ['sometimes', 'date_format:Y-m-d'],
            'date_to' => ['sometimes', 'date_format:Y-m-d'],
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
