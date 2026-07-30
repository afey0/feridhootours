<div class="space-y-8 animate-fade-in text-left">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
            <h1 class="text-3xl font-black text-white font-display">My Digital Boarding Passes</h1>
            <p class="text-xs text-slate-400 font-medium">Manage your speedboat bookings, view seat assignments, and upload payment receipts.</p>
        </div>
        <div class="relative w-full sm:w-72">
            <input type="text" wire:model.live="searchQuery" placeholder="Search by Ticket ID (e.g. SFY...)" class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-semibold focus:border-sky-500 focus:outline-none">
        </div>
    </div>

    @if($actionMessage)
        <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold">
            ✅ {{ $actionMessage }}
        </div>
    @endif

    <!-- Bookings Cards Grid -->
    @if(count($bookings) === 0)
        <div class="glass-panel-strong rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
            <div class="text-4xl">🎟️</div>
            <h3 class="font-extrabold text-white text-lg font-display">No bookings found</h3>
            <p class="text-xs text-slate-400">Search by ticket reference or book a new ferry schedule from the home page.</p>
            <a href="/" class="inline-block mt-3 px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg">
                Find Schedules
            </a>
        </div>
    @else
        <div class="grid grid-cols-1 gap-4">
            @foreach($bookings as $b)
                <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 hover:border-sky-500/30 transition space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                        <div class="flex items-center gap-3">
                            <span class="font-mono text-sm font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-xl">
                                {{ $b->id }}
                            </span>
                            <span class="text-xs font-extrabold text-white font-display">{{ $b->vessel_name }} ({{ $b->vessel_type }})</span>
                        </div>
                        <div>
                            @php
                                $statusClasses = [
                                    'verified' => 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                                    'pending_verification' => 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                                    'rejected' => 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                                    'cancelled' => 'bg-slate-800 text-slate-400 border-slate-700',
                                ];
                            @endphp
                            <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border {{ $statusClasses[$b->status] ?? 'bg-slate-800 text-slate-300' }}">
                                {{ str_replace('_', ' ', $b->status) }}
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Route</span>
                            <span class="font-bold text-white">{{ $b->route_from }} → {{ $b->route_to }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Schedule Time</span>
                            <span class="font-bold text-white">{{ $b->departure_time }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Seats Reserved</span>
                            <span class="font-bold text-sky-400">{{ is_array($b->selected_seat_ids) ? implode(', ', $b->selected_seat_ids) : $b->selected_seat_ids }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Total Amount</span>
                            <span class="font-black text-emerald-400 text-sm">${{ number_format($b->total_amount, 2) }}</span>
                        </div>
                    </div>

                    <!-- Actions Bar -->
                    <div class="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-4 gap-3">
                        <span class="text-[11px] text-slate-400">Booked by <strong class="text-slate-200">{{ $b->booked_by }}</strong></span>

                        <div class="flex items-center gap-2">
                            @if($b->status === 'pending_verification')
                                <button type="button" wire:click="uploadBankSlip('{{ $b->id }}')" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-extrabold transition">
                                    📤 Upload Bank Slip
                                </button>
                            @endif

                            <button type="button" wire:click="openTicketModal('{{ $b->id }}')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition">
                                🎟️ View Boarding Pass
                            </button>

                            @if($b->status !== 'cancelled')
                                <button type="button" wire:click="cancelBooking('{{ $b->id }}')" class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition">
                                    Cancel
                                </button>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif

    <!-- Digital Boarding Pass Modal -->
    @if($showTicketModal && $selectedBooking)
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" wire:click.self="closeTicketModal">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left space-y-6">
                <button wire:click="closeTicketModal" class="absolute top-4 right-4 text-slate-400 hover:text-white p-1">✕</button>

                <div class="text-center space-y-2 border-b border-slate-800 pb-4">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">Maldives Maritime Pass</span>
                    <h3 class="text-xl font-black text-white font-display">{{ $selectedBooking->vessel_name }}</h3>
                    <p class="text-xs font-mono text-slate-400">Ticket ID: {{ $selectedBooking->id }}</p>
                </div>

                <div class="space-y-3 text-xs">
                    <div class="flex justify-between border-b border-slate-800 pb-2">
                        <span class="text-slate-400">Route:</span>
                        <span class="font-bold text-white">{{ $selectedBooking->route_from }} → {{ $selectedBooking->route_to }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-800 pb-2">
                        <span class="text-slate-400">Departure:</span>
                        <span class="font-bold text-white">{{ $selectedBooking->departure_time }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-800 pb-2">
                        <span class="text-slate-400">Assigned Seats:</span>
                        <span class="font-bold text-sky-400">{{ is_array($selectedBooking->selected_seat_ids) ? implode(', ', $selectedBooking->selected_seat_ids) : $selectedBooking->selected_seat_ids }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-800 pb-2">
                        <span class="text-slate-400">Passenger Name:</span>
                        <span class="font-bold text-white">{{ $selectedBooking->booked_by }}</span>
                    </div>
                </div>

                <!-- Simulated QR Code -->
                <div class="bg-white p-4 rounded-2xl w-36 h-36 mx-auto flex flex-col items-center justify-center text-slate-950 font-mono text-[9px] font-bold shadow-inner">
                    <div class="grid grid-cols-4 gap-1.5 w-full h-full p-2 bg-slate-950 rounded-xl">
                        @for($q = 0; $q < 16; $q++)
                            <div class="{{ $q % 2 === 0 ? 'bg-white' : 'bg-sky-400' }} rounded-sm"></div>
                        @endfor
                    </div>
                </div>

                <div class="text-center pt-2">
                    <button wire:click="closeTicketModal" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl">
                        Close Boarding Pass
                    </button>
                </div>
            </div>
        </div>
    @endif
</div>
