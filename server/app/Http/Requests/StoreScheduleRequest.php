<?php

namespace App\Http\Requests;

use App\Actions\ExpandScheduleOccurrences;
use App\Models\Schedule;
use DateTimeImmutable;
use DateTimeZone;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Schedule::class) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'start_at' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/'],
            'end_at' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/'],
            'recurrence_rule' => ['sometimes', 'nullable', 'string', 'max:255'],
            'timezone' => ['required', Rule::in(['UTC'])],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['start_at', 'end_at', 'recurrence_rule', 'timezone'])) {
                return;
            }

            try {
                $startsAt = $this->parseUtcInstant($this->input('start_at'));
                $endsAt = $this->parseUtcInstant($this->input('end_at'));
                if ($startsAt === null || $endsAt === null) {
                    $validator->errors()->add('start_at', 'Enter valid ISO date and time values.');

                    return;
                }

                if ($startsAt <= now()) {
                    $validator->errors()->add('start_at', 'A schedule must start in the future.');

                    return;
                }

                if ($endsAt <= $startsAt) {
                    $validator->errors()->add('end_at', 'The end time must be after the start time.');

                    return;
                }

                app(ExpandScheduleOccurrences::class)->expand(
                    $startsAt,
                    $endsAt,
                    $this->input('recurrence_rule'),
                );
            } catch (\InvalidArgumentException $exception) {
                $validator->errors()->add('recurrence_rule', $exception->getMessage());
            }
        }];
    }

    private function parseUtcInstant(string $value): ?DateTimeImmutable
    {
        foreach (['!Y-m-d\TH:i:s\Z', '!Y-m-d\TH:i:s.u\Z', '!Y-m-d\TH:i:sP', '!Y-m-d\TH:i:s.uP'] as $format) {
            $date = DateTimeImmutable::createFromFormat($format, $value, new DateTimeZone('UTC'));
            $errors = DateTimeImmutable::getLastErrors();
            if ($date !== false && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))) {
                return $date->setTimezone(new DateTimeZone('UTC'));
            }
        }

        return null;
    }
}
