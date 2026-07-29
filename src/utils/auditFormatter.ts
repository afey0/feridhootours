import type { AuditLogEntry } from '../types/audit';

export interface AuditFieldDiff {
  field: string;
  label: string;
  before: string;
  after: string;
}

/**
 * Returns a human-readable title and summary for any audit log entry.
 */
export const getAuditHeadline = (entry: AuditLogEntry): string => {
  const { action, entityType, entityId, performedBy, metadata, changes } = entry;
  const actor = performedBy?.name || 'System User';
  const before = changes?.before || {};
  const after = changes?.after || {};

  if (entityType === 'BOOKING') {
    const booking = after.id ? after : before.id ? before : metadata?.deletedBookingSnapshot || {};
    const pnr = entityId || booking.id || 'N/A';
    const passengerName = booking.passengers?.[0]?.name || 'Passenger';
    const vesselName = booking.vesselName || 'Vessel';
    const route = booking.routeFrom && booking.routeTo ? `${booking.routeFrom} → ${booking.routeTo}` : '';

    if (action === 'RECEIPT_DELETED') {
      return `Deleted receipt slip & cancelled booking ${pnr} (${passengerName})`;
    }
    if (action === 'DELETE') {
      return `Deleted booking ${pnr} (${passengerName}, ${vesselName})`;
    }
    if (action === 'VERIFY_PAYMENT') {
      return `Approved payment slip for booking ${pnr} (${passengerName})`;
    }
    if (action === 'REJECT_PAYMENT') {
      return `Rejected payment slip for booking ${pnr}`;
    }
    if (action === 'REFUND') {
      const amount = metadata?.refundAmount || after.refundAmount || before.refundAmount || 0;
      return `Logged refund request ($${amount.toFixed(2)}) for booking ${pnr}`;
    }
    if (action === 'CANCEL') {
      return `Cancelled booking ${pnr} (${passengerName})`;
    }
    if (action === 'CREATE') {
      return `Created new booking ${pnr} for ${passengerName} (${route})`;
    }
    return `Updated booking ${pnr}`;
  }

  if (entityType === 'VESSEL') {
    const vesselName = after.name || before.name || entityId;
    if (action === 'CREATE') return `Registered new fleet vessel "${vesselName}"`;
    if (action === 'UPDATE') return `Updated vessel specs for "${vesselName}"`;
    if (action === 'DELETE') return `Removed vessel "${vesselName}" from fleet`;
    return `Modified vessel "${vesselName}"`;
  }

  if (entityType === 'SCHEDULE') {
    const sched = after.id ? after : before;
    const route = sched.routeFrom && sched.routeTo ? `${sched.routeFrom} → ${sched.routeTo}` : entityId;
    if (action === 'CREATE') return `Added new route schedule (${route})`;
    if (action === 'UPDATE') return `Updated route schedule (${route})`;
    if (action === 'DELETE') return `Deleted route schedule (${route})`;
    return `Modified schedule (${route})`;
  }

  if (entityType === 'USER') {
    const userName = after.name || before.name || entityId;
    const userRole = after.role || before.role || '';
    if (action === 'USER_CREATED' || action === 'CREATE') return `Created user account for ${userName} (${userRole})`;
    if (action === 'USER_UPDATED' || action === 'UPDATE') return `Updated user account for ${userName}`;
    if (action === 'USER_DELETED' || action === 'DELETE') return `Deleted user account for ${userName}`;
    return `Modified user account ${userName}`;
  }

  if (entityType === 'JETTY') {
    const portName = after.name || before.name || entityId;
    if (action === 'CREATE') return `Registered new island port "${portName}" (${entityId})`;
    if (action === 'DELETE') return `Deleted island port "${portName}" (${entityId})`;
    return `Modified port "${portName}"`;
  }

  return `${action} on ${entityType} (${entityId}) by ${actor}`;
};

/**
 * Returns plain-English details explaining exact field changes.
 */
export const getAuditReadableDiffs = (entry: AuditLogEntry): AuditFieldDiff[] => {
  const diffs: AuditFieldDiff[] = [];
  const before = entry.changes?.before;
  const after = entry.changes?.after;

  if (!before && !after) return diffs;

  const keyLabels: Record<string, string> = {
    status: 'Booking Status',
    paymentMethod: 'Payment Method',
    totalAmount: 'Total Cost ($)',
    discountApplied: 'Discount Applied ($)',
    rejectionReason: 'Rejection Reason',
    refundAmount: 'Refund Amount ($)',
    refundStatus: 'Refund Status',
    cancellationFee: 'Cancellation Fee ($)',
    refundReason: 'Refund Explanation',
    refundBankName: 'Refund Bank Name',
    refundAccountName: 'Bank Account Holder',
    refundAccountNumber: 'Bank Account Number',
    vesselName: 'Vessel Name',
    vesselType: 'Vessel Type',
    name: 'Name',
    email: 'Email Address',
    role: 'User Role',
    type: 'Type',
    layoutRows: 'Deck Rows',
    layoutCols: 'Deck Columns',
    vipRows: 'VIP Seat Rows',
    premiumRows: 'Premium Seat Rows',
    departureTime: 'Departure Time',
    arrivalTime: 'Arrival Time',
    price: 'Ticket Price ($)',
    disabled: 'Route Status',
    maintenance: 'Maintenance Status'
  };

  const formatVal = (val: any): string => {
    if (val === undefined || val === null || val === '') return 'None';
    if (typeof val === 'boolean') return val ? 'Enabled' : 'Disabled';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  if (before && after) {
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
    allKeys.forEach(k => {
      if (k === 'id' || k === 'createdAt' || k === 'updatedAt' || k === 'passengers' || k === 'selectedSeatIds' || k === 'customSeats') return;
      const valBefore = formatVal(before[k]);
      const valAfter = formatVal(after[k]);
      if (valBefore !== valAfter) {
        diffs.push({
          field: k,
          label: keyLabels[k] || k,
          before: valBefore,
          after: valAfter
        });
      }
    });
  } else if (after) {
    Object.keys(after).forEach(k => {
      if (k === 'id' || k === 'createdAt' || k === 'updatedAt' || k === 'passengers' || k === 'selectedSeatIds' || k === 'customSeats') return;
      diffs.push({
        field: k,
        label: keyLabels[k] || k,
        before: 'N/A (New Record)',
        after: formatVal(after[k])
      });
    });
  } else if (before) {
    Object.keys(before).forEach(k => {
      if (k === 'id' || k === 'createdAt' || k === 'updatedAt' || k === 'passengers' || k === 'selectedSeatIds' || k === 'customSeats') return;
      diffs.push({
        field: k,
        label: keyLabels[k] || k,
        before: formatVal(before[k]),
        after: 'Permanently Deleted'
      });
    });
  }

  return diffs;
};
