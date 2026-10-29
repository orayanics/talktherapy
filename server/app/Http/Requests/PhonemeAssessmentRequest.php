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
            'reference_text' => ['required', 'string', 'min:1', 'max:800'],
            'language' => ['sometimes', 'required', 'in:en,tl'],
        ];
    }
}
