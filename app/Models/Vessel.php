<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vessel extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'type',
        'amenities',
        'layout_rows',
        'layout_cols',
        'vip_rows',
        'premium_rows',
        'custom_seats',
    ];

    protected $casts = [
        'amenities' => 'array',
        'custom_seats' => 'array',
        'layout_rows' => 'integer',
        'layout_cols' => 'integer',
    ];
}
