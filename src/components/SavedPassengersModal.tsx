import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import type { SavedPassenger } from '../store/useAuthStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedPassengersModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, addSavedPassenger, removeSavedPassenger } = useAuthStore();
  
  // Form input states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState('Male');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen || !user) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Passenger name is required.');
      return;
    }
    if (!idNumber.trim()) {
      setError('Passport or ID Number is required.');
      return;
    }
    if (age <= 0 || age > 120) {
      setError('Please provide a valid age.');
      return;
    }

    // Check if duplicate
    const exists = user.savedPassengers.some(p => p.idNumber.toUpperCase().trim() === idNumber.toUpperCase().trim());
    if (exists) {
      setError('A traveler with this Passport / ID already exists in your list.');
      return;
    }

    const newPassenger: SavedPassenger = {
      name: name.trim(),
      age,
      gender,
      idNumber: idNumber.toUpperCase().trim(),
      specialRequest: specialRequest.trim() || undefined
    };

    addSavedPassenger(user.id, newPassenger);
    setSuccess(`Successfully added ${name.trim()} to your saved list.`);
    
    // Reset Form
    setName('');
    setAge(30);
    setGender('Male');
    setIdNumber('');
    setSpecialRequest('');
    setShowAddForm(false);

    setTimeout(() => setSuccess(null), 2500);
  };

  const handleRemove = (passport: string, travelerName: string) => {
    if (confirm(`Are you sure you want to remove ${travelerName} from your saved traveler list?`)) {
      removeSavedPassenger(user.id, passport);
      setSuccess(`Removed ${travelerName} from saved list.`);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 pt-2 pb-8 text-left">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 transition cursor-pointer text-xs"
        >
          <ArrowLeft size={16} className="text-sky-600" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Traveler Directory</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative text-slate-800 text-left">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-655 border border-sky-100 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Saved Travelers Manifest</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">Manage passenger details for fast selection during your speedboat bookings.</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
            <ShieldAlert size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
            <CheckCircle size={16} className="shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Saved List Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              List ({user.savedPassengers.length} traveler{user.savedPassengers.length === 1 ? '' : 's'})
            </span>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/10"
              >
                <UserPlus size={14} /> Add Traveler
              </button>
            )}
          </div>

          {/* Add Traveler Form */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <UserPlus size={16} className="text-sky-600" /> Register New Traveler
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Ali Sameer"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passport / ID</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="E.g. A908754"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    min="1"
                    max="120"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Special Request (Optional)</label>
                <input
                  type="text"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  placeholder="E.g. wheelchair assistance, motion sickness, none"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Save Traveler
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-transparent border border-slate-200 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg transition text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Passenger Cards List */}
          {user.savedPassengers.length === 0 ? (
            <div className="text-center py-10 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              <Users size={36} className="opacity-20 mx-auto mb-3" />
              <p className="text-xs font-medium">No saved passengers found in your directory yet. Click Add Traveler or save them during checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.savedPassengers.map((p) => (
                <div 
                  key={p.idNumber}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start transition hover:border-slate-300"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-sm uppercase tracking-wide">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {p.gender} • Age {p.age} • Passport: <span className="font-mono">{p.idNumber}</span>
                    </div>
                    {p.specialRequest && (
                      <div className="text-[10px] text-amber-600 font-semibold mt-1">
                        Request: {p.specialRequest}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(p.idNumber, p.name)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-1.5 rounded-lg hover:bg-slate-150 transition"
                    title="Remove Traveler"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
