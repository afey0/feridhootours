<div class="max-w-7xl mx-auto px-6 py-12 space-y-8">
    <!-- Title Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-3xl font-black text-white">Operator & SuperAdmin Control Panel</h1>
            <p class="text-slate-400 text-xs font-semibold mt-1">Manage fleet vessels, schedules, verify payments, user directory, and audit logs.</p>
        </div>
        <span class="px-3.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span> Render + Neon Live DB
        </span>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
        <button wire:click="setTab('vessels')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'vessels' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            🚢 Fleet Vessels
        </button>
        <button wire:click="setTab('routes')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'routes' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            🗺️ Routes & Schedules
        </button>
        <button wire:click="setTab('verify')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'verify' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            💳 Verify Payments
        </button>
        <button wire:click="setTab('bookings')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'bookings' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            🎟️ All Bookings
        </button>
        <button wire:click="setTab('users')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'users' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            👥 User Directory
        </button>
        <button wire:click="setTab('audit')" class="px-4 py-2.5 rounded-xl font-bold text-xs transition {{ $activeTab === 'audit' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 hover:text-white' }}">
            🛡️ Audit Logs (SuperAdmin)
        </button>
    </div>

    <!-- Tab Content -->
    <div>
        @if($activeTab === 'vessels')
            <div class="space-y-4">
                <h3 class="text-xl font-extrabold text-white">Registered Vessels</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @foreach($vessels as $v)
                        <div class="glass-panel rounded-2xl p-6 border border-slate-800 flex justify-between items-center">
                            <div>
                                <h4 class="font-bold text-white text-lg">{{ $v->name }}</h4>
                                <p class="text-xs text-slate-400 font-semibold">{{ $v->type }} · {{ $v->layout_rows * $v->layout_cols }} seats</p>
                                <div class="flex gap-1 mt-2">
                                    @foreach($v->amenities ?? [] as $a)
                                        <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">{{ $a }}</span>
                                    @endforeach
                                </div>
                            </div>
                            <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Active</span>
                        </div>
                    @endforeach
                </div>
            </div>
        @elseif($activeTab === 'verify')
            <div class="space-y-4">
                <h3 class="text-xl font-extrabold text-white">Payment Slip Verification</h3>
                @foreach($bookings->where('status', 'pending_verification') as $b)
                    <div class="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h4 class="font-bold text-white text-base">Booking #{{ $b->id }} — ${{ number_format($b->total_amount, 2) }}</h4>
                            <p class="text-xs text-slate-400 font-medium">Passenger: {{ $b->booked_by }} ({{ $b->passenger_email }}) · Route: {{ $b->route_from }} → {{ $b->route_to }}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <button wire:click="verifyPayment('{{ $b->id }}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition">
                                ✓ Verify Payment
                            </button>
                            <button wire:click="$set('selectedBookingId', '{{ $b->id }}')" class="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition">
                                ✕ Decline Slip
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        @elseif($activeTab === 'bookings')
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-xl font-extrabold text-white">All System Bookings</h3>
                    <span class="text-xs text-amber-400 font-bold">Super Admin: Delete Booking Enabled</span>
                </div>
                <div class="grid grid-cols-1 gap-3">
                    @foreach($bookings as $b)
                        <div class="glass-panel rounded-2xl p-5 border border-slate-800 flex justify-between items-center">
                            <div>
                                <h4 class="font-bold text-white text-base">#{{ $b->id }} — {{ $b->booked_by }}</h4>
                                <p class="text-xs text-slate-400 font-medium">{{ $b->vessel_name }} ({{ $b->route_from }} → {{ $b->route_to }}) · Status: {{ strtoupper($b->status) }}</p>
                            </div>
                            <button wire:click="deleteBooking('{{ $b->id }}')" class="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition">
                                🗑️ Delete (SuperAdmin)
                            </button>
                        </div>
                    @endforeach
                </div>
            </div>
        @elseif($activeTab === 'users')
            <div class="space-y-4">
                <h3 class="text-xl font-extrabold text-white">User Directory</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @foreach($users as $u)
                        <div class="glass-panel rounded-2xl p-5 border border-slate-800 flex justify-between items-center">
                            <div>
                                <h4 class="font-bold text-white text-base">{{ $u->name }}</h4>
                                <p class="text-xs text-slate-400 font-medium">{{ $u->email }}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-bold uppercase">{{ $u->role }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        @elseif($activeTab === 'audit')
            <div class="space-y-4">
                <h3 class="text-xl font-extrabold text-amber-400">SuperAdmin Audit Logs & Mutation History</h3>
                <div class="space-y-2">
                    @foreach($auditLogs as $a)
                        <div class="glass-panel rounded-xl p-4 border border-slate-800 text-xs font-mono flex justify-between items-center">
                            <div>
                                <span class="text-amber-400 font-bold">[{{ $a->action }}]</span>
                                <span class="text-white font-semibold ml-2">{{ $a->entity_type }} #{{ $a->entity_id }}</span>
                                <span class="text-slate-400 ml-2">by {{ $a->performed_by_name }} ({{ $a->performed_by_role }})</span>
                            </div>
                            <span class="text-slate-500 text-[10px]">{{ $a->created_at }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>

    <!-- Mandatory Rejection Modal -->
    @if($selectedBookingId)
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <h3 class="text-lg font-bold text-white">Decline Payment Slip</h3>
                <p class="text-xs text-slate-400">Please provide a mandatory reason for declining this payment slip. This comment will be visible to the passenger.</p>
                <textarea wire:model="rejectReason" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:border-rose-500 focus:outline-none" placeholder="e.g. Invalid bank transaction reference number..."></textarea>
                <div class="flex justify-end gap-3">
                    <button wire:click="$set('selectedBookingId', null)" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                    <button wire:click="rejectPayment('{{ $selectedBookingId }}')" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Submit Rejection</button>
                </div>
            </div>
        </div>
    @endif
</div>
