<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ComposeDatabaseSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Tests\TestCase;

class ComposeDatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_startup_seeds_a_new_compose_database_once(): void
    {
        DB::unprepared(file_get_contents(base_path('docker-init.sql')));
        $options = ['--seed' => true, '--seeder' => 'ComposeDatabaseSeeder', '--force' => true];

        $this->artisan('migrate', $options)->assertSuccessful();

        $this->assertDatabaseCount('users', 9);
        $demoUser = User::query()->where('email', 'sudo@example.com')->firstOrFail();
        $demoUser->update(['name' => 'Edited demo user']);

        $this->artisan('migrate', $options)->assertSuccessful();

        $this->assertDatabaseHas('users', ['id' => $demoUser->id, 'name' => 'Edited demo user']);
    }

    public function test_startup_skips_databases_without_a_compose_seed_marker(): void
    {
        $this->seed(ComposeDatabaseSeeder::class);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_failed_seeding_leaves_the_marker_pending(): void
    {
        DB::unprepared(file_get_contents(base_path('docker-init.sql')));
        $this->partialMock(DatabaseSeeder::class)->shouldReceive('__invoke')->once()
            ->andThrow(new RuntimeException('Seed failed'));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Seed failed');

        try {
            $this->seed(ComposeDatabaseSeeder::class);
        } finally {
            $this->assertDatabaseHas('compose_seed_pending', ['id' => 1]);
        }
    }
}
