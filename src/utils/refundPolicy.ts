import type { Booking } from '../data/mockData';

export interface RefundCalculation {
  hoursUntilDeparture: number;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  policyTier: '> 24h (Full Refund)' | '12-24h (75% Refund)' | '4-12h (50% Refund)' | '< 4h (Non-refundable)' | 'Pending Verification (100% Refund)';
  isEligible: boolean;
  explanation: string;
  badgeClass: string;
}

/**
 * Calculates refund metrics based on departure timing rules and booking status.
 */
export function calculateRefund(booking: Booking, referenceDate: Date = new Date()): RefundCalculation {
  const totalPaid = booking.totalAmount || 0;

  if ((booking.status as string) === 'pending_verification' || (booking.status as string) === 'pending') {
    return {
      hoursUntilDeparture: 999,
      refundPercentage: 100,
      refundAmount: totalPaid,
      cancellationFee: 0,
      policyTier: 'Pending Verification (100% Refund)',
      isEligible: true,
      explanation: 'Free cancellation prior to payment verification.',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }

  // Parse departure time (e.g. "2026-07-22 10:00 AM" or "08:30 AM")
  let departureDateTime: Date;
  const parsedDate = new Date(booking.departureTime);
  if (!isNaN(parsedDate.getTime()) && (booking.departureTime.includes('/') || booking.departureTime.includes('-') || booking.departureTime.includes(','))) {
    departureDateTime = parsedDate;
  } else {
    departureDateTime = new Date(referenceDate);
    try {
      const timeMatch = booking.departureTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        departureDateTime.setHours(hours, minutes, 0, 0);
        if (departureDateTime.getTime() < referenceDate.getTime()) {
          departureDateTime.setDate(departureDateTime.getDate() + 1);
        }
      } else {
        departureDateTime = new Date(referenceDate.getTime() + 25 * 3600 * 1000);
      }
    } catch (e) {
      departureDateTime = new Date(referenceDate.getTime() + 25 * 3600 * 1000);
    }
  }

  const diffMs = departureDateTime.getTime() - referenceDate.getTime();
  const hoursUntilDeparture = Math.max(0, diffMs / (1000 * 60 * 60));

  let refundPercentage = 0;
  let policyTier: RefundCalculation['policyTier'] = '< 4h (Non-refundable)';
  let explanation = '';
  let badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';

  if (hoursUntilDeparture >= 24) {
    refundPercentage = 100;
    policyTier = '> 24h (Full Refund)';
    explanation = 'Full 100% refund for cancellations more than 24 hours prior to departure.';
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (hoursUntilDeparture >= 12) {
    refundPercentage = 75;
    policyTier = '12-24h (75% Refund)';
    explanation = '75% partial refund (25% cancellation processing fee applies).';
    badgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
  } else if (hoursUntilDeparture >= 4) {
    refundPercentage = 50;
    policyTier = '4-12h (50% Refund)';
    explanation = '50% partial refund (50% late cancellation fee applies).';
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  } else {
    refundPercentage = 0;
    policyTier = '< 4h (Non-refundable)';
    explanation = 'Cancellations within 4 hours of departure are non-refundable.';
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
  }

  const refundAmount = Number(((totalPaid * refundPercentage) / 100).toFixed(2));
  const cancellationFee = Number((totalPaid - refundAmount).toFixed(2));

  return {
    hoursUntilDeparture: Math.round(hoursUntilDeparture * 10) / 10,
    refundPercentage,
    refundAmount,
    cancellationFee,
    policyTier,
    isEligible: refundPercentage > 0 || (booking.status as string) === 'pending_verification',
    explanation,
    badgeClass
  };
}
