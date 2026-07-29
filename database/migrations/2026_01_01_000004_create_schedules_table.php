<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('vessel_id', 64)->nullable();
            $table->string('vessel_name');
            $table->string('vessel_type')->default('Speedboat');
            $table->string('departure_time');
            $table->string('arrival_time');
            $table->integer('available_seats');
            $table->integer('total_seats');
            $table->decimal('price', 10, 2);
            $table->string('route_from', 32);
            $table->string('route_to', 32);
            $table->json('amenities')->nullable();
            $table->json('stops')->nullable();
            $table->boolean('disabled')->default(false);
            $table->boolean('maintenance')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
