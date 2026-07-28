import React from 'react';
import { ShieldAlert, Star, CheckCircle, Info } from 'lucide-react';
import type { Seat } from '../data/mockData';
import { usePlatformStore } from '../store/usePlatformStore';

interface Props {
  scheduleId?: string;
  selectedSeats: Seat[];
  onToggleSeat: (seat: Seat) => void;
  onConfirm: (action?: 'checkout' | 'admin-reserve' | 'admin-lock' | 'admin-unlock') => void;
  adminMode?: boolean;
  passengerCount?: number;
}

export const SeatMap: React.FC<Props> = ({ 
  scheduleId, 
  selectedSeats, 
  onToggleSeat, 
  onConfirm, 
  adminMode = false,
  passengerCount = 1
}) => {
  const { decks, schedules } = usePlatformStore();
  
  const deck = scheduleId ? (decks[scheduleId] || []) : [];
  const schedule = scheduleId ? schedules.find(s => s.id === scheduleId) : null;
  const basePrice = schedule?.price || 0;

  const getSeatStatus = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return 'selected';
    return seat.status;
  };

  const handleSeatClick = (seat: Seat) => {
    if (!adminMode && (seat.status === 'booked' || seat.status === 'locked')) return;
    onToggleSeat(seat);
  };

  const getSeatPrice = (seat: Seat) => {
    if (seat.class === 'VIP') return basePrice + 15;
    if (seat.class === 'Premium') return basePrice + 5;
    return basePrice;
  };

  const maxRow = React.useMemo(() => deck.reduce((max, s) => Math.max(max, s.row), 0), [deck]);
  const maxCol = React.useMemo(() => deck.reduce((max, s) => Math.max(max, s.col), 0), [deck]);
  const rows = React.useMemo(() => Array.from({ length: maxRow }, (_, i) => i + 1), [maxRow]);
  const aisleIndex = React.useMemo(() => Math.floor(maxCol / 2), [maxCol]);

  // Group seats by selected categories to display a detailed price break
  const vipSelected = selectedSeats.filter(s => s.class === 'VIP');
  const premiumSelected = selectedSeats.filter(s => s.class === 'Premium');
  const economySelected = selectedSeats.filter(s => s.class === 'Economy');

  const totalCalculatedAmount = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  
  // Validation: Check if selection matches passengerCount exactly
  const isSelectionExact = selectedSeats.length === passengerCount;

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 shadow-xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 animate-fade-in text-slate-800">
      
      {/* Vessel Deck Visualization */}
      <div className="flex-[1.2] min-w-[280px]">
        <div className="text-center mb-6">
          <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">Front (Bow) / Cabin</div>
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-sky-500 mx-auto mt-2" />
        </div>
        
        <div className="vessel-deck" style={{ maxWidth: `${maxCol * 58 + 50}px` }}>
          {rows.map(r => {
            const rowSeats = deck.filter(s => s.row === r).sort((a,b) => a.col - b.col);
            if(rowSeats.length === 0) return null;
            
            const leftSeats = rowSeats.filter(s => s.col <= aisleIndex);
            const rightSeats = rowSeats.filter(s => s.col > aisleIndex);
            
            return (
              <div key={r} className="seat-row relative">
                {/* Row number indicator */}
                <span className="absolute -left-8 top-3 text-xs font-semibold text-slate-400">R{r}</span>

                {/* Left Side */}
                {leftSeats.map(seat => {
                  const status = getSeatStatus(seat);
                  return (
                    <div 
                      key={seat.id} 
                      className={`seat seat-class-${seat.class.toLowerCase()}`}
                      data-status={status}
                      onClick={() => handleSeatClick(seat)}
                      title={`Seat ${seat.id} - ${status}`}
                    >
                      {seat.class === 'VIP' && <Star size={8} className="absolute top-1 text-amber-500 shrink-0" />}
                      <span className="text-[11px] tracking-tighter">{seat.id.replace('S-', '')}</span>
                    </div>
                  );
                })}
                
                {aisleIndex > 0 && <div className="seat-aisle" />}
                
                {/* Right Side */}
                {rightSeats.map(seat => {
                  const status = getSeatStatus(seat);
                  return (
                    <div 
                      key={seat.id} 
                      className={`seat seat-class-${seat.class.toLowerCase()}`}
                      data-status={status}
                      onClick={() => handleSeatClick(seat)}
                      title={`Seat ${seat.id} - ${status}`}
                    >
                      {seat.class === 'VIP' && <Star size={8} className="absolute top-1 text-amber-500 shrink-0" />}
                      <span className="text-[11px] tracking-tighter">{seat.id.replace('S-', '')}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* Class descriptions */}
        <div className="mt-8 space-y-3.5 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded bg-amber-400 shrink-0 mt-0.5 border border-amber-500" />
            <div>
              <strong className="text-amber-700">VIP Cabin</strong> (Base + $15.00) — Plush recliners, AC front cabin, complimentary refreshments.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded bg-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-700">Premium Cabin</strong> (Base + $5.00) — Mid-deck seating with saloon AC.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-slate-100 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-700">Economy Class</strong> (Base) — Standard layout. Wheelchair accessibility available on back row.
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Summary Panel */}
      <div className="flex-1 min-w-[280px] flex flex-col gap-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-wide">Select Your Seats</h3>
        
        {/* Legend */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white border border-slate-200" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-sky-500 border border-sky-600" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500 animate-pulse-lock" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-slate-100 border border-dashed border-slate-200" />
              <span className="text-slate-400">Booked</span>
            </div>
          </div>
        </div>

        {/* Seat Count Validation Banner */}
        {!adminMode && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors duration-300 ${
            isSelectionExact 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {isSelectionExact ? (
              <CheckCircle size={20} className="shrink-0 text-emerald-600" />
            ) : (
              <Info size={20} className="shrink-0 text-amber-600" />
            )}
            <div className="text-sm font-medium">
              {isSelectionExact ? (
                <span>Selection complete! {selectedSeats.length} of {passengerCount} seats selected.</span>
              ) : (
                <span>Please select exactly <strong className="font-bold underline">{passengerCount}</strong> seat{passengerCount > 1 ? 's' : ''}. Selected <strong className="font-bold underline text-slate-900">{selectedSeats.length}</strong>.</span>
              )}
            </div>
          </div>
        )}

        {/* Fare Breakdown */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner">
          <div className="space-y-4">
            <span className="text-base font-bold text-slate-700 block border-b border-slate-200 pb-2">
              Fare Breakdown ({selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''})
            </span>
            
            {selectedSeats.length > 0 ? (
              <div className="space-y-3 text-sm text-slate-600">
                {vipSelected.length > 0 && (
                  <div className="flex justify-between">
                    <span>{vipSelected.length}x VIP Seat(s) (${(basePrice + 15).toFixed(2)} ea):</span>
                    <span className="text-slate-900 font-bold">${(vipSelected.length * (basePrice + 15)).toFixed(2)}</span>
                  </div>
                )}
                {premiumSelected.length > 0 && (
                  <div className="flex justify-between">
                    <span>{premiumSelected.length}x Premium Seat(s) (${(basePrice + 5).toFixed(2)} ea):</span>
                    <span className="text-slate-900 font-bold">${(premiumSelected.length * (basePrice + 5)).toFixed(2)}</span>
                  </div>
                )}
                {economySelected.length > 0 && (
                  <div className="flex justify-between">
                    <span>{economySelected.length}x Economy Seat(s) (${basePrice.toFixed(2)} ea):</span>
                    <span className="text-slate-900 font-bold">${(economySelected.length * basePrice).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-800">
                  <span>Subtotal:</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-extrabold">
                    ${totalCalculatedAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">
                No seats selected yet. Please click open seats on the vessel map.
              </div>
            )}
          </div>

          {!adminMode ? (
            <div className="mt-6 space-y-4">
              <button 
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 cursor-pointer ${
                  isSelectionExact 
                    ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/10 hover:shadow-sky-600/20 hover:-translate-y-0.5' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                }`}
                disabled={!isSelectionExact}
                onClick={() => onConfirm('checkout')}
              >
                Lock Seats & Continue
              </button>
              
              <div className="flex items-center gap-2.5 text-xs text-amber-700 font-semibold justify-center">
                <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                <span>Seats will be locked for 10 minutes to complete checkout.</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={selectedSeats.length === 0}
                onClick={() => onConfirm('admin-lock')}
              >
                Quick Lock
              </button>
              <button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={selectedSeats.length === 0}
                onClick={() => onConfirm('admin-reserve')}
              >
                Quick Reserve (Book)
              </button>
              <button 
                className="w-full bg-transparent border border-rose-500 text-rose-500 hover:bg-rose-500/10 font-bold py-3.5 px-6 rounded-xl transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                disabled={selectedSeats.length === 0}
                onClick={() => onConfirm('admin-unlock')}
              >
                Release Seats
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
