<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slp_assets', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('users')->restrictOnDelete();
            $table->string('path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('bytes');
            $table->string('checksum', 64);
            $table->string('license', 255)->nullable();
            $table->timestamps();
            $table->unique(['owner_id', 'checksum']);
        });
        Schema::create('slp_assignments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('patient_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('exercise_version_id')->constrained('slp_exercise_versions')->restrictOnDelete();
            $table->string('status', 20)->default('active');
            $table->json('schedule')->nullable();
            $table->json('configuration_snapshot')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });
        Schema::create('slp_consents', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('purpose', 80);
            $table->string('policy_version', 40);
            $table->timestamp('accepted_at');
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();
            $table->index(['subject_id', 'purpose', 'withdrawn_at']);
        });
        Schema::create('slp_attempts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('assignment_id')->constrained('slp_assignments')->cascadeOnDelete();
            $table->foreignUuid('consent_id')->constrained('slp_consents')->restrictOnDelete();
            $table->string('status', 30)->default('created');
            $table->string('submission_key', 100);
            $table->timestamps();
            $table->unique(['assignment_id', 'submission_key']);
        });
        Schema::create('slp_recordings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->unique()->constrained('slp_attempts')->cascadeOnDelete();
            $table->string('path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('bytes');
            $table->string('checksum', 64);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamp('retention_until')->nullable();
            $table->timestamps();
        });
        Schema::create('slp_analysis_runs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('slp_attempts')->cascadeOnDelete();
            $table->string('status', 20)->default('queued');
            $table->string('schema_version', 20)->default('1');
            $table->string('failure_code', 80)->nullable();
            $table->json('result')->nullable();
            $table->timestamps();
            $table->index(['attempt_id', 'status']);
        });
        Schema::create('slp_reviews', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('slp_attempts')->cascadeOnDelete();
            $table->unsignedInteger('revision');
            $table->foreignUuid('reviewer_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 20)->default('draft');
            $table->json('annotations')->nullable();
            $table->json('metrics')->nullable();
            $table->timestamps();
            $table->unique(['attempt_id', 'revision']);
        });
        Schema::create('slp_reports', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('review_id')->constrained('slp_reviews')->restrictOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->restrictOnDelete();
            $table->json('snapshot');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slp_reports');
        Schema::dropIfExists('slp_reviews');
        Schema::dropIfExists('slp_analysis_runs');
        Schema::dropIfExists('slp_recordings');
        Schema::dropIfExists('slp_attempts');
        Schema::dropIfExists('slp_consents');
        Schema::dropIfExists('slp_assignments');
        Schema::dropIfExists('slp_assets');
    }
};
