<div class="space-y-8 text-left animate-fade-in">
    <!-- Admin Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-6">
        <div>
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 class="text-3xl font-black text-slate-850 font-display">Operator Admin Console</h1>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-1">Fleet management, daily schedules, bank slip verification, audit logs & user directory</p>
        </div>

        @if(session()->has('flashMessage') || $flashMessage)
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-2xl text-xs font-bold">
                ✅ {{ session('flashMessage') ?? $flashMessage }}
            </div>
        @endif
    </div>

    <!-- Admin Tabs Bar -->
    <div class="flex flex-wrap gap-2 border-b border-slate-200/80 pb-4">
        <button type="button" wire:click="setTab('vessels')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'vessels' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            🚤 Fleet Vessels ({{ count($vessels) }})
        </button>
        <button type="button" wire:click="setTab('schedules')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'schedules' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            📅 Daily Schedules ({{ count($schedules) }})
        </button>
        <button type="button" wire:click="setTab('bookings')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'bookings' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            🎟️ Verification & Bookings ({{ count($bookings) }})
        </button>
        <button type="button" wire:click="setTab('users')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'users' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            👥 User Directory ({{ count($users) }})
        </button>
        <button type="button" wire:click="setTab('reports')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'reports' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            📊 Financial Reports
        </button>
        <button type="button" wire:click="setTab('emails')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'emails' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            ✉️ Email Control
        </button>
        <button type="button" wire:click="setTab('audit')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer {{ $activeTab === 'audit' ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' }}">
            🛡️ Audit Logs ({{ count($auditLogs) }})
        </button>
    </div>

    <!-- TAB 1: FLEET VESSELS -->
    @if($activeTab === 'vessels')
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-extrabold text-slate-850 font-display">Registered Vessels</h3>
                <button type="button" wire:click="openVesselModal" class="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20">
                    + Register Vessel
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($vessels as $v)
                    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex justify-between items-start">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">🚤</span>
                                <h4 class="text-base font-extrabold text-slate-850 font-display">{{ $v->name }}</h4>
                                <span class="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase">{{ $v->type }}</span>
                            </div>
                            <p class="text-xs text-slate-500 font-medium">
                                Layout: {{ $v->layout_rows }} rows × {{ $v->layout_cols }} cols ({{ $v->layout_rows * $v->layout_cols }} capacity)
                            </p>
                            <div class="flex flex-wrap gap-1.5 pt-1">
                                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">VIP: {{ $v->vip_rows }}</span>
                                <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">Premium: {{ $v->premium_rows }}</span>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" wire:click="openVesselModal('{{ $v->id }}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold">Edit</button>
                            <button type="button" wire:click="deleteVessel('{{ $v->id }}')" class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold">Delete</button>
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
                <h3 class="text-lg font-extrabold text-slate-850 font-display">Active Schedules</h3>
                <button type="button" wire:click="openScheduleModal" class="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20">
                    + Add Schedule
                </button>
            </div>

            <div class="grid grid-cols-1 gap-4">
                @foreach($schedules as $s)
                    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div class="space-y-1">
                            <div class="flex items-center gap-3">
                                <h4 class="text-base font-extrabold text-slate-850 font-display">{{ $s->vessel_name }}</h4>
                                <span class="text-xs font-mono font-bold text-sky-600">{{ $s->route_from }} → {{ $s->route_to }}</span>
                                @if($s->disabled)
                                    <span class="px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">Disabled</span>
                                @endif
                            </div>
                            <div class="text-xs text-slate-500 font-medium">
                                🕒 {{ $s->departure_time }} - {{ $s->arrival_time }} · 💺 Available: {{ $s->available_seats }}/{{ $s->total_seats }} · 💵 Price: ${{ number_format($s->price, 2) }}
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button type="button" wire:click="toggleScheduleDisable('{{ $s->id }}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold">
                                {{ $s->disabled ? 'Enable' : 'Disable' }}
                            </button>
                            <button type="button" wire:click="openScheduleModal('{{ $s->id }}')" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold">
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
            <h3 class="text-lg font-extrabold text-slate-850 font-display">Recent Bookings & Bank Slips</h3>

            <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                        <tr>
                            <th class="p-4">Ticket ID</th>
                            <th class="p-4">Vessel & Route</th>
                            <th class="p-4">Booked By</th>
                            <th class="p-4">Payment</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        @foreach($bookings as $b)
                            <tr class="hover:bg-slate-50/80">
                                <td class="p-4 font-mono font-bold text-sky-600">{{ $b->id }}</td>
                                <td class="p-4 font-bold text-slate-850">{{ $b->vessel_name }} ({{ $b->route_from }}→{{ $b->route_to }})</td>
                                <td class="p-4 text-slate-700">{{ $b->booked_by }}<br><span class="text-[10px] text-slate-400">{{ $b->passenger_email }}</span></td>
                                <td class="p-4 uppercase text-slate-700">{{ $b->payment_method }} (${{ number_format($b->total_amount, 2) }})</td>
                                <td class="p-4">
                                    <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider {{ $b->status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ($b->status === 'pending_verification' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200') }}">
                                        {{ str_replace('_', ' ', $b->status) }}
                                    </span>
                                </td>
                                <td class="p-4 text-right space-x-1">
                                    @if($b->status === 'pending_verification')
                                        <button type="button" wire:click="approveBooking('{{ $b->id }}')" class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px]">Approve</button>
                                        <button type="button" wire:click="rejectBooking('{{ $b->id }}')" class="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px]">Reject</button>
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
            <h3 class="text-lg font-extrabold text-slate-850 font-display">Registered System Users</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                @foreach($users as $u)
                    <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-bold text-slate-850 font-display">{{ $u->name }}</span>
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-sky-50 text-sky-700 border border-sky-200">{{ $u->role }}</span>
                        </div>
                        <p class="text-xs text-slate-500 font-mono">{{ $u->email }}</p>
                        <p class="text-[11px] text-slate-400 font-semibold">{{ $u->phone ?? 'No phone' }}</p>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- TAB 5: REPORTS -->
    @if($activeTab === 'reports')
        <div class="space-y-6">
            <h3 class="text-lg font-extrabold text-slate-850 font-display">Platform Revenue & Analytics</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Total Revenue</span>
                    <div class="text-3xl font-black text-slate-850 font-display">${{ number_format($bookings->where('status', 'verified')->sum('total_amount'), 2) }}</div>
                </div>
                <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Verified Tickets</span>
                    <div class="text-3xl font-black text-sky-600 font-display">{{ $bookings->where('status', 'verified')->count() }}</div>
                </div>
                <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-1">
                    <span class="text-xs font-extrabold text-slate-400 uppercase">Pending Bank Slips</span>
                    <div class="text-3xl font-black text-amber-600 font-display">{{ $bookings->where('status', 'pending_verification')->count() }}</div>
                </div>
            </div>
        </div>
    @endif

    <!-- TAB 6: EMAIL CONTROL CENTER -->
    @if($activeTab === 'emails')
        <div class="space-y-6">
            <h3 class="text-lg font-extrabold text-slate-850 font-display">Email Dispatcher & Automated Notices</h3>
            <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div class="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-800 font-semibold">
                    ✉️ Automated Booking Confirmations, Bank Slip Audit Alerts & OTP verification dispatches are active via SMTP/Log Driver.
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 border border-slate-200 rounded-2xl space-y-2">
                        <h4 class="font-extrabold text-xs text-slate-850">Booking Confirmation Template</h4>
                        <p class="text-[11px] text-slate-500">Dispatched immediately after seat allocation & payment verification.</p>
                        <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Active</span>
                    </div>
                    <div class="p-4 border border-slate-200 rounded-2xl space-y-2">
                        <h4 class="font-extrabold text-xs text-slate-850">Disruption & Weather Warning</h4>
                        <p class="text-[11px] text-slate-500">Mass SMS & Email dispatch for weather delays or port maintenance.</p>
                        <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">Ready</span>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- TAB 7: AUDIT LOGS & SYSTEM HISTORY -->
    @if($activeTab === 'audit')
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-extrabold text-slate-850 font-display">🛡️ Audit Logs & System History</h3>
                <span class="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                    Super Admin View
                </span>
            </div>

            <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                @if(count($auditLogs) === 0)
                    <div class="p-8 text-center text-slate-500 text-xs font-semibold">
                        No audit logs recorded yet. System activities will appear here.
                    </div>
                @else
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                            <tr>
                                <th class="p-4">Timestamp</th>
                                <th class="p-4">Action</th>
                                <th class="p-4">Performed By</th>
                                <th class="p-4">Entity</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 font-medium">
                            @foreach($auditLogs as $log)
                                <tr class="hover:bg-slate-50/80">
                                    <td class="p-4 font-mono text-slate-500">{{ $log->created_at }}</td>
                                    <td class="p-4 font-extrabold text-slate-850">{{ $log->action }}</td>
                                    <td class="p-4 text-slate-700">{{ $log->performed_by_name }} ({{ $log->performed_by_role }})</td>
                                    <td class="p-4 font-mono text-sky-600">{{ $log->entity_type }}#{{ $log->entity_id }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            </div>
        </div>
    @endif

    <!-- Vessel Form Modal -->
    @if($showVesselModal)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" wire:click.self="$set('showVesselModal', false)">
            <div class="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
                <h3 class="text-xl font-black text-slate-850 font-display">{{ $editingVesselId ? 'Edit Vessel' : 'Register New Vessel' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Vessel Name</label>
                        <input type="text" wire:model="vesselName" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase">Type</label>
                            <select wire:model="vesselType" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold">
                                <option value="Speedboat">Speedboat</option>
                                <option value="Ferry">Ferry</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase">Rows × Cols</label>
                            <div class="flex gap-1">
                                <input type="number" wire:model="vesselLayoutRows" min="2" max="15" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs">
                                <input type="number" wire:model="vesselLayoutCols" min="2" max="6" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" wire:click="$set('showVesselModal', false)" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Cancel</button>
                    <button type="button" wire:click="saveVessel" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md">Save Vessel</button>
                </div>
            </div>
        </div>
    @endif

    <!-- Schedule Form Modal -->
    @if($showScheduleModal)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" wire:click.self="$set('showScheduleModal', false)">
            <div class="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
                <h3 class="text-xl font-black text-slate-850 font-display">{{ $editingScheduleId ? 'Edit Schedule' : 'Add Daily Schedule' }}</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-xs font-bold text-slate-500 uppercase">Select Vessel</label>
                        <select wire:model="scheduleVesselId" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold">
                            @foreach($vessels as $v)
                                <option value="{{ $v->id }}">{{ $v->name }} ({{ $v->type }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase">From</label>
                            <select wire:model="scheduleRouteFrom" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold">
                                @foreach($jetties as $j)<option value="{{ $j->id }}">{{ $j->name }}</option>@endforeach
                            </select>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase">To</label>
                            <select wire:model="scheduleRouteTo" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold">
                                @foreach($jetties as $j)<option value="{{ $j->id }}">{{ $j->name }}</option>@endforeach
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-slate-500 uppercase">Departure Time</label>
                            <input type="text" wire:model="scheduleDepartureTime" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold" placeholder="08:30 AM">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-400 uppercase">Price ($)</label>
                            <input type="number" step="0.01" wire:model="schedulePrice" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-xs font-semibold">
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                    <button type="button" wire:click="$set('showScheduleModal', false)" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Cancel</button>
                    <button type="button" wire:click="saveSchedule" class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md">Save Schedule</button>
                </div>
            </div>
        </div>
    @endif
</div>
