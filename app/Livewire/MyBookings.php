<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Booking;

class MyBookings extends Component
{
    public function render()
    {
        $bookings = Booking::orderBy('created_at', 'desc')->get();

        return view('livewire.my-bookings', [
            'bookings' => $bookings
        ]);
    }
}
