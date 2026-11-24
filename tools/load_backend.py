"""Drive the local Laravel/MySQL/Python stack with scheduled HTTP arrivals."""

import argparse
import base64
import concurrent.futures
import contextlib
import hashlib
import http.client
import json
import os
import platform
import re
import secrets
import shutil
import socket
import subprocess
import threading
import time
import uuid
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from analyze_benchmarks import percentile


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = re.compile(r"talktherapy_bench_[0-9a-f]{24}\Z")
BOOKING = {"encounter": dict(diagnosis="Synthetic", chief_complaint="Synthetic",
                             referral_source="Benchmark")}
CREATE_HIDDEN = getattr(subprocess, "CREATE_NO_WINDOW", 0)
THREAD = threading.local()
LIMITS = {"dashboard": 500, "availability": 500, "appointments": 500,
          "booking": 1000, "practice": 10000, "queued": 60000}


def command(arguments, **kwargs):
    return subprocess.run(arguments, check=True, encoding="utf-8",
                          creationflags=CREATE_HIDDEN, **kwargs)


def ports(count):
    with contextlib.ExitStack() as stack:
        sockets = [stack.enter_context(socket.socket()) for _ in range(count)]
        for listener in sockets:
            listener.bind(("127.0.0.1", 0))
        return [listener.getsockname()[1] for listener in sockets]


@contextlib.contextmanager
def service(arguments, log, env, cwd):
    with log.open("wb") as output, subprocess.Popen(
            arguments, stdout=output, stderr=subprocess.STDOUT, env=env,
            cwd=cwd, creationflags=CREATE_HIDDEN) as process:
        try:
            yield process
        finally:
            if process.poll() is None:
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               creationflags=CREATE_HIDDEN, check=False)
                if process.poll() is None:
                    process.kill()


def request(port, path, actor=None, data=None, *, upload=None, timeout=50, service_token=None):
    headers = {"Accept": "application/json"}
    if actor:
        headers.update({"Cookie": actor["cookie"], "X-CSRF-TOKEN": actor["csrf"],
                        "Origin": f"http://127.0.0.1:{port}"})
    if service_token:
        headers["X-Service-Token"] = service_token
    body = None
    if upload:
        field, audio = upload
        boundary = uuid.uuid4().hex
        parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode()
                 for key, value in (data or {}).items()]
        parts.extend((f'--{boundary}\r\nContent-Disposition: form-data; name="{field}"; '
                      'filename="practice.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode(),
                      audio, f"\r\n--{boundary}--\r\n".encode()))
        body = b"".join(parts)
        headers["Content-Type"] = "multipart/form-data; boundary=" + boundary
    elif data is not None:
        body = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"

    connection = getattr(THREAD, "connection", None)
    if connection is None or connection.port != port or connection.timeout != timeout:
        if connection:
            connection.close()
        connection = THREAD.connection = http.client.HTTPConnection("127.0.0.1", port, timeout=timeout)
    try:
        connection.request("POST" if body is not None else "GET", path, body, headers)
        response = connection.getresponse()
        raw = response.read()
        return response.status, json.loads(raw) if raw and "json" in response.headers.get("Content-Type", "") else {}
    except (OSError, http.client.HTTPException) as error:
        connection.close()
        return 0, {"transport_error": str(error)}
    except ValueError:
        return response.status, {}


def ready(process, port, path, log, timeout):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline and process.poll() is None:
        if request(port, path, timeout=1)[0] == 200:
            return
        time.sleep(.2)
    raise RuntimeError(f"Service failed readiness. See {log}")


def nginx_config(port, workers, server, directory):
    targets = "".join(f"server 127.0.0.1:{worker};\n" for worker in workers)
    return f"""daemon off;
master_process off;
error_log "{directory.as_posix()}/nginx-errors.log" warn;
pid "{directory.as_posix()}/nginx.pid";
events {{ worker_connections 1024; }}
http {{
    access_log off;
    client_max_body_size 11m;
    upstream php {{ least_conn; {targets} }}
    server {{
        listen 127.0.0.1:{port};
        location / {{
            fastcgi_pass php;
            fastcgi_read_timeout 55s;
            fastcgi_param SCRIPT_FILENAME "{server.as_posix()}/public/index.php";
            fastcgi_param SCRIPT_NAME /index.php;
            fastcgi_param REQUEST_METHOD $request_method;
            fastcgi_param QUERY_STRING $query_string;
            fastcgi_param REQUEST_URI $request_uri;
            fastcgi_param CONTENT_TYPE $content_type;
            fastcgi_param CONTENT_LENGTH $content_length;
            fastcgi_param SERVER_PROTOCOL $server_protocol;
            fastcgi_param SERVER_NAME 127.0.0.1;
            fastcgi_param SERVER_PORT $server_port;
            fastcgi_param REMOTE_ADDR $remote_addr;
            fastcgi_param REDIRECT_STATUS 200;
        }}
    }}
}}
"""


@contextlib.contextmanager
def laravel(args, scale, shape, variant, directory, python_port, token, clock):
    port, *listeners = ports(1 + args.php_workers)
    server = ROOT / "server"
    storage = directory / "storage"
    for folder in ("app/private", "framework/cache", "framework/sessions", "framework/views", "logs"):
        (storage / folder).mkdir(parents=True)
    origin = f"http://127.0.0.1:{port}"
    env = dict(os.environ, APP_ENV="local", APP_DEBUG="false", APP_URL=origin,
               APP_KEY="base64:" + base64.b64encode(secrets.token_bytes(32)).decode(),
               APP_CONFIG_CACHE=str(directory / "config.php"), LARAVEL_STORAGE_PATH=str(storage),
               DB_CONNECTION="mysql", DB_HOST="127.0.0.1", DB_PORT="3306",
               DB_USERNAME="root", DB_PASSWORD="", DB_URL="", DB_SOCKET="", DB_DATABASE="",
               SESSION_DRIVER="database", SESSION_CONNECTION="", SESSION_DOMAIN="",
               SESSION_SECURE_COOKIE="false", SANCTUM_STATEFUL_DOMAINS=f"127.0.0.1:{port}",
               CACHE_STORE="database", DB_CACHE_CONNECTION="", QUEUE_CONNECTION="database",
               DB_QUEUE_CONNECTION="", DB_QUEUE_RETRY_AFTER="90",
               BROADCAST_CONNECTION="null", LOG_CHANNEL="stderr", PHP_FCGI_MAX_REQUESTS="0",
               PHONEME_SERVICE_URL=f"http://127.0.0.1:{python_port}", PHONEME_SERVICE_TOKEN=token)
    prepare = [args.php, "artisan", "app:benchmark-prepare", f"--scale={scale}",
               f"--shape={shape}", f"--actors={args.actors}", f"--clock={clock}", "--no-interaction"]
    if args.index:
        prepare.append(f"--index={args.index}")
        if variant == "before":
            prepare.append("--without-index")
    try:
        setup = command(prepare, cwd=server, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as error:
        log = directory / "prepare.log"
        log.write_text(error.stdout, encoding="utf-8")
        raise RuntimeError(f"Fixture setup failed. See {log}") from None
    manifest = json.loads(setup.stdout.splitlines()[-1])
    database = manifest["database"]
    if not SCHEMA.fullmatch(database):
        raise RuntimeError("Fixture setup did not return a generated benchmark schema")
    env["DB_DATABASE"] = database
    try:
        config = directory / "nginx.conf"
        config.write_text(nginx_config(port, listeners, server, directory), encoding="utf-8")
        for folder in ("logs", "temp"):
            (directory / folder).mkdir()
        with contextlib.ExitStack() as stack:
            for process_number, address in enumerate(listeners):
                php = [str(Path(args.php).with_name("php-cgi.exe")), "-d", "upload_max_filesize=10M",
                       "-d", "post_max_size=12M", "-b", f"127.0.0.1:{address}"]
                stack.enter_context(service(php, directory / f"php-{process_number}.log", env, server))
            nginx = stack.enter_context(service([args.nginx, "-p", str(directory), "-c", str(config)],
                                                directory / "nginx.log", env, directory))
            log = directory / "nginx.log"
            ready(nginx, port, "/up", log, 20)
            for number in range(args.queue_workers):
                worker = [args.php, "artisan", "queue:work", "database", "--sleep=1",
                          "--timeout=55", "--no-interaction"]
                stack.enter_context(service(worker, directory / f"queue-{number}.log", env, server))
            status, body = request(port, "/api/v1/dashboard/summary", manifest["sessions"]["patient"][0])
            if status != 200:
                reason = body.get("transport_error") or body.get("code") or ""
                raise RuntimeError(f"Authenticated preflight returned HTTP {status} {reason}. See {directory}")
            with concurrent.futures.ThreadPoolExecutor(max_workers=args.php_workers) as warmups:
                routes = ("/dashboard/summary", "/slots", "/appointments")
                statuses = list(warmups.map(lambda i: request(port, "/api/v1" + routes[i % len(routes)],
                                                               manifest["sessions"]["patient"][0])[0],
                                            range(args.php_workers * 2)))
            if set(statuses) != {200}:
                raise RuntimeError(f"HTTP warmup failed with {Counter(statuses)}. See {directory}")
            yield port, manifest
    finally:
        command([args.mysql, "--no-defaults", "--protocol=TCP", "--host=127.0.0.1",
                 "--user=root", "--execute", f"DROP DATABASE `{database}`"],
                stdout=subprocess.DEVNULL)


def exercise(port, operation, actor, audio, slot, scheduled, drain_deadline):
    started = time.monotonic()
    if started >= drain_deadline:
        return dict(operation=operation, status=0, ok=False, terminal="dispatch_deadline",
                    accepted_ms=None, wall_ms=(started - scheduled) * 1000, requests=[],
                    dispatch_ms=(started - scheduled) * 1000, started=started, finished=started)
    statuses = []

    def call(path, data=None, upload=None):
        result = request(port, "/api/v1" + path, actor, data, upload=upload)
        statuses.append(result[0])
        return result

    terminal = None
    accepted_ms = None
    if operation == "practice":
        status, answer = call("/slp/assess", {"reference_text": "The sun is shining.", "language": "en"},
                              ("audio", audio))
        ok = status == 200 and "meta" in answer.get("data", {})
    elif operation == "queued":
        status, answer = call(f'/slp/assignments/{actor["assignment"]}/attempts',
                              {"consent_id": actor["consent"], "submission_key": uuid.uuid4().hex})
        ok = False
        if status == 201:
            path = "/slp/attempts/" + answer["data"]["id"]
            status, _ = call(path + "/recording", upload=("recording", audio))
            if status == 202:
                accepted = time.monotonic()
                accepted_ms = (accepted - scheduled) * 1000
                while time.monotonic() + 2 <= drain_deadline:
                    time.sleep(2)
                    poll_status, answer = call(path)
                    if poll_status != 200:
                        status = poll_status
                        break
                    terminal = answer.get("data", {}).get("analysis_status")
                    if terminal not in ("queued", "running"):
                        break
                ok = terminal == "succeeded"
    elif operation == "booking":
        status, _ = call(f"/slots/{slot}/book", BOOKING)
        ok = status == 201
    else:
        paths = {"dashboard": "/dashboard/summary", "availability": "/slots",
                 "appointments": "/appointments"}
        status, _ = call(paths[operation])
        ok = status == 200
    finished = time.monotonic()
    return dict(operation=operation, status=status, ok=ok, terminal=terminal,
                accepted_ms=accepted_ms, wall_ms=(finished - scheduled) * 1000,
                dispatch_ms=(started - scheduled) * 1000, requests=statuses,
                started=started, finished=finished)


def measure(args, port, manifest, audio, profile, api_rate, speech_rate):
    patients = manifest["sessions"]["patient"]
    clinicians = manifest["sessions"]["clinician"]
    slots = manifest["slots"]
    start = time.monotonic() + .25
    stop = start + args.duration
    events = []
    core = ("dashboard", "availability", "appointments", "dashboard", "availability",
            "appointments", "dashboard", "availability", "appointments", "dashboard")
    for i in range(round(api_rate * args.duration)):
        offset = i / api_rate
        operation = core[i % len(core)]
        group = clinicians if operation == "dashboard" and i % 2 == 0 else patients
        events.append((offset, operation, group[i % len(group)], None))
    for i in range(round(speech_rate * args.duration / 60)):
        operation = "practice" if i % 2 == 0 else "queued"
        events.append((i * 60 / speech_rate, operation, patients[i % len(patients)], None))
    if profile in ("api", "mixed"):
        # Controlled write stream reserves a slot for the separate contention scenario.
        for i, slot in enumerate(slots[1:1 + int(args.duration)]):
            events.append((i + .3, "booking", patients[i % len(patients)], slot))
    if profile == "race":
        events = [(0, "booking", actor, slots[0]) for actor in patients[:args.race_users]]

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.threads) as pool:
        pending = []
        for delay, operation, actor, slot in sorted(events, key=lambda event: event[0]):
            scheduled = start + delay
            time.sleep(max(0, scheduled - time.monotonic()))
            pending.append(pool.submit(exercise, port, operation, actor, audio, slot, scheduled, stop + args.drain))
        samples = [future.result() for future in pending]
    active = peak = 0
    changes = sorted([point for sample in samples if sample["finished"] > sample["started"]
                      for point in ((sample["started"], 1), (sample["finished"], -1))])
    for _, change in changes:
        active += change
        peak = max(peak, active)
    for sample in samples:
        del sample["started"]
        sample["completed_in_window"] = sample.pop("finished") <= stop
    result = dict(samples=samples, peak_active=peak)
    if profile == "race":
        result["race_ok"] = len(samples) >= 2 and Counter(s["status"] for s in samples) == {201: 1, 409: len(samples) - 1}
    return result


def summarize(result, duration):
    groups = {}
    for sample in result["samples"]:
        groups.setdefault(sample["operation"], []).append(sample)
    metrics = {}
    for operation, samples in groups.items():
        completed = [s for s in samples if s["ok"]]
        latencies = [s["wall_ms"] - (s["accepted_ms"] or 0) for s in completed]
        p95 = percentile(latencies, .95) if latencies else None
        statuses = Counter(str(s["status"]) for s in samples)
        metrics[operation] = dict(offered=len(samples), successful=len(completed),
                                  successful_per_second=sum(s.get("completed_in_window", False)
                                                            for s in completed) / duration,
                                  p95_ms=p95, statuses=statuses,
                                  p95_dispatch_ms=percentile([s["dispatch_ms"] for s in samples], .95),
                                  request_statuses=Counter(str(status) for s in samples for status in s["requests"]),
                                  meets_target=(len(completed) / len(samples) > .99 and p95 is not None
                                                and p95 <= LIMITS[operation]))
    return metrics


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--nginx", required=True, type=lambda p: str(Path(p).resolve()))
    parser.add_argument("--ffmpeg-dir", required=True, type=Path)
    parser.add_argument("--model-dir", required=True, type=Path)
    parser.add_argument("--model-revision", required=True)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--php", default=shutil.which("php"))
    parser.add_argument("--mysql", default=shutil.which("mysql"))
    parser.add_argument("--scales", default="10,100,1000")
    parser.add_argument("--shapes", default="wide,hot")
    parser.add_argument("--profiles", default="api,speech,mixed,race")
    parser.add_argument("--api-rate", type=float, default=5)
    parser.add_argument("--speech-rate", type=float, default=6)
    parser.add_argument("--ramp", action="store_true", help="Double isolated rates until a target misses or a ceiling is reached")
    parser.add_argument("--api-ceiling", type=float, default=80)
    parser.add_argument("--speech-ceiling", type=float, default=96)
    parser.add_argument("--blocks", type=int, default=1)
    parser.add_argument("--duration", type=int, default=60)
    parser.add_argument("--drain", type=int, default=90)
    parser.add_argument("--php-workers", type=int, default=4)
    parser.add_argument("--queue-workers", type=int, default=1)
    parser.add_argument("--actors", type=int, default=100)
    parser.add_argument("--threads", type=int, default=128)
    parser.add_argument("--race-users", type=int, default=10)
    parser.add_argument("--index", help="Add a candidate index (table:column,column) in after blocks")
    args = parser.parse_args()

    profiles = args.profiles.split(",")
    shapes = args.shapes.split(",")
    scales = [int(x) for x in args.scales.split(",")]
    if (os.name != "nt" or not args.php or not args.mysql or not all(1 <= scale <= 1000 for scale in scales)
            or not set(shapes) <= {"wide", "hot"} or not set(profiles) <= {"api", "speech", "mixed", "race"}
            or not (2 <= args.race_users <= args.threads and 1 <= args.php_workers <= 16
                    and 1 <= args.queue_workers <= 8 and args.blocks > 0 and args.duration > 0
                    and args.drain > 0 and args.api_rate > 0 and args.speech_rate > 0
                    and 2 <= args.actors <= 1000 and args.threads <= 512)
            or (args.ramp and (args.index or args.blocks != 1 or args.api_ceiling < args.api_rate
                               or args.speech_ceiling < args.speech_rate))):
        parser.error("Invalid runtime or workload parameters. This runner uses Laragon on Windows.")
    audio = args.audio.read_bytes()
    model = args.model_dir.resolve()
    work = args.output.resolve().with_suffix("")
    with args.output.open("x", encoding="utf-8") as output:
        work.mkdir()
        log = work / "python.log"
        token = secrets.token_hex(32)
        python_port = ports(1)[0]
        env = dict(os.environ, PATH=str(args.ffmpeg_dir.resolve()) + os.pathsep + os.environ["PATH"],
                   PHONEME_SERVICE_TOKEN=token, PHONEME_ASR_MODEL=str(model),
                   PHONEME_ASR_REVISION=args.model_revision)
        clock = datetime.now(timezone.utc).isoformat()
        args.php = str(Path(args.php).resolve())
        args.mysql = str(Path(args.mysql).resolve())
        payload = dict(metadata=dict(host=platform.platform(), cpu=platform.processor(), logical_cpus=os.cpu_count(),
                                     php_workers=args.php_workers, queue_workers=args.queue_workers,
                                     inference_workers=1, model_revision=args.model_revision,
                                     model_sha256=hashlib.file_digest((model / "model.bin").open("rb"), "sha256").hexdigest(),
                                     audio_sha256=hashlib.sha256(audio).hexdigest(), clock=clock, duration=args.duration,
                                     drain=args.drain, index=args.index, database="Laragon MySQL / InnoDB",
                                     queue="database", broadcast="null", targets_ms=LIMITS),
                       runs=[], errors=[])
        python = ROOT / "py" / ".venv" / "Scripts" / "python.exe"
        uvicorn = [str(python), "-m", "uvicorn", "phoneme_service.main:app",
                   "--host", "127.0.0.1", "--port", str(python_port)]
        try:
            with service(uvicorn, log, env, ROOT / "py") as process:
                ready(process, python_port, "/v1/health/ready", log, 150)
                status, body = request(python_port, "/v1/assess", data={"referenceText": "The sun is shining."},
                                       upload=("audio", audio), service_token=token)
                if status != 200:
                    raise RuntimeError(f"Real inference warmup returned HTTP {status}. See {log}")
                for shape in shapes:
                    for scale in scales:
                        for block in range(args.blocks):
                            variants = ("before", "after") if args.index else ("before",)
                            if block % 2:
                                variants = variants[::-1]
                            passing_api, passing_speech = args.api_rate, args.speech_rate
                            for profile in profiles:
                                for variant in variants:
                                    api_rate = passing_api if profile in ("api", "mixed") else 0
                                    speech_rate = passing_speech if profile in ("speech", "mixed") else 0
                                    while True:
                                        audit = work / f"{shape}-{scale}-{profile}-{block}-{variant}-{api_rate:g}-{speech_rate:g}"
                                        audit.mkdir()
                                        print(f"{shape} {scale}x {profile} {variant} block {block + 1} "
                                              f"({api_rate:g} req/s, {speech_rate:g} speech/min)", flush=True)
                                        with laravel(args, scale, shape, variant, audit, python_port, token, clock) as (port, manifest):
                                            result = measure(args, port, manifest, audio, profile, api_rate, speech_rate)
                                        metrics = summarize(result, args.duration)
                                        payload["runs"].append(dict(scale=scale, shape=shape, profile=profile, block=block,
                                                                    variant=variant, api_rate=api_rate, speech_rate=speech_rate,
                                                                    counts=manifest["counts"], metrics=metrics, **result))
                                        if not args.ramp or not metrics or not all(m["meets_target"] for m in metrics.values()):
                                            break
                                        if profile == "api":
                                            passing_api = api_rate
                                            if api_rate < args.api_ceiling:
                                                api_rate = min(api_rate * 2, args.api_ceiling)
                                                continue
                                        if profile == "speech":
                                            passing_speech = speech_rate
                                            if speech_rate < args.speech_ceiling:
                                                speech_rate = min(speech_rate * 2, args.speech_ceiling)
                                                continue
                                        break
        except Exception as error:
            payload["errors"].append(str(error))
            raise
        finally:
            json.dump(payload, output, indent=2)
            output.write("\n")
    return int(any(run.get("race_ok") is False for run in payload["runs"]))


if __name__ == "__main__":
    raise SystemExit(main())
