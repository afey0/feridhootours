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
  status: 'pending_verification' | 'verified' | 'rejected' | 'cancelled';
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
  refundedAt?: string;
  refundReason?: string;
  refundBankName?: string;
  refundAccountName?: string;
  refundAccountNumber?: string;
  refundReceiptImage?: string; // Operator proof of refund transfer slip
  refundRequestSlip?: string; // Passenger bank document slip
}

export const ATolls: Jetty[] = [
  { id: 'MLE', name: 'Malé City (Hulhumalé Ferry Terminal)' },
  { id: 'HUL', name: 'Hulhumalé Jetty' },
  { id: 'MAF', name: 'Maafushi Island' },
  { id: 'FUL', name: 'Fulidhoo' },
  { id: 'DHI', name: 'Dhigurah' }
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 'SCH-001',
    vesselName: 'Kaani Princess',
    vesselType: 'Speedboat',
    departureTime: '08:30 AM',
    arrivalTime: '09:15 AM',
    availableSeats: 12,
    totalSeats: 32,
    price: 25.00,
    routeFrom: 'MLE',
    routeTo: 'MAF',
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger']
  },
  {
    id: 'SCH-002',
    vesselName: 'MTCC Express',
    vesselType: 'Ferry',
    departureTime: '10:00 AM',
    arrivalTime: '11:45 AM',
    availableSeats: 45,
    totalSeats: 32,
    price: 5.00,
    routeFrom: 'MLE',
    routeTo: 'HUL',
    amenities: ['Life Jacket', 'Toilets']
  },
  {
    id: 'SCH-003',
    vesselName: 'Ocean Explorer',
    vesselType: 'Speedboat',
    departureTime: '02:15 PM',
    arrivalTime: '03:00 PM',
    availableSeats: 2,
    totalSeats: 32,
    price: 30.00,
    routeFrom: 'MLE',
    routeTo: 'MAF',
    amenities: ['AC', 'WiFi', 'Snacks', 'Life Jacket']
  }
];

export const generateMockDeck = (clean = false): Seat[] => {
  const seats: Seat[] = [];
  let seatIdCounter = 1;
  for (let row = 1; row <= 8; row++) {
    for (let col = 1; col <= 4; col++) {
      // Determine seat class based on row
      let seatClass: Seat['class'] = 'Economy';
      if (row <= 2) {
        seatClass = 'VIP';
      } else if (row <= 4) {
        seatClass = 'Premium';
      }

      // Determine attributes
      const attributes: Seat['attributes'] = [];
      if (col === 1 || col === 4) {
        attributes.push('window');
      } else {
        attributes.push('aisle');
      }

      // Special accessibility row
      if (row === 8) {
        attributes.push('accessibility');
      }

      let status: Seat['status'] = 'available';
      
      // Randomly assign some seats as booked or locked, except row 1 and 2 for easier testing
      if (!clean) {
        const rand = Math.random();
        if (row > 2) {
          if (rand > 0.8) status = 'booked';
          else if (rand > 0.7) status = 'locked';
        }
      }

      seats.push({
        id: `S-${seatIdCounter++}`,
        row,
        col,
        status,
        class: seatClass,
        attributes
      });
    }
  }
  return seats;
};

export const MOCK_VESSELS: Vessel[] = [
  {
    id: 'VSL-001',
    name: 'Kaani Princess',
    type: 'Speedboat',
    amenities: ['AC', 'Water', 'Life Jacket', 'USB Charger'],
    layoutRows: 8,
    layoutCols: 4,
    vipRows: '1-2',
    premiumRows: '3-4'
  },
  {
    id: 'VSL-002',
    name: 'MTCC Express',
    type: 'Ferry',
    amenities: ['Life Jacket', 'Toilets'],
    layoutRows: 10,
    layoutCols: 6,
    vipRows: '',
    premiumRows: '1-2'
  },
  {
    id: 'VSL-003',
    name: 'Ocean Explorer',
    type: 'Speedboat',
    amenities: ['AC', 'WiFi', 'Snacks', 'Life Jacket'],
    layoutRows: 8,
    layoutCols: 4,
    vipRows: '1-2',
    premiumRows: '3-4'
  }
];

