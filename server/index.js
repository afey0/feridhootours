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
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// PostgreSQL Pool Connection
const { Pool } = pg;
const dbConnectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;

let pool = null;
if (dbConnectionString) {
  pool = new Pool({
    connectionString: dbConnectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('[PostgreSQL] Database pool initialized.');
} else {
  console.log('[PostgreSQL] No DATABASE_URL found. Running in hybrid real-time API sync mode.');
}

// Server-Sent Events (SSE) subscribers for instant multi-device sync
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
  res.json({ status: 'ok', database: pool ? 'connected' : 'hybrid_in_memory', time: new Date().toISOString() });
});

// SSE Endpoint for real-time live updates
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

// Database Initialization DDL Runner
app.post('/api/v1/init-db', async (req, res) => {
  if (!pool) {
    return res.json({ success: true, message: 'Hybrid in-memory mode active.' });
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

// Audit Log endpoints
app.get('/api/v1/audit-logs', async (req, res) => {
  if (!pool) {
    return res.json([]);
  }
  try {
    const { rows } = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/audit-logs', async (req, res) => {
  const log = req.body;
  broadcastEvent('AUDIT_LOG_CREATED', log);

  if (!pool) {
    return res.json({ success: true, log });
  }

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
    res.json({ success: true, log });
  } catch (err) {
    console.error('[Audit Log Insert Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Broadcast Real-time Action Trigger Endpoint
app.post('/api/v1/broadcast', (req, res) => {
  const { type, payload } = req.body;
  broadcastEvent(type, payload);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`[Express API Server] Running on http://localhost:${PORT}`);
});
