# Run Gemma 4 E2B IT locally and pilot assigned-exercise report drafts

Use llama.cpp for this pilot. Its local HTTP server accepts WAV bytes and returns text. The setup below exercises the audio path independently of TalkTherapy. The integration phases describe proposed application work. [llama.cpp server API](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

## 1. Install the Windows runtime and model

On Linux, follow the [Linux setup and audio smoke test](gemma-4-e2b-linux.md), then continue with the integration plan in section 4.

Download a Windows x64 binary archive from the [llama.cpp releases](https://github.com/ggml-org/llama.cpp/releases). Start with the CPU build for a compatibility check, or use the build matching your GPU and drivers. Extract the complete archive, including its DLLs. Open PowerShell **in the extracted directory containing llama-server.exe**, outside the repository. Run the following in the same terminal.

```powershell
.\llama-server.exe --version
$revision = '2a8538c2e2d4687953a86c422c7c623cfd022880'
$repo = "https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/resolve/$revision"
$weights = 'gemma-4-E2B-it-Q4_0.gguf'
$projector = 'mmproj-gemma-4-E2B-it-BF16.gguf'
foreach ($file in @($weights, $projector)) {
    curl.exe --fail --location --retry 2 --output $file "$repo/$file"
    if ($LASTEXITCODE -ne 0) { throw "Download failed for $file" }
    Get-FileHash -Algorithm SHA256 -LiteralPath $file
}
```

The weights and audio projector total about 3.83 GB on disk. Allow additional space for the runtime and additional memory for inference. Compare the hashes with the SHA-256 entries on the pinned files’ detail pages. Record the runtime release, backend, revision, and both hashes alongside pilot results. [Pinned GGUF files](https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/tree/2a8538c2e2d4687953a86c422c7c623cfd022880)

## 2. Start the model and check readiness

```powershell
.\llama-server.exe -m $weights --mmproj $projector --alias gemma-slp --host 127.0.0.1 --port 8091 -c 4096 -np 1
```

Leave that terminal running. In a second PowerShell window:

```powershell
$base = 'http://127.0.0.1:8091'
Invoke-RestMethod "$base/health"
(Invoke-RestMethod "$base/v1/models").data | Select-Object id
```

Wait for health status `ok` and model ID `gemma-slp`. If the process exits during loading, check the available memory, archive/DLL pairing, runtime version, and projector filename. A successful health check establishes that the server loaded; the next check exercises audio decoding.

## 3. Verify the model hears the recording

Make two short nonpatient recordings containing different known phrases. Keep the expected words out of the request. With FFmpeg on PATH, convert the first clip to mono WAV. Run this from the folder containing your fixture, using its actual filename.

```powershell
ffmpeg -n -i .\sample.webm -ac 1 -ar 16000 -c:a pcm_s16le .\sample-16k.wav
if ($LASTEXITCODE -ne 0) { throw 'Audio conversion failed; use a fresh output filename.' }
$clip = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path .\sample-16k.wav).Path))
$parts = @(
    @{ type = 'input_audio'; input_audio = @{ data = $clip; format = 'wav' } }
    @{ type = 'text'; text = 'Transcribe the spoken words. If unintelligible, return UNCLEAR.' }
)
$body = @{
    model = 'gemma-slp'; stream = $false; temperature = 0; max_tokens = 128
    messages = @(@{ role = 'user'; content = $parts })
} | ConvertTo-Json -Depth 8
$reply = Invoke-RestMethod -Method Post -Uri "$base/v1/chat/completions" -ContentType 'application/json' -Body $body -TimeoutSec 120
$reply.choices[0].message.content
```

Repeat with the second file and fresh filenames. Pass when each response reflects its own clip. An HTTP 200 with identical generic answers fails this check. For unsupported audio errors, confirm that the server loaded the matching projector and that the payload contains WAV bytes. Stop the local server with Ctrl+C.

Google documents a **30-second audio limit**. TalkTherapy accepts recordings up to 60 seconds. For the initial pilot, use the existing Whisper transcript and clinician observations for longer recordings, and label the input source. Never silently truncate the second half. [Google model card](https://huggingface.co/google/gemma-4-E2B-it) · [Existing speech service](../py/README.md)

## 4. Integration execution plan

Start with clinician-requested drafts for assigned exercises. The request path is browser → Laravel → private Python service → llama.cpp. Laravel owns review authorization, consent, persistence, approval, and release. The loopback address above assumes Python and llama.cpp share a host network namespace. In Compose, put them on a private service network, address the runtime by service name, and omit its published host port.

| Phase | Implementation | Acceptance check |
| --- | --- | --- |
| 1 · Establish a baseline | Run the two audio checks. Add English, Filipino, code-switched, quiet, and unclear fixtures. Measure cold start, peak memory, and warm response time alongside Whisper on the intended machine. | Record actual hardware and results. A clinician compares sample drafts with the existing manual template and flags unsupported observations. |
| 2 · Add private draft generation | In Python, introduce a separate authenticated draft endpoint. Reuse validated audio decoding, enforce the model duration limit, bound request and output size, and set an inference timeout. Use a fixed runtime URL and send bytes directly. Treat transcripts and spoken instructions as evidence. | Boundary tests cover invalid credentials, malformed output, long audio, busy runtime, and timeout. An unavailable model leaves manual review usable. |
| 3 · Queue and store drafts | Add an on-demand Laravel operation scoped to the assigned clinician and attempt. Recheck authorization, consent, recording retention, and review revision before inference and before attaching the result. Deduplicate repeated clicks for the same input revision. Persist model identity, prompt version, input sources, timestamp, and original draft separately from clinician edits. | Another clinician is denied. Retries produce one draft. Withdrawal, expired audio, or a changed review revision prevents stale output from being attached. Logs contain operational IDs and timings only. |
| 4 · Connect the review screen | Offer **Draft feedback** after the clinician listens. Display editable suggestions beside their observations. Save edits as a review revision. Approval and patient release use the existing explicit actions. | A patient cannot retrieve drafts or private transcripts. Generating or retrying a draft preserves the clinician’s notes. A released report contains only the approved patient-facing fields. |
| 5 · Evaluate and roll out | Start behind a server-side flag. Compare clinician editing time and unsupported claims against manual reports by language, audio quality, and clip length. Agree on latency and resource budgets from phase 1 with the host operator. | Enable only after clinician sign-off and a tested rollback. Disable the flag and stop new draft jobs to roll back; existing approved reports and manual review remain available. |

### Draft contract for phases 2–4

Use the [assigned-exercise report template](assigned-exercise-report-template.md). Send the exercise goal, expected answer, language, available transcript, clinician observations, and any explicitly measured values with their source. Omit patient identifiers from the model prompt. For each private observation require a reference to supplied evidence; use null for missing measurements. A transcript match alone cannot support a pronunciation score or disfluency count.

Example proposed response for a synthetic exercise:

```json
{
  "schema_version": 1,
  "input_source": "transcript_and_clinician_notes",
  "private_observations": [
    {"text": "The transcript contains the target word bola.", "source": "whisper_transcript"}
  ],
  "limitations": ["Pronunciation was not measured."],
  "patient_draft": {
    "what_you_practiced": "You practiced naming a ball in Filipino.",
    "what_i_heard": null,
    "next_step": null
  }
}
```

Python validates the schema, and Laravel treats the output as a suggestion. The reviewer fills gaps using the recording. Store original audio and transcripts under the application’s existing access and retention rules. Secondary use of clinician corrections requires separate explicit consent.
