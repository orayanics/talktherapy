<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('slot_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('patient_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 16);
            $table->timestamp('booked_at');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->uuid('room_id')->nullable()->unique();
            $table->timestamps();
            $table->index(['patient_id', 'booked_at']);
            $table->index(['clinician_id', 'booked_at']);
        });

        Schema::create('appointment_events', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')->constrained()->restrictOnDelete();
            $table->string('actor_type', 16);
            $table->foreignUuid('actor_id')->constrained('users')->restrictOnDelete();
            $table->string('from_status', 16)->nullable();
            $table->string('to_status', 16);
            $table->string('reason', 2000)->nullable();
            $table->timestamp('created_at');
            $table->index(['appointment_id', 'created_at', 'id']);
        });

        Schema::create('encounters', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')->unique()->constrained()->restrictOnDelete();
            $table->string('diagnosis', 2000);
            $table->string('chief_complaint', 2000);
            $table->string('referral_source', 255);
            $table->string('referral_url', 2048)->nullable();
            $table->timestamps();
        });

        Schema::create('clinician_patients', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('clinician_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('patient_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('first_completed_at');
            $table->timestamps();
            $table->unique(['clinician_id', 'patient_id']);
        });

        $driver = DB::connection()->getDriverName();
        if (in_array($driver, ['pgsql', 'sqlite'], true)) {
            DB::statement("CREATE UNIQUE INDEX appointments_one_active_slot ON appointments (slot_id) WHERE status IN ('PENDING', 'ACCEPTED')");
        }

        if ($driver === 'sqlite') {
            DB::unprepared("CREATE TRIGGER appointments_status_insert BEFORE INSERT ON appointments WHEN NEW.status NOT IN ('PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED') BEGIN SELECT RAISE(ABORT, 'Appointment status is invalid'); END");
            DB::unprepared("CREATE TRIGGER appointments_status_update BEFORE UPDATE ON appointments WHEN NEW.status NOT IN ('PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED') BEGIN SELECT RAISE(ABORT, 'Appointment status is invalid'); END");
        } else {
            DB::statement("ALTER TABLE appointments ADD CONSTRAINT appointments_status_valid CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECT', 'CANCELLED', 'COMPLETED'))");
        }
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS appointments_status_insert');
        DB::unprepared('DROP TRIGGER IF EXISTS appointments_status_update');
        DB::statement('DROP INDEX IF EXISTS appointments_one_active_slot');
        Schema::dropIfExists('clinician_patients');
        Schema::dropIfExists('encounters');
        Schema::dropIfExists('appointment_events');
        Schema::dropIfExists('appointments');
    }
};
