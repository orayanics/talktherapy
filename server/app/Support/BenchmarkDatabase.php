<?php

namespace App\Support;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BenchmarkDatabase
{
    public const ADMIN = 'benchmark_mysql_admin';

    public static function create(): string
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Benchmarks require local or testing; production is refused.');
        }

        $name = 'talktherapy_bench_'.bin2hex(random_bytes(12));
        $config = self::configuration();
        config([
            'database.connections.'.self::ADMIN => $config,
            'database.connections.'.$name => [...$config, 'database' => $name],
        ]);
        if (! DB::connection(self::ADMIN)->getSchemaBuilder()->createDatabase($name)) {
            throw new RuntimeException('Could not create benchmark schema.');
        }

        return $name;
    }

    public static function migrate(string $name): void
    {
        if (Artisan::call('migrate', ['--database' => $name, '--force' => true, '--no-interaction' => true]) !== 0) {
            throw new RuntimeException('Benchmark migrations failed: '.Artisan::output());
        }
    }

    public static function drop(string $name): void
    {
        if (! preg_match('/\Atalktherapy_bench_[a-f0-9]{24}\z/', $name)) {
            throw new RuntimeException('Invalid benchmark schema name.');
        }

        DB::purge($name);
        DB::connection(self::ADMIN)->getSchemaBuilder()->dropDatabaseIfExists($name);
    }

    public static function analyze(array $tables): void
    {
        $connection = DB::connection();
        $wrapped = array_map($connection->getQueryGrammar()->wrapTable(...), $tables);
        $connection->select('ANALYZE TABLE '.implode(', ', $wrapped));
    }

    private static function configuration(): array
    {
        return [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'port' => 3306,
            'database' => '',
            'username' => 'root',
            'password' => '',
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'timezone' => '+00:00',
            'options' => [\PDO::ATTR_TIMEOUT => 5],
        ];
    }
}
