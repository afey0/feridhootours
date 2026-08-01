import React, { useState } from 'react';
import { Ticket, Trash2, ArrowLeft, RefreshCw, Eye, Anchor, ClipboardList, Info, AlertTriangle, Printer, CheckCircle, Upload, Image as ImageIcon, X, FileText } from 'lucide-react';
import { usePlatformStore } from '../store/usePlatformStore';
import type { Booking } from '../data/mockData';
import { QRCodeImage } from './QRCodeImage';
import { calculateRefund } from '../utils/refundPolicy';

interface Props {
  onBack: () => void;
  user?: any;
}

export const MyBookings: React.FC<Props> = ({ onBack, user }) => {
  const { bookings, updateBookingStatus, processRefund, showAlert } = usePlatformStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [newReceiptUrl, setNewReceiptUrl] = useState<string>('');
  const [reuploadingId, setReuploadingId] = useState<string | null>(null);
  const [reuploadFileName, setReuploadFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewingSlipUrl, setPreviewingSlipUrl] = useState<string | null>(null);
  const [refundBankName, setRefundBankName] = useState('Bank of Maldives (BML)');
  const [refundAccountName, setRefundAccountName] = useState('');
  const [refundAccountNumber, setRefundAccountNumber] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter bookings based on role
  const userBookings = React.useMemo(() => {
    if (!user) return bookings;
    if (user.role === 'agency') {
      // Show bookings created by this agency
      return bookings.filter(b => b.agencyId === user.id);
    }
    // Show passenger bookings matching user ID, email, or demo mock bookings
    return bookings.filter(b => 
      b.userId === user.id || 
      (b.passengerEmail && b.passengerEmail.toLowerCase() === user.email?.toLowerCase()) ||
      (!b.agencyId && (!b.userId || b.userId === 'usr-123'))
    );
  }, [bookings, user]);

  React.useEffect(() => {
    if (selectedBooking) {
      const updated = userBookings.find(b => b.id === selectedBooking.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedBooking)) {
        setSelectedBooking(updated);
      }
    } else if (userBookings.length > 0) {
      setSelectedBooking(userBookings[0]);
    }
  }, [userBookings]);

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'in_checkout':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200" title="Seat locked in active checkout session">🔒 Seat Locked (In Checkout)</span>;
      case 'verified':
        return <span className="status-badge verified">Verified</span>;
      case 'pending_verification':
        return <span className="status-badge pending">Pending</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return null;
    }
  };





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
      setReuploadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReuploadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReuploadReceipt = (bookingId: string) => {
    updateBookingStatus(bookingId, 'pending_verification', undefined, newReceiptUrl);
    setReuploadingId(null);
    setNewReceiptUrl('');
    setReuploadFileName('');
    showAlert('New transfer slip receipt uploaded. Status updated to Pending Verification.', 'Receipt Re-uploaded', 'success');
  };

  const renderBarcode = () => {
    return (
      <div className="flex items-center gap-[2px] h-9 w-full overflow-hidden opacity-90 mt-1">
        {[2, 1, 3, 2, 1, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 4, 2].map((w, i) => (
          <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }} />
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-200 p-6 md:p-8 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 no-print">
        <button 
          onClick={onBack} 
          className="bg-transparent border border-slate-200 hover:bg-slate-50 cursor-pointer p-2.5 rounded-xl text-slate-700 transition duration-200 flex items-center justify-center no-print"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 flex items-center gap-2">
            <ClipboardList className="text-sky-600" />
            {user?.role === 'agency' ? 'Agency Manifest Log' : 'My Bookings'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {user?.role === 'agency' 
              ? `Manage and monitor booking entries for ${user.name}` 
              : 'View boarding passes, track bank receipts, and manage your reservations.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Manifest table / Booking list */}
        <div className="flex-[1.2] space-y-4 no-print">
          {userBookings.length === 0 ? (
            <div className="text-center py-12 px-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500">
              <Ticket size={48} className="opacity-20 mx-auto mb-4 text-slate-400" />
              <p className="text-sm font-medium">No reservations found. Go back and select schedules to book seats.</p>
            </div>
          ) : user?.role === 'agency' ? (
            /* Agency Specific Spreadsheet-style manifest list */
            <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Traveler / Client</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Fare</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userBookings.map(b => (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-slate-50 cursor-pointer transition ${selectedBooking?.id === b.id ? 'bg-sky-50' : ''}`}
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="py-3 px-4 font-bold text-sky-600">{b.id}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium max-w-[120px] truncate">
                        {b.passengers[0]?.name || 'N/A'} {b.passengers.length > 1 ? `+${b.passengers.length - 1}` : ''}
                      </td>
                      <td className="py-3 px-4 text-slate-650">{b.routeFrom} → {b.routeTo}</td>
                      <td className="py-3 px-4 text-slate-500">{b.departureTime}</td>
                      <td className="py-3 px-4 text-right text-slate-800 font-bold">${b.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(b.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Regular Passenger card list */
            <div className="space-y-3.5">
              {userBookings.map(b => (
                <div 
                  key={b.id} 
                  className={`glass-panel p-5 rounded-xl cursor-pointer border transition duration-205 flex flex-col gap-3 ${
                    selectedBooking?.id === b.id 
                      ? 'border-sky-400 bg-sky-50/40' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Reference: <strong className="text-sky-600">{b.id}</strong></span>
                    {getStatusBadge(b.status)}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{b.vesselName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{b.routeFrom} → {b.routeTo} | {b.departureTime}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">${b.totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{b.selectedSeatIds.length} seat(s)</span>
                    {b.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                          setShowCancelConfirm(b.id);
                        }}
                        title="Cancel Ticket Reservation & Release Seat"
                        className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        Cancel & Refund
                      </button>

                    ) : (
                      <span className="text-[10px] text-rose-600 font-extrabold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {b.refundPercentage ?? 100}% Refunded
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Reservation details & Boarding passes viewer */}
        <div className="flex-[1.8]">
          {selectedBooking ? (
            <div id="printable-section" className="glass-panel bg-slate-50 border border-slate-200 rounded-xl p-5 md:p-6 space-y-6 animate-fade-in text-slate-850">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-850">Booking Details & Invoices</h3>
                  <span className="text-xs text-slate-500 font-medium">Created: {new Date(selectedBooking.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  {getStatusBadge(selectedBooking.status)}
                  <span className="text-xs font-bold text-sky-600">REF: {selectedBooking.id}</span>
                </div>
              </div>

              {/* Journey Metadata card */}
              <div className="grid grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-xl text-xs shadow-sm">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Vessel Name</span>
                  <strong className="text-slate-800 text-sm font-bold flex items-center gap-1.5">
                    <Anchor size={14} className="text-sky-600" /> {selectedBooking.vesselName}
                  </strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">{selectedBooking.vesselType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[9px] tracking-wider mb-0.5">Route Plan</span>
                  <strong className="text-slate-800 text-sm font-bold">{selectedBooking.routeFrom} → {selectedBooking.routeTo}</strong>
                  <span className="text-slate-500 text-[10px] block mt-0.5">Time: {selectedBooking.departureTime}</span>
                </div>
              </div>

              {/* Passengers manifest List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-sm">Traveler Manifest</h4>
                <div className="space-y-2.5">
                  {selectedBooking.passengers.map((p, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-slate-150 rounded-xl p-3.5 flex justify-between items-center text-xs shadow-sm"
                    >
                      <div>
                        <strong className="text-slate-850 text-sm font-bold uppercase">{p.name}</strong> 
                        <span className="text-slate-500 font-medium ml-1.5">({p.gender}, Age {p.age})</span>
                        <div className="text-slate-500 text-[10px] mt-0.5 font-mono">Passport / ID: {p.idNumber}</div>
                        {p.specialRequest && (
                          <div className="text-amber-600 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                            <Info size={10} /> Request: {p.specialRequest}
                          </div>
                        )}
                      </div>
                      <span className="bg-sky-50 text-sky-700 font-bold px-3 py-1.5 rounded-lg border border-sky-200 text-xs shrink-0">
                        Seat {p.seatId.replace('S-', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice calculation & Receipt Hold Banner */}
              <div className="space-y-3">
                {selectedBooking.status === 'pending_verification' && (
                  <div>
                    {(() => {
                      const elapsedMs = Date.now() - new Date(selectedBooking.createdAt).getTime();
                      const remainingMs = Math.max(0, 10 * 60 * 1000 - elapsedMs);
                      const mins = Math.floor(remainingMs / 60000);
                      const secs = Math.floor((remainingMs % 60000) / 1000);

                      if (selectedBooking.receiptImage) {
                        return (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                            <span>Bank transfer slip uploaded! Seat hold is secured while operator verifies payment.</span>
                          </div>
                        );
                      }

                      return (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 font-black text-amber-950">
                              <span>⏱️ 10-Minute Seat Hold Active</span>
                            </div>
                            <span className="bg-amber-200 text-amber-900 font-mono font-bold px-2.5 py-0.5 rounded text-xs animate-pulse">
                              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} remaining
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-850 leading-relaxed font-medium">
                            Please upload your bank transfer slip before the timer expires to secure your seats. If no slip is uploaded, the hold expires automatically and seats will be released for other travelers.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <h4 className="font-bold text-slate-700 text-sm">Payment breakdown</h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs shadow-sm">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Payment Channel:</span>
                    <span className="uppercase font-bold text-slate-800">{selectedBooking.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  {selectedBooking.paymentMethod === 'bank_transfer' && (
                    <div className="flex justify-between items-center text-slate-500 font-medium pt-1">
                      <span>Transfer Slip:</span>
                      {selectedBooking.receiptImage ? (
                        <button 
                          className="text-sky-605 hover:text-sky-500 font-bold underline cursor-pointer"
                          onClick={() => setPreviewingSlipUrl(selectedBooking.receiptImage || null)}
                        >
                          View Uploaded Slip
                        </button>
                      ) : (
                        <button
                          onClick={() => setReuploadingId(selectedBooking.id)}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer transition flex items-center gap-1 shadow-sm"
                        >
                          <Upload size={12} /> Upload Slip Now
                        </button>
                      )}
                    </div>
                  )}
                  {selectedBooking.discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Discount ({selectedBooking.promoCodeUsed}):</span>
                      <span>-${selectedBooking.discountApplied.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-sm text-slate-800">
                    <span>Amount Transacted:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 font-black">
                      ${selectedBooking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Renders Boarding passes if verified */}
              {selectedBooking.status === 'verified' ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-600 text-sm flex items-center gap-1.5">
                      <CheckCircle size={16} /> Boarding Passes Issued
                    </h4>
                    <button 
                      onClick={() => window.print()}
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Printer size={12} /> Print All
                    </button>
                  </div>
                  
                  {selectedBooking.passengers.map((passenger, idx) => {
                    const seatId = passenger.seatId;
                    
                    return (
                      <div 
                        key={idx} 
                        className="ticket-container bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row relative text-left overflow-hidden shadow-md animate-fade-in"
                      >
                        <div className="ticket-cutout-left hidden md:block" />
                        <div className="ticket-cutout-right hidden md:block" />
                        
                        <div className="flex-[3] p-4 md:p-5 border-b md:border-b-0 md:border-r border-dashed border-slate-200 space-y-3.5">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">BOARDING TERMINAL PASS</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                              Verified
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-medium">
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Vessel</span>
                              <strong className="text-slate-800">{selectedBooking.vesselName}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Departure</span>
                              <strong className="text-slate-800">{selectedBooking.departureTime}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Jetty Gate</span>
                              <strong className="text-slate-800">
                                {selectedBooking.routeFrom === 'MLE' ? 'Hulhumalé Term.' : 'Island Jetty'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase tracking-wider font-bold">Ref ID</span>
                              <strong className="text-sky-600">{selectedBooking.id}</strong>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">PASSENGER</span>
                              <strong className="text-slate-850 uppercase font-bold">{passenger.name}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] font-bold">PASSPORT / ID</span>
                              <strong className="text-slate-700">{passenger.idNumber}</strong>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-[1.1] bg-slate-50 p-4 flex flex-row md:flex-col justify-between items-center gap-3">
                          <div className="text-left md:text-center">
                            <span className="text-slate-400 block text-[8px] uppercase font-bold">SEAT</span>
                            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-650 to-indigo-650 font-display">
                              {seatId.replace('S-', '')}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <QRCodeImage value={`${window.location.origin}/?pnr=${selectedBooking.id}`} size={90} />
                            <a 
                              href={`${window.location.origin}/?pnr=${selectedBooking.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-sky-600 hover:underline font-mono font-bold block mt-1"
                              title="Click to view digital ticket link"
                            >
                              ?pnr={selectedBooking.id}
                            </a>
                          </div>
                          
                          <div className="w-full hidden md:block">
                            {renderBarcode()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Unverified pending payment view */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 text-xs text-amber-700 space-y-2.5 font-medium shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle size={16} />
                      <span>Boarding Passes Locked</span>
                    </div>
                    <p className="text-slate-650 leading-normal">
                      This reservation is pending transfer verification by the admin operator. Your QR code tickets will unlock immediately after approval.
                    </p>
                  </div>

                  {/* Re-upload receipt if rejected or pending verification */}
                  {selectedBooking.paymentMethod === 'bank_transfer' && (selectedBooking.status === 'rejected' || selectedBooking.status === 'pending_verification') && (
                    <div className={`${selectedBooking.status === 'rejected' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-slate-50 border border-slate-200 text-slate-750'} rounded-xl p-4.5 space-y-3.5 text-xs shadow-sm font-medium`}>
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle size={16} />
                        <span>{selectedBooking.status === 'rejected' ? 'Receipt Rejected' : 'Verification Queue'}</span>
                      </div>
                      {selectedBooking.status === 'rejected' ? (
                        <p className="text-slate-600">
                          Reason: <strong className="text-rose-955 font-bold">{selectedBooking.rejectionReason || 'blurry receipt or name mismatch.'}</strong>
                        </p>
                      ) : (
                        <p className="text-slate-650 leading-normal">
                          You can update or upload your transfer slip details below to help expedite operator verification.
                        </p>
                      )}
                      
                      {reuploadingId === selectedBooking.id ? (
                        <div className="space-y-3">
                          {newReceiptUrl ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-emerald-800 font-semibold text-[11px] shadow-inner">
                                <div className="flex items-center gap-2">
                                  {newReceiptUrl.startsWith('data:image/') ? (
                                    <img src={newReceiptUrl} alt="Preview" className="w-8 h-8 object-cover rounded border border-emerald-200" />
                                  ) : (
                                    <ImageIcon size={16} className="text-emerald-600" />
                                  )}
                                  <span>{reuploadFileName}</span>
                                </div>
                                <button 
                                  onClick={() => { setNewReceiptUrl(''); setReuploadFileName(''); }}
                                  className="text-rose-605 hover:text-rose-500 font-bold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                              {newReceiptUrl.startsWith('data:image/') && (
                                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[22vh] flex items-center justify-center bg-white p-2">
                                  <img src={newReceiptUrl} alt="Receipt Preview" className="max-w-full max-h-[18vh] object-contain rounded-lg shadow-sm" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div 
                              className={`w-full p-4 border border-dashed rounded-xl cursor-pointer flex flex-col items-center gap-1.5 text-slate-505 transition shadow-sm text-xs font-semibold bg-white ${
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
                              <Upload size={18} className="text-slate-400" />
                              <span>Choose Transfer Slip File</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button 
                              className={`font-bold px-4 py-2 rounded-lg cursor-pointer text-xs ${
                                newReceiptUrl 
                                  ? 'bg-sky-500 hover:bg-sky-600 text-white' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                              }`}
                              disabled={!newReceiptUrl}
                              onClick={() => handleReuploadReceipt(selectedBooking.id)}
                            >
                              Submit Slip
                            </button>
                            <button 
                              className="bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-650 px-4 py-2 rounded-lg cursor-pointer font-bold text-xs"
                              onClick={() => { setReuploadingId(null); setNewReceiptUrl(''); setReuploadFileName(''); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs"
                          onClick={() => setReuploadingId(selectedBooking.id)}
                        >
                          <RefreshCw size={14} /> {selectedBooking.receiptImage ? 'Update Transfer Slip' : 'Upload Transfer Slip'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rule-Based Refund & Cancellation Management */}
              {(() => {
                const refundCalc = calculateRefund(selectedBooking);
                return selectedBooking.status !== 'cancelled' ? (
                  <div className="border-t border-slate-200 pt-4">
                    {showCancelConfirm === selectedBooking.id ? (
                      <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 text-xs space-y-4 font-medium animate-fade-in text-slate-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-rose-700 text-sm flex items-center gap-1.5">
                              <AlertTriangle size={16} /> Manual Bank Refund Request
                            </h4>
                            <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                              Calculated based on departure timing rules ({refundCalc.hoursUntilDeparture}h remaining).
                            </p>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${refundCalc.badgeClass}`}>
                            {refundCalc.policyTier}
                          </span>
                        </div>

                        {/* Breakdown Statement */}
                        <div className="bg-white border border-rose-150 rounded-xl p-4 space-y-2 text-xs shadow-sm">
                          <div className="flex justify-between text-slate-600">
                            <span>Total Paid Fare:</span>
                            <span className="font-bold text-slate-800">${selectedBooking.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-semibold">
                            <span>Cancellation Processing Fee ({100 - refundCalc.refundPercentage}% penalty):</span>
                            <span>-${refundCalc.cancellationFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
                            <span>Net Refund Credited to Bank Account:</span>
                            <span className="text-emerald-600 font-extrabold">${refundCalc.refundAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Bank Details Inputs */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Your Bank Payout Account</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Bank Name</label>
                              <input 
                                type="text"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500"
                                placeholder="e.g. Bank of Maldives (BML)"
                                value={refundBankName}
                                onChange={(e) => setRefundBankName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Account Holder Name</label>
                              <input 
                                type="text"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500"
                                placeholder="Full name on bank account"
                                value={refundAccountName}
                                onChange={(e) => setRefundAccountName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1 sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Account Number / IBAN</label>
                              <input 
                                type="text"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500 font-mono"
                                placeholder="7730000123456"
                                value={refundAccountNumber}
                                onChange={(e) => setRefundAccountNumber(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 bg-white/80 border border-rose-100 p-2.5 rounded-lg leading-relaxed">
                          💡 <strong>Manual Process:</strong> Our finance team will transfer <strong>${refundCalc.refundAmount.toFixed(2)}</strong> to your bank account and upload proof of money transfer.
                        </p>

                        <div className="flex gap-2 pt-1">
                          <button 
                            type="button"
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs transition shadow-md shadow-rose-600/10"
                            onClick={() => {
                              if (!refundAccountName.trim() || !refundAccountNumber.trim()) {
                                showAlert('Please provide bank account holder name and account number for manual refund payout.', 'Missing Bank Details', 'error');
                                return;
                              }
                              const res = processRefund(selectedBooking.id, {
                                bankName: refundBankName,
                                accountName: refundAccountName,
                                accountNumber: refundAccountNumber
                              });
                              if (res.success) {
                                showAlert(res.message, 'Refund Logged', 'success');
                                setShowCancelConfirm(null);
                              } else {
                                showAlert(res.message, 'Cancellation Failed', 'error');
                              }
                            }}
                          >
                            Submit Manual Refund Request (${refundCalc.refundAmount.toFixed(2)})
                          </button>
                          <button 
                            type="button"
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl cursor-pointer font-bold text-xs transition"
                            onClick={() => setShowCancelConfirm(null)}
                          >
                            Keep Reservation
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs transition duration-200 shadow-sm"
                        onClick={() => setShowCancelConfirm(selectedBooking.id)}
                      >
                        <Trash2 size={14} /> Cancel & Request Manual Refund
                      </button>
                    )}
                  </div>
                ) : (
                  /* If already cancelled, show itemized refund receipt and payout slip button */
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs space-y-3 mt-4">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span className="flex items-center gap-1.5 text-rose-600 font-extrabold">
                        <X size={14} /> Reservation Cancelled
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${
                        selectedBooking.refundStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {selectedBooking.refundStatus === 'completed' ? 'Refund Paid & Slip Uploaded' : 'Refund Pending Manual Transfer'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Refund Amount</span>
                        <strong className="text-emerald-700 font-extrabold">${(selectedBooking.refundAmount || 0).toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Fee Deducted</span>
                        <strong className="text-rose-600 font-bold">${(selectedBooking.cancellationFee || 0).toFixed(2)}</strong>
                      </div>
                    </div>

                    {selectedBooking.refundBankName && (
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1">
                        <div className="font-bold text-slate-700">Bank Payout Account:</div>
                        <div className="text-slate-500 font-medium">{selectedBooking.refundBankName} · Account: {selectedBooking.refundAccountNumber} ({selectedBooking.refundAccountName})</div>
                      </div>
                    )}

                    {selectedBooking.refundReceiptImage ? (
                      <button
                        type="button"
                        onClick={() => setPreviewingSlipUrl(selectedBooking.refundReceiptImage!)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-xs shadow-sm"
                      >
                        <ImageIcon size={14} /> View Money Transfer Receipt Slip
                      </button>
                    ) : (
                      <p className="text-[10px] text-amber-600 italic">⏳ Manual bank transfer in progress by operator finance team.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[360px]">
              <Eye size={48} className="opacity-15 mb-4 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-800 mb-1.5 font-display">Select a Booking</h3>
              <p className="text-xs max-w-xs leading-relaxed text-slate-500 font-medium">
                Choose a reservation from the manifest on the left to verify invoices, download boarding passes, or manage cancellations.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* SLIP PREVIEW MODAL */}
      {previewingSlipUrl && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1300 }}>
          <div className="glass-panel-strong rounded-2xl w-full max-w-xl p-6 relative shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto flex flex-col items-center">
            <button 
              onClick={() => setPreviewingSlipUrl(null)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 cursor-pointer transition"
            >
              <X size={22} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4 self-start">Uploaded Transfer Slip</h3>
            {previewingSlipUrl.startsWith('data:image/') ? (
              <img src={previewingSlipUrl} alt="Transfer Slip" className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200 shadow" />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-100 rounded-xl border border-slate-205 w-full text-slate-555">
                <FileText size={48} className="text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-750 font-sans">Document Uploaded</span>
                <span className="text-xs mt-1 font-sans">This is a PDF or other non-image file.</span>
                <a href={previewingSlipUrl} download="transfer_slip" className="mt-4 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg text-xs font-sans">
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
