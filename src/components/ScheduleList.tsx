import React from 'react';
import { Ship, CheckCircle, ArrowRight } from 'lucide-react';
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
    <div className="animate-fade-in space-y-6 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 font-display">
          <CheckCircle className="text-emerald-500" size={22} />
          Available Speedboat & Ferry Departures
        </h3>
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
          {visibleSchedules.length} Option{visibleSchedules.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visibleSchedules.length === 0 ? (
        <div className="glass-panel border border-slate-200/80 rounded-3xl p-10 text-center space-y-4 bg-white/80 shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mx-auto">
            <Ship size={32} />
          </div>
          <h4 className="text-base font-extrabold text-slate-800">No Direct Transits Found</h4>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-sm mx-auto leading-relaxed">
            We couldn't find active speedboat schedules matching this island route right now. Try selecting another destination or date.
          </p>
        </div>
      ) : (
        visibleSchedules.map(schedule => {
          const inMaintenance = !!schedule.maintenance;
          const fromLoc = locations.find(l => l.id === schedule.routeFrom)?.name || schedule.routeFrom;
          const toLoc = locations.find(l => l.id === schedule.routeTo)?.name || schedule.routeTo;

          return (
            <div 
              key={schedule.id} 
              data-testid={`schedule-card-${schedule.id}`}
              className={`glass-panel rounded-3xl border border-slate-200/80 p-5 md:p-7 flex flex-col lg:flex-row items-stretch justify-between gap-6 transition duration-200 shadow-lg bg-white/90 ${
                inMaintenance 
                  ? 'opacity-65 cursor-not-allowed border-amber-300' 
                  : 'cursor-pointer hover:bg-white hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-600/10'
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
              <div className="flex flex-col flex-[1.6] justify-center gap-3">
                <div className="flex items-center gap-4 sm:gap-8 md:gap-10">
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-none">
                      {schedule.departureTime}
                    </span>
                    <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mt-1.5">
                      {fromLoc}
                    </span>
                  </div>

                  {/* Line connector */}
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 relative flex items-center justify-center my-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-sky-600 shadow-md shadow-sky-600/30" />
                  </div>

                  <div className="flex flex-col text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-none">
                      {schedule.arrivalTime}
                    </span>
                    <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mt-1.5">
                      {toLoc}
                    </span>
                  </div>
                </div>

                {/* Intermediate Stops list */}
                {schedule.stops && schedule.stops.length > 0 && (
                  <div className="text-[10px] text-slate-500 font-bold text-left bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-sky-700 font-black uppercase text-[9px] tracking-wider border border-sky-200 bg-sky-50 px-2 py-0.5 rounded-md shadow-sm">
                      Stops:
                    </span>
                    {schedule.stops.map((stopId, i) => (
                      <React.Fragment key={stopId}>
                        <span className="text-slate-700 font-bold">{locations.find(l => l.id === stopId)?.name || stopId}</span>
                        {i < (schedule.stops?.length || 0) - 1 && <span className="text-slate-300 font-black">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Vessel & Amenity Info */}
              <div className="flex flex-1 items-center gap-4 text-left border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center shrink-0 shadow-sm">
                  <Ship size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">{schedule.vesselName}</h4>
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                      schedule.vesselType === 'Speedboat' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {schedule.vesselType}
                    </span>
                    <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider" title="Schedule Recurrence Frequency">
                      📅 {schedule.recurrence || 'Daily'}
                    </span>
                    {inMaintenance && (
                      <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider animate-pulse">
                        Maintenance
                      </span>
                    )}

                  </div>
                </div>
              </div>

              {/* Pricing & Select Button */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-center shrink-0 gap-3 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                <div className="text-left lg:text-right">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Starting Fare</span>
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-display">
                    ${schedule.price.toFixed(2)}
                  </div>
                  <div className={`text-[11px] font-bold uppercase tracking-wide mt-0.5 ${
                    schedule.availableSeats < 5 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {schedule.availableSeats} seats open
                  </div>
                </div>

                <button 
                  type="button"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-sky-600 text-white font-extrabold px-6 py-3 rounded-2xl transition duration-200 text-xs flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  <span>Select Cabin Seats</span>
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
};
