<div class="space-y-6 sm:space-y-8 text-left animate-fade-in">

    <!-- Stepper Header -->
    <div class="glass-panel rounded-2xl sm:rounded-full px-4 py-3 border border-slate-200/80 shadow-sm flex items-center justify-center gap-2 sm:gap-4 flex-wrap max-w-2xl mx-auto">
        <div class="flex items-center gap-2 text-sky-600 font-extrabold">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20">
                1
            </div>
            <span class="text-xs sm:text-sm font-bold">Departures</span>
        </div>
        <div class="w-4 sm:w-8 md:w-10 h-[2px] rounded-full bg-slate-200"></div>

        <div class="flex items-center gap-2 text-slate-400 font-semibold">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black bg-white text-slate-400 border border-slate-200">
                2
            </div>
            <span class="text-xs sm:text-sm hidden md:inline font-bold">Seat Layout</span>
        </div>
        <div class="w-4 sm:w-8 md:w-10 h-[2px] rounded-full bg-slate-200"></div>

        <div class="flex items-center gap-2 text-slate-400 font-semibold">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black bg-white text-slate-400 border border-slate-200">
                3
            </div>
            <span class="text-xs sm:text-sm hidden md:inline font-bold">Passenger Info</span>
        </div>
        <div class="w-4 sm:w-8 md:w-10 h-[2px] rounded-full bg-slate-200"></div>

        <div class="flex items-center gap-2 text-slate-400 font-semibold">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black bg-white text-slate-400 border border-slate-200">
                4
            </div>
            <span class="text-xs sm:text-sm hidden md:inline font-bold">Payment</span>
        </div>
    </div>

    <!-- Search Hero Form -->
    <div class="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 text-left">
        <form wire:submit.prevent="$refresh" class="p-5 md:p-8 space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                <!-- FROM -->
                <div class="lg:col-span-3 flex flex-col gap-2">
                    <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        📍 Departure Port
                    </label>
                    <select wire:model.live="fromPort" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- SWAP BUTTON -->
                <div class="hidden lg:flex lg:col-span-1 justify-center pb-1">
                    <button type="button" wire:click="swapPorts" class="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 flex items-center justify-center cursor-pointer transition shadow-sm active:scale-95 shrink-0" title="Swap Ports">
                        ⇄
                    </button>
                </div>

                <!-- TO -->
                <div class="lg:col-span-3 flex flex-col gap-2">
                    <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        📍 Destination Port
                    </label>
                    <select wire:model.live="toPort" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }}</option>
                        @endforeach
                    </select>
                </div>

                <!-- DATE -->
                <div class="lg:col-span-3 flex flex-col gap-2">
                    <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        📅 Travel Date
                    </label>
                    <input type="date" wire:model.live="travelDate" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 h-12">
                </div>

                <!-- PASSENGERS -->
                <div class="lg:col-span-2 flex flex-col gap-2">
                    <label class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        👥 Passengers
                    </label>
                    <select wire:model.live="passengersCount" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12">
                        @for($n = 1; $n <= 6; $n++)
                            <option value="{{ $n }}">{{ $n }} Passenger{{ $n > 1 ? 's' : '' }}</option>
                        @endfor
                    </select>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button type="submit" class="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 hover:shadow-sky-600/35 transition duration-200 flex items-center justify-center gap-2.5 cursor-pointer text-sm font-display">
                    🔍 Find Schedules
                </button>
            </div>
        </form>
    </div>

    <!-- Schedules Results List -->
    <div class="space-y-6 mt-8">
        <div class="flex justify-between items-center border-b border-slate-200/80 pb-4">
            <div>
                <h3 class="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2 font-display">
                    ⛵ Available Daily Schedules
                </h3>
                <p class="text-slate-500 text-xs mt-1 font-semibold">Direct speedboats for selected route and date</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black border border-sky-200">
                {{ count($schedules) }} Schedules Found
            </span>
        </div>

        @if(count($schedules) === 0)
            <div class="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-sm space-y-3">
                <div class="text-4xl">🚤</div>
                <h4 class="font-extrabold text-slate-850 text-base font-display">No direct schedules found for selected route</h4>
                <p class="text-xs text-slate-500 max-w-md mx-auto">Try selecting a different departure or destination port (e.g. Malé to Maafushi).</p>
            </div>
        @else
            <div class="grid grid-cols-1 gap-4">
                @foreach($schedules as $s)
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between md:items-center gap-5 text-left">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold text-2xl shrink-0">
                                🚤
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-3">
                                    <h4 class="font-extrabold text-slate-850 text-lg font-display">{{ $s->vessel_name }}</h4>
                                    <span class="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase">{{ $s->vessel_type }}</span>
                                </div>
                                <div class="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-3">
                                    <span>🕒 {{ $s->departure_time }} → {{ $s->arrival_time }}</span>
                                    <span>•</span>
                                    <span>💺 {{ $s->available_seats }} / {{ $s->total_seats }} seats available</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                            <div class="text-right">
                                <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Price From</span>
                                <span class="text-2xl font-black text-slate-850 font-display">${{ number_format($s->price, 2) }}</span>
                            </div>
                            <button type="button" wire:click="openBookingModal('{{ $s->id }}')" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer flex items-center gap-2">
                                <span>Select Seats</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <!-- Spotlight Atoll Destinations Section -->
    <div class="space-y-6 mt-16 text-slate-800 border-t border-slate-200/80 pt-12">
        <div>
            <h3 class="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2 font-display">
                🧩 Spotlight Atoll Destinations
            </h3>
            <p class="text-slate-500 text-xs mt-1 font-semibold">Explore stunning island destinations and schedule instant speedboats across the Maldives.</p>
        </div>

        @php
            $destinations = [
                ['id' => 'MLE', 'name' => 'Malé Capital Hub', 'code' => 'MLE', 'desc' => 'Central commercial and airport transit terminal linking all island routes.', 'price' => '$5.00', 'img' => 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&auto=format&fit=crop&q=80'],
                ['id' => 'MAF', 'name' => 'Maafushi Paradise', 'code' => 'MAF', 'desc' => 'Popular tourist island known for guesthouses, watersports, and bikini beach.', 'price' => '$25.00', 'img' => 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&auto=format&fit=crop&q=80'],
                ['id' => 'DHG', 'name' => 'Dhigurah Sanctuary', 'code' => 'DHG', 'desc' => 'Beautiful long sandspit famous for year-round whale shark and manta sightings.', 'price' => '$45.00', 'img' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80'],
                ['id' => 'FUL', 'name' => 'Fulidhoo Culture', 'code' => 'FUL', 'desc' => 'Quiet tropical getaway featuring stingray feeding and traditional Maldives vibes.', 'price' => '$35.00', 'img' => 'https://images.unsplash.com/photo-1540206395-68808572332f?w=500&auto=format&fit=crop&q=80'],
            ];
        @endphp

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($destinations as $d)
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 text-left">
                    <div>
                        <div class="relative w-full h-40 overflow-hidden bg-slate-150">
                            <img src="{{ $d['img'] }}" alt="{{ $d['name'] }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] px-2 py-0.5 rounded-md font-black font-mono border border-slate-200/60 shadow-sm uppercase">
                                {{ $d['code'] }}
                            </span>
                        </div>
                        <div class="p-5">
                            <h4 class="font-extrabold text-base text-slate-850 font-display">{{ $d['name'] }}</h4>
                            <p class="text-slate-500 text-xs mt-2 leading-relaxed font-medium">{{ $d['desc'] }}</p>
                        </div>
                    </div>
                    <div class="border-t border-slate-100 mx-5 pb-5 pt-4 flex justify-between items-center text-xs font-bold">
                        <div>
                            <span class="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Price From</span>
                            <span class="text-slate-800 text-sm font-black">{{ $d['price'] }}</span>
                        </div>
                        <button type="button" wire:click="selectPort('{{ $d['id'] }}')" class="bg-white border border-slate-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 cursor-pointer p-2.5 rounded-xl text-slate-700 transition flex items-center justify-center shadow-sm">
                            →
                        </button>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    <!-- Smart Transit Features Grid -->
    <div class="space-y-6 mt-16 text-slate-800">
        <div>
            <h3 class="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2 font-display">
                🚤 Smart Transit Features
            </h3>
            <p class="text-slate-500 text-xs mt-1 font-semibold">Reliable luxury speedboats and inter-island ferry services at your fingertips.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left space-y-2">
                <div class="w-10 h-10 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl flex items-center justify-center text-xl">🚤</div>
                <h4 class="font-extrabold text-sm text-slate-850 font-display">Premium Speedboats</h4>
                <p class="text-slate-500 text-xs leading-relaxed font-medium">Travel comfortably inside fully enclosed, air-conditioned speedboats featuring leather seating, USB charging ports, and free bottled water.</p>
            </div>

            <div class="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left space-y-2">
                <div class="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                <h4 class="font-extrabold text-sm text-slate-850 font-display">2FA Secure PNR</h4>
                <p class="text-slate-500 text-xs leading-relaxed font-medium">Manage passenger names, seat maps, and departure times securely. Access is locked behind automated One-Time Passcodes (OTP).</p>
            </div>

            <div class="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left space-y-2">
                <div class="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center text-xl">🏛️</div>
                <h4 class="font-extrabold text-sm text-slate-850 font-display">Agency Manifest Tools</h4>
                <p class="text-slate-500 text-xs leading-relaxed font-medium">Approved travel agencies can reserve seats in bulk, manage dynamic manifest registries, and settle balances via bank transfer slips.</p>
            </div>
        </div>
    </div>

    <!-- Booking & Interactive Seat Selection Modal -->
    @if($showBookingModal && $selectedSchedule)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in" wire:click.self="closeBookingModal">
            <div class="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative text-left my-8 max-h-[90vh] overflow-y-auto">
                <button wire:click="closeBookingModal" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg">✕</button>

                @if($confirmedBooking)
                    <!-- Confirmation View -->
                    <div class="text-center space-y-6 py-6">
                        <div class="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                            ✓
                        </div>
                        <div>
                            <h2 class="text-3xl font-black text-slate-850 font-display">Booking Confirmed!</h2>
                            <p class="text-xs text-slate-500 mt-1">Ticket Reference: <span class="font-mono text-sky-600 font-extrabold text-base">{{ $confirmedBooking->id }}</span></p>
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 text-xs">
                            <div class="flex justify-between border-b border-slate-200 pb-2">
                                <span class="text-slate-500 font-medium">Vessel:</span>
                                <span class="font-bold text-slate-850">{{ $confirmedBooking->vessel_name }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-200 pb-2">
                                <span class="text-slate-500 font-medium">Route:</span>
                                <span class="font-bold text-slate-850">{{ $confirmedBooking->route_from }} → {{ $confirmedBooking->route_to }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-200 pb-2">
                                <span class="text-slate-500 font-medium">Time:</span>
                                <span class="font-bold text-slate-850">{{ $confirmedBooking->departure_time }}</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-200 pb-2">
                                <span class="text-slate-500 font-medium">Seats Reserved:</span>
                                <span class="font-bold text-sky-600">{{ implode(', ', $confirmedBooking->selected_seat_ids) }}</span>
                            </div>
                            <div class="flex justify-between pt-1">
                                <span class="text-slate-500 font-medium">Total Paid:</span>
                                <span class="font-extrabold text-emerald-600 text-sm">${{ number_format($confirmedBooking->total_amount, 2) }}</span>
                            </div>
                        </div>
                        <div class="flex justify-center gap-3 pt-2">
                            <a href="/my-bookings" class="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20">
                                View My Bookings
                            </a>
                            <button wire:click="closeBookingModal" class="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs">
                                Done
                            </button>
                        </div>
                    </div>
                @else
                    <!-- Seat Map & Details View -->
                    <div class="space-y-6">
                        <div>
                            <span class="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest">Instant Seat Allocation</span>
                            <h2 class="text-2xl font-black text-slate-850 font-display">{{ $selectedSchedule->vessel_name }} Seating Plan</h2>
                            <p class="text-xs text-slate-500 font-medium">Select {{ $passengersCount }} seat(s) for your voyage</p>
                        </div>

                        @if(session()->has('booking_error'))
                            <div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold">
                                ⚠️ {{ session('booking_error') }}
                            </div>
                        @endif

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <!-- Left: Interactive Seat Map -->
                            <div class="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-inner">
                                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">BOW (Front of Speedboat)</div>
                                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-sky-500 mx-auto"></div>

                                <div class="grid grid-cols-4 gap-2.5 max-w-[240px] mx-auto py-4">
                                    @for($s = 1; $s <= ($selectedVessel->layout_rows ?? 8) * ($selectedVessel->layout_cols ?? 4); $s++)
                                        @php
                                            $seatId = 'S-' . $s;
                                            $isSelected = in_array($seatId, $selectedSeats);
                                        @endphp
                                        <button type="button" wire:click="toggleSeat('{{ $seatId }}')"
                                            class="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold border transition cursor-pointer {{ $isSelected ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30 scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100' }}">
                                            {{ $s }}
                                        </button>
                                    @endfor
                                </div>

                                <div class="flex justify-center gap-4 text-[10px] font-extrabold text-slate-500 border-t border-slate-200 pt-3">
                                    <div class="flex items-center gap-1.5"><div class="w-3.5 h-3.5 rounded-md bg-white border border-slate-200"></div> Available</div>
                                    <div class="flex items-center gap-1.5"><div class="w-3.5 h-3.5 rounded-md bg-sky-600"></div> Selected</div>
                                </div>
                            </div>

                            <!-- Right: Passenger Info & Payment -->
                            <div class="lg:col-span-6 space-y-6">
                                <div class="space-y-4">
                                    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700">Passenger Information</h4>
                                    @foreach($passengersData as $idx => $p)
                                        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                                            <div class="flex justify-between items-center text-xs font-bold text-sky-600">
                                                <span>Passenger {{ $idx + 1 }}</span>
                                                <span>Seat: {{ $selectedSeats[$idx] ?? 'Not Selected' }}</span>
                                            </div>
                                            <div class="grid grid-cols-2 gap-2">
                                                <input type="text" wire:model="passengersData.{{ $idx }}.name" placeholder="Full Name" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:border-sky-500 focus:outline-none" required>
                                                <input type="text" wire:model="passengersData.{{ $idx }}.idNumber" placeholder="ID / Passport No." class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:border-sky-500 focus:outline-none">
                                            </div>
                                        </div>
                                    @endforeach
                                </div>

                                <!-- Payment Options -->
                                <div class="space-y-3">
                                    <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-700">Payment Method</h4>
                                    <div class="grid grid-cols-3 gap-2">
                                        <button type="button" wire:click="$set('paymentMethod', 'card')" class="py-2.5 px-2 rounded-xl border text-xs font-extrabold transition cursor-pointer {{ $paymentMethod === 'card' ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600' }}">
                                            💳 Card
                                        </button>
                                        <button type="button" wire:click="$set('paymentMethod', 'bank_transfer')" class="py-2.5 px-2 rounded-xl border text-xs font-extrabold transition cursor-pointer {{ $paymentMethod === 'bank_transfer' ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600' }}">
                                            🏦 Bank Slip
                                        </button>
                                        <button type="button" wire:click="$set('paymentMethod', 'cash')" class="py-2.5 px-2 rounded-xl border text-xs font-extrabold transition cursor-pointer {{ $paymentMethod === 'cash' ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600' }}">
                                            💵 Cash Pier
                                        </button>
                                    </div>
                                </div>

                                <!-- Total Summary & Action -->
                                <div class="border-t border-slate-200 pt-4 flex items-center justify-between">
                                    <div>
                                        <span class="text-[10px] font-extrabold text-slate-400 uppercase block">Total Amount</span>
                                        <div class="text-2xl font-black text-slate-850 font-display">${{ number_format($selectedSchedule->price * (int)$passengersCount, 2) }}</div>
                                    </div>
                                    <button type="button" wire:click="confirmBooking" class="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer">
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
