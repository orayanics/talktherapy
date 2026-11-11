<?php

namespace App\Console\Commands;

use App\Support\RelationalBenchmark;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:benchmark-relational {--scales=10,100,1000} {--blocks=10} {--pairs=3} {--warmups=2} {--baseline : Capture before samples only} {--output= : New JSON artifact path; existing files are refused}')]
#[Description('Profile production read controllers against disposable synthetic SQLite databases')]
class BenchmarkRelational extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(RelationalBenchmark $benchmark): int
    {
        $path = $this->option('output');
        if (! is_string($path) || $path === '') {
            $this->error('Supply --output with a new JSON file path.');

            return self::FAILURE;
        }
        $integers = explode(',', $this->option('scales'));
        foreach ([...$integers, $this->option('blocks'), $this->option('pairs'), $this->option('warmups')] as $value) {
            if (filter_var($value, FILTER_VALIDATE_INT) === false) {
                $this->error('Scales, blocks, pairs and warmups must be integers.');

                return self::FAILURE;
            }
        }
        if (! app()->environment(['local', 'testing'])) {
            $this->error('Benchmarks require local or testing; production is refused.');

            return self::FAILURE;
        }
        $file = @fopen($path, 'xb');
        if ($file === false) {
            $this->error('Cannot create output; the parent directory must exist and the file must be new.');

            return self::FAILURE;
        }
        try {
            $result = $benchmark->run(array_map('intval', $integers), (int) $this->option('blocks'), (int) $this->option('pairs'), (int) $this->option('warmups'), (bool) $this->option('baseline'));
            $failed = false;
            foreach ($result['scales'] as $scale) {
                $failed = $failed || ! empty($scale['errors']);
                foreach ($scale['cases'] as $case) {
                    $checksums = [];
                    foreach ($case['samples'] as $sample) {
                        $key = $sample['block'].':'.$sample['pair'];
                        $fingerprint = [$sample['rows'], $sample['checksum']];
                        $failed = $failed || $sample['error'] !== null || (isset($checksums[$key]) && $checksums[$key] !== $fingerprint);
                        $checksums[$key] = $fingerprint;
                    }
                }
            }
            $json = json_encode($result, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR).PHP_EOL;
            if (fwrite($file, $json) !== strlen($json)) {
                throw new \RuntimeException('Could not write the complete benchmark artifact.');
            }
            $this->info('Benchmark artifact: '.$path);
            if ($failed) {
                $this->error('Benchmark recorded errors or unequal before/after results.');
            }

            return $failed ? self::FAILURE : self::SUCCESS;
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } finally {
            fclose($file);
        }
    }
}
