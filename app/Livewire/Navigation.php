<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class Navigation extends Component
{
    public $showDrawer = false;
    public $showUserDropdown = false;
    public $showLoginModal = false;
    public $authMode = 'signin'; // 'signin', 'signup', 'forgot'

    // Form inputs
    public $email = '';
    public $password = '';
    public $name = '';
    public $role = 'passenger';
    public $confirmPassword = '';

    // Feedback messages
    public $errorMessage = null;
    public $successMessage = null;

    public function toggleDrawer()
    {
        $this->showDrawer = !$this->showDrawer;
        $this->showUserDropdown = false;
    }

    public function toggleUserDropdown()
    {
        $this->showUserDropdown = !$this->showUserDropdown;
    }

    public function openLoginModal($mode = 'signin')
    {
        $this->authMode = $mode;
        $this->errorMessage = null;
        $this->successMessage = null;
        $this->showLoginModal = true;
        $this->showDrawer = false;
        $this->showUserDropdown = false;
    }

    public function closeLoginModal()
    {
        $this->showLoginModal = false;
        $this->errorMessage = null;
        $this->successMessage = null;
    }

    public function login()
    {
        $this->errorMessage = null;
        $this->successMessage = null;

        if (empty($this->email) || empty($this->password)) {
            $this->errorMessage = 'Please enter your email and password.';
            return;
        }

        $user = User::where('email', $this->email)->first();
        if ($user && Hash::check($this->password, $user->password)) {
            Auth::login($user);
            session(['user_role' => $user->role, 'user_name' => $user->name]);
            $this->closeLoginModal();
            return $this->redirect('/', navigate: true);
        }

        $this->errorMessage = 'Invalid credentials provided.';
    }

    public function signup()
    {
        $this->errorMessage = null;
        $this->successMessage = null;

        if (empty($this->name) || empty($this->email) || empty($this->password)) {
            $this->errorMessage = 'All fields are required.';
            return;
        }

        if ($this->password !== $this->confirmPassword) {
            $this->errorMessage = 'Passwords do not match.';
            return;
        }

        if (User::where('email', $this->email)->exists()) {
            $this->errorMessage = 'An account with this email already exists.';
            return;
        }

        $user = User::create([
            'id' => 'USR-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'name' => $this->name,
            'email' => $this->email,
            'password' => Hash::make($this->password),
            'role' => $this->role,
        ]);

        Auth::login($user);
        session(['user_role' => $user->role, 'user_name' => $user->name]);
        $this->successMessage = 'Account created successfully!';
        $this->closeLoginModal();
        return $this->redirect('/', navigate: true);
    }

    public function loginAs($role)
    {
        $emailMap = [
            'passenger' => 'ahmed@example.com',
            'agency' => 'bookings@mvtravel.com',
            'admin' => 'admin@smartferry.mv',
            'super_admin' => 'superadmin@smartferry.mv',
        ];

        $targetEmail = $emailMap[$role] ?? 'ahmed@example.com';
        $user = User::where('email', $targetEmail)->first();

        if ($user) {
            Auth::login($user);
            session(['user_role' => $user->role, 'user_name' => $user->name]);
        }

        $this->closeLoginModal();
        return $this->redirect('/', navigate: true);
    }

    public function logout()
    {
        Auth::logout();
        session()->forget(['user_role', 'user_name']);
        $this->showUserDropdown = false;
        $this->showDrawer = false;
        return $this->redirect('/', navigate: true);
    }

    public function render()
    {
        return view('livewire.navigation', [
            'currentUser' => Auth::user(),
        ]);
    }
}
