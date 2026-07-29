<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vessels', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name');
            $table->enum('type', ['Speedboat', 'Ferry'])->default('Speedboat');
            $table->json('amenities')->nullable();
            $table->integer('layout_rows')->default(8);
            $table->integer('layout_cols')->default(4);
            $table->string('vip_rows')->nullable();
            $table->string('premium_rows')->nullable();
            $table->json('custom_seats')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vessels');
    }
};
