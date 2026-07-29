<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\SearchSchedules;
use App\Livewire\MyBookings;
use App\Livewire\AdminDashboard;

Route::get('/', SearchSchedules::class)->name('home');
Route::get('/my-bookings', MyBookings::class)->name('my-bookings');
Route::get('/admin', AdminDashboard::class)->name('admin');
