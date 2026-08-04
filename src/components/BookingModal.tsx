import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, X, Lock, Upload, Image as ImageIcon, Check, AlertCircle, Ticket, MapPin, Anchor } from 'lucide-react';
import type { Schedule, Seat, Passenger } from '../data/mockData';
import { usePlatformStore } from '../store/usePlatformStore';
import { QRCodeImage } from './QRCodeImage';

interface Props {
  totalAmount: number; // Final amount after discount
  lockExpiresAt: Date | null;
  onPay: (paymentMethod: 'card' | 'bank_transfer', receiptImage?: string, user?: any) => void;
  onCancel: () => void;
  isProcessing: boolean;
  step: 'payment' | 'confirmation';
  
  // Props for details
  subtotalAmount: number;
  promoCode: string;
  discount: number;
  activePromo: string | null;
  onApplyPromo: (code: string, baseTotal: number) => { success: boolean; message: string };
  onRemovePromo: () => void;
  latestBookingRef: string | null;
  selectedSchedule: Schedule | null;
  selectedSeats: Seat[];
  passengers: Passenger[];
  user?: any;
}

export const BookingModal: React.FC<Props> = ({ 
  totalAmount, 
  lockExpiresAt, 
  onPay, 
  onCancel, 
  isProcessing, 
  step,
  subtotalAmount,
  promoCode: _promoCode,
  discount,
  activePromo,
  onApplyPromo,
  onRemovePromo,
  latestBookingRef,
  selectedSchedule,
  selectedSeats,
  passengers,
  user
}) => {
  const { locations, showAlert } = usePlatformStore();
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('bank_transfer');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  
  // Bank Transfer states
  const [receiptSimulated, setReceiptSimulated] = useState(false);
  const [receiptData, setReceiptData] = useState<string | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string>('payment_slip.png');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptSimulated(true);
        setReceiptData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!lockExpiresAt) return;
    const interval = setInterval(() => {
      const diff = Math.floor((lockExpiresAt.getTime() - new Date().getTime()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
      if (diff <= 0) onCancel(); // Auto-cancel when lock expires
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt, onCancel]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    if (!promoInput.trim()) return;
    const res = onApplyPromo(promoInput, subtotalAmount);
    if (res.success) {
      setPromoSuccess(res.message);
    } else {
      setPromoError(res.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptSimulated(true);
        setReceiptData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteReceipt = () => {
    setReceiptSimulated(false);
    setReceiptData(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePayClick = () => {
    if (paymentMethod === 'bank_transfer' && !receiptSimulated) {
      showAlert('Please upload your payment receipt to submit.', 'Receipt Required', 'error');
      return;
    }
    onPay(paymentMethod, receiptData, user);
  };

  // Helper to draw simulated barcode lines - light theme matched (dark lines)
  const renderBarcode = () => {
    return (
      <div className="flex items-center gap-[2px] h-10 w-full overflow-hidden opacity-90 mt-1">
        {[2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3].map((w, i) => (
          <div 
            key={i} 
            className="bg-slate-900 h-full" 
            style={{ width: `${w}px` }} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="overlay animate-fade-in" style={{ zIndex: 1100 }}>
      <div className="glass-panel-strong rounded-2xl w-full max-w-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-350 text-slate-800">
        
        {step === 'payment' && (
          <div className="space-y-6">
            <button 
              onClick={onCancel} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 cursor-pointer transition duration-150"
              title="Cancel Booking and Release Seats"
            >
              <X size={24} />
            </button>
            
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-wide">Checkout & Payment</h2>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock size={14} className="animate-pulse" />
                <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Journey Header */}
            {selectedSchedule && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                    <Anchor size={16} className="text-sky-600" />
                    <span>{selectedSchedule.vesselName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                      {selectedSchedule.vesselType}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs mt-1 font-medium">
                    {selectedSchedule.routeFrom} → {selectedSchedule.routeTo} | {selectedSchedule.departureTime} | Travel Date: {selectedSchedule.scheduleDate ? new Date(selectedSchedule.scheduleDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </div>
                  {selectedSchedule.stops && selectedSchedule.stops.length > 0 && (
                    <div className="text-[10px] text-slate-400 font-semibold mt-1.5 flex items-center gap-1.5 flex-wrap font-sans">
                      <span className="border border-sky-200 bg-sky-50 text-sky-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Stops:</span>
                      {selectedSchedule.stops.map(stopId => locations.find(l => l.id === stopId)?.name || stopId).join(' → ')}
                    </div>
                  )}
                </div>
                <div className="md:text-right flex md:flex-col justify-between items-center md:items-end gap-1">
                  <div className="text-sm font-bold text-slate-800">
                    Seats: <strong className="text-sky-600 underline">{selectedSeats.map(s => s.id.replace('S-', '')).join(', ')}</strong>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{passengers.length} Traveler{passengers.length > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            {/* Security Alert Banner */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex gap-3 text-xs md:text-sm">
              <Lock className="text-sky-600 shrink-0 mt-0.5" size={18} />
              <div>
                <h5 className="font-bold text-sky-850 mb-0.5">Secure Seat Lock Active</h5>
                <p className="text-slate-650 leading-relaxed font-medium">
                  Your selected cabin seats are temporarily reserved. Complete checkout before the timer expires to confirm your boarding pass issue.
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">
                CHOOSE PAYMENT METHOD
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  disabled
                  type="button"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-xl font-semibold border transition duration-200 cursor-not-allowed opacity-50 bg-slate-100 border-slate-200 text-slate-400"
                  title="Credit Card payments are temporarily disabled. Please use Bank Transfer."
                >
                  <CreditCard size={18} className="text-slate-400" /> Credit Card (Disabled)
                </button>
                <button 
                  className={`flex items-center justify-center gap-2.5 p-4 rounded-xl font-semibold border transition duration-200 cursor-pointer ${
                    paymentMethod === 'bank_transfer' 
                      ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-md shadow-sky-500/5' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <Upload size={18} className="text-sky-600" /> Bank Transfer
                </button>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="border-t border-slate-200 pt-5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                PROMO CODE
              </label>
              {activePromo ? (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                  <span className="text-sm text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-emerald-600" /> Active: {activePromo} (-${discount.toFixed(2)})
                  </span>
                  <button 
                    onClick={onRemovePromo} 
                    className="text-rose-600 hover:text-rose-500 font-bold text-sm cursor-pointer transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/10 flex-1 uppercase"
                    placeholder="Enter code (e.g. ISLANDER, GROUP)" 
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button 
                    className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition cursor-pointer font-bold"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <div className="text-rose-600 text-xs mt-2 flex items-center gap-1 font-semibold">
                  <AlertCircle size={14} className="text-rose-500" /> {promoError}
                </div>
              )}
              {promoSuccess && (
                <div className="text-emerald-600 text-xs mt-2 flex items-center gap-1 font-semibold">
                  <Check size={14} className="text-emerald-500" /> {promoSuccess}
                </div>
              )}
            </div>

            {/* Sub-form inputs */}
            {paymentMethod === 'card' ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-inner">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-500">Card Number (Mock)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 text-sm w-full focus:outline-none focus:border-sky-500" 
                      placeholder="0000 0000 0000 0000" 
                      defaultValue="4242 4242 4242 4242" 
                    />
                    <CreditCard size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500">Expiry Date</label>
                    <input 
                      type="text" 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500" 
                      placeholder="MM/YY" 
                      defaultValue="12/28" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500">CVC</label>
                    <input 
                      type="password" 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500" 
                      placeholder="123" 
                      defaultValue="123" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shadow-inner">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-start gap-2.5">
                  <Clock size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold text-amber-950 block">10-Minute Seat Reservation Hold</span>
                    Your selected seats will be held for <strong>10 minutes</strong>. You can place your reservation now and upload your transfer slip right here or later in <em>My Bookings</em>. If no receipt is uploaded within 10 minutes, the seats are automatically released for other passengers.
                  </div>
                </div>

                <div className="text-xs md:text-sm text-slate-650 space-y-2 font-medium">
                  <h5 className="font-bold text-sky-700">Bank Transfer Details</h5>
                  <p className="leading-relaxed">
                    Please transfer the exact amount to the following Bank of Maldives (BML) account:
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-slate-700 font-mono text-xs shadow-sm">
                    <div>Bank: <strong>Bank of Maldives (MVR)</strong></div>
                    <div>Account Number: <strong>7730000123456</strong></div>
                    <div>Name: <strong>FeridhooTours Pvt Ltd</strong></div>
                  </div>
                </div>

                {receiptSimulated ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-250 rounded-xl">
                      <div className="flex items-center gap-2.5 text-emerald-700 font-bold font-sans">
                        {receiptData?.startsWith('data:image/') ? (
                          <img src={receiptData} alt="Preview" className="w-10 h-10 object-cover rounded border border-emerald-200" />
                        ) : (
                          <ImageIcon size={18} className="text-emerald-600" />
                        )}
                        <span className="text-sm">{receiptFileName}</span>
                      </div>
                      <button 
                        onClick={handleDeleteReceipt} 
                        className="text-rose-605 hover:text-rose-500 text-sm font-bold cursor-pointer transition"
                      >
                        Delete
                      </button>
                    </div>
                    {receiptData?.startsWith('data:image/') && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[30vh] flex items-center justify-center bg-white p-2">
                        <img src={receiptData} alt="Slip Preview" className="max-w-full max-h-[25vh] object-contain rounded-lg shadow-sm" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className={`w-full p-6 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center gap-2 text-slate-505 transition shadow-sm bg-white ${
                      isDragging ? 'border-sky-505 bg-sky-50/50' : 'border-slate-200 hover:border-sky-500/40 hover:bg-slate-50'
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
                    <Upload size={24} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">Upload Bank Transfer Slip</span>
                    <span className="text-xs">Drag & drop or tap to select slip file</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            <div className="border-t border-slate-200 pt-5 space-y-2.5">
              <div className="flex justify-between text-sm text-slate-500 font-medium">
                <span>Subtotal:</span>
                <span>${subtotalAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-750 font-bold">
                  <span>Discount Applied:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-extrabold text-slate-900 border-t border-slate-100 pt-2.5">
                <span>Total Amount:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-black">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-600/25 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              onClick={handlePayClick}
              disabled={isProcessing || (paymentMethod === 'bank_transfer' && !receiptSimulated)}
            >
              {isProcessing 
                ? 'Processing Order...' 
                : paymentMethod === 'card' 
                  ? 'Confirm & Pay' 
                  : 'Submit Transfer Slip'}
            </button>
          </div>
        )}

        {/* Confirmation Screen / Airplane Boarding Passes */}
        {step === 'confirmation' && selectedSchedule && (
          <div id="printable-section" className="space-y-6 text-center animate-fade-in py-2">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-slate-900">Order Confirmed!</h2>
              {paymentMethod === 'card' ? (
                <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto font-medium">
                  Payment processed successfully. Boarding passes have been issued. Present the tickets below at the ferry jetty gate.
                </p>
              ) : (
                <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto font-medium">
                  Transfer slip uploaded successfully. The admin operator is reviewing your booking. You can check status anytime in <strong className="text-sky-600 font-bold">My Bookings</strong>.
                </p>
              )}
            </div>

            {/* Boarding Passes Stack (airplane ticket layouts) */}
            <div className="space-y-6 pt-2">
              {passengers.map((passenger, idx) => {
                const seat = selectedSeats.find(s => s.id === passenger.seatId);
                const classLabel = seat?.class || 'Economy';
                
                return (
                  <div 
                    key={idx} 
                    className="ticket-container bg-white border border-slate-250 rounded-2xl shadow-xl flex flex-col md:flex-row relative text-left"
                  >
                    <div className="ticket-cutout-left hidden md:block" />
                    <div className="ticket-cutout-right hidden md:block" />
                    
                    {/* Main Boarding Pass Body */}
                    <div className="flex-[3] p-5 md:p-6 border-b md:border-b-0 md:border-r border-dashed border-slate-200 space-y-4">
                      {/* Logo and Ticket Header */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Ticket size={16} className="text-sky-600" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-800">FeridhooTours Boarding Pass</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          classLabel === 'VIP' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : classLabel === 'Premium' 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-slate-50 text-slate-650 border border-slate-200'
                        }`}>
                          {classLabel} Class
                        </span>
                      </div>

                      {/* Vessel Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">VESSEL</span>
                          <strong className="text-slate-800 font-bold">{selectedSchedule.vesselName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">DEPARTURE</span>
                          <strong className="text-slate-800 font-bold">{selectedSchedule.departureTime}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">JETTY GATE</span>
                          <strong className="text-slate-800 font-bold">
                            {selectedSchedule.routeFrom === 'MLE' ? 'Hulhumalé Terminal' : 'Main Island Jetty'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider">BOOKING REF</span>
                          <strong className="text-sky-600 font-bold">{latestBookingRef}</strong>
                        </div>
                      </div>

                      {/* Route Banner */}
                      <div className="space-y-1.5">
                        <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-slate-150 text-slate-700">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-sky-600" />
                            <span className="font-bold">{selectedSchedule.routeFrom}</span>
                          </div>
                          <div className="flex-1 border-t border-dashed border-slate-200 mx-3" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{selectedSchedule.routeTo}</span>
                            <MapPin size={12} className="text-sky-600" />
                          </div>
                        </div>
                        {selectedSchedule.stops && selectedSchedule.stops.length > 0 && (
                          <div className="text-[9px] text-slate-550 font-bold bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5 flex-wrap">
                            <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Stops:</span>
                            {selectedSchedule.stops.map((stopId, i) => (
                              <React.Fragment key={stopId}>
                                <span>{locations.find(l => l.id === stopId)?.name || stopId}</span>
                                {i < (selectedSchedule.stops?.length || 0) - 1 && <span className="text-slate-300">→</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Passenger Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-slate-400 block text-[9px] tracking-wider font-bold">PASSENGER NAME</span>
                          <strong className="text-slate-800 font-bold uppercase">{passenger.name}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] tracking-wider font-bold">PASSPORT / ID</span>
                          <strong className="text-slate-700">{passenger.idNumber}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] tracking-wider font-bold">AGE / GENDER</span>
                          <strong className="text-slate-700">{passenger.age} years ({passenger.gender})</strong>
                        </div>
                      </div>
                    </div>

                    {/* Tear-Off Ticket Stub */}
                    <div className="flex-[1.1] bg-slate-50 p-5 flex flex-row md:flex-col justify-between items-center gap-4 text-xs">
                      {paymentMethod === 'card' ? (
                        <>
                          <div className="text-left md:text-center space-y-1">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">BOARDING SEAT</span>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-650 to-indigo-650 font-display">
                              {passenger.seatId.replace('S-', '')}
                            </div>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">GATE CLOSE 10M PRIOR</span>
                          </div>
                          
                          {/* QR Code */}
                          <div className="flex flex-col items-center">
                            <QRCodeImage value={`${window.location.origin}/?pnr=${latestBookingRef}`} size={90} />
                            <a 
                              href={`${window.location.origin}/?pnr=${latestBookingRef}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-sky-600 hover:underline font-mono font-bold block mt-1"
                              title="Click to view digital ticket link"
                            >
                              ?pnr={latestBookingRef}
                            </a>
                          </div>
                          
                          {/* Barcode strip on side */}
                          <div className="w-full hidden md:block">
                            {renderBarcode()}
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex flex-col justify-center items-center py-4 text-center space-y-2">
                          <AlertCircle size={28} className="text-amber-500 animate-pulse shrink-0" />
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Receipt Pending Verification</span>
                          <p className="text-[9px] text-slate-500 leading-normal max-w-[120px] mx-auto font-medium">
                            QR & barcode boarding pass unlocks after admin slip approval.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold py-3.5 rounded-xl transition cursor-pointer text-sm" 
              onClick={onCancel}
            >
              Return to Search
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
