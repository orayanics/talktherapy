"""Analyze real paired SQL benchmarks; Python standard library, no dependencies."""

import argparse
import html
import itertools
import json
import math
import random
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


def summarize_case(scale, case, resamples=10000):
    pairs = defaultdict(dict)
    for sample in case["samples"]:
        if sample.get("error"):
            raise ValueError(f"Benchmark error: {sample['error']}")
        if sample["variant"] not in {"before", "after"}:
            raise ValueError("Unknown variant")
        for key in ("wall_ms", "sql_ms", "query_count"):
            if not math.isfinite(sample[key]) or sample[key] < 0:
                raise ValueError(f"Invalid {key}")
        pair = pairs[sample["block"], sample["pair"]]
        if sample["variant"] in pair:
            raise ValueError("Duplicate pair variant")
        pair[sample["variant"]] = sample
    if not pairs or any(set(pair) != {"before", "after"} for pair in pairs.values()):
        raise ValueError("Incomplete paired samples")
    blocks = defaultdict(list)
    for (block, _), pair in pairs.items():
        if pair["before"]["rows"] != pair["after"]["rows"]:
            raise ValueError("Variants return different row counts")
        blocks[block].append(pair["after"]["wall_ms"] - pair["before"]["wall_ms"])
    # Each independent process is one unit; repeated pairs within it are correlated.
    deltas = [statistics.median(values) for values in blocks.values()]
    delta = statistics.mean(deltas)
    rng = random.Random(20261107)
    bootstrap = [statistics.mean(rng.choices(deltas, k=len(deltas)))
                 for _ in range(resamples)]
    if len(deltas) > 20:
        raise ValueError("Exact paired randomization limited to 20 independent blocks")
    extreme = sum(abs(statistics.mean(d * sign for d, sign in zip(deltas, signs)))
                  >= abs(delta) - 1e-12
                  for signs in itertools.product((-1, 1), repeat=len(deltas)))
    result = dict(scale=scale, name=case["name"], pairs=len(pairs), blocks=len(blocks),
                  paired_wall_delta_ms=delta,
                  paired_delta_ci95_ms=[percentile(bootstrap, .025),
                                        percentile(bootstrap, .975)],
                  p_value=extreme / 2 ** len(deltas))
    for variant in ("before", "after"):
        samples = [pair[variant] for pair in pairs.values()]
        result[variant] = {
            "median_ms": statistics.median(s["wall_ms"] for s in samples),
            "p95_ms": percentile([s["wall_ms"] for s in samples], .95),
            "median_sql_ms": statistics.median(s["sql_ms"] for s in samples),
            "median_queries": statistics.median(s["query_count"] for s in samples),
        }
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
              '<text x="24" y="57" font-size="13">SQLite, independent process blocks; '
              'within-row scale. Blue: before. Green: after. Lower is faster.</text>']
    for index, row in enumerate(results):
        y = 92 + index * row_height
        output.append(f'<text x="24" y="{y}" font-size="13">'
                      f'{html.escape(row["name"])} / {row["scale"]}</text>')
        maximum = max(row[v]["median_ms"] for v in ("before", "after")) or 1
        for offset, variant, color in ((0, "before", "#3366aa"), (24, "after", "#087f5b")):
            value = row[variant]["median_ms"]
            length = value / maximum * 560
            output.append(f'<rect x="370" y="{y - 12 + offset}" width="{length:.2f}" '
                          f'height="17" fill="{color}"/>')
            output.append(f'<text x="{380 + length:.2f}" y="{y + offset}" '
                          f'font-size="12">{value:.4f} ms</text>')
    return "\n".join(output + ["</g></svg>"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=Path("docs/performance"))
    args = parser.parse_args()
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    results = [summarize_case(scale["scale"], case)
               for scale in payload["scales"] for case in scale["cases"]]
    for result, adjusted in zip(results, holm_adjust([r["p_value"] for r in results])):
        result["holm_p_value"] = adjusted
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "summary.json").write_text(json.dumps(
        dict(source=str(args.input), metadata=payload["metadata"], results=results),
        indent=2) + "\n", encoding="utf-8")
    (args.output / "comparison.svg").write_text(render_svg(results), encoding="utf-8")
    lines = ["# Relational workload measurements", "", "[View the standalone chart](comparison.svg).",
             "", f"Raw measurements: `{args.input.as_posix()}`.", "", "## Method", "",
             "Each before/after pair uses identical fixtures. Medians and interpolated p95 "
             "summarize all timed repeats; warmups are excluded by the benchmark producer. "
             "For inference, each independent process block contributes its median paired "
             "wall-time change (after minus before). The point estimate is the mean of those "
             "block medians. A seeded 10,000-resample percentile bootstrap resamples whole "
             "blocks for an exploratory 95% interval. A two-sided exact sign-flip test uses "
             "the same block summaries; Holm adjustment covers every case/scale comparison. "
             "Intervals are pointwise, not simultaneous. Sign-flip inference assumes symmetric "
             "independent block differences; shared hardware/cache can weaken that assumption.", "",
             "The p95 describes repeated local work, not production HTTP tail latency. "
             "SQLite timings do not prove PostgreSQL plans, network latency, contention or "
             "clinical workload behavior. Logical result equivalence is checked by the producer; "
             "the analyzer also rejects errors, incomplete pairs and row-count differences.", "",
             "Matplotlib was unavailable; the dependency-free SVG records measured values only.", "",
             "## Results", "",
             "| Case | Scale | Pairs / blocks | Before median / p95 ms | After median / p95 ms | "
             "Speedup | Paired change ms [95% CI] | Holm p | Evidence |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---|"]
    for row in results:
        before, after = row["before"], row["after"]
        low, high = row["paired_delta_ci95_ms"]
        evidence = "detectable improvement" if row["holm_p_value"] < .05 and high < 0 else (
            "detectable regression" if row["holm_p_value"] < .05 and low > 0
            else "no adjusted significance")
        speedup = f'{row["speedup"]:.2f}x' if row["speedup"] is not None else "undefined"
        lines.append(f'| {row["name"]} | {row["scale"]} | {row["pairs"]} / {row["blocks"]} | '
                     f'{before["median_ms"]:.4f} / {before["p95_ms"]:.4f} | '
                     f'{after["median_ms"]:.4f} / {after["p95_ms"]:.4f} | {speedup} | '
                     f'{row["paired_wall_delta_ms"]:.4f} [{low:.4f}, {high:.4f}] | '
                     f'{row["holm_p_value"]:.5f} | {evidence} |')
    lines.extend(["", "## Recorded benchmark environment", "", "```json",
                  json.dumps(payload["metadata"], indent=2), "```", ""])
    (args.output / "report.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
