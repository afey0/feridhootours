import React, { useState } from 'react';
import { Search, Key, ShieldCheck, User, Calendar, Upload, Check, ImageIcon, AlertCircle, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import { SeatMap } from './SeatMap';
import type { Booking, Passenger, Seat } from '../data/mockData';
import { calculateRefund } from '../utils/refundPolicy';
import { compressImage } from '../utils/imageCompressor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageBookingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { bookings, schedules, updateBooking, processRefund, showAlert } = usePlatformStore();

  const [step, setStep] = useState<'lookup' | '2fa' | 'menu' | 'edit_passengers' | 'edit_schedule_seats' | 'edit_slip' | 'cancel_refund'>('lookup');
  const [bookingRef, setBookingRef] = useState('');
  const [passengerNameOrId, setPassengerNameOrId] = useState('');
  
  // 2FA states
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOtpBanner, setShowOtpBanner] = useState(false);
  
  // Target Booking
  const [matchedBooking, setMatchedBooking] = useState<Booking | null>(null);
  
  // Editing states
  const [editedPassengers, setEditedPassengers] = useState<Passenger[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [editedSeats, setEditedSeats] = useState<Seat[]>([]);
  const [newReceiptUrl, setNewReceiptUrl] = useState<string>('');
  const [newReceiptFileName, setNewReceiptFileName] = useState<string>('');
  
  // Drag & drop file upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Common errors / success feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ref = bookingRef.trim().toUpperCase();
    const query = passengerNameOrId.trim().toLowerCase();

    if (!ref || !query) {
      setError('Please provide both a Booking Reference and passenger info.');
      return;
    }

    const booking = bookings.find(b => 
      b.id === ref && 
      b.passengers.some(p => 
        p.name.toLowerCase().includes(query) || p.idNumber.toLowerCase() === query
      )
    );

    if (!booking) {
      setError('No booking found with this reference and passenger name/ID.');
      return;
    }

    // Generate random 2FA OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setMatchedBooking(booking);
    setStep('2fa');
    setShowOtpBanner(true);
  };

  const handleVerify2fa = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otpInput.trim() !== generatedOtp) {
      setError('Invalid verification code. Please check the notification or try again.');
      return;
    }

    setShowOtpBanner(false);
    setStep('menu');
  };

  const handleSavePassengers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedBooking) return;

    // Validate passenger names and IDs are not empty
    if (editedPassengers.some(p => !p.name.trim() || !p.idNumber.trim())) {
      setError('All passenger names and ID/Passport numbers must be filled.');
      return;
    }

    updateBooking(matchedBooking.id, { passengers: editedPassengers });
    
    // Refresh local matched booking
    setMatchedBooking(prev => prev ? { ...prev, passengers: editedPassengers } : null);
    setSuccess('Passenger information updated successfully.');
    setTimeout(() => {
      setSuccess(null);
      setStep('menu');
    }, 1500);
  };

  // Drag & drop file handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (file) {
      setNewReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setNewReceiptUrl(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSlip = () => {
    if (!matchedBooking || !newReceiptUrl) return;

    updateBooking(matchedBooking.id, { 
      receiptImage: newReceiptUrl,
      status: 'pending_verification' // Reset status to trigger operator verification
    });

    setMatchedBooking(prev => prev ? { ...prev, receiptImage: newReceiptUrl, status: 'pending_verification' } : null);
    setSuccess('Transfer slip updated. Booking returned to Pending Verification status.');
    setTimeout(() => {
      setSuccess(null);
      setNewReceiptUrl('');
      setNewReceiptFileName('');
      setStep('menu');
    }, 1500);
  };

  // Find other schedules on the same route to reschedule
  const availableSchedulesForRoute = matchedBooking 
    ? schedules.filter(s => 
        s.routeFrom === matchedBooking.routeFrom && 
        s.routeTo === matchedBooking.routeTo && 
        s.id !== matchedBooking.scheduleId
      )
    : [];

  const handleStartEditScheduleSeats = () => {
    if (!matchedBooking) return;
    setSelectedScheduleId(matchedBooking.scheduleId);
    setEditedSeats([]);
    setStep('edit_schedule_seats');
  };

  const handleToggleSeat = (seat: Seat) => {
    setEditedSeats(prev => {
      const alreadySelected = prev.find(s => s.id === seat.id);
      if (alreadySelected) {
        return prev.filter(s => s.id !== seat.id);
      }
      
      // Limit selection to passenger count
      const passengerCount = matchedBooking?.passengers.length || 0;
      if (prev.length >= passengerCount) {
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleSaveScheduleSeats = () => {
    if (!matchedBooking) return;
    const passengerCount = matchedBooking.passengers.length;
    if (editedSeats.length !== passengerCount) {
      setError(`Please select exactly ${passengerCount} seat(s).`);
      return;
    }

    const newSched = schedules.find(s => s.id === selectedScheduleId);
    if (!newSched) return;

    // Update schedule info and mapping in booking
    const updatedPassengers = matchedBooking.passengers.map((p, i) => ({
      ...p,
      seatId: editedSeats[i].id
    }));

    updateBooking(matchedBooking.id, {
      scheduleId: selectedScheduleId,
      vesselName: newSched.vesselName,
      vesselType: newSched.vesselType,
      departureTime: newSched.departureTime,
      arrivalTime: newSched.arrivalTime,
      selectedSeatIds: editedSeats.map(s => s.id),
      passengers: updatedPassengers
    });

    setMatchedBooking(prev => prev ? {
      ...prev,
      scheduleId: selectedScheduleId,
      vesselName: newSched.vesselName,
      vesselType: newSched.vesselType,
      departureTime: newSched.departureTime,
      arrivalTime: newSched.arrivalTime,
      selectedSeatIds: editedSeats.map(s => s.id),
      passengers: updatedPassengers
    } : null);

    setSuccess('Journey schedule and seats updated successfully!');
    setTimeout(() => {
      setSuccess(null);
      setStep('menu');
    }, 1500);
  };

  const handleResetModal = () => {
    setStep('lookup');
    setBookingRef('');
    setPassengerNameOrId('');
    setOtpInput('');
    setGeneratedOtp('');
    setShowOtpBanner(false);
    setMatchedBooking(null);
    setError(null);
    setSuccess(null);
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
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Self-Service Lookup</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative text-slate-800 flex flex-col">

        {/* 2FA simulated OTP notification banner */}
        {showOtpBanner && (
          <div className="bg-sky-50 border border-sky-200 text-sky-850 p-4 rounded-xl text-xs font-semibold animate-pulse flex items-center justify-between mb-5">
            <span className="flex items-center gap-2">
              <Key size={14} className="text-sky-600 shrink-0" />
              <span>[Simulation 2FA SMS/Email] Security verification code: <strong>{generatedOtp}</strong></span>
            </span>
            <button onClick={() => setShowOtpBanner(false)} className="text-sky-600 font-bold hover:text-sky-800 underline">Dismiss</button>
          </div>
        )}

        {/* STEP 1: LOOKUP FORM */}
        {step === 'lookup' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-sky-600" />
                Manage Your Booking
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Verify your booking reference to reschedule seats, modify passenger details, or update payment slips securely.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Reference (PNR)</label>
                <input 
                  type="text"
                  placeholder="e.g. SFY78B"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-805 text-sm font-semibold uppercase focus:outline-none focus:border-sky-500"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Name or passport/ID</label>
                <input 
                  type="text"
                  placeholder="Enter passenger name or ID"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-805 text-sm font-semibold focus:outline-none focus:border-sky-500"
                  value={passengerNameOrId}
                  onChange={(e) => setPassengerNameOrId(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-rose-600 text-xs font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 text-sm"
              >
                <Search size={16} /> Look Up Booking
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: 2FA OTP VALIDATION */}
        {step === '2fa' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Key className="text-sky-600 animate-bounce" />
                Security Verification
              </h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                For security, we've simulated sending a 6-digit OTP code to verify authorization for Booking Ref: <strong>{bookingRef}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerify2fa} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enter 6-Digit Code</label>
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-805 text-lg text-center tracking-widest font-black focus:outline-none focus:border-sky-500"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-rose-600 text-xs font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="button"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold px-4 py-3 rounded-xl transition cursor-pointer text-sm"
                  onClick={() => setStep('lookup')}
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition cursor-pointer text-sm"
                >
                  Verify Authorization
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: LOGGED IN MANAGEMENT MENU */}
        {step === 'menu' && matchedBooking && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                Manage Booking: {matchedBooking.id}
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Authorization Active. Choose an aspect of your reservation to edit.
              </p>
            </div>

            {/* Booking overview stub */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium space-y-2.5">
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-200/60 pb-2">
                <span>Vessel Schedule</span>
                <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] ${
                  matchedBooking.status === 'verified' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>{matchedBooking.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-slate-700 text-sm">
                <div>
                  <strong className="text-slate-900 block font-bold">{matchedBooking.vesselName}</strong>
                  <span className="text-[11px] text-slate-500">{matchedBooking.routeFrom} → {matchedBooking.routeTo}</span>
                </div>
                <div className="text-right">
                  <strong className="text-slate-900 block font-bold">{matchedBooking.departureTime}</strong>
                  <span className="text-[11px] text-slate-500">Seats: {matchedBooking.selectedSeatIds.join(', ')}</span>
                </div>
              </div>
            </div>

            {success && (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-250 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-inner">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => { setEditedPassengers(matchedBooking.passengers.map(p => ({ ...p }))); setStep('edit_passengers'); }}
                className="p-5 border border-slate-200 hover:border-sky-500/30 bg-white hover:bg-slate-50 rounded-xl cursor-pointer text-left transition flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-sky-650 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <strong className="block text-slate-805 text-sm font-bold">Passenger Details</strong>
                  <span className="text-xs text-slate-450 font-medium">Names, age, ID passport numbers</span>
                </div>
              </button>

              <button 
                onClick={handleStartEditScheduleSeats}
                className="p-5 border border-slate-200 hover:border-sky-500/30 bg-white hover:bg-slate-50 rounded-xl cursor-pointer text-left transition flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-sky-650 flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <strong className="block text-slate-805 text-sm font-bold">Reschedule & Seats</strong>
                  <span className="text-xs text-slate-450 font-medium">Select another vessel or seats</span>
                </div>
              </button>

              {matchedBooking.paymentMethod === 'bank_transfer' && (
                <button 
                  onClick={() => { setStep('edit_slip'); setNewReceiptUrl(matchedBooking.receiptImage || ''); }}
                  className="p-5 border border-slate-200 hover:border-sky-500/30 bg-white hover:bg-slate-50 rounded-xl cursor-pointer text-left transition flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-sky-650 flex items-center justify-center shrink-0">
                    <Upload size={18} />
                  </div>
                  <div>
                    <strong className="block text-slate-805 text-sm font-bold">Update Bank Slip</strong>
                    <span className="text-xs text-slate-450 font-medium">Re-upload bank receipt or invoice slip</span>
                  </div>
                </button>
              )}

              {matchedBooking.status !== 'cancelled' && (
                <button 
                  onClick={() => setStep('cancel_refund')}
                  className="p-5 border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 rounded-xl cursor-pointer text-left transition flex items-center gap-3.5 sm:col-span-2"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <strong className="block text-rose-700 text-sm font-bold">Cancel & Request Refund</strong>
                    <span className="text-xs text-slate-500 font-medium">Calculate rule-based refund & cancel reservation</span>
                  </div>
                </button>
              )}
            </div>

            <div className="border-t border-slate-200 pt-5 flex justify-end">
              <button 
                onClick={handleResetModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold px-5 py-3 rounded-xl transition cursor-pointer text-xs"
              >
                Logout from Booking
              </button>
            </div>
          </div>
        )}

        {/* SUB-FLOW: EDIT PASSENGERS */}
        {step === 'edit_passengers' && (
          <div className="space-y-6 flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('menu')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Edit Passenger Information</h3>
                <span className="text-slate-400 text-xs font-semibold">Verify spelling matches official documents</span>
              </div>
            </div>

            <form onSubmit={handleSavePassengers} className="space-y-4 flex-1 overflow-y-auto max-h-[50vh] pr-2">
              {editedPassengers.map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 text-xs text-slate-700">
                  <div className="font-bold text-sky-700 flex justify-between items-center">
                    <span>Passenger #{idx + 1} (Seat {p.seatId.replace('S-', '')})</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-500">Full Name</label>
                      <input 
                        type="text" 
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-805 focus:outline-none" 
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...editedPassengers];
                          updated[idx].name = e.target.value;
                          setEditedPassengers(updated);
                        }}
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-500">ID / Passport Number</label>
                      <input 
                        type="text" 
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-805 focus:outline-none" 
                        value={p.idNumber}
                        onChange={(e) => {
                          const updated = [...editedPassengers];
                          updated[idx].idNumber = e.target.value;
                          setEditedPassengers(updated);
                        }}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-500">Age</label>
                      <input 
                        type="number" 
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-805 focus:outline-none" 
                        value={p.age}
                        onChange={(e) => {
                          const updated = [...editedPassengers];
                          updated[idx].age = parseInt(e.target.value) || 0;
                          setEditedPassengers(updated);
                        }}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-500">Gender</label>
                      <select 
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-805 focus:outline-none"
                        value={p.gender}
                        onChange={(e) => {
                          const updated = [...editedPassengers];
                          updated[idx].gender = e.target.value;
                          setEditedPassengers(updated);
                        }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {error && (
                <div className="text-rose-600 text-xs font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep('menu')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB-FLOW: EDIT SCHEDULE & SEATS */}
        {step === 'edit_schedule_seats' && matchedBooking && (
          <div className="space-y-6 flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('menu')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Reschedule Vessel & Seats</h3>
                <span className="text-slate-400 text-xs font-semibold">Change timings or choose different cabin chairs</span>
              </div>
            </div>

            {/* Schedule Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. SELECT VESSEL & DEPARTURE TIME</label>
              <div className="grid grid-cols-1 gap-2 max-h-[22vh] overflow-y-auto border border-slate-200 p-2 rounded-xl bg-slate-50">
                {/* Current Booking Schedule Option */}
                {schedules.find(s => s.id === matchedBooking.scheduleId) && (() => {
                  const s = schedules.find(s => s.id === matchedBooking.scheduleId)!;
                  return (
                    <div 
                      onClick={() => { setSelectedScheduleId(s.id); setEditedSeats([]); }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex justify-between items-center ${
                        selectedScheduleId === s.id 
                          ? 'border-sky-400 bg-sky-50/50' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <strong className="block text-slate-800 text-xs">{s.vesselName} (Current)</strong>
                        <span className="text-[10px] text-slate-500 font-semibold">{s.departureTime} | ${s.price} economy</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-655 px-2 py-0.5 rounded font-bold uppercase">Active</span>
                    </div>
                  );
                })()}

                {/* Available alternative schedules */}
                {availableSchedulesForRoute.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => { setSelectedScheduleId(s.id); setEditedSeats([]); }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex justify-between items-center ${
                      selectedScheduleId === s.id 
                        ? 'border-sky-400 bg-sky-50/50' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <strong className="block text-slate-800 text-xs">{s.vesselName}</strong>
                      <span className="text-[10px] text-slate-500 font-semibold">{s.departureTime} | ${s.price} economy</span>
                    </div>
                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold uppercase border border-sky-100">Alternative</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Map component wrapper */}
            {selectedScheduleId && (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[45vh] pr-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  2. CHOOSE NEW SEAT(S) (Select {matchedBooking.passengers.length})
                </label>
                
                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <SeatMap 
                    scheduleId={selectedScheduleId}
                    selectedSeats={editedSeats}
                    onToggleSeat={handleToggleSeat}
                    onConfirm={() => {}}
                    passengerCount={matchedBooking.passengers.length}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-rose-600 text-xs font-bold flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={handleSaveScheduleSeats}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer"
              >
                Confirm Booking Changes
              </button>
              <button 
                type="button" 
                onClick={() => setStep('menu')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SUB-FLOW: EDIT TRANSFER SLIP */}
        {step === 'edit_slip' && matchedBooking && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('menu')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Update Bank Transfer Slip</h3>
                <span className="text-slate-400 text-xs font-semibold">Change or re-upload your receipt file</span>
              </div>
            </div>

            <div className="space-y-4">
              {newReceiptUrl ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 font-bold text-xs shadow-inner">
                    <div className="flex items-center gap-2.5">
                      {newReceiptUrl.startsWith('data:image/') ? (
                        <img src={newReceiptUrl} alt="Slip" className="w-10 h-10 object-cover rounded border border-emerald-200" />
                      ) : (
                        <ImageIcon size={18} className="text-emerald-600" />
                      )}
                      <span>{newReceiptFileName || 'transfer_receipt.png'}</span>
                    </div>
                    <button 
                      onClick={() => { setNewReceiptUrl(''); setNewReceiptFileName(''); }}
                      className="text-rose-600 hover:text-rose-500 font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  {newReceiptUrl.startsWith('data:image/') && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[30vh] flex items-center justify-center bg-slate-50 p-2">
                      <img src={newReceiptUrl} alt="Slip Preview" className="max-w-full max-h-[25vh] object-contain rounded-lg shadow-sm" />
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className={`w-full p-8 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center gap-2 text-slate-500 transition shadow-sm bg-white ${
                    isDragging ? 'border-sky-500 bg-sky-50/50' : 'border-slate-200 hover:border-sky-500/40 hover:bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <Upload size={28} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">Upload New Bank Transfer Slip</span>
                  <span className="text-xs">Drag & drop or tap to select slip file</span>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={handleSaveSlip}
                  className={`flex-1 font-bold py-3 rounded-xl transition text-sm cursor-pointer ${
                    newReceiptUrl 
                      ? 'bg-sky-500 hover:bg-sky-600 text-white' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-305/50'
                  }`}
                  disabled={!newReceiptUrl}
                >
                  Submit Updated Slip
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep('menu')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-FLOW: CANCEL & REFUND */}
        {step === 'cancel_refund' && matchedBooking && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('menu')} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Rule-Based Cancellation & Refund</h3>
                <p className="text-xs text-slate-500 font-medium">Review policy breakdown before proceeding.</p>
              </div>
            </div>

            {(() => {
              const refundCalc = calculateRefund(matchedBooking);
              return (
                <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 text-xs space-y-4 font-medium text-slate-800 animate-fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-rose-700 text-sm flex items-center gap-1.5">
                        <AlertTriangle size={16} /> Refund Estimate
                      </h4>
                      <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                        Based on departure timing rules ({refundCalc.hoursUntilDeparture}h remaining).
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${refundCalc.badgeClass}`}>
                      {refundCalc.policyTier}
                    </span>
                  </div>

                  <div className="bg-white border border-rose-150 rounded-xl p-4 space-y-2 text-xs shadow-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Paid Amount:</span>
                      <span className="font-bold text-slate-800">${matchedBooking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Cancellation Fee ({100 - refundCalc.refundPercentage}% penalty):</span>
                      <span>-${refundCalc.cancellationFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                      <span>Net Refund Credited:</span>
                      <span className="text-emerald-600 font-extrabold">${refundCalc.refundAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white/80 border border-rose-100 p-2.5 rounded-lg leading-relaxed">
                    💡 <strong>Policy Rule:</strong> {refundCalc.explanation}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <button 
                      type="button"
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs transition shadow-md shadow-rose-600/10"
                      onClick={() => {
                        const res = processRefund(matchedBooking.id);
                        if (res.success) {
                          showAlert(res.message, 'Refund Executed', 'success');
                          setMatchedBooking(prev => prev ? { ...prev, status: 'cancelled', refundAmount: refundCalc.refundAmount } : null);
                          setStep('menu');
                        } else {
                          showAlert(res.message, 'Refund Failed', 'error');
                        }
                      }}
                    >
                      Confirm Cancellation (${refundCalc.refundAmount.toFixed(2)} Refund)
                    </button>
                    <button 
                      type="button"
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer font-bold text-xs transition"
                      onClick={() => setStep('menu')}
                    >
                      Back to Menu
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
