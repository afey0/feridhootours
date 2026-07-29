<div class="max-w-7xl mx-auto px-6 py-12 space-y-8">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-black text-white">My Ticket Bookings</h1>
            <p class="text-slate-400 text-xs font-semibold mt-1">Manage your active reservations, upload bank transfer slips, or view tickets.</p>
        </div>
        <span class="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            Live Neon PostgreSQL Sync
        </span>
    </div>

    @if(count($bookings) === 0)
        <div class="glass-panel rounded-3xl p-12 text-center text-slate-400 border border-slate-800">
            <p class="font-bold text-lg">No active bookings found.</p>
            <a href="/" class="inline-block mt-4 text-sky-400 font-bold hover:underline">Find a Ferry Schedule →</a>
        </div>
    @else
        <div class="grid grid-cols-1 gap-4">
            @foreach($bookings as $b)
                <div class="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div class="space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="font-extrabold text-white text-lg">Booking #{{ $b->id }}</span>
                            @if($b->status === 'verified')
                                <span class="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">✓ Verified</span>
                            @elseif($b->status === 'pending_verification')
                                <span class="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">⏱️ Pending Verification</span>
                            @elseif($b->status === 'rejected')
                                <span class="px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">✕ Rejected</span>
                            @endif
                        </div>
                        <p class="text-slate-300 text-sm font-semibold">
                            {{ $b->vessel_name }} ({{ $b->route_from }} → {{ $b->route_to }}) · {{ $b->departure_time }}
                        </p>
                        <p class="text-xs text-slate-400 font-medium">
                            Seats: {{ implode(', ', $b->selected_seat_ids ?? []) }} · Passenger: {{ $b->booked_by }}
                        </p>
                        @if($b->rejection_reason)
                            <div class="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                                <strong>Rejection Comment:</strong> {{ $b->rejection_reason }}
                            </div>
                        @endif
                    </div>

                    <div class="text-right space-y-1">
                        <span class="text-2xl font-black text-white block">${{ number_format($b->total_amount, 2) }}</span>
                        <span class="text-xs text-slate-400 font-semibold block">Payment: {{ strtoupper($b->payment_method) }}</span>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
