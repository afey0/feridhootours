export interface Jetty {
  id: string;
  name: string;
}

export interface Vessel {
  id: string;              // e.g. "VSL-001"
  name: string;
  type: 'Speedboat' | 'Ferry';
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
  price: number;
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

export const INITIAL_JETTIES: Jetty[] = [
  { id: 'MLE', name: 'Malé City Terminal (Hulhumalé Jetty)' },
  { id: 'MAF', name: 'Maafushi Central Harbor' },
  { id: 'FUL', name: 'Fulidhoo Island Jetty' },
  { id: 'DHG', name: 'Dhigurah Main Pier' },
  { id: 'FER', name: 'Feridhoo Harbor Terminal' },
];

export const ATolls: Jetty[] = INITIAL_JETTIES;

export const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'VES-001',
    name: 'Kaani Princess',
    type: 'Speedboat',
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger', 'WiFi'],
    layoutRows: 8,
    layoutCols: 4,
    vipRows: '1-2',
    premiumRows: '3-4',
  },
  {
    id: 'VES-002',
    name: 'Speedboat Alpha',
    type: 'Speedboat',
    amenities: ['AC', 'Water', 'Life Jacket'],
    layoutRows: 6,
    layoutCols: 4,
    vipRows: '1',
    premiumRows: '2-3',
  },
];

export const MOCK_VESSELS: Vessel[] = INITIAL_VESSELS;

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'SCH-001',
    vesselId: 'VES-001',
    vesselName: 'Kaani Princess',
    vesselType: 'Speedboat',
    departureTime: '08:30 AM',
    arrivalTime: '09:15 AM',
    availableSeats: 31,
    totalSeats: 32,
    price: 35.00,
    routeFrom: 'MLE',
    routeTo: 'MAF',
    recurrence: 'Daily',
    scheduleDate: '2026-08-01',
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger', 'WiFi'],
    stops: ['Gulhi Island'],
    disabled: false,
    maintenance: false,
  },
  {
    id: 'SCH-002',
    vesselId: 'VES-002',
    vesselName: 'Speedboat Alpha',
    vesselType: 'Speedboat',
    departureTime: '10:30 AM',
    arrivalTime: '12:00 PM',
    availableSeats: 24,
    totalSeats: 24,
    price: 50.00,
    routeFrom: 'MAF',
    routeTo: 'FER',
    recurrence: 'Weekly',
    scheduleDate: '2026-08-01',
    amenities: ['AC', 'Water', 'Life Jacket'],
    stops: ['Fulidhoo Island'],
    disabled: false,
    maintenance: false,
  },
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
