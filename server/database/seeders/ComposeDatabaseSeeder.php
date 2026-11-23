<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ComposeDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing']) || ! Schema::hasTable('compose_seed_pending')) {
            return;
        }

        DB::transaction(function (): void {
            // Roll back the claim if demo seeding fails so the next startup can retry.
            if (DB::table('compose_seed_pending')->where('id', 1)->delete() === 1) {
                $this->call(DatabaseSeeder::class);
            }
        });
    }
}
