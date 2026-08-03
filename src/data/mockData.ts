export type FareCategory = 'Local' | 'Tourist' | 'Work Permit' | 'Resort';

export interface FarePricing {
  category: FareCategory;
  priceUSD: number;
  priceMVR: number;
}

export interface Jetty {
  id: string;
  name: string;
}

export interface Vessel {
  id: string;              // e.g. "VSL-001"
  name: string;
  type: 'Speedboat' | 'Ferry';
  capacity?: number;
  amenities: string[];
  layoutRows: number;
  layoutCols: number;
  vipRows: string;         // e.g. "1-2"
  premiumRows: string;     // e.g. "3-4"
  customSeats?: Seat[];
}

export interface Schedule {
  id: string;
  vesselId?: string;       // references Vessel.id — optional for backward compat
  vesselName: string;
  vesselType: 'Speedboat' | 'Ferry';
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;           // Default base price (Tourist Fare)
  categoryPrices?: Record<FareCategory, number>; // Fare category pricing breakdown
  routeFrom: string;
  routeTo: string;
  recurrence?: 'Day' | '7 Days' | '30 Days' | 'Specific Date' | 'Daily' | 'Weekly' | 'Monthly';
  scheduleDate?: string;
  amenities: string[];
  stops?: string[];
  disabled?: boolean;
  maintenance?: boolean;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  status: 'available' | 'locked' | 'booked' | 'selected';
  class: 'Economy' | 'Premium' | 'VIP';
  attributes: ('window' | 'aisle' | 'accessibility')[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: string;
  idNumber: string;
  fareCategory?: FareCategory;
  specialRequest?: string;
  seatId: string;
}

export interface Booking {
  id: string;
  scheduleId: string;
  vesselName: string;
  vesselType: string;
  departureTime: string;
  arrivalTime: string;
  routeFrom: string;
  routeTo: string;
  passengers: Passenger[];
  selectedSeatIds: string[];
  fareCategory?: FareCategory;
  totalAmount: number;
  discountApplied: number;
  promoCodeUsed?: string;
  paymentMethod: 'card' | 'bank_transfer';
  receiptImage?: string; // Data URL or filename
  status: 'pending_verification' | 'verified' | 'rejected' | 'cancelled' | 'in_checkout';
  rejectionReason?: string;
  createdAt: string;
  agencyId?: string; // ID of the agency if booked by an agency
  bookedBy?: string; // Name of the agent / agency
  userId?: string; // ID of the passenger user if booked while logged in
  passengerEmail?: string; // Email of the passenger
  refundAmount?: number;
  cancellationFee?: number;
  refundPercentage?: number;
  refundStatus?: 'full' | 'partial' | 'non_refundable' | 'none' | 'requested' | 'completed';
  refundBankName?: string;
  refundAccountName?: string;
  refundAccountNumber?: string;
  refundReceiptImage?: string;
  refundedAt?: string;
  refundRequestSlip?: string;
  refundReason?: string;
}

export interface SavedPassenger {
  id: string;
  name: string;
  age: number;
  gender: string;
  idNumber: string;
  fareCategory?: FareCategory;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  encryption: 'tls' | 'ssl' | 'none';
  senderName: string;
  senderEmail: string;
  username: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  targetRole?: 'all' | 'passenger' | 'agency' | 'admin';
}

export interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface SavedTraveler {
  id: string;
  name: string;
  age: number;
  gender: string;
  idNumber: string;
  fareCategory?: FareCategory;
  passportExpiry?: string;
  nationality?: string;
  phone?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'booking' | 'schedule' | 'vessel' | 'user' | 'system';
  entityId: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

// 10 Initial Proposal Routes (Malé, Airport & Ari Atoll Network)
export const INITIAL_JETTIES: Jetty[] = [
  { id: 'APO', name: 'Airport (Velana International Airport Pier)' },
  { id: 'MLE', name: 'Male\' (Malé Central Ferry Terminal)' },
  { id: 'FER', name: 'Feridhoo Harbor Terminal' },
  { id: 'MAL', name: 'Maalhos Island Jetty' },
  { id: 'HIM', name: 'Himandhoo Island Pier' },
  { id: 'BTH', name: 'Bathala Resort Jetty' },
  { id: 'HLV', name: 'Halaveli Resort Pier' },
  { id: 'WMV', name: 'W Maldives Resort Pier' },
  { id: 'ATH', name: 'Athuruga Resort Pier' },
  { id: 'SAF', name: 'Safari Island Resort Pier' }
];

export const ATolls: Jetty[] = INITIAL_JETTIES;

// Proposal Fleet Vessels & Seating Layout Capacities
export const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'VES-38A',
    name: 'Touring 38 (27 Pax)',
    type: 'Speedboat',
    capacity: 27,
    amenities: ['AC', 'Life Jacket', 'Water', 'WiFi', 'USB Charger'],
    layoutRows: 7,
    layoutCols: 4,
    vipRows: '1',
    premiumRows: '2-3',
  },
  {
    id: 'VES-38B',
    name: 'Touring 38 (30 Pax)',
    type: 'Speedboat',
    capacity: 30,
    amenities: ['AC', 'Life Jacket', 'Water', 'USB Charger'],
    layoutRows: 8,
    layoutCols: 4,
    vipRows: '1-2',
    premiumRows: '3-4',
  },
  {
    id: 'VES-43A',
    name: 'Touring 43 (50 Pax)',
    type: 'Speedboat',
    capacity: 50,
    amenities: ['AC', 'Life Jacket', 'Water', 'WiFi', 'Toilets', 'USB Charger'],
    layoutRows: 10,
    layoutCols: 5,
    vipRows: '1-2',
    premiumRows: '3-5',
  },
  {
    id: 'VES-001',
    name: 'Senora Wave',
    type: 'Speedboat',
    capacity: 42,
    amenities: ['AC', 'Life Jacket', 'Water', 'WiFi'],
    layoutRows: 9,
    layoutCols: 5,
    vipRows: '1-2',
    premiumRows: '3-4',
  },
  {
    id: 'VES-002',
    name: 'Kaani Princess',
    type: 'Speedboat',
    capacity: 32,
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger'],
    layoutRows: 8,
    layoutCols: 4,
    vipRows: '1-2',
    premiumRows: '3-4',
  }
];

export const MOCK_VESSELS: Vessel[] = INITIAL_VESSELS;

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'SCH-001',
    vesselId: 'VES-001',
    vesselName: 'Senora Wave',
    vesselType: 'Speedboat',
    departureTime: '09:30 AM',
    arrivalTime: '11:00 AM',
    availableSeats: 18,
    totalSeats: 42,
    price: 35.00,
    categoryPrices: {
      'Tourist': 35.00,
      'Local': 15.00,
      'Work Permit': 20.00,
      'Resort': 50.00
    },
    routeFrom: 'APO',
    routeTo: 'FER',
    recurrence: 'Day',
    scheduleDate: '2026-08-03',
    amenities: ['AC', 'Water', 'Life Jacket', 'WiFi'],
    stops: ['Male\'', 'Bathala'],
    disabled: false,
    maintenance: false,
  },
  {
    id: 'SCH-002',
    vesselId: 'VES-38A',
    vesselName: 'Touring 38 (27 Pax)',
    vesselType: 'Speedboat',
    departureTime: '02:00 PM',
    arrivalTime: '03:30 PM',
    availableSeats: 27,
    totalSeats: 27,
    price: 35.00,
    categoryPrices: {
      'Tourist': 35.00,
      'Local': 15.00,
      'Work Permit': 20.00,
      'Resort': 50.00
    },
    routeFrom: 'APO',
    routeTo: 'FER',
    recurrence: '7 Days',
    scheduleDate: '2026-08-03',
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger'],
    stops: ['Halaveli', 'W Maldives'],
    disabled: false,
    maintenance: false,
  },
  {
    id: 'SCH-003',
    vesselId: 'VES-43A',
    vesselName: 'Touring 43 (50 Pax)',
    vesselType: 'Speedboat',
    departureTime: '11:30 AM',
    arrivalTime: '01:00 PM',
    availableSeats: 45,
    totalSeats: 50,
    price: 35.00,
    categoryPrices: {
      'Tourist': 35.00,
      'Local': 15.00,
      'Work Permit': 20.00,
      'Resort': 50.00
    },
    routeFrom: 'MLE',
    routeTo: 'HIM',
    recurrence: '30 Days',
    scheduleDate: '2026-08-03',
    amenities: ['AC', 'Water', 'Life Jacket', 'WiFi', 'Toilets'],
    stops: ['Maalhos', 'Safari Island'],
    disabled: false,
    maintenance: false,
  }
];

export const MOCK_SCHEDULES: Schedule[] = INITIAL_SCHEDULES;

export const generateMockDeck = (hasBooked: boolean = false): Seat[] => {
  const seats: Seat[] = [];
  let seatIdCounter = 1;
  const rows = 8;
  const cols = 4;

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      let seatClass: 'Economy' | 'Premium' | 'VIP' = 'Economy';
      if (r <= 2) seatClass = 'VIP';
      else if (r <= 4) seatClass = 'Premium';

      const attributes: ('window' | 'aisle' | 'accessibility')[] = [];
      if (c === 1 || c === cols) attributes.push('window');
      else attributes.push('aisle');
      if (r === rows) attributes.push('accessibility');

      let status: 'available' | 'locked' | 'booked' | 'selected' = 'available';
      if (hasBooked && r === 3 && c === 1) status = 'booked';

      seats.push({
        id: `S-${seatIdCounter++}`,
        row: r,
        col: c,
        status,
        class: seatClass,
        attributes
      });
    }
  }
  return seats;
};
