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
        Schema::create('slp_exercise_collections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_path')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
        Schema::table('slp_exercises', function (Blueprint $table): void {
            $table->foreignUuid('collection_id')->nullable()->constrained('slp_exercise_collections')->restrictOnDelete();
            $table->boolean('is_hidden')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slp_exercises', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('collection_id');
            $table->dropColumn('is_hidden');
        });
        Schema::dropIfExists('slp_exercise_collections');
    }
};
