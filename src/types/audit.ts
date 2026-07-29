export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RECEIPT_DELETED'
  | 'VERIFY_PAYMENT'
  | 'REJECT_PAYMENT'
  | 'REFUND'
  | 'CANCEL'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

export type AuditEntityType = 
  | 'BOOKING'
  | 'SCHEDULE'
  | 'VESSEL'
  | 'USER'
  | 'JETTY'
  | 'RECEIPT'
  | 'SYSTEM';

export interface AuditUser {
  id?: string;
  name: string;
  email?: string;
  role: 'passenger' | 'agency' | 'admin' | string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  performedBy: AuditUser;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>; // Extra details e.g. deleted receipt image preview, price change breakdown
  createdAt: string; // ISO String
}
