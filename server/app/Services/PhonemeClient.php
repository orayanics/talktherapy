<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PhonemeClient
{
    /** @return array<string, mixed> */
    public function assess(UploadedFile $audio, string $referenceText, string $requestId, string $language = 'en'): array
    {
        $baseUrl = rtrim((string) config('services.phoneme.url'), '/');
        $token = trim((string) config('services.phoneme.token'));
        if ($baseUrl === '' || $token === '') {
            abort(503);
        }

        $stream = fopen($audio->getRealPath(), 'rb');
        if ($stream === false) {
            abort(503);
        }

        try {
            $response = Http::acceptJson()
                ->connectTimeout((float) config('services.phoneme.connect_timeout', 3))
                ->timeout((float) config('services.phoneme.timeout', 45))
                ->withoutRedirecting()
                ->withHeaders([
                    'X-Service-Token' => $token,
                    'X-Request-ID' => $requestId,
                ])
                ->attach(
                    'audio',
                    $stream,
                    'recording.'.$audio->guessExtension(),
                    ['Content-Type' => $audio->getMimeType() ?? 'application/octet-stream'],
                )
                ->post($baseUrl.'/v1/assess', ['referenceText' => $referenceText, 'language' => $language]);
        } catch (ConnectionException $exception) {
            if ($this->isTimeout($exception)) {
                abort(504);
            }

            abort(503);
        } finally {
            fclose($stream);
        }

        $this->handleUpstreamFailure($response);

        if (strlen($response->body()) > 1_048_576) {
            abort(502);
        }

        $payload = $response->json();
        if (! is_array($payload) || ! $this->isValidAssessment($payload)) {
            abort(502);
        }

        return $payload;
    }

    private function handleUpstreamFailure(Response $response): void
    {
        if ($response->status() === 200) {
            return;
        }

        match ($response->status()) {
            413 => abort(413),
            422 => throw ValidationException::withMessages([
                'audio' => ['The recording could not be analyzed. Try a supported recording.'],
            ]),
            429 => abort(429),
            504 => abort(504),
            503, 500, 501, 502 => abort(503),
            default => abort($response->serverError() ? 503 : 502),
        };
    }

    /** @param array<string, mixed> $payload */
    private function isValidAssessment(array $payload): bool
    {
        $validator = Validator::make($payload, [
            'meta' => ['required', 'array:alignmentSource,cer,schemaVersion,status,measurement,modelVersion,calibrationVersion,learningEligible,language'],
            'meta.language' => ['sometimes', 'in:en,tl'],
            'meta.alignmentSource' => ['required', 'in:reference,transcript,none'],
            'meta.schemaVersion' => ['sometimes', 'in:2.0'],
            'meta.status' => ['required_with:meta.schemaVersion', 'in:review_required,task_mismatch,unscorable'],
            'meta.measurement' => ['required_with:meta.schemaVersion', 'in:transcript_agreement_only'],
            'meta.modelVersion' => ['required_with:meta.schemaVersion', 'string', 'max:200'],
            'meta.calibrationVersion' => ['required_with:meta.schemaVersion', 'in:none'],
            'meta.learningEligible' => ['required_with:meta.schemaVersion', 'boolean'],
            'meta.cer' => ['required', 'numeric', 'min:0'],
            'analysis' => ['required', 'array:transcript,lowScoring,structured'],
            'analysis.transcript' => ['required', 'string', 'max:5000'],
            'analysis.lowScoring' => ['present', 'array', 'max:2000'],
            'analysis.lowScoring.*' => ['required', 'array:phoneme,score,word,wordIndex'],
            'analysis.lowScoring.*.phoneme' => ['required', 'string', 'max:32'],
            'analysis.lowScoring.*.score' => ['required', 'numeric', 'between:0,100'],
            'analysis.lowScoring.*.word' => ['present', 'nullable', 'string', 'max:200'],
            'analysis.lowScoring.*.wordIndex' => ['present', 'nullable', 'integer', 'min:0'],
            'analysis.structured' => ['required', 'array:reference,transcript,overall,words,accurateUnits,needsWorkUnits'],
            'analysis.structured.reference' => ['required', 'string', 'max:800'],
            'analysis.structured.transcript' => ['required', 'string', 'max:5000'],
            'analysis.structured.overall' => ['required', 'array:avgScore,percentAboveNeedsWork,status'],
            'analysis.structured.overall.avgScore' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.overall.percentAboveNeedsWork' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.overall.status' => ['required', 'in:accurate,mixed,needs_work,unknown'],
            'analysis.structured.words' => ['present', 'array', 'max:1000'],
            'analysis.structured.words.*' => ['required', 'array:word,avgScore,status,lowUnits'],
            'analysis.structured.words.*.word' => ['present', 'nullable', 'string', 'max:200'],
            'analysis.structured.words.*.avgScore' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.words.*.status' => ['required', 'in:accurate,mixed,needs_work'],
            'analysis.structured.words.*.lowUnits' => ['present', 'array', 'max:100'],
            'analysis.structured.words.*.lowUnits.*' => ['required', 'array:unit,score'],
            'analysis.structured.words.*.lowUnits.*.unit' => ['required', 'string', 'max:32'],
            'analysis.structured.words.*.lowUnits.*.score' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.accurateUnits' => ['present', 'array', 'max:100'],
            'analysis.structured.accurateUnits.*' => ['required', 'array:unit,avgScore,examples'],
            'analysis.structured.accurateUnits.*.unit' => ['required', 'string', 'max:32'],
            'analysis.structured.accurateUnits.*.avgScore' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.accurateUnits.*.examples' => ['present', 'array', 'max:20'],
            'analysis.structured.accurateUnits.*.examples.*' => ['required', 'string', 'max:200'],
            'analysis.structured.needsWorkUnits' => ['present', 'array', 'max:100'],
            'analysis.structured.needsWorkUnits.*' => ['required', 'array:unit,avgScore,examples'],
            'analysis.structured.needsWorkUnits.*.unit' => ['required', 'string', 'max:32'],
            'analysis.structured.needsWorkUnits.*.avgScore' => ['required', 'numeric', 'between:0,100'],
            'analysis.structured.needsWorkUnits.*.examples' => ['present', 'array', 'max:20'],
            'analysis.structured.needsWorkUnits.*.examples.*' => ['required', 'string', 'max:200'],
            'feedback' => ['required', 'array:text'],
            'feedback.text' => ['required', 'string', 'max:10000'],
        ]);

        if ($validator->fails() || ! $this->containsFiniteNumbers($payload)) {
            return false;
        }

        if (isset($payload['meta']['schemaVersion'])) {
            return $payload['meta']['alignmentSource'] === 'none'
                && $payload['meta']['learningEligible'] === false
                && $payload['analysis']['structured']['overall']['status'] === 'unknown'
                && $payload['analysis']['lowScoring'] === []
                && $payload['analysis']['structured']['words'] === []
                && $payload['analysis']['structured']['accurateUnits'] === []
                && $payload['analysis']['structured']['needsWorkUnits'] === [];
        }

        return true;
    }

    private function containsFiniteNumbers(mixed $value): bool
    {
        if (is_int($value) || is_float($value)) {
            return is_finite((float) $value);
        }

        if (! is_array($value)) {
            return true;
        }

        foreach ($value as $nestedValue) {
            if (! $this->containsFiniteNumbers($nestedValue)) {
                return false;
            }
        }

        return true;
    }

    private function isTimeout(ConnectionException $exception): bool
    {
        $message = strtolower($exception->getMessage());

        return str_contains($message, 'timed out') || str_contains($message, 'timeout') || str_contains($message, 'error 28');
    }
}
