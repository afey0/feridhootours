import React, { useState } from 'react';
import { Ticket, MapPin, Anchor, AlertTriangle, X, Copy, Check, Printer, Trash2, ArrowLeft } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import { QRCodeImage } from './QRCodeImage';
import { calculateRefund } from '../utils/refundPolicy';

interface PublicTicketModalProps {
  pnr: string;
  onClose: () => void;
}

export const PublicTicketModal: React.FC<PublicTicketModalProps> = ({ pnr, onClose }) => {
  const { bookings, locations, processRefund, showAlert } = usePlatformStore();
  const [copied, setCopied] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const booking = bookings.find(b => b.id.toUpperCase() === pnr.toUpperCase());
  const ticketUrl = `${window.location.origin}/?pnr=${pnr.toUpperCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketUrl);
    setCopied(true);
    showAlert('Boarding ticket link copied to clipboard.', 'Link Copied', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Verified Ticket</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Verification Pending</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">{status}</span>;
    }
  };

  const fromLocation = locations.find(l => l.id === booking?.routeFrom)?.name || booking?.routeFrom || 'Departure Jetty';
  const toLocation = locations.find(l => l.id === booking?.routeTo)?.name || booking?.routeTo || 'Arrival Jetty';

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 pt-2 pb-8 text-left">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between no-print">
        <button
          type="button"
          onClick={onClose}
          className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 transition cursor-pointer text-xs"
        >
          <ArrowLeft size={16} className="text-sky-600" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Boarding Pass View</span>
      </div>

      <div id="printable-section" className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl border border-slate-150 p-6 md:p-8 relative text-left text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
              <Ticket size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Digital Boarding Ticket</h2>
              <p className="text-xs text-slate-500 font-medium">Scannable official pass & verification record.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg no-print"
          >
            <X size={22} />
          </button>
        </div>

        {!booking ? (
          <div className="text-center py-12 px-4 space-y-4">
            <AlertTriangle size={48} className="text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Booking Reference Not Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto font-medium">
              No active reservation exists for PNR <strong>{pnr}</strong>. Please check your reference code or contact ferry logistics support.
            </p>
            <button 
              onClick={onClose}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer no-print"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Top Status & PNR Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Booking PNR</span>
                <span className="text-2xl font-black text-sky-600 font-mono tracking-wider">{booking.id}</span>
              </div>
              <div>{getStatusBadge(booking.status)}</div>
            </div>

            {/* Vessel & Route Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">VESSEL LOGISTICS</span>
                <div className="flex items-center gap-2">
                  <Anchor size={18} className="text-sky-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{booking.vesselName}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{booking.vesselType}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DEPARTURE SCHEDULE</span>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{booking.departureTime}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Estimated Arrival: {booking.arrivalTime}</div>
                </div>
              </div>

              <div className="sm:col-span-2 border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-sky-600" />
                  <span>{fromLocation}</span>
                </div>
                <span className="text-slate-300 font-normal">──────→</span>
                <div className="flex items-center gap-1.5">
                  <span>{toLocation}</span>
                  <MapPin size={14} className="text-sky-600" />
                </div>
              </div>
            </div>

            {/* Passenger & Seats List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PASSENGER MANIFEST & SEATS</span>
              <div className="space-y-2">
                {booking.passengers.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">ID: {p.idNumber} · {p.gender}, {p.age} yrs</div>
                    </div>
                    <div className="text-right">
                      <span className="bg-sky-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-xs tracking-wide">
                        Seat {p.seatId.replace('S-', '')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scannable Real QR Code & Share Link Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <QRCodeImage value={ticketUrl} size={140} className="shadow-md" />
              
              <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Scannable QR Code</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    Scan with any phone camera to instantly view and verify ticket details online.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 max-w-full">
                  <span className="text-[11px] font-mono text-sky-700 truncate font-semibold">{ticketUrl}</span>
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition flex items-center gap-1 cursor-pointer no-print"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rule-Based Refund Section */}
            {(() => {
              const refundCalc = calculateRefund(booking);
              return booking.status !== 'cancelled' ? (
                <div className="border-t border-slate-100 pt-4 no-print">
                  {showRefundConfirm ? (
                    <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 text-xs space-y-4 font-medium animate-fade-in text-slate-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-rose-700 text-sm flex items-center gap-1.5">
                            <AlertTriangle size={16} /> Ticket Cancellation & Refund
                          </h4>
                          <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                            Calculated based on departure timing rules ({refundCalc.hoursUntilDeparture}h remaining).
                          </p>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${refundCalc.badgeClass}`}>
                          {refundCalc.policyTier}
                        </span>
                      </div>

                      <div className="bg-white border border-rose-150 rounded-xl p-4 space-y-2 text-xs shadow-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>Total Paid Fare:</span>
                          <span className="font-bold text-slate-800">${booking.totalAmount.toFixed(2)}</span>
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
                            const res = processRefund(booking.id);
                            if (res.success) {
                              showAlert(res.message, 'Refund Processed', 'success');
                              setShowRefundConfirm(false);
                            } else {
                              showAlert(res.message, 'Cancellation Failed', 'error');
                            }
                          }}
                        >
                          Confirm & Refund (${refundCalc.refundAmount.toFixed(2)})
                        </button>
                        <button 
                          type="button"
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer font-bold text-xs transition"
                          onClick={() => setShowRefundConfirm(false)}
                        >
                          Keep Ticket
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs transition duration-200 shadow-sm"
                      onClick={() => setShowRefundConfirm(true)}
                    >
                      <Trash2 size={14} /> Cancel & Refund Ticket
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs space-y-2 no-print">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-rose-600 font-extrabold">
                      <X size={14} /> Ticket Cancelled & Refunded
                    </span>
                    <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-black uppercase">
                      {booking.refundPercentage ?? 100}% Refunded
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Refund Credited</span>
                      <strong className="text-emerald-700 font-extrabold">${(booking.refundAmount || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Cancellation Fee</span>
                      <strong className="text-rose-600 font-bold">${(booking.cancellationFee || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 no-print">
              <button 
                type="button"
                onClick={() => window.print()}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={16} /> Print Ticket
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-sky-600/10"
              >
                Close Ticket View
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
