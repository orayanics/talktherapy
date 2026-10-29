<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_exports', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('actor_id')->constrained('users')->cascadeOnDelete();
            $table->string('format', 10);
            $table->json('filters')->nullable();
            $table->string('status', 20)->default('queued');
            $table->string('path')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_exports');
    }
};
