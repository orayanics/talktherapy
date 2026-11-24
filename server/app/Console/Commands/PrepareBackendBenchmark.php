<?php

namespace App\Console\Commands;

use App\Support\BenchmarkDatabase;
use App\Support\RelationalBenchmarkFixtures;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Throwable;

#[Signature('app:benchmark-prepare {--scale=10} {--shape=wide} {--actors=100} {--clock=} {--index=} {--without-index}')]
#[Description('Create a disposable MySQL schema and first-party sessions for local load testing')]
class PrepareBackendBenchmark extends Command
{
    public function handle(RelationalBenchmarkFixtures $fixtures): int
    {
        $name = null;
        try {
            if (config('session.driver') !== 'database' || filled(config('session.connection'))) {
                throw new \RuntimeException('Use database sessions on the default connection.');
            }
            $actors = filter_var($this->option('actors'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 2, 'max_range' => 1000]]);
            if ($actors === false) {
                throw new \RuntimeException('Use 2–1000 benchmark actors.');
            }
            $name = BenchmarkDatabase::create();
            DB::setDefaultConnection($name);
            BenchmarkDatabase::migrate($name);
            $counts = $fixtures->seed((int) $this->option('scale'), $this->option('shape'), $this->option('clock') ?? now()->toIso8601String());
            if (($index = $this->option('index')) !== null) {
                if (! preg_match('/\A[a-z_][a-z0-9_]*:[a-z_][a-z0-9_]*(?:,[a-z_][a-z0-9_]*)*\z/', $index)) {
                    throw new \RuntimeException('Use --index=table:column,column for a candidate.');
                }
                [$nameOfTable, $columnList] = explode(':', $index, 2);
                $columns = explode(',', $columnList);
                $schema = DB::connection()->getSchemaBuilder();
                $installed = collect($schema->getIndexes($nameOfTable))->first(
                    fn (array $candidate): bool => $candidate['columns'] === $columns && ! $candidate['unique'],
                );
                if ($this->option('without-index') && $installed !== null) {
                    $schema->table($nameOfTable, fn (Blueprint $table) => $table->dropIndex($installed['name']));
                }
                if (! $this->option('without-index') && $installed === null) {
                    $schema->table($nameOfTable, fn (Blueprint $table) => $table->index($columns, 'benchmark_candidate_index'));
                }
            }
            BenchmarkDatabase::analyze(array_keys($counts));
            $users = DB::table('users')->join('user_profiles', 'users.id', '=', 'user_profiles.user_id')
                ->where('user_profiles.status', 'active')
                ->whereIn('user_profiles.role', ['patient', 'clinician'])
                ->orderBy('users.email')
                ->get(['users.id', 'users.email', 'users.session_version', 'user_profiles.role']);
            $session = app('session')->driver();
            $encrypter = app('encrypter');
            $cookie = $session->getName();
            $guardKey = Auth::guard('web')->getName();
            $sessions = [];
            foreach ($users->groupBy('role') as $role => $group) {
                foreach ($group->take($actors) as $user) {
                    $session->migrate();
                    $session->flush();
                    $session->start();
                    $session->put([$guardKey => $user->id, 'auth_session_version' => (int) $user->session_version]);
                    $sessions[$role][] = [
                        'cookie' => $cookie.'='.rawurlencode($encrypter->encrypt(CookieValuePrefix::create($cookie, $encrypter->getKey()).$session->getId(), false)),
                        'csrf' => $session->token(),
                        'assignment' => $role === 'patient' ? RelationalBenchmarkFixtures::id('assignment', (int) substr($user->email, 7)) : null,
                        'consent' => $role === 'patient' ? RelationalBenchmarkFixtures::id('slp-consent', (int) substr($user->email, 7)) : null,
                    ];
                    $session->save();
                }
            }
            $slots = DB::table('slots')->where('status', 'FREE')->orderBy('start_at')->pluck('id');
            $this->line(json_encode(['database' => $name, 'counts' => $counts, 'sessions' => $sessions, 'slots' => $slots], JSON_THROW_ON_ERROR));

            return self::SUCCESS;
        } catch (Throwable $exception) {
            if ($name !== null) {
                BenchmarkDatabase::drop($name);
            }
            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }
}
