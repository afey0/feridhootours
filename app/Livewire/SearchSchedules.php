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
    // Step Engine: 'search', 'select_seats', 'passenger_details', 'payment', 'confirmation'
    public $currentStep = 'search';
    public $hasSearched = false;

    // Search Filters
    public $fromPort = 'MLE';
    public $toPort = 'MAF';
    public $travelDate = '';
    public $passengersCount = 1;

    // Booking Flow State
    public $selectedSchedule = null;
    public $selectedVessel = null;
    public $selectedSeats = [];
    public $reservedSeats = [];
    public $passengersData = [];
    
    // Payment & Promo
    public $promoCode = '';
    public $discount = 0;
    public $paymentMethod = 'card'; // 'card', 'bank_transfer', 'cash'

    // Booking Success State
    public $confirmedBooking = null;

    public function mount()
    {
        $this->travelDate = date('Y-m-d');
        $this->initPassengerData();

        if (request()->has('from') && request()->has('to')) {
            $this->fromPort = request()->query('from');
            $this->toPort = request()->query('to');
            $this->hasSearched = true;
        }
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
        $this->fromPort = 'MLE';
        $this->toPort = $portId;
        $this->hasSearched = true;
        $this->currentStep = 'search';
    }

    public function executeSearch()
    {
        $this->hasSearched = true;
        $this->currentStep = 'search';
    }

    public function selectSchedule($scheduleId)
    {
        $this->selectedSchedule = Schedule::find($scheduleId);
        if (!$this->selectedSchedule) return;

        $this->selectedVessel = Vessel::find($this->selectedSchedule->vessel_id) ?? Vessel::first();
        if (!$this->selectedVessel) {
            $this->selectedVessel = new Vessel([
                'layout_rows' => 8,
                'layout_cols' => 4,
                'name' => $this->selectedSchedule->vessel_name ?? 'Kaani Princess',
                'type' => 'Speedboat'
            ]);
        }

        // Fetch all reserved seat IDs for this schedule from existing active bookings
        $existingBookings = Booking::where('schedule_id', $this->selectedSchedule->id)
            ->whereIn('status', ['verified', 'pending_verification'])
            ->get();

        $this->reservedSeats = [];
        foreach ($existingBookings as $b) {
            if (is_array($b->selected_seat_ids)) {
                $this->reservedSeats = array_merge($this->reservedSeats, $b->selected_seat_ids);
            }
        }
        $this->reservedSeats = array_values(array_unique($this->reservedSeats));

        $this->selectedSeats = [];
        $this->initPassengerData();
        $this->currentStep = 'select_seats';
    }

    public function toggleSeat($seatId)
    {
        if (in_array($seatId, $this->reservedSeats)) {
            session()->flash('step_error', "Seat {$seatId} is already booked and reserved!");
            return;
        }

        if (in_array($seatId, $this->selectedSeats)) {
            $this->selectedSeats = array_values(array_filter($this->selectedSeats, fn($s) => $s !== $seatId));
        } else {
            if (count($this->selectedSeats) < (int)$this->passengersCount) {
                $this->selectedSeats[] = $seatId;
            }
        }

        // Sync seat IDs to passenger items
        foreach ($this->passengersData as $idx => $passenger) {
            $this->passengersData[$idx]['seatId'] = $this->selectedSeats[$idx] ?? '';
        }
    }

    public function proceedToPassengerDetails()
    {
        if (count($this->selectedSeats) < (int)$this->passengersCount) {
            session()->flash('step_error', 'Please select ' . $this->passengersCount . ' seat(s) on the layout map.');
            return;
        }

        $this->currentStep = 'passenger_details';
    }

    public function proceedToPayment()
    {
        // Validate passenger names
        foreach ($this->passengersData as $p) {
            if (empty(trim($p['name'] ?? ''))) {
                session()->flash('step_error', 'Please enter passenger names for all assigned seats.');
                return;
            }
        }

        $this->currentStep = 'payment';
    }

    public function goBackToSearch()
    {
        $this->currentStep = 'search';
    }

    public function goBackToSeats()
    {
        $this->currentStep = 'select_seats';
    }

    public function applyPromo()
    {
        if (strtoupper(trim($this->promoCode)) === 'MALDIVES10') {
            $this->discount = 10.00;
            session()->flash('promo_success', 'Promo code MALDIVES10 applied (-$10.00)');
        } else {
            session()->flash('promo_error', 'Invalid promo code. Try MALDIVES10');
        }
    }

    public function confirmPayment()
    {
        if (!$this->selectedSchedule) return;

        // Double check seat availability before saving to prevent race conditions
        $alreadyTaken = Booking::where('schedule_id', $this->selectedSchedule->id)
            ->whereIn('status', ['verified', 'pending_verification'])
            ->get()
            ->pluck('selected_seat_ids')
            ->flatten()
            ->intersect($this->selectedSeats);

        if ($alreadyTaken->count() > 0) {
            session()->flash('step_error', 'One or more selected seats were reserved just now by another passenger. Please select different seats.');
            $this->selectSchedule($this->selectedSchedule->id);
            return;
        }

        $subtotal = $this->selectedSchedule->price * (int)$this->passengersCount;
        $totalAmount = max(0, $subtotal - $this->discount);
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
            'discount_applied' => $this->discount,
            'promo_code_used' => $this->discount > 0 ? $this->promoCode : null,
            'payment_method' => $this->paymentMethod,
            'status' => $this->paymentMethod === 'bank_transfer' ? 'pending_verification' : 'verified',
            'booked_by' => Auth::check() ? Auth::user()->name : ($this->passengersData[0]['name'] ?? 'Guest'),
            'user_id' => Auth::check() ? Auth::id() : null,
            'passenger_email' => Auth::check() ? Auth::user()->email : 'guest@feridhootours.mv',
        ]);

        // Decrement available seats count on schedule
        $this->selectedSchedule->decrement('available_seats', count($this->selectedSeats));

        // Re-sync reserved seats
        $this->reservedSeats = array_values(array_unique(array_merge($this->reservedSeats, $this->selectedSeats)));

        $this->confirmedBooking = $booking;
        $this->currentStep = 'confirmation';
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
