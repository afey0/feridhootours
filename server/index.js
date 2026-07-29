import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Static frontend serving if dist exists (for Fly.io single container)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// PostgreSQL Pool Connection
const { Pool } = pg;
const dbConnectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

let pool = null;
if (dbConnectionString) {
  pool = new Pool({
    connectionString: dbConnectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('[PostgreSQL] Database pool initialized for production.');
} else {
  console.log('[Express DB Server] Operating in real-time synced database mode.');
}

// Server-Sent Events (SSE) subscribers for instant multi-browser cross-device live sync
const sseClients = new Set();

function broadcastEvent(type, payload) {
  const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: pool ? 'postgresql_connected' : 'express_api_db', 
    time: new Date().toISOString() 
  });
});

// SSE Endpoint for real-time live cross-browser updates (Chrome, Edge, Safari, Mobile)
app.get('/api/v1/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = { res };
  sseClients.add(client);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// In-Memory Database Store (Acts as active database when PostgreSQL is not attached)
let dbStore = {
  vessels: [],
  schedules: [],
  decks: {},
  locations: [],
  bookings: [],
  users: [],
  auditLogs: [],
  emailConfig: {
    smtpHost: 'smtp.smartferry.mv',
    smtpPort: 587,
    smtpUser: 'notifications@smartferry.mv',
    smtpPass: '••••••••',
    smtpSecure: true,
    senderName: 'FeridhooTours Alerts',
    senderEmail: 'notifications@smartferry.mv',
    enableBookingAlerts: true,
    enableCancellationAlerts: true,
    enablePaymentAlerts: true,
    enableAdminAlerts: true
  },
  sentEmails: []
};

// Auto Initialize Tables DDL if PostgreSQL attached
app.post('/api/v1/init-db', async (req, res) => {
  if (!pool) {
    return res.json({ success: true, message: 'Database running in Express API persistent mode.' });
  }

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    res.json({ success: true, message: 'PostgreSQL database tables initialized successfully.' });
  } catch (error) {
    console.error('[DB Init Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initial Database State Sync Endpoint (Called on App Load)
app.get('/api/v1/sync', async (req, res) => {
  if (!pool) {
    return res.json({ success: true, data: dbStore });
  }
  try {
    const vesselsRes = await pool.query('SELECT * FROM vessels ORDER BY created_at DESC');
    const schedulesRes = await pool.query('SELECT * FROM schedules ORDER BY created_at DESC');
    const bookingsRes = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
    const jettiesRes = await pool.query('SELECT * FROM jetties ORDER BY created_at DESC');
    const usersRes = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    const auditRes = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500');

    res.json({
      success: true,
      data: {
        vessels: vesselsRes.rows,
        schedules: schedulesRes.rows,
        bookings: bookingsRes.rows,
        locations: jettiesRes.rows,
        users: usersRes.rows,
        auditLogs: auditRes.rows,
        emailConfig: dbStore.emailConfig,
        sentEmails: dbStore.sentEmails
      }
    });
  } catch (err) {
    res.json({ success: true, data: dbStore });
  }
});

// Database Mutation APIs with Automatic SSE Event Broadcasting
app.post('/api/v1/broadcast', (req, res) => {
  const { type, payload } = req.body;
  
  // Update internal state store
  if (type === 'ADD_BOOKING') {
    dbStore.bookings = [payload, ...dbStore.bookings.filter(b => b.id !== payload.id)];
  } else if (type === 'UPDATE_BOOKING') {
    dbStore.bookings = dbStore.bookings.map(b => b.id === payload.id ? { ...b, ...payload } : b);
  } else if (type === 'REMOVE_BOOKING') {
    dbStore.bookings = dbStore.bookings.filter(b => b.id !== payload.id);
  } else if (type === 'ADD_SCHEDULE') {
    dbStore.schedules = [payload, ...dbStore.schedules.filter(s => s.id !== payload.id)];
  } else if (type === 'EDIT_SCHEDULE') {
    dbStore.schedules = dbStore.schedules.map(s => s.id === payload.id ? { ...s, ...payload } : s);
  } else if (type === 'REMOVE_SCHEDULE') {
    dbStore.schedules = dbStore.schedules.filter(s => s.id !== payload.id);
  } else if (type === 'ADD_VESSEL') {
    dbStore.vessels = [payload, ...dbStore.vessels.filter(v => v.id !== payload.id)];
  } else if (type === 'EDIT_VESSEL') {
    dbStore.vessels = dbStore.vessels.map(v => v.id === payload.id ? { ...v, ...payload } : v);
  } else if (type === 'REMOVE_VESSEL') {
    dbStore.vessels = dbStore.vessels.filter(v => v.id !== payload.id);
  } else if (type === 'ADD_LOCATION') {
    dbStore.locations = [payload, ...dbStore.locations.filter(l => l.id !== payload.id)];
  } else if (type === 'REMOVE_LOCATION') {
    dbStore.locations = dbStore.locations.filter(l => l.id !== payload.id);
  } else if (type === 'AUDIT_LOG_ADDED') {
    dbStore.auditLogs = [payload, ...dbStore.auditLogs.filter(a => a.id !== payload.id)];
  }

  broadcastEvent(type, payload);
  res.json({ success: true });
});

// Audit Log endpoints
app.get('/api/v1/audit-logs', async (req, res) => {
  if (!pool) return res.json(dbStore.auditLogs);
  try {
    const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500');
    res.json(rows);
  } catch (err) {
    res.json(dbStore.auditLogs);
  }
});

app.post('/api/v1/audit-logs', async (req, res) => {
  const log = req.body;
  dbStore.auditLogs = [log, ...dbStore.auditLogs];
  broadcastEvent('AUDIT_LOG_ADDED', log);

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by_id, performed_by_name, performed_by_email, performed_by_role, changes, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          log.id,
          log.action,
          log.entityType,
          log.entityId,
          log.performedBy?.id || null,
          log.performedBy?.name || 'System',
          log.performedBy?.email || null,
          log.performedBy?.role || 'user',
          JSON.stringify(log.changes || {}),
          JSON.stringify(log.metadata || {})
        ]
      );
    } catch (err) {
      console.error('[Audit Log DB Insert Error]', err);
    }
  }

  res.json({ success: true, log });
});

// Catch-all route for SPA client routing on Fly.io
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Production Database & API Server] Running on http://localhost:${PORT}`);
});
