# Gemma 4 E2B IT on Linux with llama.cpp

This guide targets Ubuntu 24.04 LTS and Bash. It builds a CPU server, downloads the instruction-tuned model and its audio projector, and checks transcription with two recordings. Run it as an ordinary user on the machine that will host inference. Only package installation needs sudo.

## 1. Build the runtime

Use a fresh working directory outside the TalkTherapy checkout. Allow about 3.83 GB for the two model files, plus space for source and build artifacts. Actual inference memory depends on the build, context size, and hardware. [Model files](https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/tree/main)

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake git curl libcurl4-openssl-dev libssl-dev ffmpeg jq ca-certificates
mkdir -p "$HOME/gemma-slp"
cd "$HOME/gemma-slp"
git clone --depth 1 https://github.com/ggml-org/llama.cpp.git
cmake -S llama.cpp -B llama.cpp/build -DCMAKE_BUILD_TYPE=Release
cmake --build llama.cpp/build --target llama-server --parallel 2
llama.cpp/build/bin/llama-server --version
git -C llama.cpp rev-parse HEAD
```

Record the printed commit with the pilot results so another machine can reproduce the runtime. The CPU build works independently of a GPU driver. For a CUDA or Vulkan build, use the backend-specific prerequisites and CMake flags in the [upstream Linux build guide](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md).

## 2. Download and verify the model

In the same terminal, fetch both files from one revision. The projector lets the server process audio.

```bash
cd "$HOME/gemma-slp"
mkdir -p models
revision=2a8538c2e2d4687953a86c422c7c623cfd022880
repo="https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/resolve/$revision"
weights=gemma-4-E2B-it-Q4_0.gguf
projector=mmproj-gemma-4-E2B-it-BF16.gguf
for file in "$weights" "$projector"; do
  curl --fail --location --retry 2 --continue-at - --output "models/$file" "$repo/$file" || break
done
sha256sum "models/$weights" "models/$projector"
```

Compare **both** printed hashes against the SHA-256 values on the file detail pages at the [pinned revision](https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/tree/2a8538c2e2d4687953a86c422c7c623cfd022880). Proceed once both match.

## 3. Start the private server

```bash
cd "$HOME/gemma-slp"
./llama.cpp/build/bin/llama-server \
  -m models/gemma-4-E2B-it-Q4_0.gguf \
  --mmproj models/mmproj-gemma-4-E2B-it-BF16.gguf \
  --alias gemma-slp --host 127.0.0.1 --port 8091 -c 4096 -np 1
```

Leave this terminal open. In a second terminal, check readiness:

```bash
base=http://127.0.0.1:8091
curl -fsS "$base/health" | jq -e '.status == "ok"'
curl -fsS "$base/v1/models" | jq -e 'any(.data[]; .id == "gemma-slp")'
```

Both checks should print `true`. A temporary 503 during model loading is expected. If the process exits, inspect the first terminal for missing files or allocation errors and check available memory with `free -h`.

## 4. Verify audio inference

In the second terminal, open a folder containing two **nonpatient** speech clips named `first.webm` and `second.webm`. Use two different known phrases under 30 seconds each. The model receives the audio and a transcription instruction, without the expected answers. The pipeline streams base64 through stdin so longer clips do not hit Linux's command-line argument limit. [llama.cpp audio API](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

```bash
set -o pipefail
for name in first second; do
  ffmpeg -nostdin -v error -n -i "$name.webm" -vn -ac 1 -ar 16000 \
    -c:a pcm_s16le "$name-16k.wav" || break
  base64 -w 0 "$name-16k.wav" |
    jq -Rsc '{model:"gemma-slp", stream:false, temperature:0, max_tokens:128,
      messages:[{role:"user",content:[
        {type:"input_audio",input_audio:{data:.,format:"wav"}},
        {type:"text",text:"Transcribe the spoken words. If unintelligible, return UNCLEAR."}
      ]}]}' |
    curl -fsS --max-time 120 -H 'Content-Type: application/json' \
      --data-binary @- "$base/v1/chat/completions" |
    jq -er '.choices[0].message.content | select(type == "string" and length > 0)' || break
done
```

Pass when **both** transcripts reflect their respective phrases. A generic answer for both clips calls for checking the projector and the server build. FFmpeg preserves existing WAVs; use a fresh fixture directory on a repeat run. Stop inference with Ctrl+C in the server terminal.

## 5. Connect to TalkTherapy

For native Linux development, Python running on the same host can use `http://127.0.0.1:8091`. For Docker Compose, run the inference server on the private service network, bind to the container interface, and use its service name from Python without publishing port 8091. Laravel remains responsible for authorization and clinician approval.

The model accepts up to 30 seconds of audio, while assigned exercises allow 60 seconds. The pilot uses Whisper transcripts and clinician observations for longer submissions. Continue with the [integration phases and acceptance checks](gemma-4-e2b-setup-and-integration.md#4-integration-execution-plan). [Google model card](https://huggingface.co/google/gemma-4-E2B-it)
