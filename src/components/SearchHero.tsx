import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, AlertTriangle } from 'lucide-react';
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
    <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
        <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-display">
          Where to next?
        </h2>
        <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
          Book inter-island ferries and premium speedboats instantly across the Maldives.
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* FROM */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" /> From
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer"
              value={fromPort}
              onChange={(e) => setFromPort(e.target.value)}
            >
              {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* TO */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" /> To
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer"
              value={toPort}
              onChange={(e) => setToPort(e.target.value)}
            >
              {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* DATE */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-sky-600" /> Date
            </label>
            <input 
              type="date" 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200"
              value={departureDate}
              min={todayStr}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>

          {/* PASSENGERS */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-sky-600" /> Passengers
            </label>
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer"
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
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm animate-fade-in font-medium">
            <AlertTriangle size={18} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-600/25 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search size={18} /> Find Schedules
          </button>
        </div>
      </form>
    </div>
  );
};
