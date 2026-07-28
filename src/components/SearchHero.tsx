import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';

interface Props {
  onSearch: (fromPort: string, toPort: string, passengerCount: number, departureDate: string) => void;
  initialFromPort?: string;
  initialToPort?: string;
}

export const SearchHero: React.FC<Props> = ({ onSearch, initialFromPort, initialToPort }) => {
  const { locations } = usePlatformStore();
  const todayStr = '2026-06-24';
  const [fromPort, setFromPort] = useState(initialFromPort || 'MLE');
  const [toPort, setToPort] = useState(initialToPort || 'MAF');

  useEffect(() => {
    if (initialFromPort) setFromPort(initialFromPort);
  }, [initialFromPort]);

  useEffect(() => {
    if (initialToPort) setToPort(initialToPort);
  }, [initialToPort]);
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [passengerCount, setPassengerCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSwapPorts = () => {
    const temp = fromPort;
    setFromPort(toPort);
    setToPort(temp);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse dates to compare
    const selectedDateObj = new Date(departureDate);
    const todayDateObj = new Date(todayStr);
    
    // Clear time part for accurate comparison
    selectedDateObj.setHours(0,0,0,0);
    todayDateObj.setHours(0,0,0,0);

    if (selectedDateObj < todayDateObj) {
      setError('Departure date cannot be in the past. Please select today or a future date.');
      return;
    }

    if (fromPort === toPort) {
      setError('Departure and destination ports cannot be the same.');
      return;
    }

    setError(null);
    onSearch(fromPort, toPort, passengerCount, departureDate);
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 text-left">
      <form onSubmit={handleSearch} className="p-5 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* FROM */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" /> Departure Port
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12"
              value={fromPort}
              onChange={(e) => setFromPort(e.target.value)}
            >
              {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Swap Button */}
          <div className="hidden lg:flex lg:col-span-1 justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapPorts}
              className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 flex items-center justify-center cursor-pointer transition shadow-sm active:scale-95 shrink-0"
              title="Swap Departure and Destination"
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* TO */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" /> Destination Port
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12"
              value={toPort}
              onChange={(e) => setToPort(e.target.value)}
            >
              {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* DATE */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-sky-600" /> Travel Date
            </label>
            <input 
              type="date" 
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 h-12"
              value={departureDate}
              min={todayStr}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>

          {/* PASSENGERS */}
          <div className="lg:col-span-2 flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-sky-600" /> Passengers
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer h-12"
              value={passengerCount}
              onChange={(e) => setPassengerCount(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs sm:text-sm animate-fade-in font-semibold">
            <AlertTriangle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 hover:shadow-sky-600/35 transition duration-200 flex items-center justify-center gap-2.5 cursor-pointer text-sm"
          >
            <Search size={18} /> Find Schedules
          </button>
        </div>
      </form>
    </div>
  );
};
