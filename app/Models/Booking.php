<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'schedule_id',
        'vessel_name',
        'vessel_type',
        'departure_time',
        'arrival_time',
        'route_from',
        'route_to',
        'passengers',
        'selected_seat_ids',
        'total_amount',
        'discount_applied',
        'promo_code_used',
        'payment_method',
        'receipt_image',
        'status',
        'rejection_reason',
        'agency_id',
        'booked_by',
        'user_id',
        'passenger_email',
        'refund_amount',
        'cancellation_fee',
        'refund_percentage',
        'refund_status',
    ];

    protected $casts = [
        'passengers' => 'array',
        'selected_seat_ids' => 'array',
        'total_amount' => 'decimal:2',
        'discount_applied' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'cancellation_fee' => 'decimal:2',
        'refund_percentage' => 'decimal:2',
    ];
}
