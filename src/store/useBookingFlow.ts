import { useState } from 'react';
import type { Schedule, Seat, Passenger, Booking } from '../data/mockData';
import { usePlatformStore, triggerEmail, recordAuditLog } from './usePlatformStore';

export type BookingStep = 'search' | 'select_seats' | 'passenger_details' | 'payment' | 'confirmation';

export const useBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('search');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // in dollars
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [latestBookingRef, setLatestBookingRef] = useState<string | null>(null);
  
  // Track search validations
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);


  const { addBooking, lockSeatsCheckout, adminUnlockSeats, showAlert } = usePlatformStore();

  const reserveSeats = async (user?: any) => {
    if (selectedSeats.length !== passengerCount) return; // Strict validation
    
    setIsLocking(true);
    // Simulate API call to acquire distributed lock
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsLocking(false);

    if (selectedSchedule) {
      const res = lockSeatsCheckout(selectedSchedule.id, selectedSeats.map(s => s.id), passengers, user);
      if (res && !res.success) {
        showAlert(res.message || 'Seat conflict detected', 'Double Booking Conflict', 'error');
        return;
      }
      recordAuditLog('SEAT_LOCKED', 'BOOKING', selectedSchedule.id, user, undefined, {
        seats: selectedSeats.map(s => s.id.replace('S-', '')),
        vesselName: selectedSchedule.vesselName,
        route: `${selectedSchedule.routeFrom} → ${selectedSchedule.routeTo}`
      });
    }

    // Set expiry 10 minutes from now
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    setLockExpiresAt(expiry);
    
    setCurrentStep('passenger_details');
  };



  const goSearch = () => {

    if (selectedSchedule && selectedSeats.length > 0) {
      adminUnlockSeats(selectedSchedule.id, selectedSeats.map(s => s.id));
    }
    setSelectedSeats([]);
    setSelectedSchedule(null);
    setPassengers([]);
    setPromoCode('');
    setDiscount(0);
    setActivePromo(null);
    setCurrentStep('search');
  };
  
  const setSearchParams = (count: number, date: string) => {
    setPassengerCount(count);
    setDepartureDate(date);
  };
  
  const selectSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setPassengers([]);
    setCurrentStep('select_seats');
  };

  const toggleSeat = (seat: Seat) => {
    setSelectedSeats(prev => {
      const alreadySelected = prev.find(s => s.id === seat.id);
      if (alreadySelected) {
        return prev.filter(s => s.id !== seat.id);
      }
      // If we already reached passengerCount, don't allow selecting more
      if (prev.length >= passengerCount) {
        return prev;
      }
      return [...prev, seat];
    });
  };




  const goBackToSeats = () => {
    if (selectedSchedule && selectedSeats.length > 0) {
      adminUnlockSeats(selectedSchedule.id, selectedSeats.map(s => s.id));
    }
    setCurrentStep('select_seats');
  };

  const savePassengerDetails = (passengersData: Passenger[]) => {
    setPassengers(passengersData);
    setCurrentStep('payment');
  };

  // Promo code validation logic
  const applyPromo = (code: string, baseTotal: number) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'ISLANDER') {
      const disc = Math.round(baseTotal * 0.1 * 100) / 100;
      setDiscount(disc);
      setActivePromo('ISLANDER');
      return { success: true, message: '10% Islander Discount Applied!' };
    }
    if (cleanCode === 'GROUP' && selectedSeats.length >= 3) {
      const disc = Math.round(baseTotal * 0.15 * 100) / 100;
      setDiscount(disc);
      setActivePromo('GROUP');
      return { success: true, message: '15% Group Discount Applied!' };
    } else if (cleanCode === 'GROUP') {
      return { success: false, message: 'Promo Code requires at least 3 seats.' };
    }
    return { success: false, message: 'Invalid Promo Code.' };
  };

  const removePromo = () => {
    setDiscount(0);
    setActivePromo(null);
    setPromoCode('');
  };

  const confirmPayment = async (
    paymentMethod: 'card' | 'bank_transfer',
    receiptImage?: string,
    userContext?: { id: string; name: string; role: string; email: string } | null
  ) => {
    if (!selectedSchedule) return;
    setIsLocking(true);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SF';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const ref = code;
    setLatestBookingRef(ref);

    // Calculate dynamic pricing
    const basePrice = selectedSchedule.price;
    const items = selectedSeats.map(seat => {
      let seatPrice = basePrice;
      if (seat.class === 'VIP') seatPrice += 15;
      else if (seat.class === 'Premium') seatPrice += 5;
      return seatPrice;
    });
    const subtotal = items.reduce((a, b) => a + b, 0);

    const booking: Booking = {
      id: ref,
      scheduleId: selectedSchedule.id,
      vesselName: selectedSchedule.vesselName,
      vesselType: selectedSchedule.vesselType,
      departureTime: selectedSchedule.departureTime,
      arrivalTime: selectedSchedule.arrivalTime,
      routeFrom: selectedSchedule.routeFrom,
      routeTo: selectedSchedule.routeTo,
      passengers: passengers.map(p => ({ ...p })),
      selectedSeatIds: selectedSeats.map(s => s.id),
      totalAmount: subtotal - discount,
      discountApplied: discount,
      promoCodeUsed: activePromo || undefined,
      paymentMethod,
      receiptImage,
      status: paymentMethod === 'card' ? 'verified' : 'pending_verification',
      createdAt: new Date().toISOString()
    };

    if (userContext) {
      booking.userId = userContext.id;
      booking.passengerEmail = userContext.email;
      if (userContext.role === 'agency') {
        booking.agencyId = userContext.id;
        booking.bookedBy = userContext.name;
      }
    }

    addBooking(booking);
    recordAuditLog(
      receiptImage ? 'SLIP_UPLOADED' : 'BOOKING_CREATED',
      'BOOKING',
      ref,
      userContext,
      { after: booking },
      { totalAmount: subtotal - discount, seatCount: selectedSeats.length, paymentMethod }
    );

    // Trigger Booking Confirmation Email

    const recipient = userContext?.email || (passengers[0] ? `${passengers[0].name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'passenger@example.com');
    const paymentStatus = paymentMethod === 'card' ? 'Verified (Instant Card Payment)' : 'Pending Verification (Bank Slip Uploaded)';
    const seatNumbers = selectedSeats.map(s => s.id.replace('S-', '')).join(', ');
    
    triggerEmail(
      recipient,
      `FeridhooTours Booking Confirmation - PNR: ${ref}`,
      `Dear Passenger,\n\nThank you for booking with FeridhooTours. Your reservation details are as follows:\n\n` +
      `Booking PNR: ${ref}\n` +
      `Vessel: ${selectedSchedule.vesselName} (${selectedSchedule.vesselType})\n` +
      `Route: ${selectedSchedule.routeFrom} to ${selectedSchedule.routeTo}\n` +
      `Departure Time: ${selectedSchedule.departureTime}\n` +
      `Seats Reserved: ${seatNumbers}\n` +
      `Total Fare Paid: $${(subtotal - discount).toFixed(2)}\n` +
      `Payment Status: ${paymentStatus}\n\n` +
      `Your digital tickets and boarding pass QR codes will unlock once payment status is Verified.\n\n` +
      `Safe Travels,\nFeridhooTours Maldives Operations Team`,
      'booking'
    );

    setIsLocking(false);
    setCurrentStep('confirmation');
  };

  return {
    currentStep,
    selectedSchedule,
    selectedSeats,
    passengers,
    promoCode,
    discount,
    activePromo,
    isLocking,
    lockExpiresAt,
    latestBookingRef,
    passengerCount,
    departureDate,
    goSearch,
    setSearchParams,
    selectSchedule,
    toggleSeat,
    reserveSeats,
    goBackToSeats,
    savePassengerDetails,
    applyPromo,
    removePromo,
    setPromoCode,
    confirmPayment
  };
};
