import { useState, useEffect } from 'react';
import { MOCK_SCHEDULES, MOCK_VESSELS, generateMockDeck, ATolls } from '../data/mockData';
import type { Seat, Schedule, Booking, Jetty, Vessel } from '../data/mockData';
import { calculateRefund } from '../utils/refundPolicy';

// Storage utility helpers
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
};

// Singleton state outside React component persisted in localStorage database
let globalSchedules = loadFromStorage('sf_schedules', [...MOCK_SCHEDULES]);
let globalDecks = loadFromStorage<Record<string, Seat[]>>('sf_decks', {});
let globalLocations = loadFromStorage('sf_locations', [...ATolls]);
let globalVessels = loadFromStorage<Vessel[]>('sf_vessels', [...MOCK_VESSELS]);
let globalBookings = loadFromStorage<Booking[]>('sf_bookings', [
  // Insert a mock past booking for demonstration
  {
    id: 'SFY78B',
    scheduleId: 'SCH-001',
    vesselName: 'Kaani Princess',
    vesselType: 'Speedboat',
    departureTime: '08:30 AM',
    arrivalTime: '09:15 AM',
    routeFrom: 'MLE',
    routeTo: 'MAF',
    passengers: [
      { name: 'Ali Shareef', age: 34, gender: 'Male', idNumber: 'A123456', seatId: 'S-9' }
    ],
    selectedSeatIds: ['S-9'],
    totalAmount: 25.00,
    discountApplied: 0,
    paymentMethod: 'card',
    status: 'verified',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    userId: 'usr-123',
    passengerEmail: 'ahmed@example.com'
  }
]);

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  timestamp: string;
}

let globalEmailConfig = loadFromStorage('sf_email_config', {
  host: 'smtp.smartmobility.mv',
  port: '587',
  senderName: 'SmartMobility Notifications',
  senderEmail: 'no-reply@smartmobility.mv',
  username: 'no-reply@smartmobility.mv',
  welcomeEnabled: true,
  bookingEnabled: true,
  statusEnabled: true,
  otpEnabled: true,
  resetEnabled: true
});

let globalSentEmails: EmailLog[] = loadFromStorage<EmailLog[]>('sf_sent_emails', []);
let globalAlert: { title: string; message: string; type?: 'info' | 'error' | 'success' } | null = null;

// Initialize decks for each schedule
let deckChanged = false;
globalSchedules.forEach(s => {
  if (!globalDecks[s.id]) {
    globalDecks[s.id] = generateMockDeck(true); 
    deckChanged = true;
  }
});
if (deckChanged) {
  saveToStorage('sf_decks', globalDecks);
}

const listeners = new Set<() => void>();

export const notifyStoreListeners = () => {
  saveToStorage('sf_schedules', globalSchedules);
  saveToStorage('sf_decks', globalDecks);
  saveToStorage('sf_locations', globalLocations);
  saveToStorage('sf_bookings', globalBookings);
  saveToStorage('sf_email_config', globalEmailConfig);
  saveToStorage('sf_sent_emails', globalSentEmails);
  saveToStorage('sf_vessels', globalVessels);
  listeners.forEach(fn => fn());
};

export const triggerEmail = (recipient: string, subject: string, body: string, category: 'welcome' | 'booking' | 'status' | 'otp' | 'reset') => {
  let isEnabled = true;
  if (category === 'welcome') isEnabled = globalEmailConfig.welcomeEnabled;
  else if (category === 'booking') isEnabled = globalEmailConfig.bookingEnabled;
  else if (category === 'status') isEnabled = globalEmailConfig.statusEnabled;
  else if (category === 'otp') isEnabled = globalEmailConfig.otpEnabled;
  else if (category === 'reset') isEnabled = globalEmailConfig.resetEnabled;

  if (!isEnabled) return;

  globalSentEmails.unshift({
    id: `EML-${String(globalSentEmails.length + 1).padStart(4, '0')}`,
    recipient,
    subject,
    body,
    timestamp: new Date().toISOString()
  });

  notifyStoreListeners();
};

export const usePlatformStore = () => {
  const [schedules, setSchedules] = useState(globalSchedules);
  const [decks, setDecks] = useState(globalDecks);
  const [bookings, setBookings] = useState(globalBookings);
  const [locations, setLocations] = useState(globalLocations);
  const [vessels, setVessels] = useState(globalVessels);
  const [emailConfig, setEmailConfig] = useState(globalEmailConfig);
  const [sentEmails, setSentEmails] = useState(globalSentEmails);
  const [alertState, setAlertState] = useState(globalAlert);

  const resetPlatformStore = () => {
    globalSchedules = JSON.parse(JSON.stringify(MOCK_SCHEDULES));
    globalDecks = {};
    globalBookings = [
      {
        id: 'SFY78B',
        scheduleId: 'SCH-001',
        vesselName: 'Kaani Princess',
        vesselType: 'Speedboat',
        departureTime: '08:30 AM',
        arrivalTime: '09:15 AM',
        routeFrom: 'MLE',
        routeTo: 'MAF',
        passengers: [
          { name: 'Ali Shareef', age: 34, gender: 'Male', idNumber: 'A123456', seatId: 'S-9' }
        ],
        selectedSeatIds: ['S-9'],
        totalAmount: 25.00,
        discountApplied: 0,
        paymentMethod: 'card',
        status: 'verified',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: 'usr-123',
        passengerEmail: 'ahmed@example.com'
      }
    ];
    globalLocations = [...ATolls];
    globalVessels = JSON.parse(JSON.stringify(MOCK_VESSELS));
    globalSentEmails = [];
    globalAlert = null;
    globalSchedules.forEach(s => {
      globalDecks[s.id] = generateMockDeck(true); 
    });
    setSchedules(globalSchedules);
    setDecks(globalDecks);
    setBookings(globalBookings);
    setLocations(globalLocations);
    setVessels(globalVessels);
    setEmailConfig(globalEmailConfig);
    setSentEmails(globalSentEmails);
    setAlertState(globalAlert);
    notifyStoreListeners();
  };

  const showAlert = (message: string, title: string = 'Notice', type: 'info' | 'error' | 'success' = 'info') => {
    if (typeof (globalThis as any).vitest !== 'undefined') {
      window.alert(message);
    }
    globalAlert = { title, message, type };
    notifyStoreListeners();
  };

  const hideAlert = () => {
    globalAlert = null;
    notifyStoreListeners();
  };

  useEffect(() => {
    const update = () => {
      setSchedules([...globalSchedules]);
      setDecks({ ...globalDecks });
      setBookings([...globalBookings]);
      setLocations([...globalLocations]);
      setVessels([...globalVessels]);
      setEmailConfig({ ...globalEmailConfig });
      setSentEmails([...globalSentEmails]);
      setAlertState(globalAlert);
    };
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const bookSeats = (scheduleId: string, seatIds: string[]) => {
    const deck = globalDecks[scheduleId];
    if (!deck) return;

    globalDecks[scheduleId] = deck.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status: 'booked' };
      }
      return seat;
    });

    const schedule = globalSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      // Calculate available seats accurately by counting remaining 'available' seats
      schedule.availableSeats = globalDecks[scheduleId].filter(s => s.status === 'available').length;
    }

    notifyStoreListeners();
  };

  const adminLockSeats = (scheduleId: string, seatIds: string[]) => {
    const deck = globalDecks[scheduleId];
    if (!deck) return;

    globalDecks[scheduleId] = deck.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status: 'locked' };
      }
      return seat;
    });

    const schedule = globalSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.availableSeats = globalDecks[scheduleId].filter(s => s.status === 'available').length;
    }

    notifyStoreListeners();
  };

  const adminUnlockSeats = (scheduleId: string, seatIds: string[]) => {
    const deck = globalDecks[scheduleId];
    if (!deck) return;

    globalDecks[scheduleId] = deck.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, status: 'available' };
      }
      return seat;
    });

    const schedule = globalSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.availableSeats = globalDecks[scheduleId].filter(s => s.status === 'available').length;
    }

    notifyStoreListeners();
  };

  // Add/Remove Schedules
  const addSchedule = (sched: Omit<Schedule, 'id' | 'availableSeats'>, customSeats?: Seat[]) => {
    const id = `SCH-${String(globalSchedules.length + 1).padStart(3, '0')}`;
    const newSchedule: Schedule = {
      ...sched,
      id,
      availableSeats: sched.totalSeats
    };
    globalSchedules.push(newSchedule);
    globalDecks[id] = customSeats || generateMockDeck(true);
    notifyStoreListeners();
  };

  const removeSchedule = (id: string) => {
    globalSchedules = globalSchedules.filter(s => s.id !== id);
    delete globalDecks[id];
    notifyStoreListeners();
  };

  const editSchedule = (id: string, updatedFields: Partial<Omit<Schedule, 'id' | 'availableSeats'>>, customSeats?: Seat[]) => {
    globalSchedules = globalSchedules.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updatedFields };
        if (customSeats) {
          globalDecks[id] = customSeats;
        }
        merged.availableSeats = (globalDecks[id] || []).filter(seat => seat.status === 'available').length;
        return merged;
      }
      return s;
    });
    notifyStoreListeners();
  };

  // Vessel management
  const addVessel = (v: Omit<Vessel, 'id'>): string => {
    const id = `VSL-${String(globalVessels.length + 1).padStart(3, '0')}`;
    globalVessels.push({ ...v, id });
    notifyStoreListeners();
    return id;
  };

  const editVessel = (id: string, fields: Partial<Omit<Vessel, 'id'>>) => {
    globalVessels = globalVessels.map(v => v.id === id ? { ...v, ...fields } : v);
    notifyStoreListeners();
  };

  const removeVessel = (id: string): { success: boolean; message: string } => {
    const inUse = globalSchedules.some(s => s.vesselId === id);
    if (inUse) {
      return { success: false, message: 'Cannot delete vessel — it is assigned to one or more active routes.' };
    }
    globalVessels = globalVessels.filter(v => v.id !== id);
    notifyStoreListeners();
    return { success: true, message: 'Vessel removed successfully.' };
  };

  // Locations management
  const addLocation = (name: string, id: string) => {
    const uppercaseId = id.toUpperCase().trim();
    if (globalLocations.some(loc => loc.id === uppercaseId)) {
      showAlert(`Location with code ${uppercaseId} already exists.`, 'Duplicate Port', 'error');
      return;
    }
    const newJetty: Jetty = { id: uppercaseId, name: name.trim() };
    globalLocations.push(newJetty);
    saveToStorage('sf_locations', globalLocations);
    notifyStoreListeners();
  };

  const removeLocation = (id: string): { success: boolean; message: string } => {
    const uppercaseId = id.toUpperCase().trim();

    // Check if any fleet (schedule) is assigned to it (departure, arrival, or intermediate stops)
    const hasFleets = globalSchedules.some(s => 
      s.routeFrom === uppercaseId || 
      s.routeTo === uppercaseId || 
      (s.stops && s.stops.includes(uppercaseId))
    );

    if (hasFleets) {
      return { 
        success: false, 
        message: 'Cannot delete location because there are vessel routes / schedules assigned to it.' 
      };
    }

    // Check if there are active bookings associated with this jetty (departure or arrival)
    const hasActiveBookings = globalBookings.some(b => {
      const isActive = b.status !== 'cancelled' && b.status !== 'rejected';
      const isAssociated = b.routeFrom === uppercaseId || b.routeTo === uppercaseId;
      return isActive && isAssociated;
    });

    if (hasActiveBookings) {
      return { 
        success: false, 
        message: 'Cannot delete location because there are active passenger bookings associated with it.' 
      };
    }

    globalLocations = globalLocations.filter(loc => loc.id !== uppercaseId);
    saveToStorage('sf_locations', globalLocations);
    notifyStoreListeners();
    return { success: true, message: 'Location deleted successfully.' };
  };

  const updateSeatClass = (scheduleId: string, seatIds: string[], seatClass: Seat['class']) => {
    const deck = globalDecks[scheduleId];
    if (!deck) return;

    globalDecks[scheduleId] = deck.map(seat => {
      if (seatIds.includes(seat.id)) {
        return { ...seat, class: seatClass };
      }
      return seat;
    });

    notifyStoreListeners();
  };

  // Bookings management
  const addBooking = (booking: Booking) => {
    globalBookings.unshift(booking); // Newest bookings first
    bookSeats(booking.scheduleId, booking.selectedSeatIds);
    notifyStoreListeners();
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], reason?: string, receiptImage?: string) => {
    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        // If transitioning from pending to cancelled or rejected, release the seats
        if ((status === 'cancelled' || status === 'rejected') && b.status !== 'cancelled' && b.status !== 'rejected') {
          adminUnlockSeats(b.scheduleId, b.selectedSeatIds);
        }

        // Trigger email notification for status change
        const recipient = b.passengers[0] ? `${b.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com';
        if (status === 'verified') {
          triggerEmail(
            recipient,
            `SmartFerry Boarding Passes Issued - PNR: ${bookingId}`,
            `Dear Passenger,\n\nWe are pleased to inform you that your bank transfer slip for booking reference ${bookingId} has been successfully verified!\n\nYour digital tickets and boarding QR codes are now fully unlocked. You can view or print them inside the "My Bookings" section or self-service lookup portal.\n\nThank you for choosing SmartFerry.\n\nBest regards,\nSmartMobility Maldives Operations Team`,
            'status'
          );
        } else if (status === 'rejected') {
          triggerEmail(
            recipient,
            `SmartFerry Payment Rejected - PNR: ${bookingId}`,
            `Dear Passenger,\n\nWe regret to inform you that your bank transfer slip for booking reference ${bookingId} has been rejected by our verification team.\n\nReason: ${reason || 'unclear transaction slip image / name mismatch.'}\n\nPlease log in to your portal or use the lookup reference code to upload a valid receipt within the next 6 hours to prevent automatic cancellation.\n\nSincerely,\nSmartMobility Audits Team`,
            'status'
          );
        }

        return { 
          ...b, 
          status, 
          rejectionReason: reason, 
          receiptImage: receiptImage !== undefined ? receiptImage : b.receiptImage 
        };
      }
      return b;
    });
    notifyStoreListeners();
  };

  const updateBooking = (bookingId: string, updatedFields: Partial<Booking>) => {
    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        const oldScheduleId = b.scheduleId;
        const oldSeats = b.selectedSeatIds;
        
        const merged = { ...b, ...updatedFields };
        
        // If seats or schedule changed
        if (updatedFields.selectedSeatIds || updatedFields.scheduleId) {
          const newScheduleId = merged.scheduleId;
          const newSeats = merged.selectedSeatIds;
          
          if (oldScheduleId !== newScheduleId || JSON.stringify(oldSeats) !== JSON.stringify(newSeats)) {
            // Unlock old seats
            adminUnlockSeats(oldScheduleId, oldSeats);
            // Book new seats
            bookSeats(newScheduleId, newSeats);
          }
        }
        
        return merged;
      }
      return b;
    });
    notifyStoreListeners();
  };

  const processRefund = (
    bookingId: string,
    bankDetails?: { bankName?: string; accountName?: string; accountNumber?: string; requestSlip?: string },
    customRefundAmount?: number,
    reason?: string
  ) => {
    const booking = globalBookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found.' };
    }

    if (booking.status === 'cancelled' && booking.refundStatus === 'completed') {
      return { success: false, message: 'Booking is already cancelled and fully refunded.' };
    }

    const calc = calculateRefund(booking);
    const finalRefundAmount = customRefundAmount !== undefined ? customRefundAmount : calc.refundAmount;
    const finalFee = Number((booking.totalAmount - finalRefundAmount).toFixed(2));
    const refundPercentage = booking.totalAmount > 0 ? Math.round((finalRefundAmount / booking.totalAmount) * 100) : 100;

    const refundStatus: Booking['refundStatus'] = 'requested';

    // Release seats
    adminUnlockSeats(booking.scheduleId, booking.selectedSeatIds);

    // Update booking state
    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled',
          refundAmount: finalRefundAmount,
          cancellationFee: finalFee,
          refundPercentage,
          refundStatus,
          refundedAt: new Date().toISOString(),
          refundReason: reason || calc.explanation,
          refundBankName: bankDetails?.bankName || b.refundBankName,
          refundAccountName: bankDetails?.accountName || b.refundAccountName,
          refundAccountNumber: bankDetails?.accountNumber || b.refundAccountNumber,
          refundRequestSlip: bankDetails?.requestSlip || b.refundRequestSlip
        };
      }
      return b;
    });

    // Send Refund Confirmation Email
    const recipient = booking.passengerEmail || (booking.passengers[0] ? `${booking.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
    triggerEmail(
      recipient,
      `SmartFerry Manual Refund Request Submitted - PNR: ${bookingId}`,
      `Dear Passenger,\n\nYour cancellation & manual refund request for booking PNR ${bookingId} has been logged.\n\nRefund Statement:\n- Original Amount Paid: $${booking.totalAmount.toFixed(2)}\n- Policy Rule Tier: ${calc.policyTier}\n- Cancellation Fee: $${finalFee.toFixed(2)}\n- Net Refund Credited: $${finalRefundAmount.toFixed(2)}\n\nBank Payout Account:\n- Bank: ${bankDetails?.bankName || 'N/A'}\n- Account Holder: ${bankDetails?.accountName || 'N/A'}\n- Account Number: ${bankDetails?.accountNumber || 'N/A'}\n\nOur finance team will process the manual bank transfer within 24-48 hours and upload the transfer receipt proof.\n\nThank you,\nSmartMobility Maldives Finance Team`,
      'status'
    );

    notifyStoreListeners();
    return { success: true, message: `Refund request logged ($${finalRefundAmount.toFixed(2)} pending manual transfer).`, refundInfo: calc };
  };

  const completeRefundPayout = (bookingId: string, refundReceiptImage: string, customRefundAmount?: number, reason?: string) => {
    const booking = globalBookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found.' };
    }

    const calc = calculateRefund(booking);
    const finalRefundAmount = customRefundAmount !== undefined ? customRefundAmount : (booking.refundAmount !== undefined ? booking.refundAmount : calc.refundAmount);

    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'cancelled',
          refundStatus: 'completed',
          refundReceiptImage,
          refundAmount: finalRefundAmount,
          refundedAt: new Date().toISOString(),
          refundReason: reason || b.refundReason || 'Manual bank transfer complete.'
        };
      }
      return b;
    });

    const recipient = booking.passengerEmail || (booking.passengers[0] ? `${booking.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
    triggerEmail(
      recipient,
      `SmartFerry Money Transfer Receipt Uploaded - PNR: ${bookingId}`,
      `Dear Passenger,\n\nOur finance department has completed your manual bank refund transfer of $${finalRefundAmount.toFixed(2)} for booking PNR ${bookingId}.\n\nProof of money transfer receipt has been attached to your reservation record. You can view or print the transfer slip inside your portal.\n\nSincerely,\nSmartMobility Accounts Audit Team`,
      'status'
    );

    notifyStoreListeners();
    return { success: true, message: 'Refund payout completed and bank transfer receipt attached.' };
  };

  const removeBooking = (bookingId: string) => {
    const booking = globalBookings.find(b => b.id === bookingId);
    if (booking) {
      if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
        adminUnlockSeats(booking.scheduleId, booking.selectedSeatIds);
      }
      globalBookings = globalBookings.filter(b => b.id !== bookingId);
      notifyStoreListeners();
      return { success: true, message: 'Booking deleted successfully.' };
    }
    return { success: false, message: 'Booking not found.' };
  };

  const updateEmailConfig = (newConfig: Partial<typeof globalEmailConfig>) => {
    globalEmailConfig = { ...globalEmailConfig, ...newConfig };
    notifyStoreListeners();
  };

  const clearEmailLogs = () => {
    globalSentEmails = [];
    notifyStoreListeners();
  };

  return {
    schedules,
    decks,
    bookings,
    locations,
    vessels,
    emailConfig,
    sentEmails,
    alert: alertState,
    showAlert,
    hideAlert,
    bookSeats,
    adminLockSeats,
    adminUnlockSeats,
    addSchedule,
    editSchedule,
    removeSchedule,
    addVessel,
    editVessel,
    removeVessel,
    addLocation,
    removeLocation,
    addBooking,
    updateBookingStatus,
    updateBooking,
    processRefund,
    completeRefundPayout,
    removeBooking,
    updateEmailConfig,
    clearEmailLogs,
    updateSeatClass,
    resetPlatformStore
  };
};
