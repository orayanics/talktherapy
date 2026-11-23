<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PhonemeAssessmentRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'audio' => ['required', 'file', 'max:10240', 'mimes:webm,wav', 'extensions:webm,wav'],
            'reference_text' => ['required_without_all:exercise_id,exercise_version_id', 'prohibits:exercise_id,exercise_version_id', 'string', 'min:1', 'max:2000'],
            'exercise_id' => ['sometimes', 'required', 'uuid', 'prohibits:exercise_version_id'],
            'exercise_version_id' => ['sometimes', 'required', 'uuid'],
            'language' => ['sometimes', 'required', 'in:en,tl'],
        ];
    }
}
