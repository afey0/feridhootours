<div class="space-y-8 animate-fade-in text-left">
    <!-- Admin Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 class="text-3xl font-black text-white font-display">Operator Admin Console</h1>
            </div>
            <p class="text-xs text-slate-400 font-medium">Fleet management, daily schedules, bank slip verification & user directory (Neon PostgreSQL)</p>
        </div>

        @if(session()->has('flashMessage') || $flashMessage)
            <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-2xl text-xs font-bold">
                ✅ {{ session('flashMessage') ?? $flashMessage }}
            </div>
        @endif
    </div>

    <!-- Admin Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <button type="button" wire:click="setTab('vessels')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'vessels' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200' }}">
            🚤 Fleet Vessels ({{ count($vessels) }})
        </button>
        <button type="button" wire:click="setTab('schedules')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'schedules' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200' }}">
            📅 Daily Schedules ({{ count($schedules) }})
        </button>
        <button type="button" wire:click="setTab('bookings')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'bookings' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200' }}">
            🎟️ Verification & Bookings ({{ count($bookings) }})
        </button>
        <button type="button" wire:click="setTab('users')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'users' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200' }}">
            👥 User Directory ({{ count($users) }})
        </button>
        <button type="button" wire:click="setTab('reports')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'reports' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200' }}">
            📊 Financial Reports
        </button>
    </div>

    <!-- TAB 1: FLEET VESSELS -->
    @if($activeTab === 'vessels')
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-extrabold text-white font-display">Registered Vessels</h3>
                <button type="button" wire:click="openVesselModal" class="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md">
                    + Register Vessel
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($vessels as $v)
                    <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 flex justify-between items-start">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">🚤</span>
                                <h4 class="text-base font-extrabold text-white font-display">{{ $v->name }}</h4>
                                <span class="px-2.5 py-0.5 rounded-md bg-slate-800 text-sky-400 text-[10px] font-bold">{{ $v->type }}</span>
                            </div>
                            <p class="text-xs text-slate-400">
                                Layout: {{ $v->layout_rows }} rows × {{ $v->layout_cols }} cols ({{ $v->layout_rows * $v->layout_cols }} capacity)
                            </p>
                            <div class="flex flex-wrap gap-1 pt-1">
                                <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">VIP: {{ $v->vip_rows }}</span>
                                <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">Premium: {{ $v->premium_rows }}</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" wire:click="openVesselModal('{{ $v->id }}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold">Edit</button>
                            <button type="button" wire:click="deleteVessel('{{ $v->id }}')" class="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold">Delete</button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- TAB 2: DAILY SCHEDULES -->
    @if($activeTab === 'schedules')
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-extrabold text-white font-display">Active Schedules</h3>
                <button type="button" wire:click="openScheduleModal" class="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md">
                    + Add Schedule
                </button>
            </div>

            <div class="grid grid-cols-1 gap-4">
                @foreach($schedules as $s)
                    <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="space-y-1">
                            <div class="flex items-center gap-3">
                                <h4 class="text-base font-extrabold text-white font-display">{{ $s->vessel_name }}</h4>
                                <span class="text-xs font-mono font-bold text-sky-400">{{ $s->route_from }} → {{ $s->route_to }}</span>
                                @if($s->disabled)
                                    <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">Disabled</span>
                                @endif
                            </div>
                            <div class="text-xs text-slate-400 font-medium">
                                🕒 {{ $s->departure_time }} - {{ $s->arrival_time }} · 💺 Available: {{ $s->available_seats }}/{{ $s->total_seats }} · 💵 Price: ${{ number_format($s->price, 2) }}
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button type="button" wire:click="toggleScheduleDisable('{{ $s->id }}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold">
                                {{ $s->disabled ? 'Enable' : 'Disable' }}
                            </button>
                            <button type="button" wire:click="openScheduleModal('{{ $s->id }}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold">
                                Edit
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- TAB 3: VERIFICATION & BOOKINGS -->
    @if($activeTab === 'bookings')
        <div class="space-y-6">
            <h3 class="text-lg font-extrabold text-white font-display">Recent Bookings & Bank Slips</h3>

            <div class="glass-panel-strong rounded-3xl overflow-hidden border border-slate-800">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-950 text-slate-400 font-extrabold uppercase border-b border-slate-800">
                        <tr>
                            <th class="p-4">Ticket ID</th>
                            <th class="p-4">Vessel & Route</th>
                            <th class="p-4">Booked By</th>
                            <th class="p-4">Payment</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/80 font-medium">
                        @foreach($bookings as $b)
                            <tr class="hover:bg-slate-850/50">
                                <td class="p-4 font-mono font-bold text-sky-400">{{ $b->id }}</td>
                                <td class="p-4 font-bold text-white">{{ $b->vessel_name }} ({{ $b->route_from }}→{{ $b->route_to }})</td>
                                <td class="p-4 text-slate-300">{{ $b->booked_by }}<br><span class="text-[10px] text-slate-500">{{ $b->passenger_email }}</span></td>
                                <td class="p-4 uppercase text-slate-300">{{ $b->payment_method }} (${{ number_format($b->total_amount, 2) }})</td>
                                <td class="p-4">
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {{ $b->status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : ($b->status === 'pending_verification' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30') }}">
                                        {{ str_replace('_', ' ', $b->status) }}
                                    </span>
                                </td>
                                <td class="p-4 text-right space-x-1">
                                    @if($b->status === 'pending_verification')
                                        <button type="button" wire:click="approveBooking('{{ $b->id }}')" class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]">Approve</button>
                                        <button type="button" wire:click="rejectBooking('{{ $b->id }}')" class="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]">Reject</button>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif

    <!-- TAB 4: USER DIRECTORY -->
    @if($activeTab === 'users')
        <div class="space-y-6">
            <h3 class="text-lg font-extrabold text-white font-display">Registered System Users</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                @foreach($users as $u)
                    <div class="glass-panel-strong rounded-3xl p-5 border border-slate-800 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-white font-display">{{ $u->name }}</span>
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-sky-400">{{ $u->role }}</span>
                        </div>
                        <p class="text-xs text-slate-400 font-mono">{{ $u->email }}</p>
                        <p class="text-[11px] text-slate-500 font-semibold">{{ $u->phone ?? 'No phone' }}</p>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- TAB 5: REPORTS -->
    @if($activeTab === 'reports')
        <div class="space-y-6">
            <h3 class="text-lg font-extrabold text-white font-display">Platform Revenue & Analytics</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Total Revenue</span>
                    <div class="text-3xl font-black text-emerald-400 font-display">${{ number_format($bookings->where('status', 'verified')->sum('total_amount'), 2) }}</div>
                </div>
                <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Verified Tickets</span>
                    <div class="text-3xl font-black text-sky-400 font-display">{{ $bookings->where('status', 'verified')->count() }}</div>
                </div>
                <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Pending Bank Slips</span>
                    <div class="text-3xl font-black text-amber-400 font-display">{{ $bookings->where('status', 'pending_verification')->count() }}</div>
                </div>
            </div>
        </div>
    @endif

    <!-- Vessel Form Modal -->
    @if($showVesselModal)
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" wire:click.self="$set('showVesselModal', false)">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
                <h3 class="text-xl font-black text-white font-display">{{ $editingVesselId ? 'Edit Vessel' : 'Register New Vessel' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase">Vessel Name</label>
                        <input type="text" wire:model="vesselName" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">Type</label>
                            <select wire:model="vesselType" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold">
                                <option value="Speedboat">Speedboat</option>
                                <option value="Ferry">Ferry</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">Rows × Cols</label>
                            <div class="flex gap-1">
                                <input type="number" wire:model="vesselLayoutRows" min="2" max="15" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs">
                                <input type="number" wire:model="vesselLayoutCols" min="2" max="6" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" wire:click="$set('showVesselModal', false)" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                    <button type="button" wire:click="saveVessel" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md">Save Vessel</button>
                </div>
            </div>
        </div>
    @endif

    <!-- Schedule Form Modal -->
    @if($showScheduleModal)
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" wire:click.self="$set('showScheduleModal', false)">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
                <h3 class="text-xl font-black text-white font-display">{{ $editingScheduleId ? 'Edit Schedule' : 'Add Daily Schedule' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-bold text-slate-400 uppercase">Select Vessel</label>
                        <select wire:model="scheduleVesselId" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold">
                            @foreach($vessels as $v)
                                <option value="{{ $v->id }}">{{ $v->name }} ({{ $v->type }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">From</label>
                            <select wire:model="scheduleRouteFrom" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold">
                                @foreach($jetties as $j)<option value="{{ $j->id }}">{{ $j->name }}</option>@endforeach
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">To</label>
                            <select wire:model="scheduleRouteTo" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold">
                                @foreach($jetties as $j)<option value="{{ $j->id }}">{{ $j->name }}</option>@endforeach
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">Departure Time</label>
                            <input type="text" wire:model="scheduleDepartureTime" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold" placeholder="08:30 AM">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">Price ($)</label>
                            <input type="number" step="0.01" wire:model="schedulePrice" class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white text-xs font-semibold">
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" wire:click="$set('showScheduleModal', false)" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">Cancel</button>
                    <button type="button" wire:click="saveSchedule" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md">Save Schedule</button>
                </div>
            </div>
        </div>
    @endif
</div>
