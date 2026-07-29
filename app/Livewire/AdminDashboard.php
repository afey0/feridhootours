<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Vessel;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\User;
use App\Models\Jetty;
use App\Models\AuditLog;

class AdminDashboard extends Component
{
    public $activeTab = 'vessels';
    public $rejectReason = '';
    public $selectedBookingId = null;

    public function mount()
    {
        if (request()->query('tab')) {
            $this->activeTab = request()->query('tab');
        }
    }

    public function setTab($tab)
    {
        $this->activeTab = $tab;
    }

    public function verifyPayment($bookingId)
    {
        $booking = Booking::find($bookingId);
        if ($booking) {
            $booking->update(['status' => 'verified']);
            AuditLog::create([
                'id' => 'AUD-' . uniqid(),
                'action' => 'VERIFY_PAYMENT',
                'entity_type' => 'BOOKING',
                'entity_id' => $bookingId,
                'performed_by_name' => 'Operator Admin',
                'performed_by_role' => 'admin',
                'changes' => ['before' => 'pending_verification', 'after' => 'verified']
            ]);
        }
    }

    public function rejectPayment($bookingId)
    {
        if (empty(trim($this->rejectReason))) {
            return;
        }

        $booking = Booking::find($bookingId);
        if ($booking) {
            $booking->update([
                'status' => 'rejected',
                'rejection_reason' => trim($this->rejectReason)
            ]);
            AuditLog::create([
                'id' => 'AUD-' . uniqid(),
                'action' => 'REJECT_PAYMENT',
                'entity_type' => 'BOOKING',
                'entity_id' => $bookingId,
                'performed_by_name' => 'Operator Admin',
                'performed_by_role' => 'admin',
                'metadata' => ['reason' => $this->rejectReason]
            ]);
            $this->rejectReason = '';
            $this->selectedBookingId = null;
        }
    }

    public function deleteBooking($bookingId)
    {
        $booking = Booking::find($bookingId);
        if ($booking) {
            AuditLog::create([
                'id' => 'AUD-' . uniqid(),
                'action' => 'DELETE',
                'entity_type' => 'BOOKING',
                'entity_id' => $bookingId,
                'performed_by_name' => 'Super Administrator',
                'performed_by_role' => 'super_admin'
            ]);
            $booking->delete();
        }
    }

    public function render()
    {
        return view('livewire.admin-dashboard', [
            'vessels' => Vessel::all(),
            'schedules' => Schedule::all(),
            'bookings' => Booking::orderBy('created_at', 'desc')->get(),
            'users' => User::all(),
            'jetties' => Jetty::all(),
            'auditLogs' => AuditLog::orderBy('created_at', 'desc')->limit(100)->get(),
        ]);
    }
}
