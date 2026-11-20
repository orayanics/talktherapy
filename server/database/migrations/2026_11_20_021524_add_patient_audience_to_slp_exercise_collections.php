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
        Schema::table('slp_exercise_collections', function (Blueprint $table) {
            $table->string('patient_audience', 24)->default('assigned');
            $table->json('patient_ids')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slp_exercise_collections', function (Blueprint $table) {
            $table->dropColumn(['patient_audience', 'patient_ids']);
        });
    }
};
