<nav class="glass-panel px-4 md:px-6 py-3.5 md:py-4 rounded-3xl md:rounded-full flex justify-between items-center relative z-20 border border-slate-200/80 shadow-md mb-6 md:mb-8 text-slate-800 backdrop-blur-xl">
    <!-- Brand Logo -->
    <a href="/" class="flex items-center gap-2.5 font-black text-lg md:text-xl cursor-pointer select-none text-left">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
            <svg class="w-5 h-5 text-white transform rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div class="flex flex-col">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 tracking-tight font-black leading-none text-base md:text-xl font-display">
                FeridhooTours
            </span>
            <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-tight hidden sm:inline">
                Speedboat & Ferry
            </span>
        </div>
    </a>

    <!-- Desktop Navigation Links -->
    <div class="hidden lg:flex items-center gap-3 font-semibold text-xs">
        <a href="/" class="px-4 py-2 rounded-2xl transition font-extrabold {{ request()->is('/') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' }}">
            🔍 Find Schedules
        </a>

        <a href="/my-bookings" class="px-4 py-2 rounded-2xl transition font-extrabold {{ request()->is('my-bookings') ? 'bg-slate-900 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200' }}">
            🎟️ My Bookings
        </a>

        @if($currentUser && in_array($currentUser->role, ['admin', 'super_admin']))
            <a href="/admin" class="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold shadow-md shadow-sky-600/15 transition flex items-center gap-1.5">
                ⚙️ Admin Panel
            </a>
        @else
            <a href="/admin" class="px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold transition">
                Operator Portal
            </a>
        @endif
    </div>

    <!-- Right Side Actions / User Menu -->
    <div class="flex items-center gap-3">
        @if($currentUser)
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-3.5 py-1.5 shadow-sm">
                <div class="flex flex-col text-left">
                    <span class="text-xs font-black text-slate-850 leading-tight font-display">{{ $currentUser->name }}</span>
                    <span class="text-[9px] font-extrabold uppercase tracking-wider text-sky-600 leading-none mt-0.5">{{ strtoupper(str_replace('_', ' ', $currentUser->role)) }}</span>
                </div>
                <button wire:click="logout" class="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer" title="Sign Out">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
            </div>
        @else
            <button wire:click="openLoginModal('signin')" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>Sign In / Register</span>
            </button>
        @endif

        <!-- Mobile Drawer Toggle -->
        <button wire:click="toggleDrawer" class="lg:hidden p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
    </div>

    <!-- Mobile Slide-out Drawer -->
    @if($showDrawer)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fade-in" wire:click.self="toggleDrawer">
            <div class="w-80 bg-white h-full border-l border-slate-200 p-6 flex flex-col justify-between text-left shadow-2xl">
                <div>
                    <div class="flex justify-between items-center pb-5 border-b border-slate-100">
                        <span class="font-extrabold text-slate-850 text-base font-display">FeridhooTours Menu</span>
                        <button wire:click="toggleDrawer" class="p-1 rounded-lg text-slate-400 hover:text-slate-700">✕</button>
                    </div>

                    <div class="space-y-3 mt-6">
                        <a href="/" class="block px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs">🔍 Find Schedules</a>
                        <a href="/my-bookings" class="block px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs">🎟️ My Bookings</a>
                        <a href="/admin" class="block px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 font-extrabold text-xs">⚙️ Admin Panel</a>
                    </div>
                </div>

                @if(!$currentUser)
                    <div class="pt-6 border-t border-slate-100">
                        <button wire:click="openLoginModal('signin')" class="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-sky-600/20">
                            Sign In / Register
                        </button>
                    </div>
                @endif
            </div>
        </div>
    @endif

    <!-- Authentication Modal -->
    @if($showLoginModal)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" wire:click.self="closeLoginModal">
            <div class="bg-white border border-slate-200/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-left">
                <!-- Modal Close Button -->
                <button wire:click="closeLoginModal" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>

                <!-- Tabs header -->
                <div class="mb-6 border-b border-slate-100 pb-4">
                    <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                        {{ $authMode === 'signin' ? 'Sign In to FeridhooTours' : ($authMode === 'signup' ? 'Create Your Account' : 'Reset Your Password') }}
                    </h2>
                    <p class="text-slate-500 text-xs mt-1 font-medium">
                        Access your digital boarding passes, saved manifests, and booking history.
                    </p>
                </div>

                @if($errorMessage)
                    <div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold mb-4">
                        ⚠️ {{ $errorMessage }}
                    </div>
                @endif

                @if($successMessage)
                    <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-semibold mb-4">
                        ✅ {{ $successMessage }}
                    </div>
                @endif

                @if($authMode === 'signin')
                    <form wire:submit.prevent="login" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <input type="email" wire:model="email" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="name@example.com" required>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
                            <input type="password" wire:model="password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 text-sm transition">
                            Sign In
                        </button>
                    </form>
                @elseif($authMode === 'signup')
                    <form wire:submit.prevent="signup" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <input type="text" wire:model="name" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="Ahmed Shareef" required>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
                            <input type="email" wire:model="email" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="name@example.com" required>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
                                <input type="password" wire:model="password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="••••••••" required>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Confirm</label>
                                <input type="password" wire:model="confirmPassword" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" placeholder="••••••••" required>
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 text-sm transition">
                            Create Account
                        </button>
                    </form>
                @endif

                <!-- Demo Instant Logins Bar -->
                <div class="mt-8 pt-6 border-t border-slate-100 space-y-3">
                    <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
                        Demo Instant One-Click Sign In Options
                    </span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <button type="button" wire:click="loginAs('passenger')" class="py-2.5 px-3 bg-sky-50 hover:bg-sky-100/80 text-sky-700 border border-sky-200 rounded-2xl text-xs font-extrabold transition cursor-pointer">
                            👤 Passenger
                        </button>
                        <button type="button" wire:click="loginAs('agency')" class="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-extrabold transition cursor-pointer">
                            🏢 Travel Agency
                        </button>
                        <button type="button" wire:click="loginAs('admin')" class="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold transition cursor-pointer shadow-sm">
                            🛡️ Operator/Admin
                        </button>
                        <button type="button" wire:click="loginAs('super_admin')" class="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-extrabold transition cursor-pointer shadow-sm">
                            ⭐ Super Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif
</nav>
