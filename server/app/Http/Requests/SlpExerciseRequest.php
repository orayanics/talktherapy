<?php

namespace App\Http\Requests;

use App\Models\SlpExercise;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SlpExerciseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $exercise = $this->route('exercise');
        $user = $this->user();
        if ($user === null || ($this->isMethod('post') && $this->input('scope', 'private') === 'shared' && $user->profile?->role->value === 'clinician')) {
            return false;
        }
        return $user->can($this->isMethod('post') ? 'create' : 'update', $exercise instanceof SlpExercise ? $exercise : SlpExercise::class);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $create = $this->isMethod('post');
        return [
            'scope' => [$create ? 'sometimes' : 'prohibited', Rule::in(['private', 'shared'])],
            'module' => [$create ? 'required' : 'sometimes', 'string', 'max:40', Rule::in(['fluency', 'timing', 'articulation', 'aphasia', 'voice', 'motor_speech'])],
            'language' => [$create ? 'required' : 'sometimes', 'string', 'max:16'],
            'dialect' => ['sometimes', 'nullable', 'string', 'max:64'],
            'task_type' => [$create ? 'required' : 'sometimes', 'string', 'max:50'],
            'prompt_text' => [$create ? 'required' : 'sometimes', 'string', 'max:2000'],
            'configuration' => ['sometimes', 'array'],
        ];
    }
}
