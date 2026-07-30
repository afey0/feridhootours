<header class="sticky top-0 z-50 glass-panel-strong border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl mb-6 md:mb-8 rounded-3xl md:rounded-full px-4 md:px-6 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Brand Logo -->
        <a href="/" class="flex items-center gap-3 select-none">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                <svg class="w-5 h-5 text-white transform rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="flex flex-col text-left">
                <span class="text-xl font-black tracking-tight text-white font-display">
                    Feridhoo<span class="gradient-text">Tours</span>
                </span>
                <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none hidden sm:inline">
                    Maldives Sea Transport
                </span>
            </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-2">
            <a href="/" class="px-4 py-2 rounded-2xl text-xs font-bold transition {{ request()->is('/') ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/60' }}">
                🔍 Find Schedules
            </a>
            <a href="/my-bookings" class="px-4 py-2 rounded-2xl text-xs font-bold transition {{ request()->is('my-bookings') ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-900/60' }}">
                🎟️ My Bookings
            </a>
            @if($currentUser && in_array($currentUser->role, ['admin', 'super_admin']))
                <a href="/admin" class="px-4 py-2 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5">
                    ⚙️ Admin Console
                </a>
            @else
                <a href="/admin" class="px-4 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 transition">
                    Operator Portal
                </a>
            @endif
        </nav>

        <!-- Right Side: User State & Quick Actions -->
        <div class="flex items-center gap-3">
            @if($currentUser)
                <div class="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-1.5">
                    <div class="flex flex-col text-left">
                        <span class="text-xs font-black text-white leading-tight">{{ $currentUser->name }}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400">{{ strtoupper(str_replace('_', ' ', $currentUser->role)) }}</span>
                    </div>
                    <button wire:click="logout" class="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition" title="Sign Out">
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
            <button wire:click="toggleDrawer" class="lg:hidden p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
    </div>

    <!-- Mobile Slide-out Drawer -->
    @if($showDrawer)
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end animate-fade-in" wire:click.self="toggleDrawer">
            <div class="w-80 bg-slate-950 h-full border-l border-slate-800 p-6 flex flex-col justify-between text-left">
                <div>
                    <div class="flex justify-between items-center pb-5 border-b border-slate-800">
                        <span class="font-extrabold text-white text-base font-display">FeridhooTours Navigation</span>
                        <button wire:click="toggleDrawer" class="p-1 rounded-lg text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div class="space-y-3 mt-6">
                        <a href="/" class="block px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-850 text-sm">🔍 Find Schedules</a>
                        <a href="/my-bookings" class="block px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-850 text-sm">🎟️ My Bookings</a>
                        <a href="/admin" class="block px-4 py-3 rounded-2xl bg-sky-600/20 text-sky-400 border border-sky-500/30 font-bold hover:bg-sky-600/30 text-sm">⚙️ Admin Console</a>
                    </div>
                </div>

                @if(!$currentUser)
                    <div class="pt-6 border-t border-slate-800">
                        <button wire:click="openLoginModal('signin')" class="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold rounded-2xl text-xs shadow-lg">
                            Sign In / Register
                        </button>
                    </div>
                @endif
            </div>
        </div>
    @endif

    <!-- Authentication Modal -->
    @if($showLoginModal)
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" wire:click.self="closeLoginModal">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-left">
                <!-- Modal Close Button -->
                <button wire:click="closeLoginModal" class="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg">✕</button>

                <!-- Tabs header -->
                <div class="flex border-b border-slate-800 mb-6 gap-6">
                    <button wire:click="$set('authMode', 'signin')" class="pb-3 text-sm font-extrabold border-b-2 transition {{ $authMode === 'signin' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200' }}">
                        Sign In
                    </button>
                    <button wire:click="$set('authMode', 'signup')" class="pb-3 text-sm font-extrabold border-b-2 transition {{ $authMode === 'signup' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200' }}">
                        Register Account
                    </button>
                </div>

                @if($errorMessage)
                    <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-xs font-bold mb-4">
                        ⚠️ {{ $errorMessage }}
                    </div>
                @endif

                @if($successMessage)
                    <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold mb-4">
                        ✅ {{ $successMessage }}
                    </div>
                @endif

                @if($authMode === 'signin')
                    <form wire:submit.prevent="login" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input type="email" wire:model="email" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="name@example.com" required>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                            <input type="password" wire:model="password" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 text-sm transition">
                            Sign In
                        </button>
                    </form>
                @elseif($authMode === 'signup')
                    <form wire:submit.prevent="signup" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <input type="text" wire:model="name" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="Ahmed Shareef" required>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input type="email" wire:model="email" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="name@example.com" required>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                <input type="password" wire:model="password" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="••••••••" required>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm</label>
                                <input type="password" wire:model="confirmPassword" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none" placeholder="••••••••" required>
                            </div>
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Type</label>
                            <select wire:model="role" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:border-sky-500 focus:outline-none">
                                <option value="passenger">Individual Passenger</option>
                                <option value="agency">Registered Travel Agency</option>
                            </select>
                        </div>
                        <button type="submit" class="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 text-sm transition">
                            Create Account
                        </button>
                    </form>
                @endif

                <!-- Demo Instant Logins Bar -->
                <div class="mt-8 pt-6 border-t border-slate-800 space-y-3">
                    <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block text-center">
                        Demo Instant One-Click Sign In
                    </span>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button type="button" wire:click="loginAs('passenger')" class="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-2xl text-xs font-bold transition">
                            👤 Passenger
                        </button>
                        <button type="button" wire:click="loginAs('agency')" class="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-2xl text-xs font-bold transition">
                            🏢 Agency
                        </button>
                        <button type="button" wire:click="loginAs('admin')" class="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition shadow-sm">
                            🛡️ Admin
                        </button>
                        <button type="button" wire:click="loginAs('super_admin')" class="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-sm">
                            ⭐ SuperAdmin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    @endif
</header>
