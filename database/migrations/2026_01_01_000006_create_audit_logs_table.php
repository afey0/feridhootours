<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('action', 64);
            $table->string('entity_type', 64);
            $table->string('entity_id', 64);
            $table->string('performed_by_id', 64)->nullable();
            $table->string('performed_by_name');
            $table->string('performed_by_email')->nullable();
            $table->string('performed_by_role', 32);
            $table->json('changes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
