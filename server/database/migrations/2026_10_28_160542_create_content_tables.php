<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('author_id')->constrained('users')->restrictOnDelete();
            $table->string('name', 50);
            $table->string('slug', 60);
            $table->timestamps();
            $table->unique(['author_id', 'slug']);
        });

        Schema::create('contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('author_id')->constrained('users')->restrictOnDelete();
            $table->string('diagnosis_id', 191)->nullable();
            $table->foreign('diagnosis_id')->references('id')->on('diagnoses')->nullOnDelete();
            $table->string('title');
            $table->string('description', 2000);
            $table->text('body');
            $table->timestamps();
            $table->index(['diagnosis_id', 'created_at']);
        });

        Schema::create('content_tag', function (Blueprint $table): void {
            $table->foreignUuid('content_id')->constrained('contents')->cascadeOnDelete();
            $table->foreignUuid('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['content_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_tag');
        Schema::dropIfExists('contents');
        Schema::dropIfExists('tags');
    }
};
