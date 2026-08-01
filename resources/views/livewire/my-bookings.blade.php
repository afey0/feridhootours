<div class="space-y-8 text-left animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-6">
        <div>
            <h1 class="text-3xl font-black text-slate-850 font-display">My Digital Boarding Passes</h1>
            <p class="text-xs text-slate-500 font-medium mt-1">Manage your speedboat bookings, view seat assignments, and upload payment receipts.</p>
        </div>
        <div class="relative w-full sm:w-72">
            <input type="text" wire:model.live="searchQuery" placeholder="Search by Ticket ID (e.g. SFY...)" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-semibold focus:border-sky-500 focus:outline-none shadow-sm">
        </div>
    </div>

    @if($actionMessage)
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold">
            ✅ {{ $actionMessage }}
        </div>
    @endif

    <!-- Bookings Cards Grid -->
    @if(count($bookings) === 0)
        <div class="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-sm space-y-3">
            <div class="text-4xl">🎟️</div>
            <h3 class="font-extrabold text-slate-850 text-lg font-display">No bookings found</h3>
            <p class="text-xs text-slate-500">Search by ticket reference or book a new ferry schedule from the home page.</p>
            <a href="/" class="inline-block mt-3 px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20">
                Find Schedules
            </a>
        </div>
    @else
        <div class="grid grid-cols-1 gap-4">
            @foreach($bookings as $b)
                <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 text-left">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div class="flex items-center gap-3">
                            <span class="font-mono text-sm font-black text-sky-600 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
                                {{ $b->id }}
                            </span>
                            <span class="text-xs font-extrabold text-slate-850 font-display">{{ $b->vessel_name }} ({{ $b->vessel_type }})</span>
                        </div>
                        <div>
                            @php
                                $statusClasses = [
                                    'verified' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                    'pending_verification' => 'bg-amber-50 text-amber-700 border-amber-200',
                                    'rejected' => 'bg-rose-50 text-rose-700 border-rose-200',
                                    'cancelled' => 'bg-slate-100 text-slate-500 border-slate-200',
                                ];
                            @endphp
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border {{ $statusClasses[$b->status] ?? 'bg-slate-100 text-slate-600' }}">
                                {{ str_replace('_', ' ', $b->status) }}
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Route</span>
                            <span class="font-bold text-slate-800">{{ $b->route_from }} → {{ $b->route_to }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Schedule Time</span>
                            <span class="font-bold text-slate-800">{{ $b->departure_time }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Seats Reserved</span>
                            <span class="font-bold text-sky-600">{{ is_array($b->selected_seat_ids) ? implode(', ', $b->selected_seat_ids) : $b->selected_seat_ids }}</span>
                        </div>
                        <div>
                            <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Total Amount</span>
                            <span class="font-black text-slate-850 text-sm font-display">${{ number_format($b->total_amount, 2) }}</span>
                        </div>
                    </div>

                    <!-- Actions Bar -->
                    <div class="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-3">
                        <span class="text-[11px] text-slate-500">Booked by <strong class="text-slate-800">{{ $b->booked_by }}</strong></span>

                        <div class="flex items-center gap-2">
                            @if($b->status === 'pending_verification')
                                <button type="button" wire:click="uploadBankSlip('{{ $b->id }}')" class="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-extrabold transition">
                                    📤 Upload Bank Slip
                                </button>
                            @endif

                            <button type="button" wire:click="openTicketModal('{{ $b->id }}')" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-sm">
                                🎟️ Boarding Pass
                            </button>

                            @if($b->status !== 'cancelled')
                                <button type="button" wire:click="cancelBooking('{{ $b->id }}')" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition">
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
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" wire:click.self="closeTicketModal">
            <div class="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left space-y-6">
                <button wire:click="closeTicketModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">✕</button>

                <div class="text-center space-y-2 border-b border-slate-100 pb-4">
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Maldives Maritime Pass</span>
                    <h3 class="text-xl font-black text-slate-850 font-display">{{ $selectedBooking->vessel_name }}</h3>
                    <p class="text-xs font-mono text-slate-500">Ticket ID: {{ $selectedBooking->id }}</p>
                </div>

                <div class="space-y-3 text-xs">
                    <div class="flex justify-between border-b border-slate-100 pb-2">
                        <span class="text-slate-500 font-medium">Route:</span>
                        <span class="font-bold text-slate-800">{{ $selectedBooking->route_from }} → {{ $selectedBooking->route_to }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-100 pb-2">
                        <span class="text-slate-500 font-medium">Departure:</span>
                        <span class="font-bold text-slate-800">{{ $selectedBooking->departure_time }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-100 pb-2">
                        <span class="text-slate-500 font-medium">Assigned Seats:</span>
                        <span class="font-bold text-sky-600">{{ is_array($selectedBooking->selected_seat_ids) ? implode(', ', $selectedBooking->selected_seat_ids) : $selectedBooking->selected_seat_ids }}</span>
                    </div>
                    <div class="flex justify-between border-b border-slate-100 pb-2">
                        <span class="text-slate-500 font-medium">Passenger Name:</span>
                        <span class="font-bold text-slate-800">{{ $selectedBooking->booked_by }}</span>
                    </div>
                </div>

                <!-- Simulated QR Code -->
                <div class="bg-slate-900 p-4 rounded-2xl w-36 h-36 mx-auto flex flex-col items-center justify-center text-white font-mono text-[9px] font-bold shadow-inner">
                    <div class="grid grid-cols-4 gap-1.5 w-full h-full p-2 bg-slate-950 rounded-xl">
                        @for($q = 0; $q < 16; $q++)
                            <div class="{{ $q % 2 === 0 ? 'bg-white' : 'bg-sky-500' }} rounded-sm"></div>
                        @endfor
                    </div>
                </div>

                <div class="text-center pt-2">
                    <button wire:click="closeTicketModal" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl">
                        Close Boarding Pass
                    </button>
                </div>
            </div>
        </div>
    @endif
</div>
