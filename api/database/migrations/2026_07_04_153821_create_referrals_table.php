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
        Schema::create('referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('referrer_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignUuid('referred_id')->constrained('accounts')->cascadeOnDelete();
            $table->foreignUuid('center_id')->constrained('centers')->cascadeOnDelete();
            $table->boolean('rewarded')->default(false);
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamps();
            $table->unique(['referred_id', 'center_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
