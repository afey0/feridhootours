<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Schedule;
use App\Models\Jetty;
use App\Models\Vessel;
use App\Models\Booking;
use Illuminate\Support\Facades\Auth;

class SearchSchedules extends Component
{
    // Search Filters
    public $fromPort = 'MLE';
    public $toPort = 'MAF';
    public $travelDate = '';
    public $passengersCount = 1;

    // Booking Modal State
    public $showBookingModal = false;
    public $selectedSchedule = null;
    public $selectedVessel = null;
    public $selectedSeats = [];
    public $passengersData = [];
    public $paymentMethod = 'card'; // 'card', 'bank_transfer', 'cash'
    public $bankReceiptUploaded = false;

    // Booking Success State
    public $confirmedBooking = null;

    public function mount()
    {
        $this->travelDate = date('Y-m-d');
        $this->initPassengerData();
    }

    public function updatedPassengersCount()
    {
        $this->initPassengerData();
        $this->selectedSeats = [];
    }

    public function initPassengerData()
    {
        $this->passengersData = [];
        for ($i = 0; $i < (int)$this->passengersCount; $i++) {
            $this->passengersData[] = [
                'name' => Auth::check() ? (Auth::user()->name ?? '') : '',
                'age' => 28,
                'gender' => 'Male',
                'idNumber' => '',
                'seatId' => '',
            ];
        }
    }

    public function swapPorts()
    {
        $temp = $this->fromPort;
        $this->fromPort = $this->toPort;
        $this->toPort = $temp;
    }

    public function selectPort($portId)
    {
        if ($this->fromPort === $portId) {
            $this->toPort = $portId;
        } else {
            $this->toPort = $portId;
        }
    }

    public function openBookingModal($scheduleId)
    {
        $this->selectedSchedule = Schedule::find($scheduleId);
        if (!$this->selectedSchedule) return;

        $this->selectedVessel = Vessel::find($this->selectedSchedule->vessel_id) ?? Vessel::first();
        $this->selectedSeats = [];
        $this->initPassengerData();
        $this->confirmedBooking = null;
        $this->showBookingModal = true;
    }

    public function closeBookingModal()
    {
        $this->showBookingModal = false;
        $this->selectedSchedule = null;
        $this->selectedSeats = [];
        $this->confirmedBooking = null;
    }

    public function toggleSeat($seatId)
    {
        if (in_array($seatId, $this->selectedSeats)) {
            $this->selectedSeats = array_values(array_filter($this->selectedSeats, fn($s) => $s !== $seatId));
        } else {
            if (count($this->selectedSeats) < (int)$this->passengersCount) {
                $this->selectedSeats[] = $seatId;
            }
        }

        // Assign seat IDs to passenger items
        foreach ($this->passengersData as $idx => $passenger) {
            $this->passengersData[$idx]['seatId'] = $this->selectedSeats[$idx] ?? '';
        }
    }

    public function confirmBooking()
    {
        if (!$this->selectedSchedule) return;

        if (count($this->selectedSeats) < (int)$this->passengersCount) {
            session()->flash('booking_error', 'Please select ' . $this->passengersCount . ' seat(s) before confirming.');
            return;
        }

        $totalAmount = $this->selectedSchedule->price * (int)$this->passengersCount;
        $bookingId = 'SFY-' . strtoupper(substr(md5(uniqid()), 0, 6));

        $booking = Booking::create([
            'id' => $bookingId,
            'schedule_id' => $this->selectedSchedule->id,
            'vessel_name' => $this->selectedSchedule->vessel_name,
            'vessel_type' => $this->selectedSchedule->vessel_type,
            'departure_time' => $this->selectedSchedule->departure_time,
            'arrival_time' => $this->selectedSchedule->arrival_time,
            'route_from' => $this->selectedSchedule->route_from,
            'route_to' => $this->selectedSchedule->route_to,
            'passengers' => $this->passengersData,
            'selected_seat_ids' => $this->selectedSeats,
            'total_amount' => $totalAmount,
            'payment_method' => $this->paymentMethod,
            'status' => $this->paymentMethod === 'bank_transfer' ? 'pending_verification' : 'verified',
            'booked_by' => Auth::check() ? Auth::user()->name : ($this->passengersData[0]['name'] ?? 'Guest'),
            'user_id' => Auth::check() ? Auth::id() : null,
            'passenger_email' => Auth::check() ? Auth::user()->email : 'guest@feridhootours.mv',
        ]);

        // Decrement available seats
        $this->selectedSchedule->decrement('available_seats', count($this->selectedSeats));

        $this->confirmedBooking = $booking;
    }

    public function render()
    {
        $jetties = Jetty::all();
        $schedules = Schedule::where('route_from', $this->fromPort)
            ->where('route_to', $this->toPort)
            ->where('disabled', false)
            ->get();

        return view('livewire.search-schedules', [
            'jetties' => $jetties,
            'schedules' => $schedules,
        ]);
    }
}
