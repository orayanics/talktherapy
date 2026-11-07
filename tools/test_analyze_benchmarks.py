import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from analyze_benchmarks import holm_adjust, summarize_case


class AnalysisTest(unittest.TestCase):
    def samples(self, blocks=3, pairs=2):
        return [dict(block=block, pair=pair, variant=variant, wall_ms=wall,
                     sql_ms=wall / 2, query_count=1, rows=3, error=None,
                     checksum="a" * 64)
                for block in range(blocks) for pair in range(pairs)
                for variant, wall in (("after", 5), ("before", 10))]

    def test_pairs_are_matched_by_block_and_id_not_array_order(self):
        samples = []
        for block in range(3):
            for pair in range(2):
                samples.extend([
                    dict(block=block, pair=pair, variant="after", wall_ms=5,
                         sql_ms=2, query_count=1, rows=3, error=None, checksum="a" * 64),
                    dict(block=block, pair=pair, variant="before", wall_ms=10,
                         sql_ms=4, query_count=2, rows=3, error=None, checksum="a" * 64),
                ])
        result = summarize_case(10, dict(name="example", samples=samples), 100)
        self.assertEqual(result["paired_wall_delta_ms"], -5)
        self.assertEqual(result["paired_delta_ci95_ms"], [-5, -5])
        self.assertEqual(result["speedup"], 2)
        self.assertEqual(result["p_value"], 0.25)
        self.assertEqual(result["blocks"], 3)

    def test_invalid_and_incomplete_pairs_fail_instead_of_disappearing(self):
        with self.assertRaises(ValueError):
            summarize_case(10, dict(name="broken", samples=[
                self.samples()[0]
            ]), 100)

    def test_invalid_metrics_ids_and_checksums_are_rejected(self):
        for key, value in (("wall_ms", float("nan")), ("sql_ms", -1),
                           ("query_count", 1.5), ("rows", -1), ("rows", True),
                           ("pair", "1"), ("checksum", None)):
            with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                samples = self.samples()
                samples[0][key] = value
                summarize_case(10, dict(name="broken", samples=samples), 100)
        samples = self.samples()
        del samples[0]["sql_ms"]
        with self.assertRaises(ValueError):
            summarize_case(10, dict(name="missing", samples=samples), 100)

    def test_errors_duplicates_and_result_mismatches_are_rejected(self):
        for key, value in (("error", "database timeout"), ("rows", 4),
                           ("checksum", "b" * 64), ("variant", "unknown")):
            with self.subTest(key=key), self.assertRaises(ValueError):
                samples = self.samples()
                samples[0][key] = value
                summarize_case(10, dict(name="broken", samples=samples), 100)
        samples = self.samples()
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            summarize_case(10, dict(name="duplicate", samples=samples + [samples[0]]), 100)

    def test_small_runs_are_marked_insufficient_and_large_runs_qualify(self):
        small = summarize_case(10, dict(name="small", samples=self.samples(1, 1)), 100)
        self.assertFalse(small["sufficient_observations"])
        full = summarize_case(10, dict(name="full", samples=self.samples(6, 5)), 100)
        self.assertTrue(full["sufficient_observations"])

    def test_invalid_scales_and_excess_blocks_fail_before_inference(self):
        for scale in (0, -1, "10", True):
            with self.subTest(scale=scale), self.assertRaisesRegex(ValueError, "scale"):
                summarize_case(scale, dict(name="case", samples=self.samples()), 100)
        with self.assertRaisesRegex(ValueError, "20 independent blocks"):
            summarize_case(10, dict(name="case", samples=self.samples(21, 1)), 100)

    def test_cli_generates_reports_and_preserves_failed_cases(self):
        case = dict(name="case <one>", samples=self.samples(6, 5))
        payload = dict(metadata=dict(database="sqlite", exclusions=["HTTP concurrency"]),
                       scales=[dict(scale=10, cases=[case], blocks=[
                           dict(index_build=dict(wall_ms=2, allocated_bytes=2048))])])
        script = Path(__file__).with_name("analyze_benchmarks.py")
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source, output = base / "raw.json", base / "report"
            source.write_text(json.dumps(payload))
            run = subprocess.run([sys.executable, str(script), str(source), "--output", str(output)],
                                 capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            summary = json.loads((output / "summary.json").read_text())
            self.assertEqual(summary["results"][0]["speedup"], 2)
            self.assertEqual(summary["failures"], [])
            self.assertIn("case &lt;one&gt;", (output / "comparison.svg").read_text())
            self.assertTrue((output / "scale.svg").exists())
            self.assertIn("| 10 | 1 | 2.0000 | 2.00 |", (output / "report.md").read_text())
            broken = copy.deepcopy(case)
            broken["name"] = "failed case"
            broken["samples"][0]["error"] = "database timeout"
            payload["scales"][0]["cases"].append(broken)
            source.write_text(json.dumps(payload))
            run = subprocess.run([sys.executable, str(script), str(source), "--output", str(output)],
                                 capture_output=True, text=True)
            self.assertEqual(run.returncode, 1)
            summary = json.loads((output / "summary.json").read_text())
            self.assertEqual(len(summary["results"]), 1)
            self.assertEqual(summary["results"][0]["holm_p_value"], 0.0625)
            self.assertIn("database timeout", summary["failures"][0]["error"])
            self.assertIn("database timeout", (output / "report.md").read_text())

    def test_cli_preserves_empty_and_failed_scales(self):
        script = Path(__file__).with_name("analyze_benchmarks.py")
        payload = dict(metadata={}, scales=[dict(scale=10, cases=[]),
                       dict(scale=100, cases=[], error="fixture generation failed")])
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            source, output = base / "raw.json", base / "report"
            source.write_text(json.dumps(payload))
            run = subprocess.run([sys.executable, str(script), str(source), "--output", str(output)],
                                 capture_output=True, text=True)
            self.assertEqual(run.returncode, 1)
            summary = json.loads((output / "summary.json").read_text())
            self.assertEqual(summary["results"], [])
            self.assertEqual(len(summary["failures"]), 2)
            self.assertIn("fixture generation failed", (output / "report.md").read_text())

    def test_holm_adjustment_is_monotone_in_sorted_order(self):
        self.assertEqual(holm_adjust([0.03, 0.01, 0.8]), [0.06, 0.03, 0.8])


if __name__ == "__main__":
    unittest.main()
