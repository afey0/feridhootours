<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('schedule_id', 64);
            $table->string('vessel_name');
            $table->string('vessel_type');
            $table->string('departure_time');
            $table->string('arrival_time');
            $table->string('route_from', 32);
            $table->string('route_to', 32);
            $table->json('passengers');
            $table->json('selected_seat_ids');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_applied', 10, 2)->default(0);
            $table->string('promo_code_used')->nullable();
            $table->string('payment_method')->default('card');
            $table->text('receipt_image')->nullable();
            $table->enum('status', ['pending_verification', 'verified', 'rejected', 'cancelled'])->default('pending_verification');
            $table->text('rejection_reason')->nullable();
            $table->string('agency_id')->nullable();
            $table->string('booked_by')->nullable();
            $table->string('user_id')->nullable();
            $table->string('passenger_email')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->decimal('cancellation_fee', 10, 2)->nullable();
            $table->decimal('refund_percentage', 5, 2)->nullable();
            $table->string('refund_status')->default('none');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
