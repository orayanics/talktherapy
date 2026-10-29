# Spec: phoneme-analysis

Status: proposed. Depends on: identity, platform. Inherits [common conventions](../ARCHITECTURE.md) and [speech contract](../API-CONTRACT.md#speech-response-contract). Addresses audit 8, 9, 10, 12, 18. Decisions D8, D10, D11.

## Objective and current scope

Keep inference in Python and replace only the public API/proxy boundary with Laravel, while separately correcting and validating the analysis implementation. Sources: active `server/src/modules/slp/index.ts`; uncalled `assessment/service.ts`; every Python source/config file; `client/src/api/slp.ts`, SLP recording page/hook and result components. No current persistence model exists for recordings/results.

## Service boundary

- Browser -> Laravel `POST /api/v1/slp/assess`, multipart `audio` and `reference_text`. Verified active users may self-assess; no patient ID/clinical-record write is inferred. Laravel enforces account/user limits and forwards to configured private Python `/v1/assess` using multipart `referenceText` for the existing internal DTO naming.
- Python accepts only authenticated service requests on an internal network. Shared service credential or mTLS is injected server-side, never Vite/client config; compare tokens safely and rotate. CORS is not authorization. No browser Python URL or backend database credentials.
- Proposed upload caps: 10 MiB encoded bytes, <=60 seconds decoded duration, 1..800 trimmed reference characters, supported WebM/Opus and WAV formats initially (add browser codec variants only with fixtures). Inspect actual decoded media; do not trust extension/MIME. Apply proxy/PHP/Python byte caps consistently and stream bounded chunks. Reject empty/silent/nonfinite/unsupported input explicitly.
- Laravel `Http::attach()` streams a file handle, uses configured host, service credential, request ID, connect deadline and total deadline, and handles non-2xx responses explicitly. Proposed connect 3 s / total 45 s; Python end-to-end budget 40 s including decode and inference. Tune to measured hardware before release. Do not auto-retry inference POSTs or pretend an HTTP timeout cancels Python work. [HTTP client](https://laravel.com/framework/docs/13.x/http-client).
- Map invalid audio/text to 422, oversized to 413, client throttling to 429, busy/unready service to 503, invalid upstream output to 502 and inference deadline to 504. Return safe codes/messages and request ID, not Python exception text. Validate successful DTO deeply, including finite ranges, list/string bounds, enum values and nullable fields.

## Python runtime and resource rules

- Add an exact tested Python package manifest/lock plus test dependencies and a reproducible Linux image/system dependency recipe for FFmpeg/espeak-ng. Record model revisions/checksums/licenses and provision weights before serving; health must not trigger downloads.
- First feasibility task proves the current alignment stack in a known compatible environment. Do not install latest TorchAudio blindly: official documentation flags alignment API deprecation/removal. A temporary compatible pin is an explicit limit with a supported replacement task, not a permanent production maintenance plan. [Deprecation](https://docs.pytorch.org/audio/stable/tutorials/forced_alignment_for_multilingual_data_tutorial.html).
- Model startup is explicit application lifespan/readiness work, not a surprise import-time network download. Warm one inference process initially, with bounded admission (one active inference per worker) and no unbounded waiting queue. Reject busy requests promptly. ASR/alignment work leaves the async event loop; a thread alone does not make timeout cancellation safe.
- Use an isolated worker process with an enforced wall-clock budget and kill/restart recovery for stuck decode/inference. FFmpeg gets `-nostdin`, subprocess timeout and supported-input restrictions. Parent owns a per-request temporary directory containing both original/converted files; cleanup works even when conversion fails before returning an output filename, child crashes or caller disconnects. Do not retain audio as an implementation convenience.
- Liveness is cheap; readiness confirms loaded models/decoder availability. Log only IDs, byte count, format/duration, model/scoring version, elapsed time and safe failure codes. Remove transcript/word logging and raw exception bodies.

## Scientific correctness gate

The existing output is an unvalidated heuristic, not a diagnosis. Token alignment confidence, transcript character error rate (CER), pronunciation quality and clinical impairment are different quantities. Laravel must not change or reinterpret these concepts implicitly.

- Establish MMS_FA's expected text/token inventory and output score scale from the pinned implementation. Current IPA-to-letter mapping collapses different sounds and sends phonetic substitutions to a text alignment model. Prove a valid alignment input approach before describing the output as phoneme accuracy. [Bundle contract](https://docs.pytorch.org/audio/2.8.0/generated/torchaudio.pipelines.Wav2Vec2FABundle.html).
- Fix duration to count actual frames (`sum(span.end - span.start)` or the pinned API's equivalent), not `len(spans)`. Verify score conversion against actual probability/log-space semantics; current sigmoid constants must not be assumed calibrated. Preserve word boundaries and digraph identity rather than reconstructing incompatible units after alignment.
- Empty ASR transcript currently pairs CER=1 with alignment confidence=1; define unscorable/no-speech behavior explicitly instead of producing a confident reference alignment. Distinguish missing words, extra words, different spoken text and unsupported language; silently skipping unphonemizable words must not inflate a score.
- Validate configuration types/ranges/finite numbers and threshold ordering. Fail a malformed/missing required YAML configuration rather than silently changing calibration when PyYAML is absent. Version scoring settings and model artifacts.
- Contract tests preserve fields, not incorrect numerical outputs. New score semantics get a scoring version and clinician-reviewed fixtures covering intended language/accent/disorder populations. No new numeric calibration target is invented here; release criteria and acceptable error must be established by a qualified reviewer before clinical claims.
- MMS_FA documentation labels its weights CC-BY-NC 4.0. Confirm rights for the actual intended deployment/artifact; do not assume the Python package license covers the weights. [Model documentation](https://docs.pytorch.org/audio/2.8.0/generated/torchaudio.pipelines.MMS_FA.html).

## Acceptance and verification

Laravel tests use `Http::fake()`/prevent stray requests and cover multipart names/credential, valid DTO, malformed JSON/DTO/ranges, upstream 422/503/timeout, oversized/unauthorized input and no retry. Python tests cover byte/duration limits, malformed audio, silence, no valid tokens, unsupported language, repeated words/digraphs, CER edge cases, frame-duration scoring, bad config, deadlines, process death, concurrency admission and cleanup. Use synthetic/licensed nonpatient audio fixtures.

Run `php artisan test --filter=Phoneme`, `python -m pytest -q` from `py/`, client SLP tests/typecheck and a clean-image integration assessment. Measure cold/warm latency and peak memory on deployment hardware before setting worker count. Clinical validation and license approval are independent release gates, not made green by technical contract tests.

## Task plan

1. **F1 — Prove runtime/model feasibility.** Dependency: P1; can start before identity. Files: Python manifest/lock, image recipe, model manifest and smoke fixture/test (<=five). Acceptance: clean known-compatible startup, dependency/model versions and licensing evidence recorded. Verify: build isolated image, warm model, run one synthetic fixture; no latest-version guess.
2. **F2 — Establish inference contract tests.** Dependency: F1. Files: DTO, route test, fake-model fixture, config test and client DTO test (five). Acceptance: success/failure schema and `unknown`/null/CER edges covered without downloading weights. Verify: Python tests and client typecheck.
3. **F3 — Bound uploads/decoder lifecycle.** Dependency: F2. Files: route, auth/limit dependency, decoder worker, cleanup/decode tests (max five). Acceptance: streamed caps, private auth, timeout and all temporary-file paths cleaned. Verify: corrupt/oversized/failed-conversion/process-death tests.
4. **F4 — Isolate inference/readiness.** Dependency: F3. Files: app lifespan, worker supervisor, ASR startup change, resource integration test (four). Acceptance: one admitted job/worker, enforced budget and responsive health; recovery after timeout. Verify: real-process concurrency/deadline tests plus hardware measurement.
5. **F5 — Validate alignment and scoring.** Dependency: F1/F2, clinician review. Files: alignment, phonemization, scoring/config, scientific fixture test (five per focused correction). Acceptance: correct token/score/frame semantics, explicit unscorable cases and versioned calibration evidence. Verify: pure-unit tests plus clinician-reviewed audio corpus. Split token mapping, scoring and calibration changes into independent reviewed slices.
6. **F6 — Add Laravel proxy.** Dependency: I2/F2/P2. Files: assessment request/controller, concrete PhonemeClient, services config, feature test (five). Acceptance: secure multipart forwarding, deadline/error/DTO validation and no retry. Verify: `php artisan test --filter=Phoneme` with HTTP fakes.
7. **F7 — Connect browser assessment.** Dependency: F6/F3. Files: SLP API, hook, recorder page, result type/display, client test (five per batch). Acceptance: upload cap, no manual multipart boundary, clear timeout/busy/unscorable UI and unchanged intended result structure. Verify: client tests/build and browser recording with each supported codec.
8. **F8 — Approve supported production model path.** Dependency: F4/F5 and D10/D11. Files: runtime/model decision record, compatibility pins/image update, regression fixtures (<=five per change). Acceptance: license, maintenance path, measured budgets and clinician validation accepted; otherwise keep analysis unavailable with a safe error. Verify: clean-image full inference and documented sign-off.

## Exclusions

No LLM feedback generation, external cloud ASR, stored assessment history, recordings bucket, automatic SOAP writing or GPU scaling platform. If 60-second inputs cannot finish within the approved synchronous budget on real hardware, make a separate explicit queued-job/API decision rather than silently retaining requests forever.
