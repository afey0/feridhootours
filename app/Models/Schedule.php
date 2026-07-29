<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'vessel_id',
        'vessel_name',
        'vessel_type',
        'departure_time',
        'arrival_time',
        'available_seats',
        'total_seats',
        'price',
        'route_from',
        'route_to',
        'amenities',
        'stops',
        'disabled',
        'maintenance',
    ];

    protected $casts = [
        'amenities' => 'array',
        'stops' => 'array',
        'available_seats' => 'integer',
        'total_seats' => 'integer',
        'price' => 'decimal:2',
        'disabled' => 'boolean',
        'maintenance' => 'boolean',
    ];
}
