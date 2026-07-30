<div class="space-y-10 animate-fade-in text-left">
    <!-- Hero Header -->
    <div class="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <span class="px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-extrabold uppercase tracking-widest inline-block shadow-sm">
            ⚡ Live Neon PostgreSQL + Render.com Booking Engine
        </span>
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white font-display leading-tight">
            Island Hopping in the <span class="gradient-text">Maldives</span> Made Effortless
        </h1>
        <p class="text-slate-400 text-sm sm:text-base font-medium">
            Book high-speed ferries & luxury speedboats between Malé, Maafushi, Fulidhoo, Dhigurah & Feridhoo with instant seat reservation.
        </p>
    </div>

    <!-- Spotlight Destinations Grid -->
    <div class="space-y-3">
        <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400 block text-left">Popular Island Destinations</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            @php
                $destinations = [
                    ['id' => 'MLE', 'name' => 'Malé City', 'img' => 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&auto=format&fit=crop&q=80', 'tag' => 'Capital Hub'],
                    ['id' => 'MAF', 'name' => 'Maafushi', 'img' => 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&auto=format&fit=crop&q=80', 'tag' => 'Bikini Beach'],
                    ['id' => 'FUL', 'name' => 'Fulidhoo', 'img' => 'https://images.unsplash.com/photo-1540206395-68808572332f?w=500&auto=format&fit=crop&q=80', 'tag' => 'Stingray Point'],
                    ['id' => 'DHG', 'name' => 'Dhigurah', 'img' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80', 'tag' => 'Whale Shark'],
                    ['id' => 'FER', 'name' => 'Feridhoo', 'img' => 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=500&auto=format&fit=crop&q=80', 'tag' => 'Pristine Reef'],
                ];
            @endphp
            @foreach($destinations as $d)
                <button type="button" wire:click="selectPort('{{ $d['id'] }}')" class="group relative rounded-2xl overflow-hidden h-28 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer text-left shadow-lg">
                    <img src="{{ $d['img'] }}" alt="{{ $d['name'] }}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-60">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div class="absolute bottom-3 left-3 right-3">
                        <span class="text-[9px] font-extrabold text-sky-400 uppercase tracking-wider block">{{ $d['tag'] }}</span>
                        <h4 class="text-sm font-extrabold text-white group-hover:text-sky-300 transition">{{ $d['name'] }}</h4>
                    </div>
                </button>
            @endforeach
        </div>
    </div>

    <!-- Search Hero Card -->
    <div class="glass-panel-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        <form wire:submit.prevent="$refresh" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                <!-- Departure Port -->
                <div class="lg:col-span-3 space-y-2">
                    <label class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Departure Port</label>
                    <select wire:model.live="fromPort" class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-sky-500 focus:outline-none cursor-pointer">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->id }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Swap Button -->
                <div class="hidden lg:flex lg:col-span-1 justify-center pb-2">
                    <button type="button" wire:click="swapPorts" class="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition border border-slate-700 cursor-pointer shadow-md">
                        ⇄
                    </button>
                </div>

                <!-- Destination Port -->
                <div class="lg:col-span-3 space-y-2">
                    <label class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Destination Port</label>
                    <select wire:model.live="toPort" class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-sky-500 focus:outline-none cursor-pointer">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->id }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Date -->
                <div class="lg:col-span-3 space-y-2">
                    <label class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Travel Date</label>
                    <input type="date" wire:model.live="travelDate" class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-sky-500 focus:outline-none">
                </div>

                <!-- Passengers -->
                <div class="lg:col-span-2 space-y-2">
                    <label class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Passengers</label>
                    <select wire:model.live="passengersCount" class="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:border-sky-500 focus:outline-none cursor-pointer">
                        @for($n = 1; $n <= 6; $n++)
                            <option value="{{ $n }}">{{ $n }} Passenger{{ $n > 1 ? 's' : '' }}</option>
                        @endfor
                    </select>
                </div>
            </div>
        </form>
    </div>

    <!-- Schedules Results -->
    <div class="space-y-6">
        <div class="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <div>
                <h2 class="text-2xl font-black text-white font-display">Available Daily Schedules</h2>
                <p class="text-xs text-slate-400 font-medium">Direct transfers for selected route</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-extrabold border border-slate-700">
                {{ count($schedules) }} Schedules Found
            </span>
        </div>

        @if(count($schedules) === 0)
            <div class="glass-panel-strong rounded-3xl p-12 text-center text-slate-400 border border-slate-800 space-y-3">
                <div class="text-4xl">🚤</div>
                <h3 class="font-extrabold text-white text-lg font-display">No direct schedules found for selected route</h3>
                <p class="text-xs text-slate-400 max-w-md mx-auto">Try selecting a different departure or destination port such as Malé (MLE) to Maafushi (MAF).</p>
            </div>
        @else
            <div class="grid grid-cols-1 gap-4">
                @foreach($schedules as $s)
                    <div class="glass-panel-strong rounded-3xl p-6 border border-slate-800 hover:border-sky-500/40 transition flex flex-col md:flex-row justify-between md:items-center gap-6 shadow-xl">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-2xl shrink-0">
                                🚤
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-3">
                                    <h3 class="font-extrabold text-white text-lg font-display">{{ $s->vessel_name }}</h3>
                                    <span class="px-2.5 py-0.5 rounded-md bg-slate-800 text-sky-400 text-[11px] font-extrabold uppercase border border-slate-700">{{ $s->vessel_type }}</span>
                                </div>
                                <div class="text-xs font-bold text-slate-400 flex flex-wrap items-center gap-3">
                                    <span>🕒 {{ $s->departure_time }} → {{ $s->arrival_time }}</span>
                                    <span>•</span>
                                    <span>💺 {{ $s->available_seats }} / {{ $s->total_seats }} seats available</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0">
                            <div class="text-right">
                                <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Price per seat</span>
                                <span class="text-2xl font-black text-emerald-400">${{ number_format($s->price, 2) }}</span>
                            </div>
                            <button type="button" wire:click="openBookingModal('{{ $s->id }}')" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer flex items-center gap-2">
                                <span>Select Seats</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <!-- Booking & Interactive Seat Selection Modal -->
    @if($showBookingModal && $selectedSchedule)
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in" wire:click.self="closeBookingModal">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative text-left my-8 max-h-[90vh] overflow-y-auto">
                <button wire:click="closeBookingModal" class="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg">✕</button>

                @if($confirmedBooking)
                    <!-- Confirmation View -->
                    <div class="text-center space-y-6 py-6">
                        <div class="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                            ✓
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-white font-display">Booking Confirmed!</h2>
                            <p class="text-xs text-slate-400 mt-1">Ticket Reference: <span class="font-mono text-sky-400 font-extrabold text-base">{{ $confirmedBooking->id }}</span></p>
                        </div>
                        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 text-xs">
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Vessel:</span>
                                <span class="font-bold text-white">{{ $confirmedBooking->vessel_name }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Route:</span>
                                <span class="font-bold text-white">{{ $confirmedBooking->route_from }} → {{ $confirmedBooking->route_to }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Time:</span>
                                <span class="font-bold text-white">{{ $confirmedBooking->departure_time }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Seats Reserved:</span>
                                <span class="font-bold text-sky-400">{{ implode(', ', $confirmedBooking->selected_seat_ids) }}</span>
                            </div>
                            <div class="flex justify-between pt-1">
                                <span class="text-slate-400">Total Paid:</span>
                                <span class="font-extrabold text-emerald-400 text-sm">${{ number_format($confirmedBooking->total_amount, 2) }}</span>
                            </div>
                        </div>
                        <div class="flex justify-center gap-3 pt-2">
                            <a href="/my-bookings" class="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md">
                                View My Bookings
                            </a>
                            <button wire:click="closeBookingModal" class="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs">
                                Done
                            </button>
                        </div>
                    </div>
                @else
                    <!-- Seat Map & Details View -->
                    <div class="space-y-6">
                        <div>
                            <span class="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest">Instant Seat Allocation</span>
                            <h2 class="text-2xl font-black text-white font-display">{{ $selectedSchedule->vessel_name }} Seating Plan</h2>
                            <p class="text-xs text-slate-400">Select {{ $passengersCount }} seat(s) for your voyage</p>
                        </div>

                        @if(session()->has('booking_error'))
                            <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-2xl text-xs font-bold">
                                ⚠️ {{ session('booking_error') }}
                            </div>
                        @endif

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <!-- Left: Interactive Seat Map -->
                            <div class="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">BOW (Front of Speedboat)</div>
                                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-sky-500 mx-auto"></div>

                                <div class="grid grid-cols-4 gap-2.5 max-w-[240px] mx-auto py-4">
                                    @for($s = 1; $s <= ($selectedVessel->layout_rows ?? 8) * ($selectedVessel->layout_cols ?? 4); $s++)
                                        @php
                                            $seatId = 'S-' . $s;
                                            $isSelected = in_array($seatId, $selectedSeats);
                                        @endphp
                                        <button type="button" wire:click="toggleSeat('{{ $seatId }}')"
                                            class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold border transition cursor-pointer {{ $isSelected ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/30 scale-105' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-sky-500/50' }}">
                                            {{ $s }}
                                        </button>
                                    @endfor
                                </div>

                                <div class="flex justify-center gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-800/80 pt-3">
                                    <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-slate-900 border border-slate-800"></div> Available</div>
                                    <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-sky-500"></div> Selected</div>
                                </div>
                            </div>

                            <!-- Right: Passenger Info & Payment -->
                            <div class="lg:col-span-6 space-y-6">
                                <div class="space-y-4">
                                    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Passenger Information</h4>
                                    @foreach($passengersData as $idx => $p)
                                        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                                            <div class="flex justify-between items-center text-xs font-bold text-sky-400">
                                                <span>Passenger {{ $idx + 1 }}</span>
                                                <span>Seat: {{ $selectedSeats[$idx] ?? 'Not Selected' }}</span>
                                            </div>
                                            <div class="grid grid-cols-2 gap-2">
                                                <input type="text" wire:model="passengersData.{{ $idx }}.name" placeholder="Full Name" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:border-sky-500 focus:outline-none" required>
                                                <input type="text" wire:model="passengersData.{{ $idx }}.idNumber" placeholder="ID / Passport No." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:border-sky-500 focus:outline-none">
                                            </div>
                                        </div>
                                    @endforeach
                                </div>

                                <!-- Payment Options -->
                                <div class="space-y-3">
                                    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-300">Payment Method</h4>
                                    <div class="grid grid-cols-3 gap-2">
                                        <button type="button" wire:click="$set('paymentMethod', 'card')" class="py-2.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer {{ $paymentMethod === 'card' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400' }}">
                                            💳 Card
                                        </button>
                                        <button type="button" wire:click="$set('paymentMethod', 'bank_transfer')" class="py-2.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer {{ $paymentMethod === 'bank_transfer' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400' }}">
                                            🏦 Bank Slip
                                        </button>
                                        <button type="button" wire:click="$set('paymentMethod', 'cash')" class="py-2.5 px-2 rounded-xl border text-xs font-bold transition cursor-pointer {{ $paymentMethod === 'cash' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-950 border-slate-800 text-slate-400' }}">
                                            💵 Cash Pier
                                        </button>
                                    </div>
                                </div>

                                <!-- Total Summary & Action -->
                                <div class="border-t border-slate-800 pt-4 flex items-center justify-between">
                                    <div>
                                        <span class="text-[10px] font-extrabold text-slate-400 uppercase">Total Amount</span>
                                        <div class="text-2xl font-black text-emerald-400">${{ number_format($selectedSchedule->price * (int)$passengersCount, 2) }}</div>
                                    </div>
                                    <button type="button" wire:click="confirmBooking" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer">
                                        Confirm Booking
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    @endif
</div>
