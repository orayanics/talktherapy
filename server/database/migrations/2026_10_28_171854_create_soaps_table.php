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
        Schema::create('soaps', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('patient_id')->constrained('users')->restrictOnDelete();
            $table->text('activity_plan');
            $table->string('session_type', 100)->nullable();
            $table->text('subjective_notes')->nullable();
            $table->text('objective_notes')->nullable();
            $table->text('assessment')->nullable();
            $table->text('recommendation')->nullable();
            $table->text('comments')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->index(['patient_id', 'created_at', 'id']);
            $table->index(['clinician_id', 'patient_id', 'created_at', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soaps');
    }
};
