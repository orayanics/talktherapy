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
        Schema::create('outbox_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kind', 100);
            $table->string('aggregate_id', 191);
            $table->foreignUuid('recipient_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->string('delivery_key', 191)->unique();
            $table->text('payload')->nullable();
            $table->timestamp('available_at');
            $table->timestamp('claimed_at')->nullable();
            $table->uuid('claim_token')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->string('last_error_code', 100)->nullable();
            $table->timestamps();
            $table->index(['delivered_at', 'available_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outbox_messages');
    }
};
