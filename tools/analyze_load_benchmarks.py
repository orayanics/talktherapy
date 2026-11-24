"""Render per-workload capacity and paired HTTP benchmark evidence."""

import html
import json
import math
import os
import statistics
from collections import defaultdict
from pathlib import Path

from analyze_benchmarks import holm_adjust, paired_statistics, render_scale_svg


def paired_comparisons(runs):
    cells = defaultdict(dict)
    for run in runs:
        if run["profile"] == "race":
            continue
        for operation, metrics in run["metrics"].items():
            key = (run["shape"], run["scale"], run["profile"], operation,
                   run["api_rate"], run["speech_rate"])
            pair = (run["block"], run["variant"])
            if pair in cells[key]:
                raise ValueError(f"Duplicate HTTP benchmark sample for {key}")
            cells[key][pair] = metrics
    results = []
    for key, samples in cells.items():
        blocks = sorted({block for block, _ in samples})
        if not any(variant == "after" for _, variant in samples):
            continue
        for metric in ("p95_ms", "successful_per_second"):
            pairs = [(samples.get((block, "before"), {}).get(metric),
                      samples.get((block, "after"), {}).get(metric)) for block in blocks]
            valid = all(type(value) in (float, int) and math.isfinite(value)
                        for pair in pairs for value in pair)
            row = dict(zip(("shape", "scale", "profile", "operation", "api_rate", "speech_rate"), key))
            if valid:
                delta, interval, p = paired_statistics([after - before for before, after in pairs])
                row.update(delta=delta, ci95=interval, p=p)
            results.append(dict(row, metric=metric, blocks=len(blocks),
                                evidence="eligible" if len(blocks) >= 12 and valid else "exploratory"))
    adjusted = holm_adjust([row.get("p", 1) for row in results])
    for row, p in zip(results, adjusted):
        row["holm_p"] = p
    return results


def capacity_svg(runs):
    groups = defaultdict(list)
    for run in runs:
        if run["profile"] == "race":
            continue
        for name, metrics in run["metrics"].items():
            groups[name].append((run, metrics))
    width = 920
    height = 90 + 260 * max(1, math.ceil(len(groups) / 2))
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
             'role="img" aria-labelledby="title desc">',
             '<title id="title">Successful throughput versus offered traffic</title>',
             '<desc id="desc">Points show individual HTTP benchmark windows. '
             'Green meets latency and reliability targets; red misses a target.</desc>',
             f'<rect width="{width}" height="{height}" fill="#fff"/>',
             '<g font-family="Arial,sans-serif" font-size="12" fill="#172b4d">',
             '<text x="24" y="32" font-size="22">Successful throughput versus offered traffic</text>',
             '<text x="24" y="56">Operations/s · green meets targets · red misses targets · hollow after</text>']
    for panel, (name, rows) in enumerate(sorted(groups.items())):
        x, y = 64 + (panel % 2) * 450, 100 + (panel // 2) * 260
        w, h = 335, 160
        maximum = max(m["offered"] / r["duration"] for r, m in rows) or 1
        lines.extend((f'<text x="{x}" y="{y - 10}" font-weight="bold">{html.escape(name)}</text>',
                      f'<path d="M{x},{y}V{y+h}H{x+w}" fill="none" stroke="#687991"/>',
                      f'<path d="M{x},{y+h}L{x+w},{y}" stroke="#a6b2c1" stroke-dasharray="4 4"/>',
                      f'<text x="{x - 10}" y="{y+h+16}">0</text>',
                      f'<text x="{x+w-18}" y="{y+h+16}">{maximum:.2f}</text>',
                      f'<text x="{x-37}" y="{y+4}">{maximum:.2f}</text>'))
        for run, metrics in rows:
            px = x + w * metrics["offered"] / run["duration"] / maximum
            py = y + h * (1 - metrics["successful_per_second"] / maximum)
            color = "#087f5b" if metrics["meets_target"] else "#b23a2b"
            fill = "white" if run["variant"] == "after" else color
            desc = html.escape(f'{run["shape"]} {run["scale"]}x {run["profile"]} {run["variant"]}, '
                               f'p95 {metrics["p95_ms"]} ms; {metrics["successful"]}/{metrics["offered"]} succeeded')
            lines.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="4" fill="{fill}" '
                         f'stroke="{color}"><title>{desc}</title></circle>')
    return "\n".join(lines + ["</g></svg>"])


def mixed_latency_svg(runs):
    windows = defaultdict(list)
    for run in runs:
        if run["profile"] != "mixed":
            continue
        for operation, metric in run["metrics"].items():
            if metric["p95_ms"] is not None:
                name = f'{run["shape"]} / {operation} ({run["api_rate"]:g}/s, {run["speech_rate"]:g}/min)'
                windows[name, run["scale"], run["variant"]].append(metric["p95_ms"])
    results = {}
    for (name, scale, variant), values in windows.items():
        results.setdefault((name, scale), dict(name=name, scale=scale))[variant] = {
            "p95_ms": statistics.median(values),
        }
    return render_scale_svg(results.values(), metric="p95_ms")


def report(payload, source, output):
    output.mkdir(parents=True, exist_ok=True)
    runs = [dict(run, duration=payload["metadata"]["duration"]) for run in payload["runs"]]
    comparisons = paired_comparisons(runs)
    (output / "throughput.svg").write_text(capacity_svg(runs), encoding="utf-8")
    (output / "latency.svg").write_text(mixed_latency_svg(runs), encoding="utf-8")
    lines = ["# Concurrent MySQL and speech workloads", "",
             "[Capacity chart](throughput.svg) · [Mixed latency by scale](latency.svg) · "
             f"[Raw measurements]({Path(os.path.relpath(source.resolve(), output.resolve())).as_posix()})", "",
             "Latency includes dispatch delay. Queued latency starts at upload acceptance and "
             "includes two-second polling granularity. Successful throughput counts completions "
             "inside the offering window. Reliability counts late completions through the drain window. "
             "The p95 uses successful requests and should be read alongside the success fraction. "
             "HTTP 0 records a transport failure or dispatch deadline.", "",
             "| Shape / scale | Profile / block | Variant | Workflow | Successful / offered | "
             "Goodput/s | p95 ms | HTTP outcomes | Peak active | Target |",
             "|---|---|---|---|---:|---:|---:|---|---:|---|"]
    for run in runs:
        for name, m in run["metrics"].items():
            p95 = f'{m["p95_ms"]:.1f}' if m["p95_ms"] is not None else "—"
            statuses = ", ".join(f"{status}×{n}" for status, n in sorted(m["statuses"].items()))
            target = ("pass" if run["race_ok"] else "fail") if "race_ok" in run else (
                "pass" if m["meets_target"] else "miss")
            lines.append(f'| {run["shape"]} / {run["scale"]}× | {run["profile"]} / {run["block"] + 1} | '
                         f'{run["variant"]} | {name} | {m["successful"]} / {m["offered"]} | '
                         f'{m["successful_per_second"]:.2f} | {p95} | {statuses} | '
                         f'{run.get("peak_active", "—")} | {target} |')
    if comparisons:
        lines.extend(("", "## Paired changes", "",
                      "Each fresh-schema run pair is one observation. The analyzer applies Holm "
                      "adjustment across reported tests. Intervals are 95% pointwise bootstrap intervals.", "",
                      "| Shape / scale | Profile | Workflow / metric | Pairs | Change [95% CI] | Holm p | Evidence |",
                      "|---|---|---|---:|---:|---:|---|"))
        for row in comparisons:
            low, high = row.get("ci95", (0, 0))
            delta = f'{row["delta"]:.4f} [{low:.4f}, {high:.4f}]' if "delta" in row else "—"
            lines.append(f'| {row["shape"]} / {row["scale"]}× | {row["profile"]} | '
                         f'{row["operation"]} / {row["metric"]} | {row["blocks"]} | {delta} | '
                         f'{row["holm_p"]:.5f} | {row["evidence"]} |')
    if payload.get("errors"):
        lines.extend(("", "## Run errors", "", *payload["errors"]))
    lines.extend(("", "## Environment", "", "```json",
                  json.dumps(payload["metadata"], indent=2), "```", ""))
    (output / "report.md").write_text("\n".join(lines), encoding="utf-8")
    (output / "summary.json").write_text(json.dumps(
        dict(comparisons=comparisons, runs=[{k: v for k, v in run.items() if k != "samples"}
                                           for run in runs]), indent=2) + "\n", encoding="utf-8")
    return int(not runs or bool(payload.get("errors")) or any(run.get("race_ok") is False for run in runs))
