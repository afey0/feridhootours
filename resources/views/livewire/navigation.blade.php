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

    <!-- Desktop Navigation Links (≥ 1024px) -->
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
            <!-- User Dropdown Menu -->
            <div class="relative" x-data="{ open: false }">
                <button @click="open = !open" class="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm cursor-pointer transition focus:outline-none text-left">
                    <div class="w-7 h-7 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm font-display">
                        {{ strtoupper(substr($currentUser->name, 0, 1)) }}
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-extrabold text-slate-850 leading-none font-display">{{ $currentUser->name }}</span>
                        <span class="text-[9px] font-extrabold uppercase tracking-wider text-sky-600 leading-none mt-0.5">{{ strtoupper(str_replace('_', ' ', $currentUser->role)) }}</span>
                    </div>
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>

                <!-- Dropdown Menu -->
                <div x-show="open" @click.away="open = false" x-transition class="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 z-50 text-left animate-fade-in">
                    <div class="px-4 py-2 border-b border-slate-100 mb-1.5">
                        <span class="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Signed In As</span>
                        <span class="text-xs font-extrabold text-slate-800 block truncate mt-0.5">{{ $currentUser->email }}</span>
                    </div>

                    @if(in_array($currentUser->role, ['admin', 'super_admin']))
                        <a href="/admin" class="block px-4 py-2.5 text-xs font-extrabold text-sky-700 bg-sky-50/80 hover:bg-sky-100 transition flex items-center gap-2 border-b border-sky-100 mb-1">
                            ⚙️ Operator Dashboard
                        </a>
                        <a href="/admin?tab=reports" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition">
                            📊 Reports & Analytics
                        </a>
                        <a href="/admin?tab=emails" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition">
                            ✉️ Email Control Center
                        </a>
                        <a href="/admin?tab=users" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition">
                            👥 User Directory
                        </a>
                        @if($currentUser->role === 'super_admin')
                            <a href="/admin?tab=audit" class="block px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition">
                                🛡️ Audit Logs & History
                            </a>
                        @endif
                        <div class="my-1 border-t border-slate-100"></div>
                    @endif

                    <a href="/my-bookings" class="block px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition">
                        🎟️ My Bookings
                    </a>

                    <button wire:click="logout" class="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 mt-1.5 cursor-pointer">
                        🚪 Sign Out Account
                    </button>
                </div>
            </div>
        @else
            <button wire:click="openLoginModal('signin')" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer flex items-center gap-2 font-display">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span>Sign In / Register</span>
            </button>
        @endif

        <!-- Mobile & Tablet Drawer Trigger Button (< 1024px) -->
        <button wire:click="toggleDrawer" class="lg:hidden p-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-md flex items-center gap-2 text-xs font-extrabold cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <span class="hidden sm:inline font-bold">Menu</span>
        </button>
    </div>

    <!-- Responsive Mobile & Tablet Drawer -->
    @if($showDrawer)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex justify-end animate-fade-in" wire:click.self="toggleDrawer">
            <div class="w-80 max-w-[85vw] bg-white h-full border-l border-slate-200 p-6 flex flex-col justify-between text-left shadow-2xl overflow-y-auto">
                <div class="space-y-6">
                    <!-- Drawer Header -->
                    <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                                ⚓
                            </div>
                            <span class="font-extrabold text-slate-850 text-base font-display">Navigation Menu</span>
                        </div>
                        <button wire:click="toggleDrawer" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer">✕</button>
                    </div>

                    <!-- User Profile Card inside Drawer -->
                    <div class="bg-sky-50/60 border border-sky-100 rounded-2xl p-4">
                        @if($currentUser)
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 font-display">
                                    {{ strtoupper(substr($currentUser->name, 0, 1)) }}
                                </div>
                                <div class="flex flex-col text-left overflow-hidden">
                                    <span class="text-xs font-extrabold text-slate-850 truncate font-display">{{ $currentUser->name }}</span>
                                    <span class="text-[10px] text-slate-500 truncate font-medium">{{ $currentUser->email }}</span>
                                    <span class="inline-block bg-sky-100 text-sky-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 w-fit">
                                        {{ strtoupper(str_replace('_', ' ', $currentUser->role)) }}
                                    </span>
                                </div>
                            </div>
                        @else
                            <div class="space-y-2">
                                <h4 class="font-extrabold text-slate-850 text-xs font-display">Welcome to FeridhooTours</h4>
                                <p class="text-[11px] text-slate-500 font-medium">Sign in to access your digital tickets and saved manifests.</p>
                                <button wire:click="openLoginModal('signin')" class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md">
                                    Sign In or Register
                                </button>
                            </div>
                        @endif
                    </div>

                    <!-- Navigation Links inside Drawer -->
                    <div class="space-y-2 font-semibold text-xs">
                        <a href="/" class="block px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold hover:bg-slate-100 transition">
                            🔍 Find Schedules
                        </a>
                        <a href="/my-bookings" class="block px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-extrabold hover:bg-slate-100 transition">
                            🎟️ My Bookings & Boarding Passes
                        </a>

                        @if($currentUser && in_array($currentUser->role, ['admin', 'super_admin']))
                            <div class="pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">
                                Operator Admin Modules
                            </div>
                            <a href="/admin" class="block px-4 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold shadow-sm">
                                ⚙️ Admin Console
                            </a>
                            <a href="/admin?tab=reports" class="block px-4 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition">
                                📊 Reports & Analytics
                            </a>
                            <a href="/admin?tab=emails" class="block px-4 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition">
                                ✉️ Email Control Center
                            </a>
                            <a href="/admin?tab=users" class="block px-4 py-2 text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition">
                                👥 User Directory
                            </a>
                            @if($currentUser->role === 'super_admin')
                                <a href="/admin?tab=audit" class="block px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-xl transition">
                                    🛡️ Audit Logs & System History
                                </a>
                            @endif
                        @endif
                    </div>
                </div>

                @if($currentUser)
                    <div class="pt-6 border-t border-slate-100 mt-6">
                        <button wire:click="logout" class="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold rounded-2xl text-xs border border-rose-200 transition">
                            🚪 Sign Out Account
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
                <button wire:click="closeLoginModal" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>

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
