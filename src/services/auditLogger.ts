import type { AuditLogEntry, AuditAction, AuditEntityType, AuditUser } from '../types/audit';

export const createAuditEntry = (
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  performedBy: AuditUser | null | undefined,
  changes?: { before?: any; after?: any },
  metadata?: Record<string, any>
): AuditLogEntry => {
  const user: AuditUser = performedBy ? {
    id: performedBy.id,
    name: performedBy.name || 'User',
    email: performedBy.email,
    role: performedBy.role || 'passenger'
  } : {
    name: 'System Action',
    role: 'system'
  };

  return {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    action,
    entityType,
    entityId,
    performedBy: user,
    changes: changes || {},
    metadata: metadata || {},
    createdAt: new Date().toISOString()
  };
};
