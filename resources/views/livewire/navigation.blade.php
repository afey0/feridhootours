<header class="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
                <span class="text-lg font-extrabold tracking-tight text-white">Feridhoo<span class="gradient-text">Tours</span></span>
                <span class="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Maldives Sea Transport</span>
            </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="/" class="hover:text-sky-400 transition">Find Schedules</a>
            <a href="/my-bookings" class="hover:text-sky-400 transition">My Bookings</a>
            <a href="/admin" class="hover:text-sky-400 transition">Admin Console</a>
        </nav>

        <!-- Right User Actions / Hamburger -->
        <div class="flex items-center gap-4">
            <a href="/admin" class="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition cursor-pointer">
                Operator / SuperAdmin
            </a>
            
            <button wire:click="toggleDrawer" class="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
        </div>
    </div>

    <!-- Slide-out Hamburger Drawer -->
    @if($showDrawer)
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in" wire:click.self="toggleDrawer">
            <div class="w-80 bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center pb-6 border-b border-slate-800">
                        <span class="font-bold text-white">Navigation Menu</span>
                        <button wire:click="toggleDrawer" class="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div class="space-y-4 mt-6">
                        <a href="/" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">🔍 Find Schedules</a>
                        <a href="/my-bookings" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">🎟️ My Bookings</a>
                        <a href="/admin" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">⚙️ Admin Dashboard</a>
                        <a href="/admin?tab=reports" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">📊 Reports & Analytics</a>
                        <a href="/admin?tab=emails" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">✉️ Email Control Center</a>
                        <a href="/admin?tab=users" class="block px-4 py-3 rounded-xl bg-slate-800/50 text-white font-semibold hover:bg-slate-800">👥 User Directory</a>
                        <a href="/admin?tab=audit" class="block px-4 py-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold hover:bg-amber-500/20">🛡️ Audit Logs (SuperAdmin)</a>
                    </div>
                </div>

                <div class="text-center pt-6 border-t border-slate-800 text-xs text-slate-400">
                    Render.com + Neon PostgreSQL
                </div>
            </div>
        </div>
    @endif
</header>
