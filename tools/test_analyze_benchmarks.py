import unittest

from analyze_benchmarks import holm_adjust, summarize_case


class AnalysisTest(unittest.TestCase):
    def test_pairs_are_matched_by_block_and_id_not_array_order(self):
        samples = []
        for block in range(3):
            for pair in range(2):
                samples.extend([
                    dict(block=block, pair=pair, variant="after", wall_ms=5,
                         sql_ms=2, query_count=1, rows=3, error=None),
                    dict(block=block, pair=pair, variant="before", wall_ms=10,
                         sql_ms=4, query_count=2, rows=3, error=None),
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
                dict(block=0, pair=0, variant="before", wall_ms=1, error=None)
            ]), 100)

    def test_holm_adjustment_is_monotone_in_sorted_order(self):
        self.assertEqual(holm_adjust([0.03, 0.01, 0.8]), [0.06, 0.03, 0.8])


if __name__ == "__main__":
    unittest.main()
