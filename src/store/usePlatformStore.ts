import { useState, useEffect } from 'react';
import { MOCK_SCHEDULES, MOCK_VESSELS, generateMockDeck, ATolls } from '../data/mockData';
import type { Seat, Schedule, Booking, Jetty, Vessel, Passenger } from '../data/mockData';

import type { AuditLogEntry, AuditAction, AuditEntityType } from '../types/audit';
import { createAuditEntry } from '../services/auditLogger';
import { broadcastRealtimeEvent, subscribeRealtimeEvents, fetchInitialDatabaseState } from '../services/dbClient';

import { calculateRefund } from '../utils/refundPolicy';
import { syncUsersFromDatabase } from './useAuthStore';

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

let globalAuditLogs = loadFromStorage<AuditLogEntry[]>('sf_audit_logs', [
  {
    id: 'AUDIT-1001',
    action: 'CREATE',
    entityType: 'BOOKING',
    entityId: 'SFY78B',
    performedBy: { id: 'usr-123', name: 'Ahmed F.', email: 'ahmed@example.com', role: 'passenger' },
    changes: { after: { id: 'SFY78B', vesselName: 'Kaani Princess', totalAmount: 25 } },
    metadata: { note: 'Initial passenger reservation created' },
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'AUDIT-1000',
    action: 'VERIFY_PAYMENT',
    entityType: 'BOOKING',
    entityId: 'SFY78B',
    performedBy: { id: 'adm-999', name: 'System Admin', email: 'admin@smartferry.mv', role: 'admin' },
    changes: { before: { status: 'pending_verification' }, after: { status: 'verified' } },
    metadata: { note: 'Payment slip verified by admin' },
    createdAt: new Date(Date.now() - 82000000).toISOString()
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
  host: 'smtp.feridhootours.mv',
  port: '587',
  senderName: 'FeridhooTours Notifications',
  senderEmail: 'no-reply@feridhootours.mv',
  username: 'no-reply@feridhootours.mv',
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
  saveToStorage('sf_audit_logs', globalAuditLogs);
  listeners.forEach(fn => fn());
};

export const recordAuditLog = (
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  performedBy?: any,
  changes?: { before?: any; after?: any },
  metadata?: Record<string, any>
) => {
  const entry = createAuditEntry(action, entityType, entityId, performedBy, changes, metadata);
  globalAuditLogs.unshift(entry);
  notifyStoreListeners();

  // Sync with Express backend database
  fetch('/api/v1/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  }).catch(() => {
    // Ignore if backend offline in standalone mode
  });

  return entry;
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
  const [auditLogs, setAuditLogs] = useState(globalAuditLogs);
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
    globalAuditLogs = [];
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
    setAuditLogs(globalAuditLogs);
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

  const syncDecksWithBookings = () => {
    globalSchedules.forEach(s => {
      const deck = globalDecks[s.id];
      if (deck) {
        globalDecks[s.id] = deck.map(seat => ({ ...seat, status: 'available' as any }));
      } else {
        globalDecks[s.id] = generateMockDeck(false);
      }
    });

    globalBookings.forEach(b => {
      if (b.status === 'cancelled' || b.status === 'rejected') return;
      const deck = globalDecks[b.scheduleId];
      if (deck) {
        globalDecks[b.scheduleId] = deck.map(seat => {
          if (b.selectedSeatIds.includes(seat.id)) {
            const newStatus = b.status === 'in_checkout' ? 'locked' : 'booked';
            return { ...seat, status: newStatus as any };
          }
          return seat;
        });
      }
    });

    globalSchedules.forEach(s => {
      const deck = globalDecks[s.id];
      if (deck) {
        s.availableSeats = deck.filter(seat => seat.status === 'available').length;
      }
    });
  };

  const refreshDatabaseState = () => {
    fetchInitialDatabaseState().then(dbData => {
      if (dbData) {
        if (dbData.vessels && dbData.vessels.length > 0) globalVessels = dbData.vessels;
        if (dbData.schedules && dbData.schedules.length > 0) globalSchedules = dbData.schedules;
        if (dbData.bookings) globalBookings = dbData.bookings;
        if (dbData.auditLogs) globalAuditLogs = dbData.auditLogs;
        if (dbData.locations && dbData.locations.length > 0) globalLocations = dbData.locations;
        if (dbData.users) syncUsersFromDatabase(dbData.users);
        
        // Propagate state changes to listeners
        const update = Array.from(listeners)[0];
        if (update) update();
      }
    });
  };

  useEffect(() => {
    const update = () => {
      syncDecksWithBookings();
      setSchedules([...globalSchedules]);
      setDecks({ ...globalDecks });
      setBookings([...globalBookings]);
      setLocations([...globalLocations]);
      setVessels([...globalVessels]);
      setEmailConfig({ ...globalEmailConfig });
      setSentEmails([...globalSentEmails]);
      setAuditLogs([...globalAuditLogs]);
      setAlertState(globalAlert);
    };
    listeners.add(update);

    // Initial database fetch
    refreshDatabaseState();

    // Subscribe to cross-session realtime events — only sync from D1 when a mutation event arrives
    const unsubscribe = subscribeRealtimeEvents((type, _payload) => {
      if (type === 'STATE_SYNC' || type.startsWith('BOOKING_') || type.startsWith('SCHEDULE_') || type.startsWith('VESSEL_') || type.startsWith('SEATS_') || type.startsWith('JETTY_') || type.startsWith('USER_')) {
        refreshDatabaseState();
      }
    });

    // Check expired holds periodically (60s is enough since server also cleans up on sync)
    checkExpiredHolds();
    const intervalId = setInterval(() => {
      checkExpiredHolds();
    }, 60000);

    return () => { 
      listeners.delete(update); 
      unsubscribe();
      clearInterval(intervalId);
    };
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
      schedule.availableSeats = globalDecks[scheduleId].filter(s => s.status === 'available').length;
    }

    notifyStoreListeners();
    broadcastRealtimeEvent('SEATS_BOOKED', { scheduleId, seatIds });
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
    broadcastRealtimeEvent('SEATS_LOCKED', { scheduleId, seatIds });
  };

  const lockSeatsCheckout = (scheduleId: string, seatIds: string[], passengers: Passenger[] = [], user?: any, customBookingId?: string): { success: boolean; message?: string; bookingId?: string } => {
    const deck = globalDecks[scheduleId];
    if (deck) {
      const conflictSeats = deck.filter(seat => seatIds.includes(seat.id) && (seat.status === 'booked' || seat.status === 'locked'));
      if (conflictSeats.length > 0) {
        const seatNames = conflictSeats.map(s => s.id.replace('S-', '')).join(', ');
        return {
          success: false,
          message: `Seat ${seatNames} on this schedule date is already locked or booked by another traveler. Please select a different seat.`
        };
      }

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
    }

    const schedule = globalSchedules.find(s => s.id === scheduleId);
    const bookingId = customBookingId || `SFY-LOCK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newBooking: Booking = {
      id: bookingId,
      scheduleId,
      vesselName: schedule?.vesselName || 'Speedboat',
      vesselType: schedule?.vesselType || 'Speedboat',
      departureTime: schedule?.departureTime || '08:30 AM',
      arrivalTime: schedule?.arrivalTime || '09:15 AM',
      routeFrom: schedule?.routeFrom || 'MLE',
      routeTo: schedule?.routeTo || 'MAF',
      passengers: passengers.length > 0 ? passengers : seatIds.map(sId => ({ name: user?.name || 'Guest Passenger', age: 28, gender: 'Male', idNumber: '', seatId: sId })),
      selectedSeatIds: seatIds,
      totalAmount: (schedule?.price || 35) * seatIds.length,
      discountApplied: 0,
      paymentMethod: 'card',
      status: 'in_checkout',
      createdAt: new Date().toISOString(),
      userId: user?.id,
      bookedBy: user?.name || passengers[0]?.name || 'Guest Passenger',
      passengerEmail: user?.email || 'guest@feridhootours.mv'
    };

    globalBookings.unshift(newBooking);
    notifyStoreListeners();
    broadcastRealtimeEvent('SEATS_LOCKED', { scheduleId, seatIds, bookingId });
    return { success: true, bookingId };
  };



  const adminUnlockSeats = (scheduleId: string, seatIds: string[]) => {
    // Only unlock bookings that are temporary holds (in_checkout) or
    // abandoned pending_verification without receipt upload.
    // NEVER delete bookings that already have a receipt image or are verified/confirmed.
    const lockBookings = globalBookings.filter(b => 
      b.scheduleId === scheduleId && 
      b.status === 'in_checkout' &&
      b.selectedSeatIds.some(sId => seatIds.includes(sId))
    );

    lockBookings.forEach(lb => {
      broadcastRealtimeEvent('BOOKING_DELETED', { id: lb.id, bookingId: lb.id });
    });

    globalBookings = globalBookings.filter(b => !lockBookings.map(lb => lb.id).includes(b.id));

    const deck = globalDecks[scheduleId];
    if (deck) {
      globalDecks[scheduleId] = deck.map(seat => {
        if (seatIds.includes(seat.id)) {
          return { ...seat, status: 'available' };
        }
        return seat;
      });
    }

    const schedule = globalSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.availableSeats = globalDecks[scheduleId].filter(s => s.status === 'available').length;
    }

    notifyStoreListeners();
    broadcastRealtimeEvent('SEATS_UNLOCKED', { scheduleId, seatIds });
  };

  const checkExpiredHolds = () => {
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const now = Date.now();
    let hasExpired = false;

    globalBookings.forEach(b => {
      if (b.status === 'pending_verification' && !b.receiptImage) {
        const createdAtTime = new Date(b.createdAt).getTime();
        if (!isNaN(createdAtTime) && (now - createdAtTime > TEN_MINUTES_MS)) {
          hasExpired = true;
          // Release held seats
          const deck = globalDecks[b.scheduleId];
          if (deck) {
            globalDecks[b.scheduleId] = deck.map(seat => {
              if (b.selectedSeatIds.includes(seat.id)) {
                return { ...seat, status: 'available' };
              }
              return seat;
            });
            const schedule = globalSchedules.find(s => s.id === b.scheduleId);
            if (schedule) {
              schedule.availableSeats = globalDecks[b.scheduleId].filter(s => s.status === 'available').length;
            }
          }

          b.status = 'rejected';
          b.rejectionReason = 'Temporary 10-minute seat hold expired without payment receipt upload.';
          
          recordAuditLog(
            'REJECT_PAYMENT',
            'BOOKING',
            b.id,
            { name: 'System Hold Expiry', role: 'admin' },
            { after: { status: 'rejected', rejectionReason: b.rejectionReason } },
            { note: 'Automatically expired 10-minute hold and released seats.' }
          );

          const recipient = b.passengerEmail || (b.passengers[0] ? `${b.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
          triggerEmail(
            recipient,
            `FeridhooTours 10-Minute Hold Expired - PNR: ${b.id}`,
            `Dear Passenger,\n\nYour temporary 10-minute seat reservation for booking reference ${b.id} has expired because no payment transfer receipt was uploaded.\n\nThe reserved seats have been released for other travelers. If you still wish to travel, please make a new booking.\n\nBest regards,\nFeridhooTours Maldives Team`,
            'status'
          );
        }
      }
    });

    if (hasExpired) {
      notifyStoreListeners();
    }
  };

  // Add/Remove Schedules
  const addSchedule = (sched: Omit<Schedule, 'id' | 'availableSeats'>, customSeats?: Seat[], performedBy?: any) => {
    const id = `SCH-${String(globalSchedules.length + 1).padStart(3, '0')}`;
    const newSchedule: Schedule = {
      ...sched,
      id,
      availableSeats: sched.totalSeats
    };
    globalSchedules.push(newSchedule);
    globalDecks[id] = customSeats || generateMockDeck(true);
    
    recordAuditLog('CREATE', 'SCHEDULE', id, performedBy, { after: newSchedule });
    notifyStoreListeners();
    broadcastRealtimeEvent('SCHEDULE_CREATED', newSchedule);
  };

  const removeSchedule = (id: string, performedBy?: any) => {
    const oldSchedule = globalSchedules.find(s => s.id === id);
    globalSchedules = globalSchedules.filter(s => s.id !== id);
    delete globalDecks[id];

    recordAuditLog('DELETE', 'SCHEDULE', id, performedBy, { before: oldSchedule });
    notifyStoreListeners();
    broadcastRealtimeEvent('SCHEDULE_DELETED', { id });
  };

  const editSchedule = (id: string, updatedFields: Partial<Omit<Schedule, 'id' | 'availableSeats'>>, customSeats?: Seat[], performedBy?: any) => {
    const oldSchedule = globalSchedules.find(s => s.id === id);
    let newSchedule: Schedule | null = null;

    globalSchedules = globalSchedules.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updatedFields };
        if (customSeats) {
          globalDecks[id] = customSeats;
        }
        merged.availableSeats = (globalDecks[id] || []).filter(seat => seat.status === 'available').length;
        newSchedule = merged;
        return merged;
      }
      return s;
    });

    recordAuditLog('UPDATE', 'SCHEDULE', id, performedBy, { before: oldSchedule, after: newSchedule });
    notifyStoreListeners();
    broadcastRealtimeEvent('SCHEDULE_UPDATED', newSchedule);
  };

  // Vessel management
  const addVessel = (v: Omit<Vessel, 'id'>, performedBy?: any): string => {
    const id = `VSL-${String(globalVessels.length + 1).padStart(3, '0')}`;
    const newVessel = { ...v, id };
    globalVessels.push(newVessel);

    recordAuditLog('CREATE', 'VESSEL', id, performedBy, { after: newVessel });
    notifyStoreListeners();
    broadcastRealtimeEvent('VESSEL_CREATED', newVessel);
    return id;
  };

  const editVessel = (id: string, fields: Partial<Omit<Vessel, 'id'>>, performedBy?: any) => {
    const oldVessel = globalVessels.find(v => v.id === id);
    let newVessel: Vessel | null = null;
    globalVessels = globalVessels.map(v => {
      if (v.id === id) {
        newVessel = { ...v, ...fields };
        return newVessel;
      }
      return v;
    });

    recordAuditLog('UPDATE', 'VESSEL', id, performedBy, { before: oldVessel, after: newVessel });
    notifyStoreListeners();
    broadcastRealtimeEvent('VESSEL_UPDATED', newVessel);
  };

  const removeVessel = (id: string, performedBy?: any): { success: boolean; message: string } => {
    const inUse = globalSchedules.some(s => s.vesselId === id);
    if (inUse) {
      return { success: false, message: 'Cannot delete vessel — it is assigned to one or more active routes.' };
    }
    const oldVessel = globalVessels.find(v => v.id === id);
    globalVessels = globalVessels.filter(v => v.id !== id);

    recordAuditLog('DELETE', 'VESSEL', id, performedBy, { before: oldVessel });
    notifyStoreListeners();
    broadcastRealtimeEvent('VESSEL_DELETED', { id });
    return { success: true, message: 'Vessel removed successfully.' };
  };

  // Locations management
  const addLocation = (name: string, id: string, performedBy?: any) => {
    const uppercaseId = id.toUpperCase().trim();
    if (globalLocations.some(loc => loc.id === uppercaseId)) {
      showAlert(`Location with code ${uppercaseId} already exists.`, 'Duplicate Port', 'error');
      return;
    }
    const newJetty: Jetty = { id: uppercaseId, name: name.trim() };
    globalLocations.push(newJetty);

    recordAuditLog('CREATE', 'JETTY', uppercaseId, performedBy, { after: newJetty });
    saveToStorage('sf_locations', globalLocations);
    notifyStoreListeners();
    broadcastRealtimeEvent('JETTY_CREATED', newJetty);
  };

  const removeLocation = (id: string, performedBy?: any): { success: boolean; message: string } => {
    const uppercaseId = id.toUpperCase().trim();

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

    const oldJetty = globalLocations.find(l => l.id === uppercaseId);
    globalLocations = globalLocations.filter(loc => loc.id !== uppercaseId);

    recordAuditLog('DELETE', 'JETTY', uppercaseId, performedBy, { before: oldJetty });
    saveToStorage('sf_locations', globalLocations);
    notifyStoreListeners();
    broadcastRealtimeEvent('JETTY_DELETED', { id: uppercaseId });
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
  const addBooking = (booking: Booking, performedBy?: any) => {
    globalBookings = globalBookings.filter(b => b.id !== booking.id);
    globalBookings.unshift(booking); // Newest bookings first
    bookSeats(booking.scheduleId, booking.selectedSeatIds);

    recordAuditLog('CREATE', 'BOOKING', booking.id, performedBy || { name: booking.passengers[0]?.name || 'Passenger', role: 'passenger' }, { after: booking });
    notifyStoreListeners();
    broadcastRealtimeEvent('BOOKING_CREATED', booking);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], reason?: string, receiptImage?: string, performedBy?: any) => {
    const oldBooking = globalBookings.find(b => b.id === bookingId);

    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        if ((status === 'cancelled' || status === 'rejected') && b.status !== 'cancelled' && b.status !== 'rejected') {
          adminUnlockSeats(b.scheduleId, b.selectedSeatIds);
        }

        const recipient = b.passengers[0] ? `${b.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com';
        if (status === 'verified') {
          triggerEmail(
            recipient,
            `FeridhooTours Boarding Passes Issued - PNR: ${bookingId}`,
            `Dear Passenger,\n\nWe are pleased to inform you that your bank transfer slip for booking reference ${bookingId} has been successfully verified!\n\nYour digital tickets and boarding QR codes are now fully unlocked. You can view or print them inside the "My Bookings" section or self-service lookup portal.\n\nThank you for choosing FeridhooTours.\n\nBest regards,\nFeridhooTours Maldives Operations Team`,
            'status'
          );
        } else if (status === 'rejected') {
          triggerEmail(
            recipient,
            `FeridhooTours Payment Rejected - PNR: ${bookingId}`,
            `Dear Passenger,\n\nWe regret to inform you that your bank transfer slip for booking reference ${bookingId} has been rejected by our verification team.\n\nReason: ${reason || 'unclear transaction slip image / name mismatch.'}\n\nPlease log in to your portal or use the lookup reference code to upload a valid receipt within the next 6 hours to prevent automatic cancellation.\n\nSincerely,\nFeridhooTours Audits Team`,
            'status'
          );
        }

        const updated = { 
          ...b, 
          status, 
          rejectionReason: reason, 
          receiptImage: receiptImage !== undefined ? receiptImage : b.receiptImage 
        };

        const action: AuditAction = status === 'verified' ? 'VERIFY_PAYMENT' : status === 'rejected' ? 'REJECT_PAYMENT' : status === 'cancelled' ? 'CANCEL' : 'UPDATE';
        recordAuditLog(action, 'BOOKING', bookingId, performedBy, { before: oldBooking, after: updated });

        return updated;
      }
      return b;
    });

    notifyStoreListeners();
    broadcastRealtimeEvent('BOOKING_UPDATED', { bookingId, status, rejectionReason: reason, receiptImage });
  };

  const updateBooking = (bookingId: string, updatedFields: Partial<Booking>, performedBy?: any) => {
    const oldBooking = globalBookings.find(b => b.id === bookingId);
    let newBooking: Booking | null = null;

    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        const oldScheduleId = b.scheduleId;
        const oldSeats = b.selectedSeatIds;
        
        const merged = { ...b, ...updatedFields };
        newBooking = merged;
        
        if (updatedFields.selectedSeatIds || updatedFields.scheduleId) {
          const newScheduleId = merged.scheduleId;
          const newSeats = merged.selectedSeatIds;
          
          if (oldScheduleId !== newScheduleId || JSON.stringify(oldSeats) !== JSON.stringify(newSeats)) {
            adminUnlockSeats(oldScheduleId, oldSeats);
            bookSeats(newScheduleId, newSeats);
          }
        }
        
        return merged;
      }
      return b;
    });

    recordAuditLog('UPDATE', 'BOOKING', bookingId, performedBy, { before: oldBooking, after: newBooking });
    notifyStoreListeners();
    broadcastRealtimeEvent('BOOKING_UPDATED', { bookingId, updatedFields });
  };

  const processRefund = (
    bookingId: string,
    bankDetails?: { bankName?: string; accountName?: string; accountNumber?: string; requestSlip?: string },
    customRefundAmount?: number,
    reason?: string,
    performedBy?: any
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

    adminUnlockSeats(booking.scheduleId, booking.selectedSeatIds);

    let updatedBooking: Booking | undefined;
    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        const updated: Booking = {
          ...b,
          status: 'cancelled',
          refundAmount: finalRefundAmount,
          cancellationFee: finalFee,
          refundPercentage,
          refundStatus: 'requested',
          refundedAt: new Date().toISOString(),
          refundReason: reason || calc.explanation,
          refundBankName: bankDetails?.bankName || b.refundBankName,
          refundAccountName: bankDetails?.accountName || b.refundAccountName,
          refundAccountNumber: bankDetails?.accountNumber || b.refundAccountNumber,
          refundRequestSlip: bankDetails?.requestSlip || b.refundRequestSlip
        };
        updatedBooking = updated;
        return updated;
      }
      return b;
    });

    recordAuditLog('REFUND', 'BOOKING', bookingId, performedBy, { before: booking, after: updatedBooking }, { refundAmount: finalRefundAmount, fee: finalFee });

    const recipient = booking.passengerEmail || (booking.passengers[0] ? `${booking.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
    triggerEmail(
      recipient,
      `FeridhooTours Manual Refund Request Submitted - PNR: ${bookingId}`,
      `Dear Passenger,\n\nYour cancellation & manual refund request for booking PNR ${bookingId} has been logged.\n\nRefund Statement:\n- Original Amount Paid: $${booking.totalAmount.toFixed(2)}\n- Policy Rule Tier: ${calc.policyTier}\n- Cancellation Fee: $${finalFee.toFixed(2)}\n- Net Refund Credited: $${finalRefundAmount.toFixed(2)}\n\nBank Payout Account:\n- Bank: ${bankDetails?.bankName || 'N/A'}\n- Account Holder: ${bankDetails?.accountName || 'N/A'}\n- Account Number: ${bankDetails?.accountNumber || 'N/A'}\n\nOur finance team will process the manual bank transfer within 24-48 hours and upload the transfer receipt proof.\n\nThank you,\nFeridhooTours Maldives Finance Team`,
      'status'
    );

    notifyStoreListeners();
    broadcastRealtimeEvent('BOOKING_REFUND_REQUESTED', { bookingId, refundAmount: finalRefundAmount });
    return { success: true, message: `Refund request logged ($${finalRefundAmount.toFixed(2)} pending manual transfer).`, refundInfo: calc };
  };

  const completeRefundPayout = (bookingId: string, refundReceiptImage: string, customRefundAmount?: number, reason?: string, performedBy?: any) => {
    const booking = globalBookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, message: 'Booking not found.' };
    }

    const calc = calculateRefund(booking);
    const finalRefundAmount = customRefundAmount !== undefined ? customRefundAmount : (booking.refundAmount !== undefined ? booking.refundAmount : calc.refundAmount);

    let updatedBooking: Booking | undefined;
    globalBookings = globalBookings.map(b => {
      if (b.id === bookingId) {
        const updated: Booking = {
          ...b,
          status: 'cancelled',
          refundStatus: 'completed',
          refundReceiptImage,
          refundAmount: finalRefundAmount,
          refundedAt: new Date().toISOString(),
          refundReason: reason || b.refundReason || 'Manual bank transfer complete.'
        };
        updatedBooking = updated;
        return updated;
      }
      return b;
    });


    recordAuditLog('REFUND', 'BOOKING', bookingId, performedBy, { before: booking, after: updatedBooking }, { refundStatus: 'completed', refundAmount: finalRefundAmount });

    const recipient = booking.passengerEmail || (booking.passengers[0] ? `${booking.passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
    triggerEmail(
      recipient,
      `FeridhooTours Money Transfer Receipt Uploaded - PNR: ${bookingId}`,
      `Dear Passenger,\n\nOur finance department has completed your manual bank refund transfer of $${finalRefundAmount.toFixed(2)} for booking PNR ${bookingId}.\n\nProof of money transfer receipt has been attached to your reservation record. You can view or print the transfer slip inside your portal.\n\nSincerely,\nFeridhooTours Accounts Audit Team`,
      'status'
    );

    notifyStoreListeners();
    broadcastRealtimeEvent('REFUND_PAYOUT_COMPLETED', { bookingId });
    return { success: true, message: 'Refund payout completed and bank transfer receipt attached.' };
  };

const getCurrentAuthUser = (): any => {
  try {
    const stored = localStorage.getItem('sf_current_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

  const removeBooking = (bookingId: string, performedBy?: any): { success: boolean; message: string } => {
    // Authorization Check: Only Super Admin can delete bookings or refund records
    const actor = performedBy || getCurrentAuthUser();
    if (!actor || actor.role !== 'super_admin') {
      return { success: false, message: 'Access Denied: Only Super Admin is authorized to delete bookings or refund records.' };
    }

    const booking = globalBookings.find(b => b.id === bookingId);
    if (booking) {
      if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
        adminUnlockSeats(booking.scheduleId, booking.selectedSeatIds);
      }
      globalBookings = globalBookings.filter(b => b.id !== bookingId);

      // Audit log recording exact snapshot and receipt deletion
      const isReceiptDeleted = Boolean(booking.receiptImage);
      recordAuditLog(
        isReceiptDeleted ? 'RECEIPT_DELETED' : 'DELETE',
        isReceiptDeleted ? 'RECEIPT' : 'BOOKING',
        bookingId,
        performedBy,
        { before: booking },
        { deletedBookingSnapshot: booking, hadReceipt: isReceiptDeleted }
      );

      notifyStoreListeners();
      broadcastRealtimeEvent('BOOKING_DELETED', { bookingId, deletedBooking: booking });
      return { success: true, message: 'Booking & receipt deleted from database by Super Admin.' };
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
    auditLogs,
    alert: alertState,
    showAlert,
    hideAlert,
    bookSeats,
    lockSeatsCheckout,
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
    checkExpiredHolds,
    refreshDatabaseState,
    resetPlatformStore
  };
};
