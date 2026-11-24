"""Analyze real paired SQL benchmarks; Python standard library, no dependencies."""

import argparse
import html
import itertools
import json
import math
import os
import random
import re
import statistics
from collections import defaultdict
from pathlib import Path


def percentile(values, fraction):
    ordered = sorted(values)
    index = (len(ordered) - 1) * fraction
    low, high = math.floor(index), math.ceil(index)
    return ordered[low] + (ordered[high] - ordered[low]) * (index - low)


def holm_adjust(p_values):
    adjusted = [None] * len(p_values)
    previous = 0
    for rank, index in enumerate(sorted(range(len(p_values)), key=p_values.__getitem__)):
        previous = max(previous, min(1, p_values[index] * (len(p_values) - rank)))
        adjusted[index] = previous
    return adjusted


def sample_metrics(samples):
    return dict(median_ms=statistics.median(s["wall_ms"] for s in samples),
                p95_ms=percentile([s["wall_ms"] for s in samples], .95),
                median_sql_ms=statistics.median(s["sql_ms"] for s in samples),
                median_queries=statistics.median(s["query_count"] for s in samples))


def paired_statistics(deltas, resamples=10000):
    if not 1 <= len(deltas) <= 20:
        raise ValueError("Exact paired randomization requires 1–20 independent blocks")
    delta = statistics.mean(deltas)
    rng = random.Random(20261107)
    bootstrap = [statistics.mean(rng.choices(deltas, k=len(deltas))) for _ in range(resamples)]
    threshold = abs(math.fsum(deltas)) - 1e-12
    extreme = sum(abs(math.fsum(d * sign for d, sign in zip(deltas, signs))) >= threshold
                  for signs in itertools.product((-1, 1), repeat=len(deltas)))
    return delta, [percentile(bootstrap, .025), percentile(bootstrap, .975)], extreme / 2 ** len(deltas)


def summarize_case(scale, case, resamples=10000, baseline=False):
    if type(scale) is not int or scale < 1:
        raise ValueError("Invalid fixture scale")
    pairs = defaultdict(dict)
    for sample in case["samples"]:
        if sample.get("error"):
            raise ValueError(f"Benchmark error: {sample['error']}")
        if sample["variant"] not in {"before", "after"}:
            raise ValueError("Unknown variant")
        for key in ("wall_ms", "sql_ms", "query_count", "rows", "block", "pair"):
            value = sample.get(key)
            if (type(value) not in (float, int) or not math.isfinite(value) or value < 0
                    or (key not in {"wall_ms", "sql_ms"} and type(value) is not int)):
                raise ValueError(f"Invalid {key}")
        if not isinstance(sample.get("checksum"), str) or not re.fullmatch("[0-9a-f]{64}", sample["checksum"]):
            raise ValueError("Invalid checksum")
        pair = pairs[sample["block"], sample["pair"]]
        if sample["variant"] in pair:
            raise ValueError("Duplicate pair variant")
        pair[sample["variant"]] = sample
    expected = {"before"} if baseline else {"before", "after"}
    if not pairs or any(set(pair) != expected for pair in pairs.values()):
        raise ValueError("Incomplete paired samples")
    result = dict(scale=scale, name=case["name"], pairs=len(pairs),
                  before=sample_metrics([pair["before"] for pair in pairs.values()]))
    if baseline:
        return dict(result, blocks=len({block for block, _ in pairs}))
    blocks = defaultdict(list)
    for (block, _), pair in pairs.items():
        if pair["before"]["rows"] != pair["after"]["rows"]:
            raise ValueError("Variants return different row counts")
        if pair["before"]["checksum"] != pair["after"]["checksum"]:
            raise ValueError("Variants return different result checksums")
        blocks[block].append(pair["after"]["wall_ms"] - pair["before"]["wall_ms"])
    # Rebuilt database blocks are the units; repeated pairs within them are correlated.
    deltas = [statistics.median(values) for values in blocks.values()]
    delta, interval, p_value = paired_statistics(deltas, resamples)
    result.update(blocks=len(blocks), sufficient_observations=len(pairs) >= 30 and len(blocks) >= 12,
                  paired_wall_delta_ms=delta, paired_delta_ci95_ms=interval, p_value=p_value,
                  after=sample_metrics([pair["after"] for pair in pairs.values()]))
    after = result["after"]["median_ms"]
    result["speedup"] = result["before"]["median_ms"] / after if after else None
    return result


def render_svg(results):
    width, row_height = 1120, 76
    height = 120 + len(results) * row_height
    output = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
              'role="img" aria-labelledby="title desc">',
              '<title id="title">Relational workload benchmark</title>',
              '<desc id="desc">Before and after medians in milliseconds; shorter bars are faster. '
              'Each row has its own scale. Exact values and statistical results are in report.md.</desc>',
              f'<rect width="{width}" height="{height}" fill="#fff"/>',
              '<g font-family="Arial,sans-serif" fill="#172b4d">',
              '<text x="24" y="32" font-size="22">Relational workload: before / after</text>',
              '<text x="24" y="57" font-size="13">MySQL, rebuilt database blocks; '
              'within-row scale. Blue: before. Green: after. Lower is faster.</text>']
    for index, row in enumerate(results):
        y = 92 + index * row_height
        output.append(f'<text x="24" y="{y}" font-size="13">'
                      f'{html.escape(row["name"])} / {html.escape(str(row["scale"]))}</text>')
        low, high = row.get("paired_delta_ci95_ms", (0, 0))
        if "after" not in row:
            output.append(f'<text x="370" y="{y}">{row["before"]["median_ms"]:.4f} ms median, '
                          f'{row["before"]["p95_ms"]:.4f} ms p95</text>')
            continue
        output.append(f'<text x="24" y="{y + 22}" font-size="11">'
                      f'Change {row["paired_wall_delta_ms"]:.4f} ms '
                      f'[{low:.4f}, {high:.4f}] 95% CI</text>')
        extent = max(abs(low), abs(high), 1e-12)
        zero, interval_y = 170, y + 42
        output.append(f'<path d="M{zero},{interval_y - 7}v14" stroke="#9aa8ba"/>')
        output.append(f'<path d="M{zero + low / extent * 140},{interval_y}'
                      f'H{zero + high / extent * 140}" stroke="#172b4d" stroke-width="2"/>')
        output.append(f'<circle cx="{zero + row["paired_wall_delta_ms"] / extent * 140}" '
                      f'cy="{interval_y}" r="3" fill="#172b4d"/>')
        maximum = max(row[v]["median_ms"] for v in ("before", "after")) or 1
        for offset, variant, color in ((0, "before", "#3366aa"), (24, "after", "#087f5b")):
            value = row[variant]["median_ms"]
            length = value / maximum * 560
            output.append(f'<rect x="370" y="{y - 12 + offset}" width="{length:.2f}" '
                          f'height="17" fill="{color}"/>')
            output.append(f'<text x="{380 + length:.2f}" y="{y + offset}" '
                          f'font-size="12">{value:.4f} ms</text>')
    return "\n".join(output + ["</g></svg>"])


def render_scale_svg(results, metric="median_ms"):
    cases = defaultdict(list)
    for result in results:
        cases[result["name"]].append(result)
    height = 90 + max(1, math.ceil(len(cases) / 3)) * 260
    label = "Median latency" if metric == "median_ms" else "Median window p95 latency"
    output = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1140" height="{height}" '
              'role="img" aria-labelledby="title desc">',
              f'<title id="title">{label} versus fixture scale</title>',
              '<desc id="desc">Each panel uses its own latency axis in milliseconds. '
              'Scale uses a logarithmic axis. Blue is before; green is after.</desc>',
              f'<rect width="1140" height="{height}" fill="white"/>',
              '<g font-family="Arial,sans-serif" font-size="12" fill="#172b4d">',
              f'<text x="24" y="30" font-size="22">{label} versus fixture scale</text>',
              '<text x="24" y="55">Milliseconds; blue: before; green: after. '
              'Separate latency axis per panel; logarithmic fixture scale.</text>']
    for index, (name, rows) in enumerate(cases.items()):
        rows = sorted(rows, key=lambda row: row["scale"])
        x, y = 65 + (index % 3) * 375, 120 + (index // 3) * 260
        output.append(f'<text x="{x - 35}" y="{y - 20}">{html.escape(name)}</text>')
        maximum = max(row[v][metric] for row in rows for v in ("before", "after") if v in row) or 1
        scales = [math.log10(row["scale"]) for row in rows]
        span = max(scales) - min(scales) or 1
        for tick in (0, .5, 1):
            tick_y = y + 160 - tick * 160
            output.append(f'<path d="M{x},{tick_y}h270" stroke="#d8dee8"/>')
            output.append(f'<text x="{x - 8}" y="{tick_y + 4}" text-anchor="end">'
                          f'{maximum * tick:.2f}</text>')
        for row, scale in zip(rows, scales):
            point_x = x + (scale - min(scales)) / span * 270
            output.append(f'<text x="{point_x}" y="{y + 180}" text-anchor="middle">'
                          f'{row["scale"]}x</text>')
        for variant, color in (("before", "#3366aa"), ("after", "#087f5b")):
            observed = [(row, scale) for row, scale in zip(rows, scales) if variant in row]
            if not observed:
                continue
            points = [(x + (scale - min(scales)) / span * 270,
                       y + 160 - row[variant][metric] / maximum * 160)
                      for row, scale in observed]
            output.append(f'<polyline points="{" ".join(f"{px},{py}" for px, py in points)}" '
                          f'fill="none" stroke="{color}" stroke-width="2"/>')
            for (px, py), (row, _) in zip(points, observed):
                output.append(f'<circle cx="{px}" cy="{py}" r="3" fill="{color}">'
                              f'<title>{variant}: {row[variant][metric]:.4f} ms</title></circle>')
    return "\n".join(output + ["</g></svg>"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=Path("docs/performance"))
    parser.add_argument("--min-improvement-ms", type=float, default=0,
                        help="Prespecified minimum useful SQL wall-time improvement")
    args = parser.parse_args()
    if not math.isfinite(args.min_improvement_ms) or args.min_improvement_ms < 0:
        parser.error("Minimum improvement must be a finite nonnegative duration")
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    if "runs" in payload:
        from analyze_load_benchmarks import report
        return report(payload, args.input, args.output)
    baseline = payload["metadata"].get("baseline_only", False)
    results, failures = [], []
    if not payload["scales"]:
        parser.error("No benchmark scales supplied")
    case_names = {case["name"] for scale in payload["scales"] for case in scale.get("cases", [])}
    for scale in payload["scales"]:
        if scale.get("error") or not scale.get("cases"):
            for name in sorted(case_names) or ["(scale setup)"]:
                failures.append(dict(scale=scale["scale"], name=name,
                                     error=scale.get("error") or "No benchmark cases supplied"))
            continue
        for case in scale["cases"]:
            label = f'{scale["shape"]} / {case["name"]}' if "shape" in scale else case["name"]
            try:
                results.append(summarize_case(scale["scale"], dict(case, name=label), baseline=baseline))
            except (ValueError, KeyError, TypeError) as error:
                failures.append(dict(scale=scale["scale"], name=label, error=str(error)))
    if not baseline:
        for result, adjusted in zip(results, holm_adjust([r["p_value"] for r in results]
                                                       + [1] * len(failures))):
            result["holm_p_value"] = adjusted
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "summary.json").write_text(json.dumps(
        dict(source=str(args.input), metadata=payload["metadata"], min_improvement_ms=args.min_improvement_ms,
             results=results, failures=failures),
        indent=2) + "\n", encoding="utf-8")
    (args.output / "comparison.svg").write_text(render_svg(results), encoding="utf-8")
    (args.output / "scale.svg").write_text(render_scale_svg(results), encoding="utf-8")
    lines = ["# Relational workload measurements", "", "[Before/after and uncertainty](comparison.svg) · "
             "[Latency versus fixture scale](scale.svg).",
             "", f"[Raw measurements and plans]({Path(os.path.relpath(args.input.resolve(), args.output.resolve())).as_posix()}).",
             "", "## Method", "",
             "Each before/after pair uses identical fixtures. Medians and interpolated p95 "
             "summarize all timed repeats; warmups are excluded by the benchmark producer. "
             "For inference, each rebuilt database block contributes its median paired "
             "wall-time change (after minus before). The point estimate is the mean of those "
             "block medians. A seeded 10,000-resample percentile bootstrap resamples whole "
             "blocks for an exploratory 95% interval. A two-sided exact sign-flip test uses "
             "the same block summaries; Holm adjustment covers every case/scale comparison. "
             "Failed comparisons count as p=1 so failures cannot reduce the adjustment family. "
             "Intervals are pointwise, not simultaneous. Sign-flip inference assumes symmetric "
             "independent block differences; shared hardware/cache can weaken that assumption.", "",
             "At least 30 paired observations and twelve rebuilt blocks are required for the evidence "
             "label; smaller runs are exploratory only. More blocks improve inferential resolution: "
             "six blocks cannot produce a two-sided exact p below 0.03125 before adjustment. "
             "Rebuilt blocks still share one machine, and bootstrap intervals with few blocks "
             "are unstable. Statistical significance is not guaranteed.", "",
             "Scales execute sequentially in one process. Absolute times across scales can "
             "reflect process warmup, cache state and machine load as well as growing data; "
             "the scale curves are descriptive. Paired within-scale comparisons provide the "
             "stronger evidence. Creating an index can itself warm database pages; alternating "
             "order and warmups cannot guarantee identical cache conditions.", "",
             "The p95 describes direct Laravel controller work against MySQL. "
             "The analyzer rejects failed or incomplete comparisons, "
             "invalid metrics, different result counts and different SHA-256 result checksums. "
             "Failed cases remain listed below; their successful samples are not selectively analyzed. "
             "Raw SQL, query plans, fixture counts, treatment order and index costs are recorded in "
             "the source artifact where supplied by the producer. Exclusions are recorded in its metadata.", "",
             "The dependency-free SVGs show actual observations; the change is after minus before, "
             "so negative values indicate improvement. Speedup is the ratio of pooled medians, "
             "a different descriptive statistic from the mean of block median changes.", "",
             "## Results", "",
             "| Case | Scale | Pairs / blocks | Before median / p95 ms | After median / p95 ms | "
             "Speedup | Paired change ms [95% CI] | Holm p | Evidence |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---|"]
    for row in results:
        if baseline:
            before = row["before"]
            lines.append(f'| {row["name"]} | {row["scale"]} | {row["pairs"]} / {row["blocks"]} | '
                         f'{before["median_ms"]:.4f} / {before["p95_ms"]:.4f} | — | — | — | — | baseline |')
            continue
        before, after = row["before"], row["after"]
        low, high = row["paired_delta_ci95_ms"]
        evidence = "no adjusted significance"
        if row["holm_p_value"] < .05:
            if high < 0:
                evidence = "detectable improvement" if high < -args.min_improvement_ms else "below minimum useful effect"
            elif low > 0:
                evidence = "detectable regression"
        if not row["sufficient_observations"]:
            evidence = "insufficient observations; exploratory only"
        speedup = f'{row["speedup"]:.2f}x' if row["speedup"] is not None else "undefined"
        lines.append(f'| {row["name"]} | {row["scale"]} | {row["pairs"]} / {row["blocks"]} | '
                     f'{before["median_ms"]:.4f} / {before["p95_ms"]:.4f} | '
                     f'{after["median_ms"]:.4f} / {after["p95_ms"]:.4f} | {speedup} | '
                     f'{row["paired_wall_delta_ms"]:.4f} [{low:.4f}, {high:.4f}] | '
                     f'{row["holm_p_value"]:.5f} | {evidence} |')
    lines.extend(["", "## Failed comparisons", ""])
    lines.extend(f'- {row["name"]} / {row["scale"]}: {row["error"]}' for row in failures)
    if not failures:
        lines.append("None recorded.")
    lines.extend(["", "## SQL work", "",
                  "| Case | Scale | Before median SQL ms / queries | After median SQL ms / queries |",
                  "|---|---:|---:|---:|"])
    for row in results:
        after = row.get("after")
        after_sql = f'{after["median_sql_ms"]:.4f} / {after["median_queries"]}' if after else "—"
        lines.append(f'| {row["name"]} | {row["scale"]} | '
                     f'{row["before"]["median_sql_ms"]:.4f} / {row["before"]["median_queries"]} | '
                     f'{after_sql} |')
    lines.extend(["", "## Index setup cost", "",
                  "The same physical index exists in both variants; only optimizer visibility changes. "
                  "Read timings exclude builds and do not measure write maintenance.", "",
                  "| Shape | Scale | Recorded builds | Median build ms |",
                  "|---|---:|---:|---:|"])
    for scale in payload["scales"]:
        costs = [block["index_build"] for block in scale.get("blocks", []) if "index_build" in block]
        if costs:
            lines.append(f'| {scale.get("shape", "—")} | {scale["scale"]} | {len(costs)} | '
                         f'{statistics.median(cost["wall_ms"] for cost in costs):.4f} |')
    lines.extend(["", "## Recorded benchmark environment", "", "```json",
                  json.dumps(dict(payload["metadata"], min_improvement_ms=args.min_improvement_ms), indent=2), "```", ""])
    (args.output / "report.md").write_text("\n".join(lines), encoding="utf-8")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
