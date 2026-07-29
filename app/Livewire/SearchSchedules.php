<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Schedule;
use App\Models\Jetty;

class SearchSchedules extends Component
{
    public $fromPort = 'MLE';
    public $toPort = 'MAF';
    public $travelDate = '';
    public $passengersCount = 1;

    public function mount()
    {
        $this->travelDate = date('Y-m-d');
    }

    public function swapPorts()
    {
        $temp = $this->fromPort;
        $this->fromPort = $this->toPort;
        $this->toPort = $temp;
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
