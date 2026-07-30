<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Ensure migrations run outside of a transaction (avoids Neon PostgreSQL transaction abort on enum)
    public $withinTransaction = false;

    public function up(): void
    {
        Schema::dropIfExists('users');
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            // Use string + check constraint instead of enum (PostgreSQL enum causes transaction issues)
            $table->string('role', 20)->default('passenger');
            $table->string('phone')->nullable();
            $table->string('agency_name')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Add check constraint separately (outside CREATE TABLE to avoid transaction abort)
        \DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('passenger','agency','admin','super_admin'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
