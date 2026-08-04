import React, { useState } from 'react';
import { ArrowLeft, Users, ArrowRight, UserPlus, Info } from 'lucide-react';
import type { Seat, Passenger, FareCategory } from '../data/mockData';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  selectedSeats: Seat[];
  initialPassengers?: Passenger[];
  onSave: (passengers: Passenger[]) => void;
  onSilentChange?: (passengers: Passenger[]) => void;
  onBack: () => void;
}

export const PassengerDetails: React.FC<Props> = ({ selectedSeats, initialPassengers, onSave, onSilentChange, onBack }) => {
  const { user, addSavedPassenger } = useAuthStore();

  const [formData, setFormData] = useState<Record<string, Omit<Passenger, 'seatId'>>>(() => {
    return selectedSeats.reduce((acc, seat) => {
      const existing = initialPassengers?.find(p => p.seatId === seat.id);
      acc[seat.id] = {
        name: existing?.name || '',
        age: existing?.age ?? 18,
        gender: existing?.gender || 'Male',
        idNumber: existing?.idNumber || '',
        fareCategory: existing?.fareCategory || 'Local',
        specialRequest: existing?.specialRequest || ''
      };
      return acc;
    }, {} as Record<string, Omit<Passenger, 'seatId'>>);
  });

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [saveToAccount, setSaveToAccount] = useState<Record<string, boolean>>({});

  const handleChange = (seatId: string, field: string, value: any) => {
    const updated = {
      ...formData,
      [seatId]: {
        ...formData[seatId],
        [field]: value
      }
    };
    setFormData(updated);

    // Clear error
    if (errors[seatId]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [seatId]: {
          ...prev[seatId],
          [field]: ''
        }
      }));
    }

    if (onSilentChange) {
      const passengerList: Passenger[] = selectedSeats.map(seat => ({
        ...(updated[seat.id] || { name: '', age: 18, gender: 'Male', idNumber: '', fareCategory: 'Local', specialRequest: '' }),
        seatId: seat.id
      }));
      onSilentChange(passengerList);
    }
  };

  const getIdLabel = (category: string) => {
    switch (category) {
      case 'Local': return 'National ID Card Number (NID)';
      case 'Tourist': return 'Passport Number';
      case 'Work Permit': return 'Work Permit Card Number';
      case 'Resort': return 'Resort ID / Passport Number';
      default: return 'Passport / National ID';
    }
  };

  const getIdPlaceholder = (category: string) => {
    switch (category) {
      case 'Local': return 'Enter NID card number';
      case 'Tourist': return 'Enter Passport number';
      case 'Work Permit': return 'Enter Work Permit card number';
      case 'Resort': return 'Enter Resort ID or Passport';
      default: return 'Enter ID/Passport number';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, Record<string, string>> = {};
    let hasError = false;

    selectedSeats.forEach(seat => {
      const data = formData[seat.id];
      const seatErrors: Record<string, string> = {};

      if (!data.name.trim()) {
        seatErrors.name = 'Full name is required';
        hasError = true;
      }
      if (!data.idNumber.trim()) {
        const cat = data.fareCategory || 'Local';
        seatErrors.idNumber = `${getIdLabel(cat)} is required`;
        hasError = true;
      }
      if (data.age <= 0) {
        seatErrors.age = 'Age must be valid';
        hasError = true;
      }

      if (Object.keys(seatErrors).length > 0) {
        newErrors[seat.id] = seatErrors;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.input-error');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Save checked travelers to store accounts
    if (user) {
      selectedSeats.forEach(seat => {
        if (saveToAccount[seat.id]) {
          const traveler = formData[seat.id];
          addSavedPassenger(user.id, {
            name: traveler.name.trim(),
            age: traveler.age,
            gender: traveler.gender,
            idNumber: traveler.idNumber.toUpperCase().trim(),
            specialRequest: traveler.specialRequest?.trim() || undefined
          });
        }
      });
    }

    const passengerList: Passenger[] = selectedSeats.map(seat => ({
      ...formData[seat.id],
      seatId: seat.id
    }));

    onSave(passengerList);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 p-6 md:p-8 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="bg-transparent border border-slate-200 hover:bg-slate-50 cursor-pointer p-2.5 rounded-xl text-slate-700 transition duration-200 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850">Passenger Information</h2>
            <p className="text-slate-500 text-sm font-medium">Provide details for the boarding passes below.</p>
          </div>
        </div>
        
        {/* Guest Warning / Call to Action */}
        {!user && (
          <div className="flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-700 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-inner">
            <Info size={16} className="text-sky-600 shrink-0 animate-pulse" />
            <span>Traveling often? Sign In or Sign Up to save traveler lists and speed up checkouts!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {selectedSeats.map((seat, index) => {
          const data = formData[seat.id];
          const seatErrors = errors[seat.id] || {};

          // VIP vs Premium vs Economy colors
          const classBorderColor = 
            seat.class === 'VIP' 
              ? 'border-l-amber-500' 
              : seat.class === 'Premium' 
                ? 'border-l-indigo-500' 
                : 'border-l-slate-400';

          return (
            <div 
              key={seat.id} 
              className={`glass-panel border-l-4 ${classBorderColor} rounded-xl p-6 bg-white shadow-sm border border-slate-150`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Users size={18} className="text-sky-605" />
                  Passenger {index + 1} — Seat {seat.id.replace('S-', '')}
                </h4>
                
                <div className="flex items-center gap-3">
                  {/* Class Badge */}
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    seat.class === 'VIP' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                      : seat.class === 'Premium' 
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {seat.class} Class
                  </span>

                  {/* Saved Passengers Dropdown (Quick Fill) */}
                  {user && user.savedPassengers.length > 0 && (
                    <select
                      className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer transition shadow-sm"
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = user.savedPassengers.find((p: any) => p.idNumber === val);
                        if (match) {
                          const updatedSeatData: Omit<Passenger, 'seatId'> = {
                            ...formData[seat.id],
                            name: match.name,
                            age: match.age,
                            gender: match.gender as any,
                            idNumber: match.idNumber,
                            fareCategory: 'Local' as FareCategory,
                            specialRequest: match.specialRequest || ''
                          };
                          const updated: Record<string, Omit<Passenger, 'seatId'>> = {
                            ...formData,
                            [seat.id]: updatedSeatData
                          };
                          setFormData(updated);

                          // Clear errors for this seat
                          setErrors(prev => ({
                            ...prev,
                            [seat.id]: {}
                          }));

                          if (onSilentChange) {
                            const passengerList: Passenger[] = selectedSeats.map(s => ({
                              ...(s.id === seat.id ? updatedSeatData : (updated[s.id] || { name: '', age: 18, gender: 'Male', idNumber: '', fareCategory: 'Local' as FareCategory, specialRequest: '' })),
                              seatId: s.id
                            }));
                            onSilentChange(passengerList);
                          }
                        }
                      }}
                    >
                      <option value="">Quick Fill Saved Traveler</option>
                      {user.savedPassengers.map((sp: any) => (
                        <option key={sp.idNumber} value={sp.idNumber}>
                          {sp.name} ({sp.idNumber})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Full name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-505">Full Name</label>
                  <input 
                    type="text" 
                    className={`bg-white border ${seatErrors.name ? 'border-rose-300 input-error ring-2 ring-rose-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-slate-850 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200`}
                    placeholder="Enter full name" 
                    value={data.name}
                    onChange={(e) => handleChange(seat.id, 'name', e.target.value)}
                  />
                  {seatErrors.name && (
                    <span className="text-rose-600 text-xs mt-0.5 font-semibold">{seatErrors.name}</span>
                  )}
                </div>

                {/* ID/Passport */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-505">{getIdLabel(data.fareCategory || 'Local')}</label>
                  <input 
                    type="text" 
                    className={`bg-white border ${seatErrors.idNumber ? 'border-rose-300 input-error ring-2 ring-rose-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-slate-850 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200`}
                    placeholder={getIdPlaceholder(data.fareCategory || 'Local')}
                    value={data.idNumber}
                    onChange={(e) => handleChange(seat.id, 'idNumber', e.target.value)}
                  />
                  {seatErrors.idNumber && (
                    <span className="text-rose-605 text-xs mt-0.5 font-semibold">{seatErrors.idNumber}</span>
                  )}
                </div>

                {/* Age */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-505">Age</label>
                  <input 
                    type="number" 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-855 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200" 
                    min="1"
                    max="120"
                    value={data.age}
                    onChange={(e) => handleChange(seat.id, 'age', parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-505">Gender</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer"
                    value={data.gender}
                    onChange={(e) => handleChange(seat.id, 'gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Passenger Fare Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-505">Passenger Category</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200 cursor-pointer"
                    value={data.fareCategory || 'Local'}
                    onChange={(e) => handleChange(seat.id, 'fareCategory', e.target.value)}
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="Local">Local</option>
                    <option value="Work Permit">Work Permit</option>
                    <option value="Resort">Resort Staff</option>
                  </select>
                </div>
              </div>

              {/* Special Request */}
              <div className="flex flex-col gap-2 mt-5">
                <label className="text-xs font-semibold text-slate-505">Special Requests (e.g. Assistance, Meals, Extra Baggage)</label>
                <input 
                  type="text" 
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-850 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition duration-200" 
                  placeholder="E.g. wheelchair assistance, motion sickness, window preference" 
                  value={data.specialRequest}
                  onChange={(e) => handleChange(seat.id, 'specialRequest', e.target.value)}
                />
              </div>

              {/* Save traveler toggle */}
              {user && (
                <div className="flex items-center gap-2 mt-4.5 pt-2 border-t border-slate-100">
                  <input 
                    type="checkbox"
                    id={`save-p-${seat.id}`}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                    checked={!!saveToAccount[seat.id]}
                    onChange={(e) => setSaveToAccount(prev => ({ ...prev, [seat.id]: e.target.checked }))}
                  />
                  <label htmlFor={`save-p-${seat.id}`} className="text-xs text-slate-500 font-bold flex items-center gap-1 cursor-pointer">
                    <UserPlus size={13} className="text-sky-600" /> Save this traveler to my list for future bookings
                  </label>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-600/25 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            Continue to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
