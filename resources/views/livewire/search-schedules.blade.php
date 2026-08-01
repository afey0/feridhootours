<div class="space-y-8 animate-fade-in text-left">
    <!-- Stepper Navigation Header -->
    <div class="glass-panel p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-sm flex justify-between items-center bg-white">
        <div class="flex items-center gap-2 sm:gap-6 w-full justify-between sm:justify-start text-xs font-extrabold font-display">
            <!-- Step 1: Departures -->
            <div wire:click="goBackToSearch" class="flex items-center gap-2 cursor-pointer transition {{ $currentStep === 'search' ? 'text-sky-600 font-black' : 'text-slate-400 hover:text-slate-700' }}">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black {{ $currentStep === 'search' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-500' }}">1</div>
                <span class="hidden sm:inline">Departures</span>
            </div>

            <div class="w-6 sm:w-12 h-0.5 bg-slate-200"></div>

            <!-- Step 2: Seat Layout -->
            <div class="flex items-center gap-2 {{ $currentStep === 'select_seats' ? 'text-sky-600 font-black' : 'text-slate-400' }}">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black {{ $currentStep === 'select_seats' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-500' }}">2</div>
                <span class="hidden sm:inline">Seat Layout</span>
            </div>

            <div class="w-6 sm:w-12 h-0.5 bg-slate-200"></div>

            <!-- Step 3: Passenger Info -->
            <div class="flex items-center gap-2 {{ $currentStep === 'passenger_details' ? 'text-sky-600 font-black' : 'text-slate-400' }}">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black {{ $currentStep === 'passenger_details' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-500' }}">3</div>
                <span class="hidden sm:inline">Passenger Info</span>
            </div>

            <div class="w-6 sm:w-12 h-0.5 bg-slate-200"></div>

            <!-- Step 4: Payment -->
            <div class="flex items-center gap-2 {{ in_array($currentStep, ['payment', 'confirmation']) ? 'text-sky-600 font-black' : 'text-slate-400' }}">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black {{ in_array($currentStep, ['payment', 'confirmation']) ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'bg-slate-100 text-slate-500' }}">4</div>
                <span class="hidden sm:inline">Payment</span>
            </div>
        </div>
    </div>

    @if(session()->has('step_error'))
        <div class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold animate-fade-in">
            ⚠️ {{ session('step_error') }}
        </div>
    @endif

    <!-- STEP 1: SEARCH & SCHEDULES LIST -->
    @if($currentStep === 'search')
        <!-- Search Hero Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg bg-gradient-to-b from-white to-sky-50/30 space-y-6">
            <div class="space-y-1">
                <h1 class="text-2xl sm:text-3xl font-black text-slate-850 font-display">Book Island Speedboats & Inter-Atoll Ferries</h1>
                <p class="text-xs sm:text-sm text-slate-500 font-medium">Real-time schedule search, instant seat reservation, and digital boarding pass generation.</p>
            </div>

            <form wire:submit.prevent="executeSearch" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <!-- From Port -->
                <div class="space-y-1.5">
                    <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Departure Port</label>
                    <select wire:model="fromPort" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->location }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Swap & To Port -->
                <div class="space-y-1.5">
                    <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Destination Port</label>
                    <select wire:model="toPort" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition">
                        @foreach($jetties as $j)
                            <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->location }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Travel Date -->
                <div class="space-y-1.5">
                    <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Travel Date</label>
                    <input type="date" wire:model="travelDate" class="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition">
                </div>

                <!-- Passengers & Submit -->
                <div class="space-y-1.5 flex flex-col justify-end">
                    <label class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Passengers</label>
                    <div class="flex gap-2">
                        <select wire:model.live="passengersCount" class="w-1/3 bg-white border border-slate-200 rounded-2xl px-3 py-3 text-slate-800 text-xs font-bold">
                            @for($i = 1; $i <= 8; $i++)
                                <option value="{{ $i }}">{{ $i }}</option>
                            @endfor
                        </select>
                        <button type="submit" class="w-2/3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-1.5 font-display">
                            🔍 Find Ferries
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Schedule Results List -->
        @if($hasSearched)
            <div class="space-y-4 pt-2">
                <div class="flex justify-between items-center px-1">
                    <h3 class="text-lg font-black text-slate-850 font-display">Available Transfers</h3>
                    <span class="text-xs text-slate-500 font-bold bg-sky-50 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                        {{ count($schedules) }} transfer(s) found
                    </span>
                </div>

                @if(count($schedules) === 0)
                    <div class="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                        <div class="text-4xl">⛵</div>
                        <h4 class="text-base font-extrabold text-slate-800 font-display">No Scheduled Transfers Found</h4>
                        <p class="text-xs text-slate-500 max-w-md mx-auto">Try selecting a different departure island or destination port.</p>
                    </div>
                @else
                    <div class="grid grid-cols-1 gap-4">
                        @foreach($schedules as $s)
                            <div class="bg-white border border-slate-200 hover:border-sky-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div class="space-y-2 flex-1">
                                    <div class="flex items-center gap-3">
                                        <h4 class="text-lg font-black text-slate-850 font-display">{{ $s->vessel_name }}</h4>
                                        <span class="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase">{{ $s->vessel_type }}</span>
                                    </div>
                                    <div class="flex items-center gap-4 text-xs font-bold text-slate-600">
                                        <span class="text-sky-600 font-extrabold">🕒 {{ $s->departure_time }} → {{ $s->arrival_time }}</span>
                                        <span>💺 Available: {{ $s->available_seats }}/{{ $s->total_seats }}</span>
                                    </div>
                                </div>

                                <div class="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
                                    <div class="text-left md:text-right">
                                        <span class="text-[10px] text-slate-400 font-extrabold uppercase block">Price / Seat</span>
                                        <span class="text-2xl font-black text-slate-850 font-display">${{ number_format($s->price, 2) }}</span>
                                    </div>
                                    <button wire:click="selectSchedule('{{ $s->id }}')" class="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-sky-600/20 transition cursor-pointer">
                                        Select Seats →
                                    </button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        @else
            <!-- Landing Info Cards (Spotlight Destinations & Smart Transit Features) -->
            <div class="space-y-12 pt-4">
                <!-- Spotlight Atoll Destinations Cards -->
                <div class="space-y-4">
                    <h3 class="text-xl font-black text-slate-850 font-display">Spotlight Island Destinations</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div wire:click="selectPort('MAF')" class="group relative rounded-3xl overflow-hidden shadow-md cursor-pointer border border-slate-200">
                            <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80" class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                                <span class="text-xs font-bold text-sky-400 uppercase">South Male Atoll</span>
                                <h4 class="text-lg font-black font-display">Maafushi Island</h4>
                                <span class="text-xs font-semibold text-slate-200 mt-0.5">$25.00 · Daily 45m Transfer</span>
                            </div>
                        </div>

                        <div wire:click="selectPort('FUL')" class="group relative rounded-3xl overflow-hidden shadow-md cursor-pointer border border-slate-200">
                            <img src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=600&q=80" class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                                <span class="text-xs font-bold text-sky-400 uppercase">Vaavu Atoll</span>
                                <h4 class="text-lg font-black font-display">Fulidhoo Island</h4>
                                <span class="text-xs font-semibold text-slate-200 mt-0.5">$45.00 · Stingray Beach</span>
                            </div>
                        </div>

                        <div wire:click="selectPort('DHG')" class="group relative rounded-3xl overflow-hidden shadow-md cursor-pointer border border-slate-200">
                            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                                <span class="text-xs font-bold text-sky-400 uppercase">South Ari Atoll</span>
                                <h4 class="text-lg font-black font-display">Dhigurah Sandspit</h4>
                                <span class="text-xs font-semibold text-slate-200 mt-0.5">$65.00 · Whale Shark Point</span>
                            </div>
                        </div>

                        <div wire:click="selectPort('MLE')" class="group relative rounded-3xl overflow-hidden shadow-md cursor-pointer border border-slate-200">
                            <img src="https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80" class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white">
                                <span class="text-xs font-bold text-sky-400 uppercase">Capital Region</span>
                                <h4 class="text-lg font-black font-display">Malé Central Pier</h4>
                                <span class="text-xs font-semibold text-slate-200 mt-0.5">Airports & Harbor Hub</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Smart Transit Features Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">⚡</div>
                        <h4 class="text-base font-extrabold text-slate-850 font-display">Instant Digital Tickets</h4>
                        <p class="text-xs text-slate-500 font-medium leading-relaxed">Generates offline QR digital boarding passes immediately upon payment confirmation.</p>
                    </div>

                    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">💺</div>
                        <h4 class="text-base font-extrabold text-slate-850 font-display">Live Interactive Seating</h4>
                        <p class="text-xs text-slate-500 font-medium leading-relaxed">Pick exact seats with real-time availability updates for Economy, VIP, and Premium cabins.</p>
                    </div>

                    <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-2">
                        <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">🏦</div>
                        <h4 class="text-base font-extrabold text-slate-850 font-display">BML & Card Instant Pay</h4>
                        <p class="text-xs text-slate-500 font-medium leading-relaxed">Supports Bank of Maldives direct transfers with automated receipt verification.</p>
                    </div>
                </div>
            </div>
        @endif
    @endif

    <!-- STEP 2: SELECT SEATS ON PAGE -->
    @if($currentStep === 'select_seats' && $selectedSchedule)
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                    <span class="text-xs font-bold text-sky-600 uppercase tracking-wider">Step 2 of 4</span>
                    <h2 class="text-2xl font-black text-slate-850 font-display">Pick Your Preferred Seat Layout</h2>
                    <p class="text-xs text-slate-500 font-medium">Select {{ $passengersCount }} seat(s) on {{ $selectedSchedule->vessel_name }}</p>
                </div>
                <button wire:click="goBackToSearch" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl">
                    ← Change Route
                </button>
            </div>

            <!-- Seat Map Layout -->
            <div class="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center space-y-4">
                <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Front (Bow)</div>
                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-sky-500"></div>

                @php
                    $rows = $selectedVessel->layout_rows ?? 8;
                    $cols = $selectedVessel->layout_cols ?? 4;
                @endphp

                <div class="grid gap-2.5 max-w-sm mx-auto">
                    @for($r = 1; $r <= $rows; $r++)
                        <div class="flex items-center gap-2 justify-center">
                            <span class="text-[10px] font-bold text-slate-400 w-4">R{{ $r }}</span>
                            @for($c = 1; $c <= $cols; $c++)
                                @php
                                    $seatId = 'S-' . $r . '-' . $c;
                                    $isSelected = in_array($seatId, $selectedSeats);
                                @endphp
                                <button type="button" wire:click="toggleSeat('{{ $seatId }}')" class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition cursor-pointer border shadow-sm {{ $isSelected ? 'bg-emerald-500 text-white border-emerald-600 scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50' }}">
                                    {{ $r }}{{ chr(64 + $c) }}
                                </button>
                                @if($c == ceil($cols / 2))
                                    <div class="w-4"></div> <!-- Aisle -->
                                @endif
                            @endfor
                        </div>
                    @endfor
                </div>

                <div class="flex items-center gap-4 text-xs font-bold text-slate-600 pt-4 border-t border-slate-200 w-full justify-center">
                    <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 bg-white border border-slate-300 rounded-md"></span> Available</span>
                    <span class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 bg-emerald-500 rounded-md"></span> Selected ({{ count($selectedSeats) }}/{{ $passengersCount }})</span>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button wire:click="proceedToPassengerDetails" class="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer">
                    Proceed to Passenger Info →
                </button>
            </div>
        </div>
    @endif

    <!-- STEP 3: PASSENGER DETAILS ON PAGE -->
    @if($currentStep === 'passenger_details' && $selectedSchedule)
        <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div class="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                    <span class="text-xs font-bold text-sky-600 uppercase tracking-wider">Step 3 of 4</span>
                    <h2 class="text-2xl font-black text-slate-850 font-display">Enter Passenger Manifest Info</h2>
                </div>
                <button wire:click="goBackToSeats" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl">
                    ← Back to Seats
                </button>
            </div>

            <div class="space-y-4">
                @foreach($passengersData as $idx => $p)
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                        <div class="flex justify-between items-center">
                            <h4 class="font-extrabold text-xs text-slate-850">Passenger {{ $idx + 1 }} (Assigned Seat: {{ $p['seatId'] ?: 'N/A' }})</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                                <input type="text" wire:model="passengersData.{{ $idx }}.name" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold" placeholder="Full Name" required>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase">ID / Passport</label>
                                <input type="text" wire:model="passengersData.{{ $idx }}.idNumber" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold" placeholder="A1234567">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                                <select wire:model="passengersData.{{ $idx }}.gender" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            <div class="flex justify-end pt-2">
                <button wire:click="proceedToPayment" class="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer">
                    Proceed to Payment →
                </button>
            </div>
        </div>
    @endif

    <!-- STEP 4: PAYMENT MODAL OVERLAY -->
    @if($currentStep === 'payment' && $selectedSchedule)
        <div class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div class="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-left">
                <div class="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                        <span class="text-xs font-bold text-sky-600 uppercase tracking-wider">Step 4 of 4</span>
                        <h2 class="text-2xl font-black text-slate-850 font-display">Review & Pay</h2>
                    </div>
                    <button wire:click="$set('currentStep', 'passenger_details')" class="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-bold">
                    <div class="flex justify-between text-slate-700">
                        <span>Transfer Ticket ({{ $passengersCount }} seat)</span>
                        <span>${{ number_format($selectedSchedule->price * $passengersCount, 2) }}</span>
                    </div>
                    @if($discount > 0)
                        <div class="flex justify-between text-emerald-600 font-extrabold">
                            <span>Promo Discount (MALDIVES10)</span>
                            <span>-${{ number_format($discount, 2) }}</span>
                        </div>
                    @endif
                    <div class="flex justify-between text-slate-850 text-base font-black border-t border-slate-200 pt-2 font-display">
                        <span>Total Due</span>
                        <span class="text-sky-600">${{ number_format(max(0, ($selectedSchedule->price * $passengersCount) - $discount), 2) }}</span>
                    </div>
                </div>

                <!-- Promo Code -->
                <div class="flex gap-2">
                    <input type="text" wire:model="promoCode" class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase" placeholder="PROMO CODE (e.g. MALDIVES10)">
                    <button wire:click="applyPromo" class="px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl">Apply</button>
                </div>

                <!-- Payment Methods -->
                <div class="space-y-2">
                    <label class="text-xs font-extrabold text-slate-500 uppercase">Select Payment Method</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button type="button" wire:click="$set('paymentMethod', 'card')" class="p-3 rounded-2xl border text-xs font-extrabold transition {{ $paymentMethod === 'card' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-200 text-slate-700' }}">
                            💳 Credit Card
                        </button>
                        <button type="button" wire:click="$set('paymentMethod', 'bank_transfer')" class="p-3 rounded-2xl border text-xs font-extrabold transition {{ $paymentMethod === 'bank_transfer' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-200 text-slate-700' }}">
                            🏦 Bank Transfer
                        </button>
                        <button type="button" wire:click="$set('paymentMethod', 'cash')" class="p-3 rounded-2xl border text-xs font-extrabold transition {{ $paymentMethod === 'cash' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-200 text-slate-700' }}">
                            💵 Pay at Pier
                        </button>
                    </div>
                </div>

                <button wire:click="confirmPayment" class="w-full py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer font-display">
                    Confirm & Issue Ticket →
                </button>
            </div>
        </div>
    @endif

    <!-- STEP 5: CONFIRMATION VIEW -->
    @if($currentStep === 'confirmation' && $confirmedBooking)
        <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl max-w-xl mx-auto space-y-6 text-center animate-fade-in">
            <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto font-bold shadow-sm">
                ✓
            </div>

            <div class="space-y-1">
                <h2 class="text-2xl font-black text-slate-850 font-display">Transfer Confirmed!</h2>
                <p class="text-xs text-slate-500 font-medium">Your digital ticket reference has been generated.</p>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 text-left text-xs font-semibold">
                <div class="flex justify-between">
                    <span class="text-slate-400 uppercase">Ticket ID</span>
                    <span class="font-mono font-bold text-sky-600 text-sm">{{ $confirmedBooking->id }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400 uppercase">Route</span>
                    <span class="text-slate-850 font-bold">{{ $confirmedBooking->route_from }} → {{ $confirmedBooking->route_to }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400 uppercase">Seats</span>
                    <span class="text-slate-850 font-bold">{{ implode(', ', $confirmedBooking->selected_seat_ids) }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400 uppercase">Total Paid</span>
                    <span class="text-emerald-600 font-bold">${{ number_format($confirmedBooking->total_amount, 2) }}</span>
                </div>
            </div>

            <div class="flex gap-3">
                <a href="/my-bookings" class="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition">
                    View Boarding Pass →
                </a>
                <button wire:click="goBackToSearch" class="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition">
                    Done
                </button>
            </div>
        </div>
    @endif
</div>
