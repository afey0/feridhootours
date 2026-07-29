<div class="max-w-7xl mx-auto px-6 py-12 space-y-12">
    <!-- Hero Section -->
    <div class="text-center space-y-4 max-w-3xl mx-auto">
        <span class="px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-extrabold uppercase tracking-widest inline-block">
            ⚡ Powered by Render.com & Neon PostgreSQL
        </span>
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Island Hopping in the <span class="gradient-text">Maldives</span> Made Effortless
        </h1>
        <p class="text-slate-400 text-base sm:text-lg">
            Book high-speed ferries & luxury speedboats between Malé, Maafushi, Fulidhoo, Dhigurah & Feridhoo with instant seat reservation.
        </p>
    </div>

    <!-- Search Box Card -->
    <div class="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <!-- Departure Port -->
            <div class="sm:col-span-4 space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Departure Port</label>
                <select wire:model.live="fromPort" class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-semibold focus:border-sky-500 focus:outline-none">
                    @foreach($jetties as $j)
                        <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->id }})</option>
                    @endforeach
                </select>
            </div>

            <!-- Swap Button -->
            <div class="sm:col-span-1 flex justify-center pb-2">
                <button wire:click="swapPorts" class="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition border border-slate-700">
                    ⇄
                </button>
            </div>

            <!-- Destination Port -->
            <div class="sm:col-span-4 space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Destination Port</label>
                <select wire:model.live="toPort" class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-semibold focus:border-sky-500 focus:outline-none">
                    @foreach($jetties as $j)
                        <option value="{{ $j->id }}">{{ $j->name }} ({{ $j->id }})</option>
                    @endforeach
                </select>
            </div>

            <!-- Date -->
            <div class="sm:col-span-3 space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</label>
                <input type="date" wire:model.live="travelDate" class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-semibold focus:border-sky-500 focus:outline-none">
            </div>
        </div>
    </div>

    <!-- Schedules Results -->
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-extrabold text-white">Available Daily Schedules</h2>
            <span class="text-xs font-bold text-slate-400">{{ count($schedules) }} Schedules Found</span>
        </div>

        @if(count($schedules) === 0)
            <div class="glass-panel rounded-3xl p-12 text-center text-slate-400 border border-slate-800">
                <p class="font-bold text-lg">No direct schedules found for selected route.</p>
                <p class="text-xs text-slate-500 mt-1">Try selecting different departure or arrival ports.</p>
            </div>
        @else
            <div class="grid grid-cols-1 gap-4">
                @foreach($schedules as $s)
                    <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-sky-500/50 transition flex flex-col md:flex-row justify-between md:items-center gap-6">
                        <div class="flex items-center gap-5">
                            <div class="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
                                🚤
                            </div>
                            <div class="space-y-1">
                                <div class="flex items-center gap-3">
                                    <h3 class="font-extrabold text-white text-lg">{{ $s->vessel_name }}</h3>
                                    <span class="px-2.5 py-0.5 rounded-md bg-slate-800 text-sky-400 text-[11px] font-bold">{{ $s->vessel_type }}</span>
                                </div>
                                <div class="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                    <span>🕒 {{ $s->departure_time }} → {{ $s->arrival_time }}</span>
                                    <span>•</span>
                                    <span>💺 {{ $s->available_seats }} / {{ $s->total_seats }} seats available</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between md:justify-end gap-6">
                            <div class="text-right">
                                <span class="text-xs font-bold text-slate-400 block">Price per ticket</span>
                                <span class="text-2xl font-black text-emerald-400">${{ number_format($s->price, 2) }}</span>
                            </div>
                            <a href="/my-bookings" class="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition">
                                Select Seats
                            </a>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
