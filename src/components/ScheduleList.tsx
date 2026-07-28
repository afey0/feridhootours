import React from 'react';
import { Ship, CheckCircle } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import type { Schedule } from '../data/mockData';

interface Props {
  fromPort: string;
  toPort: string;
  onSelect: (schedule: Schedule) => void;
}

export const ScheduleList: React.FC<Props> = ({ fromPort, toPort, onSelect }) => {
  const { schedules, locations, showAlert } = usePlatformStore();

  // Filter out disabled schedules and match route paths including intermediate stops
  const visibleSchedules = schedules.filter(s => {
    if (s.disabled) return false;
    const path = [s.routeFrom, ...(s.stops || []), s.routeTo];
    const fromIndex = path.indexOf(fromPort);
    const toIndex = path.indexOf(toPort);
    return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
  });

  return (
    <div className="animate-fade-in space-y-5">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 text-left">
        <CheckCircle className="text-emerald-500" size={20} />
        Available Departures
      </h3>

      {visibleSchedules.length === 0 ? (
        <div className="glass-panel border border-slate-200 rounded-2xl p-8 text-center space-y-3 bg-white shadow-md animate-fade-in">
          <Ship size={36} className="text-slate-400 mx-auto stroke-[1.5]" />
          <h4 className="text-sm font-extrabold text-slate-800">No Transits Found</h4>
          <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
            We couldn't find any Speedboat or Ferry schedules matching this path. Try searching for other island destinations or modify your filters.
          </p>
        </div>
      ) : (
        visibleSchedules.map(schedule => {
          const inMaintenance = !!schedule.maintenance;

          return (
            <div 
              key={schedule.id} 
              data-testid={`schedule-card-${schedule.id}`}
              className={`glass-panel rounded-2xl border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row items-stretch justify-between gap-6 transition duration-200 shadow-lg bg-white ${
                inMaintenance 
                  ? 'opacity-65 cursor-not-allowed border-amber-300' 
                  : 'cursor-pointer hover:bg-slate-50 hover:-translate-y-0.5 hover:border-sky-500/30'
              }`} 
              onClick={() => {
                if (inMaintenance) {
                  showAlert('This vessel is currently in maintenance mode. Bookings are temporarily suspended.', 'Vessel In Maintenance', 'error');
                  return;
                }
                onSelect(schedule);
              }}
            >
              {/* Timeline Block */}
              <div className="flex flex-col flex-[1.5] justify-center gap-2">
                <div className="flex items-center gap-6 md:gap-10">
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-2xl font-black text-slate-850 font-display tracking-tight leading-none">{schedule.departureTime}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                      {locations.find(l => l.id === schedule.routeFrom)?.name || schedule.routeFrom}
                    </span>
                  </div>

                  {/* Line connector */}
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent relative flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-md shadow-sky-500/40" />
                  </div>

                  <div className="flex flex-col text-right shrink-0">
                    <span className="text-2xl font-black text-slate-850 font-display tracking-tight leading-none">{schedule.arrivalTime}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                      {locations.find(l => l.id === schedule.routeTo)?.name || schedule.routeTo}
                    </span>
                  </div>
                </div>

                {/* Intermediate Stops list */}
                {schedule.stops && schedule.stops.length > 0 && (
                  <div className="text-[10px] text-slate-500 font-bold text-left mt-1.5 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-sky-700 font-black uppercase text-[8px] tracking-wider border border-sky-200 bg-sky-50 px-1.5 py-0.5 rounded shadow-sm">Via Stops:</span>
                    {schedule.stops.map((stopId, i) => (
                      <React.Fragment key={stopId}>
                        <span className="text-slate-700">{locations.find(l => l.id === stopId)?.name || stopId}</span>
                        {i < (schedule.stops?.length || 0) - 1 && <span className="text-slate-300 font-black">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider line for desktop */}
              <div className="hidden md:block w-[1px] bg-slate-200 mx-2" />

              {/* Vessel Info */}
              <div className="flex flex-1 items-center gap-4 text-left">
                <div className="bg-sky-50 text-sky-600 border border-sky-200 p-3.5 rounded-2xl shrink-0">
                  <Ship size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-850 text-base leading-tight">{schedule.vesselName}</h4>
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      schedule.vesselType === 'Speedboat' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {schedule.vesselType}
                    </span>
                    {inMaintenance && (
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider animate-pulse">
                        Vessel in Maintenance
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Seats */}
              <div className="flex flex-col items-start md:items-end justify-center shrink-0 gap-1 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-display">
                  ${schedule.price.toFixed(2)}
                </div>
                <div className={`text-xs font-bold uppercase tracking-wide mt-0.5 ${
                  schedule.availableSeats < 5 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {schedule.availableSeats} seats remaining
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
};
