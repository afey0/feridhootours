<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;

class MyBookings extends Component
{
    public $searchQuery = '';
    public $selectedBooking = null;
    public $showTicketModal = false;
    public $receiptNote = '';
    public $actionMessage = null;

    public function openTicketModal($bookingId)
    {
        $this->selectedBooking = Booking::find($bookingId);
        if ($this->selectedBooking) {
            $this->showTicketModal = true;
        }
    }

    public function closeTicketModal()
    {
        $this->showTicketModal = false;
        $this->selectedBooking = null;
    }

    public function cancelBooking($bookingId)
    {
        $booking = Booking::find($bookingId);
        if ($booking) {
            $booking->update([
                'status' => 'cancelled',
                'refund_status' => 'requested',
            ]);
            $this->actionMessage = "Booking {$bookingId} has been cancelled.";
        }
    }

    public function uploadBankSlip($bookingId)
    {
        $booking = Booking::find($bookingId);
        if ($booking) {
            $booking->update([
                'receipt_image' => 'uploaded_bank_slip.jpg',
                'status' => 'pending_verification'
            ]);
            $this->actionMessage = "Payment slip for {$bookingId} uploaded successfully and is under operator review.";
        }
    }

    public function render()
    {
        $query = Booking::query();

        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'passenger') {
                $query->where(function($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('passenger_email', $user->email);
                });
            }
        }

        if (!empty($this->searchQuery)) {
            $query->where('id', 'ILIKE', "%{$this->searchQuery}%")
                  ->orWhere('passenger_email', 'ILIKE', "%{$this->searchQuery}%")
                  ->orWhere('booked_by', 'ILIKE', "%{$this->searchQuery}%");
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return view('livewire.my-bookings', [
            'bookings' => $bookings
        ]);
    }
}
