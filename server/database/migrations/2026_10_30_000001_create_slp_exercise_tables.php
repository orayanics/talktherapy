<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slp_exercises', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->restrictOnDelete();
            $table->string('scope', 20)->default('private');
            $table->string('module', 40);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['scope', 'module', 'archived_at']);
        });

        Schema::create('slp_exercise_versions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('exercise_id')->constrained('slp_exercises')->cascadeOnDelete();
            $table->unsignedInteger('revision');
            $table->string('language', 16);
            $table->string('dialect', 64)->nullable();
            $table->string('task_type', 50);
            $table->string('status', 20)->default('draft');
            $table->string('prompt_text', 2000);
            $table->json('configuration')->nullable();
            $table->foreignUuid('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['exercise_id', 'revision']);
            $table->index(['status', 'language', 'task_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slp_exercise_versions');
        Schema::dropIfExists('slp_exercises');
    }
};
