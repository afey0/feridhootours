import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ship, AlertTriangle, ArrowLeft, Plus, CheckCircle, XCircle, FileText, X, CreditCard, DollarSign, Layers, Mail, Key, Trash2, ClipboardList, AlertCircle, ShieldAlert, Search, Download, Eye, Clock, List, Code, Check, Lock, Pencil, Unlock, Wrench, Armchair } from 'lucide-react';

import { usePlatformStore } from '../store/usePlatformStore';
import { useAuthStore, getCurrentAuthUser } from '../store/useAuthStore';
import { SeatMap } from './SeatMap';
import type { Seat, Booking, Passenger } from '../data/mockData';
import type { AuditLogEntry } from '../types/audit';
import { getAuditHeadline, getAuditReadableDiffs } from '../utils/auditFormatter';

// Utility to parse custom row input string (e.g. "1-2, 5") into a set of row numbers
const parseRowsString = (input: string, maxRow: number): Set<number> => {
  const result = new Set<number>();
  if (!input || !input.trim()) return result;
  
  const parts = input.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxRow, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          result.add(i);
        }
      }
    } else {
      const row = parseInt(trimmed, 10);
      if (!isNaN(row) && row >= 1 && row <= maxRow) {
        result.add(row);
      }
    }
  }
  return result;
};

// Utility to format an array of row numbers into a range string (e.g. [1, 2, 5] -> "1-2, 5")
const formatRowsString = (rows: number[]): string => {
  if (!rows || rows.length === 0) return '';
  const sorted = Array.from(new Set(rows)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
};

interface AdminDashboardProps {
  initialTab?: 'dashboard' | 'vessels' | 'fleet' | 'verify' | 'bookings' | 'locations' | 'reports' | 'emails' | 'users' | 'audit';
  onTabChange?: (tab: 'dashboard' | 'vessels' | 'fleet' | 'verify' | 'bookings' | 'locations' | 'reports' | 'emails' | 'users' | 'audit') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab, onTabChange }) => {
  const { 
    schedules, 
    decks, 
    bookings,
    locations,
    emailConfig,
    sentEmails,
    adminLockSeats, 
    adminUnlockSeats, 
    bookSeats,
    addSchedule,
    editSchedule,
    removeSchedule,
    addLocation,
    removeLocation,
    showAlert,
    updateBookingStatus,
    processRefund,
    completeRefundPayout,
    updateBooking,
    removeBooking,
    addBooking,
    updateEmailConfig,
    clearEmailLogs,
    updateSeatClass,
    addVessel,
    editVessel,
    removeVessel,
    vessels,
    auditLogs
  } = usePlatformStore();

  const {
    users: authUsers,
    user: currentAuthUser,
    adminAddUser,
    adminDeleteUser,
    adminUpdateUser
  } = useAuthStore();

  const currentUser = currentAuthUser || getCurrentAuthUser();

  const [activeTab, setActiveTabState] = useState<'dashboard' | 'vessels' | 'fleet' | 'verify' | 'bookings' | 'locations' | 'reports' | 'emails' | 'users' | 'audit'>(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const setActiveTab = (tab: 'dashboard' | 'vessels' | 'fleet' | 'verify' | 'bookings' | 'locations' | 'reports' | 'emails' | 'users' | 'audit') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');
  const [auditFilterEntity, setAuditFilterEntity] = useState<string>('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditViewMode, setAuditViewMode] = useState<'table' | 'timeline'>('table');
  const [inspectingAuditLog, setInspectingAuditLog] = useState<AuditLogEntry | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'readable' | 'json'>('readable');
  const [previewingSlipUrl, setPreviewingSlipUrl] = useState<string | null>(null);
  const [managingScheduleId, setManagingScheduleId] = useState<string | null>(null);
  const [adminSelectedSeats, setAdminSelectedSeats] = useState<Seat[]>([]);
  const [previewingEmail, setPreviewingEmail] = useState<any | null>(null);
  const [uploadingRefundBookingId, setUploadingRefundBookingId] = useState<string | null>(null);
  const [refundProofUrl, setRefundProofUrl] = useState<string>('');
  const [refundProofFileName, setRefundProofFileName] = useState<string>('');

  // User Management states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'passenger' | 'agency' | 'admin'>('passenger');
  const [editUserPassword, setEditUserPassword] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'passenger' | 'agency' | 'admin'>('passenger');
  const [userFormMessage, setUserFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SMTP configurations
  const [smtpHost, setSmtpHost] = useState(emailConfig.host);
  const [smtpPort, setSmtpPort] = useState(emailConfig.port);
  const [smtpSenderName, setSmtpSenderName] = useState(emailConfig.senderName);
  const [smtpSenderEmail, setSmtpSenderEmail] = useState(emailConfig.senderEmail);
  const [smtpUsername, setSmtpUsername] = useState(emailConfig.username);
  const [smtpPassword, setSmtpPassword] = useState('••••••••');
  
  // Schedule creation & editing form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [departureTime, setDepartureTime] = useState('09:00 AM');
  const [arrivalTime, setArrivalTime] = useState('10:00 AM');
  const [price, setPrice] = useState(20);
  const [routeFrom, setRouteFrom] = useState('MLE');
  const [routeTo, setRouteTo] = useState('MAF');
  const [scheduleRecurrence, setScheduleRecurrence] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Specific Date'>('Daily');
  const [scheduleDate, setScheduleDate] = useState('2026-08-01');

  
  const [routeVesselId, setRouteVesselId] = useState('');

  // Vessel CRUD states
  const [showVesselForm, setShowVesselForm] = useState(false);
  const [editingVesselId, setEditingVesselId] = useState<string | null>(null);
  const [vesselFormName, setVesselFormName] = useState('');
  const [vesselFormType, setVesselFormType] = useState<'Speedboat' | 'Ferry'>('Speedboat');
  const [vesselFormAmenities, setVesselFormAmenities] = useState<string[]>(['AC', 'Life Jacket']);
  const [vesselFormRows, setVesselFormRows] = useState(8);
  const [vesselFormCols, setVesselFormCols] = useState(4);
  const [vesselFormVipRows, setVesselFormVipRows] = useState('');
  const [vesselFormPremiumRows, setVesselFormPremiumRows] = useState('');
  const [vesselPreviewSeats, setVesselPreviewSeats] = useState<Seat[]>([]);

  // Rejection state
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Stops and state configuration states
  const [stops, setStops] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  // Quick Port Add states
  const [quickAddTarget, setQuickAddTarget] = useState<'departure' | 'arrival' | null>(null);
  const [quickPortName, setQuickPortName] = useState('');
  const [quickPortCode, setQuickPortCode] = useState('');

  // Bookings CRUD states
  const [searchBookingText, setSearchBookingText] = useState('');
  const [filterBookingStatus, setFilterBookingStatus] = useState<string>('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [crudBookingScheduleId, setCrudBookingScheduleId] = useState('');
  const [crudBookingPayment, setCrudBookingPayment] = useState<'card' | 'bank_transfer'>('card');
  const [crudBookingStatus, setCrudBookingStatus] = useState<Booking['status']>('verified');
  const [crudBookingPassengers, setCrudBookingPassengers] = useState<Passenger[]>([{
    name: '', age: 30, gender: 'Male', idNumber: '', seatId: ''
  }]);
  const [crudBookingPromo, setCrudBookingPromo] = useState('');
  const [crudBookingDiscount, setCrudBookingDiscount] = useState(0);

  useEffect(() => {
    if (showAddForm || showBookingForm || showVesselForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddForm, showBookingForm, showVesselForm]);

  useEffect(() => {
    if (!showVesselForm) return;

    const newSeats: Seat[] = [];
    let seatIdCounter = 1;
    for (let r = 1; r <= vesselFormRows; r++) {
      for (let c = 1; c <= vesselFormCols; c++) {
        const existing = vesselPreviewSeats.find(s => s.row === r && s.col === c);
        let seatClass: 'Economy' | 'Premium' | 'VIP' = 'Economy';
        
        if (existing) {
          seatClass = existing.class;
        } else {
          if (r <= 2) seatClass = 'VIP';
          else if (r <= 4) seatClass = 'Premium';
        }

        const attributes: Seat['attributes'] = [];
        if (c === 1 || c === vesselFormCols) {
          attributes.push('window');
        } else {
          attributes.push('aisle');
        }

        if (r === vesselFormRows) {
          attributes.push('accessibility');
        }

        newSeats.push({
          id: `S-${seatIdCounter++}`,
          row: r,
          col: c,
          status: 'available',
          class: seatClass,
          attributes
        });
      }
    }
    
    const currentSignature = vesselPreviewSeats.map(s => `${s.row}-${s.col}-${s.class}`).join(',');
    const newSignature = newSeats.map(s => `${s.row}-${s.col}-${s.class}`).join(',');
    if (currentSignature !== newSignature) {
      setVesselPreviewSeats(newSeats);
    }
  }, [vesselFormRows, vesselFormCols, showVesselForm]);

  const handleToggleVesselSeatClass = (seatId: string) => {
    setVesselPreviewSeats(prev => prev.map(s => {
      if (s.id !== seatId) return s;
      const next: Seat['class'] = s.class === 'Economy' ? 'VIP' : s.class === 'VIP' ? 'Premium' : 'Economy';
      return { ...s, class: next };
    }));
  };

  const handleOpenEditForm = (scheduleId: string) => {
    const s = schedules.find(x => x.id === scheduleId);
    if (!s) return;
    setEditingScheduleId(scheduleId);
    setRouteVesselId(s.vesselId || '');
    setDepartureTime(s.departureTime);
    setArrivalTime(s.arrivalTime);
    setPrice(s.price);
    setRouteFrom(s.routeFrom);
    setRouteTo(s.routeTo);
    setScheduleRecurrence(s.recurrence || 'Daily');
    setScheduleDate(s.scheduleDate || '2026-08-01');
    setStops(s.stops || []);
    setDisabled(!!s.disabled);
    setMaintenance(!!s.maintenance);
    
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingScheduleId(null);
    setRouteVesselId('');
    setDepartureTime('09:00 AM');
    setArrivalTime('10:00 AM');
    setPrice(20);
    setRouteFrom('MLE');
    setRouteTo('MAF');
    setScheduleRecurrence('Daily');
    setScheduleDate('2026-08-01');
    setStops([]);
    setDisabled(false);
    setMaintenance(false);
  };

  // Handle adding or editing schedule
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVesselId = routeVesselId || vessels[0]?.id;
    if (!targetVesselId) {
      showAlert('Please register at least one vessel in the Fleet Vessels tab first.', 'No Vessels Available', 'error');
      return;
    }
    const vessel = vessels.find(v => v.id === targetVesselId);
    if (!vessel) {
      showAlert('Selected vessel not found.', 'Missing Vessel', 'error');
      return;
    }

    const totalSeats = vessel.layoutRows * vessel.layoutCols;
    const scheduleData = {
      vesselId: vessel.id,
      vesselName: vessel.name,
      vesselType: vessel.type,
      departureTime,
      arrivalTime,
      price,
      routeFrom,
      routeTo,
      recurrence: scheduleRecurrence,
      scheduleDate,
      totalSeats,
      amenities: vessel.amenities,
      stops,
      disabled,
      maintenance
    };


    let generatedSeats: Seat[] = [];
    if (vessel.customSeats && vessel.customSeats.length === totalSeats) {
      generatedSeats = vessel.customSeats.map(s => ({ ...s, status: 'available' }));
    } else {
      const vipSet = parseRowsString(vessel.vipRows, vessel.layoutRows);
      const premiumSet = parseRowsString(vessel.premiumRows, vessel.layoutRows);
      let seatIdCounter = 1;
      for (let r = 1; r <= vessel.layoutRows; r++) {
        for (let c = 1; c <= vessel.layoutCols; c++) {
          let seatClass: 'Economy' | 'Premium' | 'VIP' = 'Economy';
          
          if (vipSet.has(r)) {
            seatClass = 'VIP';
          } else if (premiumSet.has(r)) {
            seatClass = 'Premium';
          }

          const attributes: Seat['attributes'] = [];
          if (c === 1 || c === vessel.layoutCols) {
            attributes.push('window');
          } else {
            attributes.push('aisle');
          }

          if (r === vessel.layoutRows) {
            attributes.push('accessibility');
          }

          generatedSeats.push({
            id: `S-${seatIdCounter++}`,
            row: r,
            col: c,
            status: 'available',
            class: seatClass,
            attributes
          });
        }
      }
    }

    if (editingScheduleId) {
      // For editing, preserve existing booked status if seat still exists
      const existingDeck = decks[editingScheduleId] || [];
      const finalSeats = generatedSeats.map(newSeat => {
        const oldSeat = existingDeck.find(os => os.id === newSeat.id);
        if (oldSeat && oldSeat.status !== 'available') {
          return { ...newSeat, status: oldSeat.status };
        }
        return newSeat;
      });
      editSchedule(editingScheduleId, scheduleData, finalSeats);
    } else {
      addSchedule(scheduleData, generatedSeats);
    }

    handleCloseForm();
  };

  // Get total revenue
  const totalVerifiedRevenue = bookings
    .filter(b => b.status === 'verified')
    .reduce((sum, b) => sum + b.totalAmount, 0) + 45200; // Mock base + dynamic sales

  const pendingBookings = bookings.filter(b => b.status === 'pending_verification');

  if (managingScheduleId) {
    const s = schedules.find(s => s.id === managingScheduleId);
    if (!s) return null;
    return (
      <div className="animate-fade-in space-y-6 text-slate-800">
        <button 
          className="bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl transition duration-200 flex items-center gap-2 cursor-pointer text-xs"
          onClick={() => { setManagingScheduleId(null); setAdminSelectedSeats([]); }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Managing: {s.vesselName}</h2>
          <p className="text-slate-500 text-sm font-medium">Customize cabin classes and manage passenger seat allocations.</p>
        </div>
        
        <SeatMap 
          scheduleId={s.id}
          adminMode={true}
          selectedSeats={adminSelectedSeats}
          onToggleSeat={(seat) => {
            setAdminSelectedSeats(prev => {
              if (prev.find(x => x.id === seat.id)) return prev.filter(x => x.id !== seat.id);
              return [...prev, seat];
            });
          }}
          onConfirm={(action) => {
            if (action === 'admin-lock') {
              adminLockSeats(s.id, adminSelectedSeats.map(x => x.id));
            } else if (action === 'admin-reserve') {
              bookSeats(s.id, adminSelectedSeats.map(x => x.id));
            } else if (action === 'admin-unlock') {
              adminUnlockSeats(s.id, adminSelectedSeats.map(x => x.id));
            }
            setAdminSelectedSeats([]);
          }}
        />

        {/* Class Painting & Customization Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 text-left max-w-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-extrabold text-slate-850 flex items-center gap-2">
              <Ship className="text-sky-655" size={16} />
              Seat Customizer & Class Painter
            </h3>
            {adminSelectedSeats.length > 0 ? (
              <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {adminSelectedSeats.length} Seats Selected
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-medium">Select seats on the map above to customize</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actions for changing classes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Paint Seat Class</h4>
              <p className="text-slate-500 text-[11px] font-medium leading-normal">
                Apply class designations. This dynamically recalculates pricing surcharges (+15 for VIP, +5 for Premium) for ticket checkout.
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={adminSelectedSeats.length === 0}
                  onClick={() => {
                    updateSeatClass(s.id, adminSelectedSeats.map(x => x.id), 'VIP');
                    setAdminSelectedSeats([]);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Paint Selected as VIP (+$15.00)
                </button>
                <button
                  type="button"
                  disabled={adminSelectedSeats.length === 0}
                  onClick={() => {
                    updateSeatClass(s.id, adminSelectedSeats.map(x => x.id), 'Premium');
                    setAdminSelectedSeats([]);
                  }}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-md shadow-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Paint Selected as Premium (+$5.00)
                </button>
                <button
                  type="button"
                  disabled={adminSelectedSeats.length === 0}
                  onClick={() => {
                    updateSeatClass(s.id, adminSelectedSeats.map(x => x.id), 'Economy');
                    setAdminSelectedSeats([]);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Paint Selected as Economy ($0.00)
                </button>
              </div>
            </div>

            {/* Quick Status Modifiers */}
            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Quick Status Modifiers</h4>
              <p className="text-slate-500 text-[11px] font-medium leading-normal">
                Batch lock or release status override for administrative allocation blocks.
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={adminSelectedSeats.length === 0}
                  onClick={() => {
                    adminLockSeats(s.id, adminSelectedSeats.map(x => x.id));
                    setAdminSelectedSeats([]);
                  }}
                  className="w-full bg-amber-100 hover:bg-amber-200 border border-amber-200 text-amber-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Block / Lock Selected Seats
                </button>
                <button
                  type="button"
                  disabled={adminSelectedSeats.length === 0}
                  onClick={() => {
                    adminUnlockSeats(s.id, adminSelectedSeats.map(x => x.id));
                    setAdminSelectedSeats([]);
                  }}
                  className="w-full bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 text-emerald-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Release / Make Available
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operator Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time overview of smart vessel logistics, financial summaries, and verification queues.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto scrollbar-none">
        <button
          id="tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={16} /> Overview Dashboard
        </button>
        <button
          id="tab-vessels"
          onClick={() => setActiveTab('vessels')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'vessels' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ship size={16} /> Fleet Vessels
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'fleet' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ship size={16} /> Routes & Schedules
        </button>
        <button 
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer relative whitespace-nowrap ${
            activeTab === 'verify' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard size={16} /> Verify Payments
          {pendingBookings.length > 0 && (
            <span className="ml-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {pendingBookings.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'bookings' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList size={16} /> All Bookings
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'locations' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} /> Jetties & Locations
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'reports' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={16} /> Reports & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'emails' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail size={16} /> Email Control Center
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'users' 
              ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> User Directory
        </button>
        {currentUser?.role === 'super_admin' && (
          <button 
            id="tab-audit"
            data-testid="tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-5 font-semibold text-sm border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'audit' 
                ? 'border-sky-500 text-sky-700 bg-sky-50 rounded-t-lg font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert size={16} className="text-amber-500" /> Audit Logs & History
          </button>
        )}
      </div>

      {/* OVERVIEW DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-850">Logistics & Revenue Dashboard</h3>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">Comprehensive real-time overview of bookings, revenue, fleet deployment, and alerts.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2 cursor-pointer text-xs"
                onClick={() => showAlert('Broadcasting system warning: Male-Maafushi Speedboats delayed by 20 mins due to strong winds.', 'Broadcast Disruption Alert', 'info')}
              >
                <AlertTriangle size={16} /> Broadcast Disruption
              </button>
              <button 
                className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2 cursor-pointer text-xs"
                onClick={() => {
                  setEditingScheduleId(null);
                  setRouteVesselId(vessels[0]?.id || '');
                  setDepartureTime('09:00 AM');
                  setArrivalTime('10:00 AM');
                  setPrice(25);
                  setRouteFrom('MLE');
                  setRouteTo('MAF');
                  setStops([]);
                  setDisabled(false);
                  setMaintenance(false);
                  setShowAddForm(true);
                }}
              >
                <Plus size={16} /> New Schedule
              </button>
            </div>
          </div>

          {/* Summarized Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-md border-t-4 border-t-emerald-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                ${bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalAmount || 0), 0).toFixed(2)}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Total revenue across all verified bookings</p>
            </div>

            {/* Bookings Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-md border-t-4 border-t-sky-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Bookings Made</span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <ClipboardList size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {bookings.length}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1">{bookings.filter(b => b.status === 'verified').length} verified, {pendingBookings.length} pending</p>
            </div>

            {/* Active Fleet Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-md border-t-4 border-t-indigo-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Fleet</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Ship size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {vessels.length} Vessels
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-1">{schedules.length} active routes deployed</p>
            </div>

            {/* Verification Queue Card */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-md border-t-4 border-t-amber-500">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Slip Verification</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <CreditCard size={18} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {pendingBookings.length} Pending
              </div>
              <p className="text-[11px] font-bold text-amber-600 mt-1">{pendingBookings.length > 0 ? 'Slips awaiting manual review' : 'All slips processed'}</p>
            </div>
          </div>

          {/* Logistics Overview & Quick Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings Summary */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Recent Booking Ledger</h4>
                <button 
                  onClick={() => setActiveTab('bookings')} 
                  className="text-xs font-extrabold text-sky-600 hover:underline cursor-pointer"
                >
                  View All ({bookings.length}) →
                </button>
              </div>
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs min-w-[300px]">
                    <div>
                      <div className="font-bold text-slate-800">{b.id} — {b.passengers[0]?.name || 'Passenger'}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{b.createdAt} · {b.selectedSeatIds.join(', ')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900">${b.totalAmount}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        b.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fleet Summary */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Fleet Deployment</h4>
                <button 
                  onClick={() => setActiveTab('vessels')} 
                  className="text-xs font-extrabold text-sky-600 hover:underline cursor-pointer"
                >
                  Manage ({vessels.length}) →
                </button>
              </div>
              <div className="space-y-3">
                {vessels.map(v => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Ship size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{v.name}</div>
                        <div className="text-[10px] text-slate-400">{v.type} · {v.layoutRows * v.layoutCols} Seats</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VESSELS TAB */}
      {activeTab === 'vessels' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-850">Fleet Vessels</h3>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">Manage your vessel fleet. Define seat layouts and amenities here.</p>
            </div>
            <button
              onClick={() => {
                setEditingVesselId(null);
                setVesselFormName('');
                setVesselFormType('Speedboat');
                setVesselFormAmenities(['AC', 'Life Jacket']);
                setVesselFormRows(8);
                setVesselFormCols(4);
                setVesselFormVipRows('1-2');
                setVesselFormPremiumRows('3-4');
                setVesselPreviewSeats([]);
                setShowVesselForm(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus size={16} /> Add Vessel
            </button>
          </div>

          {/* Vessel list */}
          {vessels.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              <Ship size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No vessels registered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vessels.map(v => {
                const assignedRoutes = schedules.filter(s => s.vesselId === v.id);
                return (
                  <div key={v.id} className="glass-panel border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-center shrink-0">
                        <Ship size={22} className="text-sky-600" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{v.name}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{v.type} · {v.layoutRows * v.layoutCols} seats · {assignedRoutes.length} routes</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {v.amenities.map(a => (
                            <span key={a} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-start lg:justify-end">
                      <button
                        className="bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        title="Edit Vessel Specifications & Seat Layout"
                        onClick={() => {
                          setEditingVesselId(v.id);
                          setVesselFormName(v.name);
                          setVesselFormType(v.type);
                          setVesselFormAmenities([...v.amenities]);
                          setVesselFormRows(v.layoutRows);
                          setVesselFormCols(v.layoutCols);
                          setVesselFormVipRows(v.vipRows);
                          setVesselFormPremiumRows(v.premiumRows);
                          if (v.customSeats && v.customSeats.length > 0) {
                            setVesselPreviewSeats(JSON.parse(JSON.stringify(v.customSeats)));
                          } else {
                            setVesselPreviewSeats([]);
                          }
                          setShowVesselForm(true);
                        }}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        title="Delete Vessel from Fleet Registry"
                        onClick={() => {
                          const result = removeVessel(v.id);
                          if (!result.success) {
                            showAlert(result.message, 'Cannot Delete Vessel', 'error');
                          } else {
                            showAlert(`${v.name} has been removed from the fleet.`, 'Vessel Removed', 'success');
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>


                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ROUTES & SCHEDULES TAB */}
      {activeTab === 'fleet' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-850">Routes & Fleet Schedules</h3>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">Manage transit schedules, assigned vessels, departure/arrival jetties, stops, and pricing.</p>
            </div>
            <button
              onClick={() => {
                setEditingScheduleId(null);
                setRouteVesselId(vessels[0]?.id || '');
                setDepartureTime('09:00 AM');
                setArrivalTime('10:00 AM');
                setPrice(25);
                setRouteFrom('MLE');
                setRouteTo('MAF');
                setStops([]);
                setDisabled(false);
                setMaintenance(false);
                setShowAddForm(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer text-xs shadow-md shadow-sky-600/10"
            >
              <Plus size={16} /> Add Route Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
              <Ship size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No route schedules created yet.</p>
              <button
                onClick={() => {
                  setEditingScheduleId(null);
                  setRouteVesselId(vessels[0]?.id || '');
                  setShowAddForm(true);
                }}
                className="mt-3 text-sky-600 hover:text-sky-700 font-bold text-xs cursor-pointer"
              >
                + Create your first route schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
            {schedules.map(s => {
              const deck = decks[s.id] || [];
              const bookedCount = deck.filter(seat => seat.status === 'booked' || seat.status === 'locked').length;
              const pct = Math.round((bookedCount / 32) * 100);
              
              return (
                <div 
                  key={s.id} 
                  className="glass-panel border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition duration-200 hover:border-slate-350"
                >
                  <div className="min-w-[180px] text-left">
                    <div className="font-bold text-slate-800 text-lg leading-tight flex flex-wrap items-center gap-1.5">
                      {s.vesselName}
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase" title="Schedule Recurrence Frequency">
                        📅 {s.recurrence || 'Daily'}
                      </span>
                      {s.scheduleDate && (
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold px-2 py-0.5 rounded" title="Effective Schedule Date">
                          {s.scheduleDate}
                        </span>
                      )}
                      {s.disabled && (
                        <span className="bg-slate-105 text-slate-600 border border-slate-200 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                          Disabled
                        </span>
                      )}
                      {s.maintenance && (
                        <span className="bg-amber-100 text-amber-700 border border-amber-250 text-[8px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase animate-pulse">
                          Maint.
                        </span>
                      )}
                    </div>

                    <div className="text-slate-500 text-xs mt-1.5 font-medium">
                      {s.routeFrom} → {s.routeTo} | {s.departureTime}
                    </div>
                    {s.stops && s.stops.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">
                        Stops: {s.stops.map(stopId => locations.find(l => l.id === stopId)?.name || stopId).join(' → ')}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600">
                      <span>Occupancy Rate</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="min-w-[120px] text-xs space-y-0.5 font-medium text-left lg:text-right">
                    <div className="text-slate-850 font-bold"><strong>{bookedCount}</strong> seats reserved</div>
                    <div className="text-slate-500">{32 - bookedCount} open seats remaining</div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                    <button 
                      className={`font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        s.disabled 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={s.disabled ? "Enable Daily Route Schedule" : "Disable Daily Route Schedule"}
                      onClick={() => editSchedule(s.id, { disabled: !s.disabled })}
                    >
                      {s.disabled ? <Unlock size={14} /> : <Lock size={14} />} {s.disabled ? 'Enable' : 'Disable'}
                    </button>
                    <button 
                      className={`font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        s.maintenance 
                          ? 'bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100' 
                          : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                      }`}
                      title={s.maintenance ? "Set Active Operational Mode" : "Set Maintenance Mode"}
                      onClick={() => editSchedule(s.id, { maintenance: !s.maintenance })}
                    >
                      <Wrench size={14} /> {s.maintenance ? 'Active Mode' : 'Maintenance'}
                    </button>
                    <button 
                      className="bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Manage Seating Map & Lock/Release Individual Seats"
                      onClick={() => setManagingScheduleId(s.id)}
                    >
                      <Armchair size={14} /> Manage Seats
                    </button>
                    <button 
                      className="bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Edit Route Schedule Details & Pricing"
                      onClick={() => handleOpenEditForm(s.id)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button 
                      className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Cancel This Route Schedule"
                      onClick={() => {
                        const hasActiveBookings = bookings.some(b => b.scheduleId === s.id && (b.status === 'verified' || b.status === 'pending_verification'));
                        if (hasActiveBookings) {
                          showAlert('Cannot delete this route because there are active passenger bookings. Please cancel or reject the bookings first.', 'Active Bookings Blocked', 'error');
                          return;
                        }
                        if (confirm('Are you sure you want to delete this route?')) {
                          removeSchedule(s.id);
                        }
                      }}
                    >
                      <Trash2 size={14} /> Cancel Route
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* VERIFY PAYMENTS TAB */}
      {activeTab === 'verify' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700">Pending Bank Transfer Receipts</h3>
          
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-16 px-6 border border-dashed border-slate-200 rounded-2xl text-slate-500">
                <CheckCircle size={44} className="text-emerald-500 opacity-40 mx-auto mb-4" />
                <h4 className="text-slate-800 font-bold text-base mb-1">Queue Empty</h4>
                <p className="text-xs font-medium">There are no pending bank transfers requiring verification.</p>
              </div>
            ) : (
              pendingBookings.map(b => (
                <div 
                  key={b.id} 
                  className="glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6"
                >
                  {/* Slip Preview stub */}
                  <div className="w-28 h-36 bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 shrink-0 shadow-inner overflow-hidden relative group">
                    {b.receiptImage && b.receiptImage.startsWith('data:image/') ? (
                      <img src={b.receiptImage} alt="Receipt Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <FileText size={28} className="text-slate-400" />
                        <span className="text-[10px] font-mono text-slate-550">{b.receiptImage ? 'Slip Uploaded' : 'No Slip'}</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button 
                        className="bg-white text-slate-805 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer shadow hover:bg-slate-50"
                        onClick={() => {
                          if (b.receiptImage) {
                            setPreviewingSlipUrl(b.receiptImage);
                          } else {
                            showAlert('No transfer slip uploaded.', 'Missing Slip Receipt', 'error');
                          }
                        }}
                      >
                        View Slip
                      </button>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="flex-1 space-y-3.5 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Reference ID: <strong className="text-sky-650 font-bold">{b.id}</strong></span>
                      
                      {b.bookedBy ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded text-[10px] uppercase tracking-wider">
                          Agency: {b.bookedBy}
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          Standard booking
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-slate-800 text-base">{b.vesselName}</h4>
                        {(() => {
                          const elapsedMs = Date.now() - new Date(b.createdAt).getTime();
                          const remainingMs = Math.max(0, 10 * 60 * 1000 - elapsedMs);
                          const mins = Math.floor(remainingMs / 60000);
                          const secs = Math.floor((remainingMs % 60000) / 1000);

                          if (b.receiptImage) {
                            return (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                <CheckCircle size={12} /> Receipt Uploaded · Hold Secured
                              </span>
                            );
                          }

                          if (remainingMs > 0) {
                            return (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md animate-pulse">
                                ⏱️ 10-Min Hold: {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} (No Receipt)
                              </span>
                            );
                          }

                          return (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                              ⚠️ Hold Expired · Releasing Seats
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Route: {b.routeFrom} → {b.routeTo} | Departure: {b.departureTime}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {b.passengers.map((p, i) => (
                        <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2.5 py-1 rounded-md font-medium shadow-sm">
                          {p.name} (Seat {p.seatId.replace('S-', '')})
                        </span>
                      ))}
                    </div>

                    <div className="text-sm font-bold text-slate-600">
                      Receipt Amount: <strong className="text-sky-650 text-base font-black">${b.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col justify-center gap-2.5 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    {rejectingBookingId === b.id ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Provide rejection reason (required)..." 
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-[11px] w-full focus:outline-none focus:border-rose-400" 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          required
                        />
                        <div className="flex gap-1.5">
                          <button 
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold p-1.5 rounded-lg text-[10px] flex-1 cursor-pointer shadow"
                            onClick={() => {
                              if (!rejectionReason.trim()) {
                                showAlert('A rejection reason/comment is required to decline payment and release seats.', 'Comment Required', 'error');
                                return;
                              }
                              updateBookingStatus(b.id, 'rejected', rejectionReason, undefined, currentUser);
                              setRejectingBookingId(null);
                              setRejectionReason('');
                              showAlert(`Booking ${b.id} payment slip rejected. Held seats have been released.`, 'Payment Declined', 'success');
                            }}
                          >
                            Confirm Reject
                          </button>
                          <button 
                            className="bg-transparent border border-slate-200 text-slate-600 p-1.5 rounded-lg text-[10px] flex-1 cursor-pointer font-bold"
                            onClick={() => setRejectingBookingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/5"
                          onClick={() => updateBookingStatus(b.id, 'verified')}
                        >
                          <CheckCircle size={14} /> Verify & Approve
                        </button>
                        <button 
                          className="bg-transparent border border-rose-200 text-rose-500 hover:bg-rose-50 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                          onClick={() => setRejectingBookingId(b.id)}
                        >
                          <XCircle size={14} /> Decline Slip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS CRUD TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-850">All Passenger Bookings</h3>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">Manage, edit, cancel, or manually issue passenger boarding tickets.</p>
            </div>
            <button
              onClick={() => {
                // Initialize default values for creating a new booking
                setEditingBookingId(null);
                setCrudBookingScheduleId(schedules[0]?.id || '');
                setCrudBookingPayment('card');
                setCrudBookingStatus('verified');
                setCrudBookingPassengers([{ name: '', age: 30, gender: 'Male', idNumber: '', seatId: '' }]);
                setCrudBookingPromo('');
                setCrudBookingDiscount(0);
                setShowBookingForm(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus size={16} /> Manually Book Seats
            </button>
          </div>

          {/* Search & Filter bar */}
          <div className="glass-panel border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by Passenger Name, Email, or Booking Ref ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold focus:outline-none"
                value={searchBookingText}
                onChange={(e) => setSearchBookingText(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer"
                value={filterBookingStatus}
                onChange={(e) => setFilterBookingStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified (Active)</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings List grid */}
          <div className="space-y-4">
            {(() => {
              const filtered = bookings.filter(b => {
                const matchesStatus = filterBookingStatus === 'all' || b.status === filterBookingStatus;
                const matchesSearch = 
                  b.id.toLowerCase().includes(searchBookingText.toLowerCase()) ||
                  b.vesselName.toLowerCase().includes(searchBookingText.toLowerCase()) ||
                  b.passengers.some(p => p.name.toLowerCase().includes(searchBookingText.toLowerCase()) || p.idNumber.includes(searchBookingText));
                return matchesStatus && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-16 border border-slate-150 rounded-2xl text-slate-400 bg-white">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">No bookings match your search filters.</p>
                  </div>
                );
              }

              return filtered.map(b => {
                return (
                  <div key={b.id} className="glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 bg-white hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 uppercase tracking-wider font-mono">
                          {b.id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase ${
                          b.status === 'verified'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                            : b.status === 'pending_verification'
                              ? 'bg-amber-50 border-amber-250 text-amber-700'
                              : 'bg-rose-50 border-rose-250 text-rose-700'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm font-black text-slate-800">
                        {b.routeFrom} ➔ {b.routeTo}
                        <span className="text-xs text-slate-500 font-semibold ml-2">
                          ({b.vesselName} • {b.vesselType})
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-550 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Departure: {b.departureTime}</span>
                        <span>Arrival: {b.arrivalTime}</span>
                        <span>Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Passengers details list */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        {b.passengers.map((p, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1">
                            {p.name} ({p.gender}, Age {p.age}) - Seat: <span className="font-mono text-indigo-700 font-black">{p.seatId}</span>
                          </span>
                        ))}
                      </div>

                      {/* Manual Refund Payout Details & Operator Upload Box */}
                      {(b.status === 'cancelled' || b.refundBankName) && (
                        <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-amber-800 flex items-center gap-1">
                              <AlertCircle size={14} /> Passenger Bank Refund Details
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                              b.refundStatus === 'completed' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {b.refundStatus === 'completed' ? 'Transfer Complete' : 'Payout Pending'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 font-medium">
                            <div>Bank: <strong className="text-slate-900">{b.refundBankName || 'BML'}</strong></div>
                            <div>Account: <strong className="text-slate-900">{b.refundAccountName || b.passengers[0]?.name}</strong></div>
                            <div>Number: <strong className="text-slate-900 font-mono">{b.refundAccountNumber || '773000000000'}</strong></div>
                          </div>
                          <div className="text-[11px] text-slate-600 font-semibold pt-1 border-t border-amber-200/60 flex justify-between">
                            <span>Refund Amount to Transfer: <strong className="text-emerald-700">${(b.refundAmount || b.totalAmount).toFixed(2)}</strong></span>
                            <span>Fee Deducted: <strong className="text-rose-600">${(b.cancellationFee || 0).toFixed(2)}</strong></span>
                          </div>

                          {uploadingRefundBookingId === b.id && (
                            <div className="pt-2 border-t border-amber-200 space-y-2 bg-white p-3 rounded-lg border border-amber-200">
                              <label className="text-[10px] font-bold text-slate-600 uppercase block">Upload Money Transfer Receipt Slip Image</label>
                              <input 
                                type="file" 
                                accept="image/*,application/pdf"
                                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setRefundProofFileName(file.name);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setRefundProofUrl(reader.result as string);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              {refundProofFileName && (
                                <p className="text-[10px] text-emerald-700 font-bold">Selected: {refundProofFileName}</p>
                              )}
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  disabled={!refundProofUrl}
                                  onClick={() => {
                                    const res = completeRefundPayout(b.id, refundProofUrl);
                                    if (res.success) {
                                      showAlert(res.message, 'Payout Proof Attached', 'success');
                                      setUploadingRefundBookingId(null);
                                      setRefundProofUrl('');
                                      setRefundProofFileName('');
                                    } else {
                                      showAlert(res.message, 'Error', 'error');
                                    }
                                  }}
                                  className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer ${
                                    refundProofUrl ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  Attach Receipt & Complete Refund
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setUploadingRefundBookingId(null)}
                                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-end gap-3 justify-between w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block">Total Paid</span>
                        <span className="text-lg font-black text-slate-850">${b.totalAmount}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => {
                            // Populate states for editing
                            setEditingBookingId(b.id);
                            setCrudBookingScheduleId(b.scheduleId);
                            setCrudBookingPayment(b.paymentMethod);
                            setCrudBookingStatus(b.status);
                            setCrudBookingPassengers([...b.passengers]);
                            setCrudBookingPromo(b.promoCodeUsed || '');
                            setCrudBookingDiscount(b.discountApplied);
                            setShowBookingForm(true);
                          }}
                          className="bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                        >
                          Edit
                        </button>

                        {b.status !== 'cancelled' ? (
                          <button
                            onClick={() => {
                              const res = processRefund(b.id, { bankName: 'Bank of Maldives (BML)', accountName: b.passengers[0]?.name || 'Passenger', accountNumber: '7730000123456' });
                              if (res.success) {
                                showAlert(res.message, 'Refund Request Logged', 'success');
                              } else {
                                showAlert(res.message, 'Refund Error', 'error');
                              }
                            }}
                            className="bg-transparent hover:bg-amber-50 border border-amber-300 text-amber-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                          >
                            Log Refund
                          </button>
                        ) : (
                          <button
                            onClick={() => setUploadingRefundBookingId(b.id)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                          >
                            {b.refundReceiptImage ? 'Update Payout Slip' : 'Upload Payout Slip'}
                          </button>
                        )}

                        {b.refundReceiptImage && (
                          <button
                            onClick={() => setPreviewingSlipUrl(b.refundReceiptImage!)}
                            className="bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                          >
                            View Slip
                          </button>
                        )}

                        {currentAuthUser?.role === 'super_admin' ? (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete and void booking ${b.id}? This will immediately release all booked seats.`)) {
                                const res = removeBooking(b.id, currentAuthUser);
                                showAlert(res.message, res.success ? 'Booking Deleted' : 'Access Denied', res.success ? 'success' : 'error');
                              }
                            }}
                            className="bg-transparent hover:bg-rose-50 border border-rose-250 text-rose-600 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer font-sans"
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-not-allowed select-none" title="Only Super Admin can delete bookings or refund records">
                            <Lock size={12} className="text-slate-400" /> Deletion Restricted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* JETTIES & LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left: Location List */}
            <div className="flex-1 glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 text-left">
              <h3 className="text-lg font-bold text-slate-700">Registered Ports & Jetties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locations.map(loc => (
                  <div key={loc.id} className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">{loc.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Port Code: {loc.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-sky-50 text-sky-700 font-bold px-2 py-1 rounded text-xs border border-sky-105 uppercase">{loc.id}</span>
                      <button 
                        data-testid={`delete-location-${loc.id}`}
                        onClick={() => {
                          const res = removeLocation(loc.id);
                          if (!res.success) {
                            showAlert(res.message, 'Port Deletion Blocked', 'error');
                          }
                        }}
                        className="bg-transparent hover:bg-rose-50 text-rose-500 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer transition border border-transparent hover:border-rose-100 flex items-center justify-center"
                        title="Delete Location"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add Location Form */}
            <div className="w-full lg:w-80 glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 h-fit text-left">
              <h3 className="text-lg font-bold text-slate-700">Add New Location</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const nameInput = form.elements.namedItem('portName') as HTMLInputElement;
                const codeInput = form.elements.namedItem('portCode') as HTMLInputElement;
                const name = nameInput.value.trim();
                const code = codeInput.value.trim().toUpperCase();
                
                if (name && code) {
                  if (code.length !== 3) {
                    showAlert('Port code must be exactly 3 letters.', 'Invalid Port Code', 'error');
                    return;
                  }
                  addLocation(name, code);
                  form.reset();
                }
              }} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-505">Location/Island Name</label>
                  <input 
                    name="portName"
                    type="text" 
                    placeholder="e.g. Rasdhoo Island"
                    className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-505">3-Letter Code</label>
                  <input 
                    name="portCode"
                    type="text" 
                    maxLength={3}
                    placeholder="e.g. RAS"
                    className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-800 uppercase focus:outline-none font-medium"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-sky-505 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                >
                  Register Location
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* USER DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left: User Registry List */}
            <div className="flex-1 glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-705">Registered Accounts</h3>
                <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2 py-0.5 rounded border border-sky-100 uppercase">
                  {authUsers.length} Users
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {authUsers.map(u => (
                  <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-850 text-sm">{u.name}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          u.role === 'admin' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : u.role === 'agency'
                              ? 'bg-amber-50 text-amber-700 border border-amber-250'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {u.role}
                        </span>
                        {currentAuthUser?.id === u.id && (
                          <span className="bg-slate-100 text-slate-655 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">You</span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs mt-1 block font-medium">{u.email}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">ID: {u.id} | Saved Travelers: {u.savedPassengers?.length || 0}</span>
                    </div>

                    {u.role === 'super_admin' ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 select-none">
                        <Lock size={12} /> Shell Protected
                      </span>
                    ) : (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditUserName(u.name);
                            setEditUserEmail(u.email);
                            setEditUserRole(u.role as any);
                            setEditUserPassword('');
                          }}
                          className="bg-transparent border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const res = adminDeleteUser(u.id);
                            if (res.success) {
                              showAlert(res.message, 'User Account Deleted', 'success');
                            } else {
                              showAlert(res.message, 'Deletion Rejected', 'error');
                            }
                          }}
                          disabled={currentAuthUser?.id === u.id}
                          className="bg-transparent border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-1.5 px-3 rounded-lg text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add New User / Edit User Form */}
            <div className="w-full lg:w-80 glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 h-fit">
              {editingUserId ? (
                // Edit User Form
                <>
                  <h3 className="text-lg font-bold text-slate-700">Edit User Account</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editUserName.trim() || !editUserEmail.trim()) return;
                    const fields: any = {
                      name: editUserName.trim(),
                      email: editUserEmail.toLowerCase().trim(),
                      role: editUserRole
                    };
                    if (editUserPassword) {
                      if (editUserPassword.length < 6) {
                        showAlert('Password must be at least 6 characters.', 'Weak Password', 'error');
                        return;
                      }
                      fields.password = editUserPassword;
                    }
                    const res = adminUpdateUser(editingUserId, fields);
                    if (res.success) {
                      showAlert(res.message, 'User Account Updated', 'success');
                      setEditingUserId(null);
                    } else {
                      showAlert(res.message, 'Update Failed', 'error');
                    }
                  }} className="space-y-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Name</label>
                      <input 
                        type="text" 
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-805 focus:outline-none font-medium"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Email</label>
                      <input 
                        type="email" 
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-805 focus:outline-none font-medium"
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Role</label>
                      <select 
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-805 focus:outline-none font-medium cursor-pointer"
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value as any)}
                      >
                        <option value="passenger">Passenger</option>
                        <option value="agency">Travel Agency (Agent)</option>
                        <option value="admin">Admin Operator</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Reset Password (Optional)</label>
                      <input 
                        type="password" 
                        placeholder="Leave blank to keep current"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-805 focus:outline-none font-medium"
                        value={editUserPassword}
                        onChange={(e) => setEditUserPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setEditingUserId(null)}
                        className="flex-1 bg-transparent border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs animate-none"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Add New User Form
                <>
                  <h3 className="text-lg font-bold text-slate-700">Add New User</h3>
                  {userFormMessage && (
                    <div className={`p-2.5 rounded-xl text-[10px] font-semibold border ${
                      userFormMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {userFormMessage.text}
                    </div>
                  )}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setUserFormMessage(null);
                    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
                      setUserFormMessage({ type: 'error', text: 'All fields are required.' });
                      return;
                    }
                    if (newUserPassword.length < 6) {
                      setUserFormMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
                      return;
                    }
                    const res = adminAddUser(newUserName, newUserEmail, newUserPassword, newUserRole);
                    if (res.success) {
                      setUserFormMessage({ type: 'success', text: res.message });
                      setNewUserName('');
                      setNewUserEmail('');
                      setNewUserPassword('');
                      setNewUserRole('passenger');
                    } else {
                      setUserFormMessage({ type: 'error', text: res.message });
                    }
                  }} className="space-y-4 text-xs font-semibold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Ibrahim Ali"
                        className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-805 focus:outline-none font-medium"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. ibrahim@example.com"
                        className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-850 focus:outline-none font-medium"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-850 focus:outline-none font-medium"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Access Level Role</label>
                      <select 
                        className="bg-white border border-slate-205 rounded-xl px-3 py-2.5 text-slate-850 focus:outline-none font-medium cursor-pointer"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                      >
                        <option value="passenger">Passenger</option>
                        <option value="agency">Travel Agency (Agent)</option>
                        <option value="admin">Admin Operator</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md shadow-sky-500/5 animate-none"
                    >
                      Create User Account
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AUDIT LOGS & HISTORY TAB */}
      {activeTab === 'audit' && (
        currentUser?.role !== 'super_admin' ? (
          <div className="text-center py-20 glass-panel border border-slate-200 rounded-3xl p-8 shadow-sm">
            <ShieldAlert size={56} className="text-amber-500 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Super Admin Access Only</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
              System database audit logs and change history are strictly confidential and accessible exclusively to Super Admin master accounts.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-850">Database Audit Logs & Change History</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">
                  Restricted exclusively to Super Admin. Complete audit trail tracking who made changes, before/after values, and deleted receipts.
                </p>
              </div>
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAuditViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    auditViewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List size={14} /> Table View
                </button>
                <button
                  type="button"
                  onClick={() => setAuditViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    auditViewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock size={14} /> Timeline History
                </button>
              </div>

              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `feridhootours_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-2 shadow-md"
              >
                <Download size={16} /> Export Logs (JSON)
              </button>
            </div>
          </div>

          {/* Stat Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-amber-500">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Total Audit Events</div>
              <div className="text-2xl font-black text-slate-900">{auditLogs.length}</div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Logged mutations across database</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-rose-500">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Deletions Logged</div>
              <div className="text-2xl font-black text-slate-900">
                {auditLogs.filter(a => a.action === 'DELETE' || a.action === 'RECEIPT_DELETED' || a.action === 'USER_DELETED').length}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Deleted bookings, users, or schedules</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-indigo-500">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Receipts Deleted / Modified</div>
              <div className="text-2xl font-black text-slate-900">
                {auditLogs.filter(a => a.action === 'RECEIPT_DELETED' || (a.metadata && a.metadata.hadReceipt)).length}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Deleted transfer slip attachments</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white shadow-sm border-t-4 border-t-emerald-500">
              <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Verified Slip Approvals</div>
              <div className="text-2xl font-black text-slate-900">
                {auditLogs.filter(a => a.action === 'VERIFY_PAYMENT').length}
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Admin payment approvals logged</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action:</label>
                <select
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  value={auditFilterAction}
                  onChange={(e) => setAuditFilterAction(e.target.value)}
                >
                  <option value="ALL">All Actions</option>
                  <option value="DELETE">DELETE</option>
                  <option value="RECEIPT_DELETED">RECEIPT_DELETED</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="VERIFY_PAYMENT">VERIFY_PAYMENT</option>
                  <option value="REJECT_PAYMENT">REJECT_PAYMENT</option>
                  <option value="REFUND">REFUND</option>
                  <option value="CANCEL">CANCEL</option>
                  <option value="USER_DELETED">USER_DELETED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entity:</label>
                <select
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  value={auditFilterEntity}
                  onChange={(e) => setAuditFilterEntity(e.target.value)}
                >
                  <option value="ALL">All Entities</option>
                  <option value="BOOKING">BOOKING</option>
                  <option value="SCHEDULE">SCHEDULE</option>
                  <option value="VESSEL">VESSEL</option>
                  <option value="USER">USER</option>
                  <option value="JETTY">JETTY</option>
                  <option value="RECEIPT">RECEIPT</option>
                </select>
              </div>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit logs by ID, summary, user, or email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE VIEW */}
          {auditViewMode === 'table' && (
            <div className="glass-panel rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Action</th>
                      <th className="px-6 py-3.5">Readable Event Description</th>
                      <th className="px-6 py-3.5">Performed By</th>
                      <th className="px-6 py-3.5 text-right">Details & History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs
                      .filter(a => auditFilterAction === 'ALL' || a.action === auditFilterAction)
                      .filter(a => auditFilterEntity === 'ALL' || a.entityType === auditFilterEntity)
                      .filter(a => {
                        if (!auditSearchQuery.trim()) return true;
                        const q = auditSearchQuery.toLowerCase().trim();
                        const headline = getAuditHeadline(a).toLowerCase();
                        return (
                          a.id.toLowerCase().includes(q) ||
                          a.entityId.toLowerCase().includes(q) ||
                          headline.includes(q) ||
                          a.performedBy.name.toLowerCase().includes(q) ||
                          (a.performedBy.email && a.performedBy.email.toLowerCase().includes(q))
                        );
                      })
                      .map(a => {
                        const isDelete = a.action.includes('DELETE');
                        const isVerify = a.action === 'VERIFY_PAYMENT';
                        const isCreate = a.action === 'CREATE' || a.action === 'USER_CREATED';
                        const headline = getAuditHeadline(a);

                        return (
                          <tr key={a.id} className="hover:bg-slate-50/80 transition duration-150">
                            <td className="px-6 py-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                              {new Date(a.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase border ${
                                isDelete ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                isVerify ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isCreate ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {a.action}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-900 text-xs leading-snug">{headline}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Target ID: <span className="font-bold text-slate-700">{a.entityId}</span> ({a.entityType})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-extrabold text-slate-900">{a.performedBy.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                {a.performedBy.email || 'N/A'} · <span className="uppercase font-bold">{a.performedBy.role}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setInspectorTab('readable');
                                  setInspectingAuditLog(a);
                                }}
                                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-[11px] font-bold cursor-pointer transition inline-flex items-center gap-1.5 border border-sky-200 shadow-sm"
                              >
                                <Eye size={14} /> View History
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TIMELINE AUDIT TRAIL VIEW */}
          {auditViewMode === 'timeline' && (
            <div className="glass-panel rounded-2xl border border-slate-200 bg-white p-6 shadow-md relative">
              <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
                {auditLogs
                  .filter(a => auditFilterAction === 'ALL' || a.action === auditFilterAction)
                  .filter(a => auditFilterEntity === 'ALL' || a.entityType === auditFilterEntity)
                  .filter(a => {
                    if (!auditSearchQuery.trim()) return true;
                    const q = auditSearchQuery.toLowerCase().trim();
                    const headline = getAuditHeadline(a).toLowerCase();
                    return (
                      a.id.toLowerCase().includes(q) ||
                      a.entityId.toLowerCase().includes(q) ||
                      headline.includes(q) ||
                      a.performedBy.name.toLowerCase().includes(q) ||
                      (a.performedBy.email && a.performedBy.email.toLowerCase().includes(q))
                    );
                  })
                  .map(a => {
                    const isDelete = a.action.includes('DELETE');
                    const isVerify = a.action === 'VERIFY_PAYMENT';
                    const isCreate = a.action === 'CREATE' || a.action === 'USER_CREATED';
                    const headline = getAuditHeadline(a);
                    const diffs = getAuditReadableDiffs(a);

                    return (
                      <div key={a.id} className="relative flex items-start gap-4 pl-10">
                        {/* Timeline Node Icon */}
                        <div className={`absolute left-0 top-0.5 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm z-10 ${
                          isDelete ? 'bg-rose-100 border-rose-300 text-rose-600' :
                          isVerify ? 'bg-emerald-100 border-emerald-300 text-emerald-600' :
                          isCreate ? 'bg-sky-100 border-sky-300 text-sky-600' :
                          'bg-amber-100 border-amber-300 text-amber-700'
                        }`}>
                          {isDelete ? <Trash2 size={16} /> : isVerify ? <CheckCircle size={16} /> : isCreate ? <Plus size={16} /> : <AlertTriangle size={16} />}
                        </div>

                        {/* Card */}
                        <div className="flex-1 glass-panel p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-slate-400">{a.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                isDelete ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                isVerify ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                isCreate ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {a.action}
                              </span>
                              <span className="text-xs font-bold text-slate-600">· {a.entityType} ({a.entityId})</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {new Date(a.createdAt).toLocaleString()}
                            </div>
                          </div>

                          <div className="text-sm font-extrabold text-slate-900 leading-snug">
                            {headline}
                          </div>

                          {diffs.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {diffs.slice(0, 4).map((d, i) => (
                                <div key={i} className="text-[10px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold shadow-2xs">
                                  <span className="text-slate-400 font-bold">{d.label}:</span> <span className="text-rose-600 line-through">{d.before}</span> → <span className="text-emerald-700 font-extrabold">{d.after}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 text-[11px] text-slate-500 border-t border-slate-200/60">
                            <div>
                              Performed by: <span className="font-bold text-slate-800">{a.performedBy.name}</span> ({a.performedBy.role})
                            </div>
                            <button
                              onClick={() => {
                                setInspectorTab('readable');
                                setInspectingAuditLog(a);
                              }}
                              className="text-sky-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Eye size={12} /> Inspect Audit Log
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* AUDIT LOG INSPECTOR MODAL WITH HUMAN READABLE + JSON OPTIONAL TABS */}
      {inspectingAuditLog && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1300 }}>
          <div 
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <ShieldAlert size={22} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Audit Entry: {inspectingAuditLog.id}</h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Recorded on {new Date(inspectingAuditLog.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setInspectingAuditLog(null)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Format Switcher Tabs: Readable Summary (Default) vs JSON (Optional) */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/30">
              <button
                type="button"
                onClick={() => setInspectorTab('readable')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  inspectorTab === 'readable'
                    ? 'border-sky-500 text-sky-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText size={15} /> Readable Change Summary
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab('json')}
                className={`py-3 px-4 text-xs font-extrabold border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  inspectorTab === 'json'
                    ? 'border-sky-500 text-sky-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code size={15} /> Raw JSON Data (Optional / Technical)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto text-left text-xs">
              
              {/* Event Metadata Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action</span>
                  <span className="font-black text-slate-900 text-sm">{inspectingAuditLog.action}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Entity</span>
                  <span className="font-bold text-slate-800 text-sm">{inspectingAuditLog.entityType} ({inspectingAuditLog.entityId})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Performed By</span>
                  <span className="font-extrabold text-slate-900">{inspectingAuditLog.performedBy.name}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">({inspectingAuditLog.performedBy.role})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Email</span>
                  <span className="font-mono text-slate-700">{inspectingAuditLog.performedBy.email || 'N/A'}</span>
                </div>
              </div>

              {/* READABLE SUMMARY TAB CONTENT */}
              {inspectorTab === 'readable' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Headline summary card */}
                  <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-sky-900">
                    <div className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider mb-1">Human-Readable Event Summary</div>
                    <div className="text-sm font-black leading-relaxed">
                      {getAuditHeadline(inspectingAuditLog)}
                    </div>
                  </div>

                  {/* Field Level Changes Table */}
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                      What Changed (Field History Breakdown)
                    </h4>
                    {getAuditReadableDiffs(inspectingAuditLog).length === 0 ? (
                      <div className="text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                        No specific field changes recorded for this entry.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2.5">Field / Attribute</th>
                              <th className="px-4 py-2.5 text-rose-700">Original Value (Before)</th>
                              <th className="px-4 py-2.5 text-emerald-700">Updated Value (After)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {getAuditReadableDiffs(inspectingAuditLog).map((diff, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-extrabold text-slate-800">{diff.label}</td>
                                <td className="px-4 py-3 font-mono text-rose-600 bg-rose-50/50">{diff.before}</td>
                                <td className="px-4 py-3 font-mono text-emerald-700 bg-emerald-50/50 font-bold">{diff.after}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Context Card */}
                  {inspectingAuditLog.metadata && Object.keys(inspectingAuditLog.metadata).length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">
                        Context & Deletion Snapshot Notes
                      </h4>
                      {inspectingAuditLog.metadata.deletedBookingSnapshot && (
                        <div className="text-slate-800 space-y-1 bg-white p-3 rounded-xl border border-amber-200/60">
                          <div className="font-bold text-rose-700">⚠️ Deleted Booking Snapshot Details:</div>
                          <div>• PNR Code: <span className="font-mono font-bold">{inspectingAuditLog.metadata.deletedBookingSnapshot.id}</span></div>
                          <div>• Passenger: <span className="font-bold">{inspectingAuditLog.metadata.deletedBookingSnapshot.passengers?.[0]?.name}</span> ({inspectingAuditLog.metadata.deletedBookingSnapshot.passengerEmail})</div>
                          <div>• Vessel & Route: {inspectingAuditLog.metadata.deletedBookingSnapshot.vesselName} ({inspectingAuditLog.metadata.deletedBookingSnapshot.routeFrom} → {inspectingAuditLog.metadata.deletedBookingSnapshot.routeTo})</div>
                          <div>• Total Fare Paid: ${inspectingAuditLog.metadata.deletedBookingSnapshot.totalAmount?.toFixed(2)}</div>
                          <div>• Transfer Slip Attachment Status: {inspectingAuditLog.metadata.hadReceipt ? 'Receipt image deleted' : 'No slip was attached'}</div>
                        </div>
                      )}
                      {inspectingAuditLog.metadata.note && (
                        <div className="text-amber-800 font-medium">
                          Note: {inspectingAuditLog.metadata.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* RAW JSON TAB CONTENT */}
              {inspectorTab === 'json' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Raw JSON Payload & State Diffs</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(inspectingAuditLog, null, 2));
                        showAlert('Raw JSON copied to clipboard.', 'Copied', 'success');
                      }}
                      className="text-sky-600 font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Check size={14} /> Copy JSON
                    </button>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs mb-1">Changes Object (Before vs After)</h5>
                    <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed max-h-60 shadow-inner">
                      {JSON.stringify(inspectingAuditLog.changes || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-700 text-xs mb-1">Metadata Object</h5>
                    <pre className="bg-slate-100 text-slate-800 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed max-h-40 border border-slate-200">
                      {JSON.stringify(inspectingAuditLog.metadata || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-slate-400 text-[11px] font-medium">Audit Record ID: {inspectingAuditLog.id}</span>
              <button
                onClick={() => setInspectingAuditLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS & ANALYTICS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-lg border-l-4 border-l-sky-500 space-y-2">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={16} className="text-sky-600" /> Revenue Summary
              </div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-650 to-indigo-650">
                ${totalVerifiedRevenue.toLocaleString()}
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                Aggregates all cleared credit card charges and verified bank slip payments.
              </p>
            </div>
            
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-lg border-l-4 border-l-indigo-400 space-y-2">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={16} className="text-indigo-600" /> Fleet Utilization
              </div>
              <div className="text-2xl font-black text-slate-850">82% Capacity</div>
              <p className="text-slate-500 text-[10px] leading-relaxed font-medium">
                Vessel layouts locked and booked occupancy average across active scheduled routes.
              </p>
            </div>
          </div>

          <div className="glass-panel border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cabin Class Popularity</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Demographics and passenger ratios grouped by booking category.</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {/* VIP */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-600 font-semibold flex items-center gap-1">VIP Cabin Class</span>
                  <span>18%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full border border-slate-350/20 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
              
              {/* Premium */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-indigo-600 font-semibold flex items-center gap-1">Premium Cabin Class</span>
                  <span>32%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full border border-slate-350/20 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '32%' }} />
                </div>
              </div>

              {/* Economy */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 font-semibold flex items-center gap-1">Economy Class</span>
                  <span>50%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full border border-slate-350/20 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddForm && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1200 }}>
          {/* White card — same pattern as ProfileModal */}
          <div
            className="bg-white rounded-3xl w-full max-w-2xl mx-auto shadow-2xl border border-slate-100 flex flex-col animate-fade-in relative overflow-y-auto"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Fixed Header ── */}
            <div className="flex justify-between items-center px-8 pt-7 pb-5 shrink-0 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingScheduleId ? 'Edit Vessel Route Schedule' : 'Define New Schedule'}
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Configure vessel schedule, route, and stops.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="flex flex-col flex-1 min-h-0 text-left">
              {/* ── Scrollable body ── */}
              <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Fleet Vessel</label>
                  <select 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 cursor-pointer font-medium transition duration-200"
                    value={routeVesselId || vessels[0]?.id || ''}
                    onChange={(e) => setRouteVesselId(e.target.value)}
                    required
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departure Jetty</label>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddTarget('departure');
                          setQuickPortName('');
                          setQuickPortCode('');
                        }}
                        className="text-[10px] text-sky-600 hover:text-sky-505 font-black uppercase tracking-wider cursor-pointer transition select-none"
                      >
                        + New
                      </button>
                    </div>
                    <select 
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 cursor-pointer font-medium transition duration-200"
                      value={routeFrom} 
                      onChange={(e) => setRouteFrom(e.target.value)}
                    >
                      {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival Jetty</label>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddTarget('arrival');
                          setQuickPortName('');
                          setQuickPortCode('');
                        }}
                        className="text-[10px] text-sky-600 hover:text-sky-505 font-black uppercase tracking-wider cursor-pointer transition select-none"
                      >
                        + New
                      </button>
                    </div>
                    <select 
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 cursor-pointer font-medium transition duration-200"
                      value={routeTo} 
                      onChange={(e) => setRouteTo(e.target.value)}
                    >
                      {locations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recurrence Frequency</label>
                    <select 
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 cursor-pointer font-semibold transition duration-200"
                      value={scheduleRecurrence}
                      onChange={(e) => setScheduleRecurrence(e.target.value as any)}
                    >
                      <option value="Daily">Daily Transfer</option>
                      <option value="Weekly">Weekly Transfer</option>
                      <option value="Monthly">Monthly Transfer</option>
                      <option value="Specific Date">Specific Date Only</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule Date</label>
                    <input 
                      type="date" 
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-sky-500 font-semibold"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departure Time</label>

                    <input 
                      type="text" 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 font-medium transition duration-200" 
                      value={departureTime} 
                      onChange={(e) => setDepartureTime(e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arrival Time</label>
                    <input 
                      type="text" 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 font-medium transition duration-200" 
                      value={arrivalTime} 
                      onChange={(e) => setArrivalTime(e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price ($)</label>
                    <input 
                      type="number" 
                      className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 font-medium transition duration-200" 
                      value={price} 
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} 
                    />
                  </div>
                </div>

                {/* Route Stops Configuration */}
                <div className="border-t border-slate-150 pt-5 space-y-3">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Route Path Stops (Chronological)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {stops.map((stopId, index) => (
                      <div key={index} className="flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-700 text-xs px-2.5 py-1 rounded-lg font-bold">
                        <span>{locations.find(l => l.id === stopId)?.name || stopId}</span>
                        <button
                          type="button"
                          onClick={() => setStops(prev => prev.filter((_, i) => i !== index))}
                          className="text-rose-600 hover:text-rose-500 font-bold ml-1 cursor-pointer focus:outline-none"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {stops.length === 0 && (
                      <span className="text-xs text-slate-400 font-medium">No intermediate stops configured (Direct Route).</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer font-medium flex-1 text-slate-800"
                      value=""
                      onChange={(e) => {
                        const stopId = e.target.value;
                        if (stopId && !stops.includes(stopId) && stopId !== routeFrom && stopId !== routeTo) {
                          setStops(prev => [...prev, stopId]);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="" className="text-slate-500">+ Add Intermediate Stop Port</option>
                      {locations
                        .filter(l => l.id !== routeFrom && l.id !== routeTo && !stops.includes(l.id))
                        .map(l => (
                          <option key={l.id} value={l.id} className="text-slate-800">{l.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* Route Status Controls */}
                <div className="border-t border-slate-150 pt-5 grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2.5 text-xs text-rose-700 hover:text-rose-800 cursor-pointer select-none font-bold bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 transition duration-150">
                    <input
                      type="checkbox"
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500/20 bg-white"
                      checked={disabled}
                      onChange={(e) => setDisabled(e.target.checked)}
                    />
                    Disable Route
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-amber-700 hover:text-amber-800 cursor-pointer select-none font-bold bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 transition duration-155">
                    <input
                      type="checkbox"
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500/20 bg-white"
                      checked={maintenance}
                      onChange={(e) => setMaintenance(e.target.checked)}
                    />
                    Vessel Maintenance Mode
                  </label>
                </div>
              </div>

              {/* ── Pinned Footer ── */}
              <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 shrink-0 bg-white rounded-b-3xl">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-505 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition cursor-pointer text-sm"
                >
                  {editingScheduleId ? 'Save Schedule Changes' : 'Create Schedule Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN BOOKING CRUD FORM MODAL */}
      {showBookingForm && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1200 }}>
          <div className="glass-panel-strong rounded-3xl w-full max-w-4xl p-6 md:p-8 relative shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto flex flex-col bg-white">
            <button 
              type="button"
              onClick={() => setShowBookingForm(false)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-705 cursor-pointer transition animate-none"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2 text-left">
              {editingBookingId ? `Edit Booking ${editingBookingId}` : 'Create Manual Booking'}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-6 text-left border-b pb-4">
              {editingBookingId ? 'Modify passenger information, seat class selections, payment methods, or booking status.' : 'Register a new passenger booking and lock down seat assignments manually.'}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              
              // Validate passenger seats and fields
              const hasEmptySeats = crudBookingPassengers.some(p => !p.seatId);
              if (hasEmptySeats) {
                showAlert('Please select a seat assignment for every passenger.', 'Seat Missing', 'error');
                return;
              }

              const hasDuplicateSeats = new Set(crudBookingPassengers.map(p => p.seatId)).size !== crudBookingPassengers.length;
              if (hasDuplicateSeats) {
                showAlert('Each passenger must have a unique seat assignment.', 'Duplicate Seats', 'error');
                return;
              }

              const selectedSchedule = schedules.find(s => s.id === crudBookingScheduleId);
              if (!selectedSchedule) {
                showAlert('Selected transit route is invalid.', 'Invalid Schedule', 'error');
                return;
              }

              // Build/update booking object
              const seatIds = crudBookingPassengers.map(p => p.seatId);
              
              // Compute price
              const basePrice = selectedSchedule.price;
              const deckSeats = decks[crudBookingScheduleId] || [];
              let computedTotal = 0;
              crudBookingPassengers.forEach(p => {
                const seatObj = deckSeats.find(s => s.id === p.seatId);
                let seatSurcharge = 0;
                if (seatObj?.class === 'VIP') seatSurcharge = 15;
                else if (seatObj?.class === 'Premium') seatSurcharge = 5;
                computedTotal += basePrice + seatSurcharge;
              });

              // Apply discount
              const finalAmount = Math.max(0, computedTotal - crudBookingDiscount);

              if (editingBookingId) {
                // Update booking
                updateBooking(editingBookingId, {
                  scheduleId: crudBookingScheduleId,
                  vesselName: selectedSchedule.vesselName,
                  vesselType: selectedSchedule.vesselType,
                  departureTime: selectedSchedule.departureTime,
                  arrivalTime: selectedSchedule.arrivalTime,
                  routeFrom: selectedSchedule.routeFrom,
                  routeTo: selectedSchedule.routeTo,
                  passengers: crudBookingPassengers,
                  selectedSeatIds: seatIds,
                  totalAmount: finalAmount,
                  discountApplied: crudBookingDiscount,
                  promoCodeUsed: crudBookingPromo || undefined,
                  paymentMethod: crudBookingPayment,
                  status: crudBookingStatus
                });
                showAlert('Booking updated successfully.', 'Booking Saved', 'success');
              } else {
                // Add booking
                const newId = `SF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                addBooking({
                  id: newId,
                  scheduleId: crudBookingScheduleId,
                  vesselName: selectedSchedule.vesselName,
                  vesselType: selectedSchedule.vesselType,
                  departureTime: selectedSchedule.departureTime,
                  arrivalTime: selectedSchedule.arrivalTime,
                  routeFrom: selectedSchedule.routeFrom,
                  routeTo: selectedSchedule.routeTo,
                  passengers: crudBookingPassengers,
                  selectedSeatIds: seatIds,
                  totalAmount: finalAmount,
                  discountApplied: crudBookingDiscount,
                  promoCodeUsed: crudBookingPromo || undefined,
                  paymentMethod: crudBookingPayment,
                  status: crudBookingStatus,
                  createdAt: new Date().toISOString()
                });
                showAlert('Booking created successfully.', 'Booking Issued', 'success');
              }

              setShowBookingForm(false);
            }} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs font-semibold">
              
              {/* Left Column: Core Fields */}
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-505">Transit Schedule & Vessel</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none cursor-pointer"
                    value={crudBookingScheduleId}
                    onChange={(e) => {
                      setCrudBookingScheduleId(e.target.value);
                      // Clear selected seats when changing transit
                      setCrudBookingPassengers(prev => prev.map(p => ({ ...p, seatId: '' })));
                    }}
                    required
                  >
                    {schedules.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.vesselName} ({s.vesselType}) | {s.routeFrom} ➔ {s.routeTo} at {s.departureTime} (${s.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-505">Payment Option</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none cursor-pointer"
                      value={crudBookingPayment}
                      onChange={(e) => setCrudBookingPayment(e.target.value as any)}
                    >
                      <option value="card">Card Payment</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-505">Booking Status</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none cursor-pointer"
                      value={crudBookingStatus}
                      onChange={(e) => setCrudBookingStatus(e.target.value as any)}
                    >
                      <option value="verified">Verified (Active)</option>
                      <option value="pending_verification">Pending Verification</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-505">Promo Code (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none"
                      value={crudBookingPromo}
                      onChange={(e) => setCrudBookingPromo(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-505">Discount Amount ($)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none"
                      value={crudBookingDiscount}
                      onChange={(e) => setCrudBookingDiscount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Passengers Information & Seat Assignment */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-sm font-extrabold text-slate-750">Passenger & Seats List</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCrudBookingPassengers(prev => [
                        ...prev,
                        { name: '', age: 30, gender: 'Male', idNumber: '', seatId: '' }
                      ]);
                    }}
                    className="text-sky-650 hover:text-sky-700 font-extrabold text-xs cursor-pointer"
                  >
                    + Add Passenger
                  </button>
                </div>

                <div className="space-y-4 pr-1">
                  {crudBookingPassengers.map((passenger, index) => {
                    // Calculate available seats for this schedule
                    const deckSeats = decks[crudBookingScheduleId] || [];
                    const currentBookingObj = bookings.find(b => b.id === editingBookingId);
                    
                    // A seat is available if it status is available, or if it belongs to the current booking we are editing
                    const availableSeats = deckSeats.filter(seat => {
                      const isFree = seat.status === 'available';
                      const isMySeat = currentBookingObj ? currentBookingObj.selectedSeatIds.includes(seat.id) : false;
                      const isAlreadyClaimedByOtherPassenger = crudBookingPassengers.some((p, pIdx) => pIdx !== index && p.seatId === seat.id);
                      return (isFree || isMySeat) && !isAlreadyClaimedByOtherPassenger;
                    });

                    return (
                      <div key={index} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 relative">
                        {crudBookingPassengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCrudBookingPassengers(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute right-3 top-3 text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                        
                        <div className="font-extrabold text-slate-650 mb-1">Passenger #{index + 1}</div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">Full Name</label>
                            <input
                              type="text"
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                              value={passenger.name}
                              onChange={(e) => {
                                const newP = [...crudBookingPassengers];
                                newP[index].name = e.target.value;
                                setCrudBookingPassengers(newP);
                              }}
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">ID / Passport Number</label>
                            <input
                              type="text"
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                              value={passenger.idNumber}
                              onChange={(e) => {
                                const newP = [...crudBookingPassengers];
                                newP[index].idNumber = e.target.value;
                                setCrudBookingPassengers(newP);
                              }}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">Age</label>
                            <input
                              type="number"
                              min="1"
                              className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                              value={passenger.age}
                              onChange={(e) => {
                                const newP = [...crudBookingPassengers];
                                newP[index].age = Number(e.target.value);
                                setCrudBookingPassengers(newP);
                              }}
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500">Gender</label>
                            <select
                              className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none cursor-pointer"
                              value={passenger.gender}
                              onChange={(e) => {
                                const newP = [...crudBookingPassengers];
                                newP[index].gender = e.target.value;
                                setCrudBookingPassengers(newP);
                              }}
                            >
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-550">Assign Seat</label>
                            <select
                              className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none cursor-pointer font-mono font-black"
                              value={passenger.seatId}
                              onChange={(e) => {
                                const newP = [...crudBookingPassengers];
                                newP[index].seatId = e.target.value;
                                setCrudBookingPassengers(newP);
                              }}
                              required
                            >
                              <option value="">Select...</option>
                              {availableSeats.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.id} ({s.class})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 border-t pt-6 mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-505 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer animate-none"
                >
                  {editingBookingId ? 'Save Changes' : 'Issue Tickets'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <span className="text-xs mt-1">This is a PDF or other non-image file.</span>
                <a href={previewingSlipUrl} download="transfer_slip" className="mt-4 bg-sky-505 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-lg text-xs font-sans">
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK ADD JETTY PORT OVERLAY MODAL */}
      {quickAddTarget && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1300 }}>
          <div className="glass-panel-strong rounded-3xl w-full max-w-md p-6 relative shadow-2xl border border-slate-200 bg-white">
            <button 
              type="button"
              onClick={() => {
                setQuickAddTarget(null);
                setQuickPortName('');
                setQuickPortCode('');
              }} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-750 cursor-pointer transition p-1.5 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1 text-left">
              Quick Add {quickAddTarget === 'departure' ? 'Departure' : 'Arrival'} Port
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-6 text-left">
              Create a new jetty option that will instantly become selectable in the route options.
            </p>

            <div className="space-y-4 text-left text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Port/Island Name</label>
                <input
                  type="text"
                  placeholder="e.g. Feridhoo Port"
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none font-medium text-xs"
                  value={quickPortName}
                  onChange={(e) => setQuickPortName(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">3-Letter Code</label>
                <input
                  type="text"
                  placeholder="e.g. FRD"
                  maxLength={3}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-slate-800 focus:outline-none font-medium uppercase text-xs"
                  value={quickPortCode}
                  onChange={(e) => setQuickPortCode(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 mt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddTarget(null);
                    setQuickPortName('');
                    setQuickPortCode('');
                  }}
                  className="bg-transparent border border-slate-200 text-slate-650 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = quickPortName.trim();
                    const code = quickPortCode.trim().toUpperCase();
                    if (!name || !code) {
                      showAlert('Please fill out both Port Name and 3-Letter Code.', 'Fields Required', 'error');
                      return;
                    }
                    if (code.length !== 3) {
                      showAlert('Port code must be exactly 3 letters.', 'Invalid Code', 'error');
                      return;
                    }
                    
                    // Verify if port already exists
                    if (locations.some(loc => loc.id === code)) {
                      showAlert(`A port with code ${code} already exists.`, 'Duplicate Port', 'error');
                      return;
                    }

                    addLocation(name, code);
                    
                    // Automatically select the newly created port in the dropdown
                    if (quickAddTarget === 'departure') {
                      setRouteFrom(code);
                    } else {
                      setRouteTo(code);
                    }

                    setQuickAddTarget(null);
                    setQuickPortName('');
                    setQuickPortCode('');
                  }}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition shadow-md"
                >
                  Register Port
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL CENTER TAB */}
      {activeTab === 'emails' && (
        <div className="space-y-6 text-slate-800">
          
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* SMTP config form */}
            <div className="flex-1 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2 border-b pb-2">
                <Key className="text-sky-650" size={18} /> SMTP Server Settings
              </h3>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                   updateEmailConfig({
                     host: smtpHost,
                     port: smtpPort,
                     senderName: smtpSenderName,
                     senderEmail: smtpSenderEmail,
                     username: smtpUsername
                   });
                   showAlert('SMTP Configuration saved successfully!', 'SMTP Settings Saved', 'success');
                 }}
                className="space-y-4 text-xs font-semibold"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">SMTP Host</label>
                    <input 
                      type="text" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">SMTP Port</label>
                    <input 
                      type="text" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Sender Name</label>
                    <input 
                      type="text" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpSenderName}
                      onChange={(e) => setSmtpSenderName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Sender Email</label>
                    <input 
                      type="email" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpSenderEmail}
                      onChange={(e) => setSmtpSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">SMTP Username</label>
                    <input 
                      type="text" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">SMTP Password</label>
                    <input 
                      type="password" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-sm transition"
                >
                  Save Configuration
                </button>
              </form>
            </div>

            {/* Notification triggers toggles */}
            <div className="w-full lg:w-80 bg-white border border-slate-200 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2 border-b pb-2">
                <AlertTriangle className="text-sky-650" size={18} /> Notification Toggles
              </h3>
              
              <div className="space-y-3.5 text-xs font-semibold text-slate-655">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span>Welcome email on registration</span>
                  <input 
                    type="checkbox"
                    checked={emailConfig.welcomeEnabled}
                    onChange={(e) => updateEmailConfig({ welcomeEnabled: e.target.checked })}
                    className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20"
                  />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span>Booking invoice and receipt</span>
                  <input 
                    type="checkbox"
                    checked={emailConfig.bookingEnabled}
                    onChange={(e) => updateEmailConfig({ bookingEnabled: e.target.checked })}
                    className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span>Verification updates (Slip reviews)</span>
                  <input 
                    type="checkbox"
                    checked={emailConfig.statusEnabled}
                    onChange={(e) => updateEmailConfig({ statusEnabled: e.target.checked })}
                    className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span>Security lookup OTP keys</span>
                  <input 
                    type="checkbox"
                    checked={emailConfig.otpEnabled}
                    onChange={(e) => updateEmailConfig({ otpEnabled: e.target.checked })}
                    className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span>Password recovery OTP emails</span>
                  <input 
                    type="checkbox"
                    checked={emailConfig.resetEnabled}
                    onChange={(e) => updateEmailConfig({ resetEnabled: e.target.checked })}
                    className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Email logs table */}
          <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-extrabold text-slate-855 flex items-center gap-2">
                <Mail className="text-sky-655" size={18} /> Automated Sent Emails Log
              </h3>
              {sentEmails.length > 0 && (
                <button 
                  onClick={clearEmailLogs}
                  className="bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-550 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {sentEmails.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-xl">
                No mock emails have been dispatched or logged in this session yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-black">
                      <th className="py-2.5 px-4">Log ID</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4">Recipient</th>
                      <th className="py-2.5 px-4">Subject</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                    {sentEmails.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600">{log.id}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.recipient}</td>
                        <td className="py-3 px-4 truncate max-w-[200px]">{log.subject}</td>
                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => setPreviewingEmail(log)}
                            className="bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1 rounded-lg transition font-bold cursor-pointer"
                          >
                            Inspect Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* INSPECT EMAIL MODAL */}
      {previewingEmail && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1400 }}>
          <div className="glass-panel-strong rounded-2xl w-full max-w-xl p-6 relative shadow-2xl border border-slate-300 bg-white text-slate-800 text-left max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setPreviewingEmail(null)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 cursor-pointer transition"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 mb-4 border-b pb-2">Inspect Sent Email Log</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs font-semibold mb-4 leading-relaxed">
              <div><span className="text-slate-400">SMTP Server:</span> {emailConfig.host}:{emailConfig.port}</div>
              <div><span className="text-slate-400">From:</span> {emailConfig.senderName} &lt;{emailConfig.senderEmail}&gt;</div>
              <div><span className="text-slate-400">To:</span> {previewingEmail.recipient}</div>
              <div><span className="text-slate-400">Date:</span> {new Date(previewingEmail.timestamp).toLocaleString()}</div>
              <div><span className="text-slate-400">Subject:</span> <strong className="text-slate-800">{previewingEmail.subject}</strong></div>
            </div>
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-[40vh] overflow-y-auto shadow-inner bg-slate-100/10">
              {previewingEmail.body}
            </div>
          </div>
        </div>
      )}

      {/* VESSEL CRUD FORM MODAL */}
      {showVesselForm && (
        <div className="overlay animate-fade-in" style={{ zIndex: 1200 }}>
          <div
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-100 flex flex-col animate-fade-in relative overflow-y-auto lg:overflow-hidden"
            style={{ maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-8 pt-7 pb-5 shrink-0 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingVesselId ? 'Edit Vessel & Layout' : 'Add New Vessel'}
                </h3>
                <p className="text-slate-500 text-xs mt-1 font-medium">Configure vessel details, seat class layout, and amenities.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVesselForm(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const vipRowsList = Array.from(new Set(vesselPreviewSeats.filter(s => s.class === 'VIP').map(s => s.row)));
                const premiumRowsList = Array.from(new Set(vesselPreviewSeats.filter(s => s.class === 'Premium').map(s => s.row)));
                const finalVipRows = formatRowsString(vipRowsList) || vesselFormVipRows;
                const finalPremiumRows = formatRowsString(premiumRowsList) || vesselFormPremiumRows;

                const vData = {
                  name: vesselFormName,
                  type: vesselFormType as 'Speedboat' | 'Ferry',
                  amenities: vesselFormAmenities,
                  layoutRows: vesselFormRows,
                  layoutCols: vesselFormCols,
                  vipRows: finalVipRows,
                  premiumRows: finalPremiumRows,
                  customSeats: vesselPreviewSeats
                };
                if (editingVesselId) {
                  editVessel(editingVesselId, vData);
                } else {
                  addVessel(vData);
                }
                setShowVesselForm(false);
              }} 
              className="flex flex-col flex-1 min-h-0 text-left"
            >
              <div className="flex-1 min-h-0 lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-full">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-7 space-y-5 px-8 py-6 lg:overflow-y-auto lg:h-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vessel Name</label>
                        <input 
                          type="text" 
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 font-medium"
                          value={vesselFormName}
                          onChange={(e) => setVesselFormName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vessel Type</label>
                        <select 
                          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
                          value={vesselFormType}
                          onChange={(e) => setVesselFormType(e.target.value as any)}
                        >
                          <option value="Speedboat">Speedboat</option>
                          <option value="Ferry">Ferry</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-505 uppercase tracking-wider">Vessel Amenities</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                        {['AC', 'Water', 'Life Jacket', 'USB Charger', 'WiFi', 'Snacks'].map(item => (
                          <label key={item} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none font-semibold hover:text-slate-900 transition">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-350 text-sky-600 focus:ring-sky-500/20 bg-white"
                              checked={vesselFormAmenities.includes(item)}
                              onChange={() => {
                                setVesselFormAmenities(prev => 
                                  prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
                                );
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Seat Layout Settings</h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/60 border border-slate-150 rounded-2xl p-4">
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rows</label>
                          <input 
                            data-testid="layout-rows-input"
                            type="number" 
                            min="2" max="15"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none font-semibold" 
                            value={vesselFormRows} 
                            onChange={(e) => setVesselFormRows(Math.max(2, Math.min(15, parseInt(e.target.value) || 8)))} 
                          />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cols</label>
                          <input 
                            data-testid="layout-cols-input"
                            type="number" 
                            min="2" max="8"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none font-semibold" 
                            value={vesselFormCols} 
                            onChange={(e) => setVesselFormCols(Math.max(2, Math.min(8, parseInt(e.target.value) || 4)))} 
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-center bg-white border border-slate-200 rounded-xl px-3 py-2">
                          <p className="text-[11px] text-slate-500 font-semibold leading-tight">
                            Total Deck Capacity: <strong className="text-sky-600 font-extrabold">{vesselFormRows * vesselFormCols} Seats</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Seating preview */}
                  <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 px-8 py-6 flex flex-col lg:overflow-y-auto lg:h-full">
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Live Vessel Seating Preview</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        Click any seat to manually toggle its class: Economy (⚪) → VIP (🟡) → Premium (🔵).
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex-1 flex flex-col items-center justify-start min-h-[450px] shadow-inner relative bg-gradient-to-b from-slate-50 to-slate-100/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center w-full">Front (Bow)</div>
                      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-sky-500 mx-auto mb-6 shrink-0" />
                      
                      <div className="space-y-3 w-full max-w-[280px] pb-6 flex flex-col justify-start">
                        {Array.from({ length: vesselFormRows }, (_, i) => i + 1).map(r => {
                          const rowSeats = vesselPreviewSeats.filter(s => s.row === r).sort((a,b) => a.col - b.col);
                          if (rowSeats.length === 0) return null;
                          
                          const aisleIdx = Math.floor(vesselFormCols / 2);
                          const leftSeats = rowSeats.filter(s => s.col <= aisleIdx);
                          const rightSeats = rowSeats.filter(s => s.col > aisleIdx);
                          
                          return (
                            <div key={r} className="flex items-center justify-center gap-2 relative">
                              <span className="text-[10px] font-bold text-slate-400 absolute -left-7">R{r}</span>
                              
                              {/* Left Side */}
                              {leftSeats.map(seat => {
                                const cl = seat.class;
                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    onClick={() => handleToggleVesselSeatClass(seat.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition duration-200 cursor-pointer shadow-sm ${
                                      cl === 'VIP'
                                        ? 'bg-amber-400 text-amber-900 border-amber-500 shadow-md shadow-amber-400/20'
                                        : cl === 'Premium'
                                          ? 'bg-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                          : 'bg-white text-slate-700 border-slate-205 hover:bg-slate-100'
                                    }`}
                                  >
                                    {seat.id.replace('S-', '')}
                                  </button>
                                );
                              })}
                              
                              {aisleIdx > 0 && <div className="w-5 shrink-0" />}
                              
                              {/* Right Side */}
                              {rightSeats.map(seat => {
                                const cl = seat.class;
                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    onClick={() => handleToggleVesselSeatClass(seat.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition duration-200 cursor-pointer shadow-sm ${
                                      cl === 'VIP'
                                        ? 'bg-amber-400 text-amber-900 border-amber-500 shadow-md shadow-amber-400/20'
                                        : cl === 'Premium'
                                          ? 'bg-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                          : 'bg-white text-slate-700 border-slate-205 hover:bg-slate-100'
                                    }`}
                                  >
                                    {seat.id.replace('S-', '')}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center flex-wrap gap-4 text-[10px] font-extrabold text-slate-600 bg-slate-50 border border-slate-150 rounded-2xl p-3 shadow-sm">
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md border border-slate-200 bg-white" /><span>Economy</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-550" /><span>VIP</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-md bg-indigo-500 border border-indigo-600" /><span>Premium</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-100 shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowVesselForm(false)}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-505 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 transition cursor-pointer text-sm"
                >
                  {editingVesselId ? 'Save Changes' : 'Create Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
