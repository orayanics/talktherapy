<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('recurrence_rule', 255)->nullable();
            $table->string('timezone', 64)->default('UTC');
            $table->timestamps();
            $table->index(['clinician_id', 'start_at']);
        });

        Schema::create('slots', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('status', 16)->default('FREE');
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
            $table->index(['clinician_id', 'start_at']);
            $table->index(['status', 'is_hidden', 'start_at']);
        });

        if (DB::connection()->getDriverName() === 'sqlite') {
            DB::unprepared("CREATE TRIGGER schedules_positive_duration_insert BEFORE INSERT ON schedules WHEN NEW.end_at <= NEW.start_at BEGIN SELECT RAISE(ABORT, 'Schedule duration must be positive'); END");
            DB::unprepared("CREATE TRIGGER schedules_positive_duration_update BEFORE UPDATE ON schedules WHEN NEW.end_at <= NEW.start_at BEGIN SELECT RAISE(ABORT, 'Schedule duration must be positive'); END");
            DB::unprepared("CREATE TRIGGER slots_valid_insert BEFORE INSERT ON slots WHEN NEW.end_at <= NEW.start_at OR NEW.status NOT IN ('FREE', 'PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED') BEGIN SELECT RAISE(ABORT, 'Slot duration or status is invalid'); END");
            DB::unprepared("CREATE TRIGGER slots_valid_update BEFORE UPDATE ON slots WHEN NEW.end_at <= NEW.start_at OR NEW.status NOT IN ('FREE', 'PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED') BEGIN SELECT RAISE(ABORT, 'Slot duration or status is invalid'); END");
        } else {
            DB::statement('ALTER TABLE schedules ADD CONSTRAINT schedules_positive_duration CHECK (end_at > start_at)');
            DB::statement('ALTER TABLE slots ADD CONSTRAINT slots_positive_duration CHECK (end_at > start_at)');
            DB::statement("ALTER TABLE slots ADD CONSTRAINT slots_status_valid CHECK (status IN ('FREE', 'PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slots');
        Schema::dropIfExists('schedules');
    }
};
