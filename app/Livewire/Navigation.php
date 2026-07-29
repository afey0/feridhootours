<?php

namespace App\Livewire;

use Livewire\Component;

class Navigation extends Component
{
    public $showDrawer = false;
    public $showLoginModal = false;
    public $email = '';
    public $password = '';
    public $loginRole = 'passenger';

    public function toggleDrawer()
    {
        $this->showDrawer = !$this->showDrawer;
    }

    public function openLoginModal()
    {
        $this->showLoginModal = true;
    }

    public function closeLoginModal()
    {
        $this->showLoginModal = false;
    }

    public function render()
    {
        return view('livewire.navigation');
    }
}
