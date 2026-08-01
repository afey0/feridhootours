<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Vessel;
use App\Models\Schedule;
use App\Models\Booking;
use App\Models\User;
use App\Models\Jetty;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AdminDashboard extends Component
{
    public $activeTab = 'vessels'; // 'vessels', 'schedules', 'bookings', 'users', 'reports', 'audit'

    // Vessel Form Modal
    public $showVesselModal = false;
    public $editingVesselId = null;
    public $vesselName = '';
    public $vesselType = 'Speedboat';
    public $vesselLayoutRows = 8;
    public $vesselLayoutCols = 4;
    public $vesselVipRows = '1-2';
    public $vesselPremiumRows = '3-4';

    // Schedule Form Modal
    public $showScheduleModal = false;
    public $editingScheduleId = null;
    public $scheduleVesselId = '';
    public $scheduleRouteFrom = 'MLE';
    public $scheduleRouteTo = 'MAF';
    public $scheduleDepartureTime = '08:30 AM';
    public $scheduleArrivalTime = '09:15 AM';
    public $schedulePrice = 35.00;
    public $scheduleTotalSeats = 32;
    public $scheduleRecurrence = 'Daily'; // 'Daily', 'Weekly', 'Monthly', 'Specific Date'
    public $scheduleDate = '';

    // Reject Modal State
    public $rejectBookingId = null;
    public $rejectionReason = '';

    // Alert Notification
    public $flashMessage = null;

    public function mount()
    {
        if (request()->has('tab')) {
            $this->activeTab = request()->query('tab');
        }
        $this->scheduleDate = date('Y-m-d');
    }

    public function setTab($tab)
    {
        $this->activeTab = $tab;
    }

    // Vessel Management
    public function openVesselModal($vesselId = null)
    {
        $this->editingVesselId = $vesselId;
        if ($vesselId) {
            $v = Vessel::find($vesselId);
            if ($v) {
                $this->vesselName = $v->name;
                $this->vesselType = $v->type;
                $this->vesselLayoutRows = $v->layout_rows;
                $this->vesselLayoutCols = $v->layout_cols;
                $this->vesselVipRows = $v->vip_rows;
                $this->vesselPremiumRows = $v->premium_rows;
            }
        } else {
            $this->vesselName = '';
            $this->vesselType = 'Speedboat';
            $this->vesselLayoutRows = 8;
            $this->vesselLayoutCols = 4;
            $this->vesselVipRows = '1-2';
            $this->vesselPremiumRows = '3-4';
        }
        $this->showVesselModal = true;
    }

    public function saveVessel()
    {
        if (empty($this->vesselName)) return;

        if ($this->editingVesselId) {
            Vessel::where('id', $this->editingVesselId)->update([
                'name' => $this->vesselName,
                'type' => $this->vesselType,
                'layout_rows' => $this->vesselLayoutRows,
                'layout_cols' => $this->vesselLayoutCols,
                'vip_rows' => $this->vesselVipRows,
                'premium_rows' => $this->vesselPremiumRows,
            ]);
            $this->flashMessage = "Vessel {$this->vesselName} updated successfully.";
        } else {
            Vessel::create([
                'id' => 'VES-' . strtoupper(substr(md5(uniqid()), 0, 6)),
                'name' => $this->vesselName,
                'type' => $this->vesselType,
                'layout_rows' => $this->vesselLayoutRows,
                'layout_cols' => $this->vesselLayoutCols,
                'vip_rows' => $this->vesselVipRows,
                'premium_rows' => $this->vesselPremiumRows,
            ]);
            $this->flashMessage = "New vessel {$this->vesselName} created.";
        }

        $this->showVesselModal = false;
    }

    public function deleteVessel($vesselId)
    {
        Vessel::destroy($vesselId);
        $this->flashMessage = "Vessel removed.";
    }

    // Schedule Management
    public function openScheduleModal($scheduleId = null)
    {
        $this->editingScheduleId = $scheduleId;
        if ($scheduleId) {
            $s = Schedule::find($scheduleId);
            if ($s) {
                $this->scheduleVesselId = $s->vessel_id;
                $this->scheduleRouteFrom = $s->route_from;
                $this->scheduleRouteTo = $s->route_to;
                $this->scheduleDepartureTime = $s->departure_time;
                $this->scheduleArrivalTime = $s->arrival_time;
                $this->schedulePrice = $s->price;
                $this->scheduleTotalSeats = $s->total_seats;
                $this->scheduleRecurrence = $s->recurrence ?? 'Daily';
                $this->scheduleDate = $s->schedule_date ? $s->schedule_date->format('Y-m-d') : date('Y-m-d');
            }
        } else {
            $vessel = Vessel::first();
            $this->scheduleVesselId = $vessel ? $vessel->id : '';
            $this->scheduleRouteFrom = 'MLE';
            $this->scheduleRouteTo = 'MAF';
            $this->scheduleDepartureTime = '08:30 AM';
            $this->scheduleArrivalTime = '09:15 AM';
            $this->schedulePrice = 35.00;
            $this->scheduleTotalSeats = 32;
            $this->scheduleRecurrence = 'Daily';
            $this->scheduleDate = date('Y-m-d');
        }
        $this->showScheduleModal = true;
    }

    public function saveSchedule()
    {
        $vessel = Vessel::find($this->scheduleVesselId) ?? Vessel::first();
        $vName = $vessel ? $vessel->name : 'Kaani Princess';
        $vType = $vessel ? $vessel->type : 'Speedboat';

        if ($this->editingScheduleId) {
            Schedule::where('id', $this->editingScheduleId)->update([
                'vessel_id' => $this->scheduleVesselId,
                'vessel_name' => $vName,
                'vessel_type' => $vType,
                'route_from' => $this->scheduleRouteFrom,
                'route_to' => $this->scheduleRouteTo,
                'departure_time' => $this->scheduleDepartureTime,
                'arrival_time' => $this->scheduleArrivalTime,
                'price' => $this->schedulePrice,
                'total_seats' => $this->scheduleTotalSeats,
                'recurrence' => $this->scheduleRecurrence,
                'schedule_date' => $this->scheduleDate ?: null,
            ]);
            $this->flashMessage = "Schedule updated successfully.";
        } else {
            Schedule::create([
                'id' => 'SCH-' . strtoupper(substr(md5(uniqid()), 0, 6)),
                'vessel_id' => $this->scheduleVesselId,
                'vessel_name' => $vName,
                'vessel_type' => $vType,
                'route_from' => $this->scheduleRouteFrom,
                'route_to' => $this->scheduleRouteTo,
                'departure_time' => $this->scheduleDepartureTime,
                'arrival_time' => $this->scheduleArrivalTime,
                'available_seats' => $this->scheduleTotalSeats,
                'total_seats' => $this->scheduleTotalSeats,
                'price' => $this->schedulePrice,
                'recurrence' => $this->scheduleRecurrence,
                'schedule_date' => $this->scheduleDate ?: null,
            ]);
            $this->flashMessage = "New schedule created.";
        }

        $this->showScheduleModal = false;
    }

    public function toggleScheduleDisable($scheduleId)
    {
        $s = Schedule::find($scheduleId);
        if ($s) {
            $s->update(['disabled' => !$s->disabled]);
            $this->flashMessage = "Schedule status toggled.";
        }
    }

    // Booking Verification
    public function approveBooking($bookingId)
    {
        Booking::where('id', $bookingId)->update(['status' => 'verified']);
        $this->flashMessage = "Booking {$bookingId} approved & verified!";
    }

    public function rejectBooking($bookingId)
    {
        Booking::where('id', $bookingId)->update([
            'status' => 'rejected',
            'rejection_reason' => $this->rejectionReason ?: 'Payment verification failed.'
        ]);
        $this->rejectBookingId = null;
        $this->rejectionReason = '';
        $this->flashMessage = "Booking {$bookingId} rejected.";
    }

    public function render()
    {
        return view('livewire.admin-dashboard', [
            'vessels' => Vessel::all(),
            'schedules' => Schedule::all(),
            'bookings' => Booking::orderBy('created_at', 'desc')->get(),
            'users' => User::all(),
            'jetties' => Jetty::all(),
            'auditLogs' => AuditLog::orderBy('created_at', 'desc')->take(20)->get(),
        ]);
    }
}
