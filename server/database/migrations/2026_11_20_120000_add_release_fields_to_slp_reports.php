<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slp_reports', function (Blueprint $table): void {
            $table->timestamp('released_at')->nullable()->index();
            $table->foreignUuid('released_by')->nullable()->constrained('users')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('slp_reports', function (Blueprint $table): void {
            $table->dropForeign(['released_by']);
            $table->dropColumn(['released_at', 'released_by']);
        });
    }
};
