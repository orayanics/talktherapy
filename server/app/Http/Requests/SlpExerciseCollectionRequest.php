<?php

namespace App\Http\Requests;

use App\Models\ClinicianPatient;
use App\Models\SlpExerciseCollection;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SlpExerciseCollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $collection = $this->route('collection');

        return $this->user()?->can($collection ? 'update' : 'create', $collection ?? SlpExerciseCollection::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => [$this->route('collection') ? 'sometimes' : 'required', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'is_hidden' => ['sometimes', 'boolean'],
            'patient_audience' => ['sometimes', Rule::in(['assigned', 'selected', 'clinician', 'platform'])],
            'patient_ids' => ['sometimes', 'array', 'max:1000'],
            'patient_ids.*' => ['required', 'uuid', 'distinct'],
            'cover' => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=6000,max_height=6000'],
            'remove_cover' => ['sometimes', 'boolean', 'prohibits:cover'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $collection = $this->route('collection');
            $audience = $this->input('patient_audience', $collection?->patient_audience ?? 'assigned');
            $ids = $this->input('patient_ids', $collection?->patient_ids ?? []);
            if ($audience === 'selected') {
                $patients = User::query()->whereIn('id', $ids)->whereHas('profile', fn ($q) => $q->where('role', 'patient'));
                if ($this->user()->profile->role->value === 'clinician') {
                    $patients->whereIn('id', ClinicianPatient::query()->select('patient_id')->where('clinician_id', $this->user()->id));
                }
                if (count($ids) === 0 || $patients->count() !== count($ids)) {
                    $validator->errors()->add('patient_ids', 'Select patients you are allowed to share this collection with.');
                }
            }
            if ($audience === 'clinician' && $this->user()->profile->role->value !== 'clinician') {
                $validator->errors()->add('patient_audience', 'Choose selected patients or every platform patient.');
            }
        }];
    }
}
