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

// Static frontend serving if dist exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// PostgreSQL Connection Pool to VirtualBox Server (192.168.100.71)
const { Pool } = pg;
const dbConnectionString = process.env.PG_CONNECTION_STRING || process.env.DATABASE_URL || 'postgres://postgres:postgres@192.168.100.71:5432/boat_management';

let pool = new Pool({
  connectionString: dbConnectionString,
  connectionTimeoutMillis: 5000
});

// Auto initialize DDL on boot
async function initDbTables() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('[PostgreSQL] Connected to 192.168.100.71 database & tables initialized.');
  } catch (err) {
    console.warn('[PostgreSQL Connection Note]', err.message);
  }
}
initDbTables();

// SSE Clients for live updates
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

// Initial Sync Endpoint - Fetch directly from PostgreSQL Database
app.get('/api/v1/sync', async (req, res) => {
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
        vessels: vesselsRes.rows.map(v => ({
          id: v.id,
          name: v.name,
          type: v.type,
          amenities: v.amenities || [],
          layoutRows: v.layout_rows,
          layoutCols: v.layout_cols,
          vipRows: v.vip_rows || '',
          premiumRows: v.premium_rows || '',
          customSeats: v.custom_seats || []
        })),
        schedules: schedulesRes.rows.map(s => ({
          id: s.id,
          vesselId: s.vessel_id,
          vesselName: s.vessel_name,
          vesselType: s.vessel_type,
          departureTime: s.departure_time,
          arrivalTime: s.arrival_time,
          availableSeats: s.available_seats,
          totalSeats: s.total_seats,
          price: Number(s.price),
          routeFrom: s.route_from,
          routeTo: s.route_to,
          recurrence: s.recurrence || 'Day',
          scheduleDate: s.schedule_date,
          amenities: s.amenities || [],
          stops: s.stops || [],
          disabled: s.disabled || false,
          maintenance: s.maintenance || false
        })),
        bookings: bookingsRes.rows.map(b => ({
          id: b.id,
          scheduleId: b.schedule_id,
          vesselName: b.vessel_name,
          vesselType: b.vessel_type,
          departureTime: b.departure_time,
          arrivalTime: b.arrival_time,
          routeFrom: b.route_from,
          routeTo: b.route_to,
          passengers: b.passengers || [],
          selectedSeatIds: b.selected_seat_ids || [],
          totalAmount: Number(b.total_amount),
          discountApplied: Number(b.discount_applied || 0),
          promoCodeUsed: b.promo_code_used,
          paymentMethod: b.payment_method,
          receiptImage: b.receipt_image,
          status: b.status,
          rejectionReason: b.rejection_reason,
          agencyId: b.agency_id,
          bookedBy: b.booked_by,
          userId: b.user_id,
          passengerEmail: b.passenger_email,
          createdAt: b.created_at
        })),
        locations: jettiesRes.rows,
        users: usersRes.rows,
        auditLogs: auditRes.rows.map(a => ({
          id: a.id,
          action: a.action,
          entityType: a.entity_type,
          entityId: a.entity_id,
          performedBy: {
            id: a.performed_by_id,
            name: a.performed_by_name,
            email: a.performed_by_email,
            role: a.performed_by_role
          },
          changes: a.changes || {},
          metadata: a.metadata || {},
          createdAt: a.created_at
        }))
      }
    });
  } catch (err) {
    console.error('[Sync DB Error]', err);
    res.json({ success: false, error: err.message });
  }
});

// Broadcast & Mutation Handler (Writes directly to PostgreSQL)
app.post('/api/v1/broadcast', async (req, res) => {
  const { type, payload } = req.body;

  try {
    if (type === 'ADD_VESSEL' || type === 'EDIT_VESSEL') {
      await pool.query(
        `INSERT INTO vessels (id, name, type, amenities, layout_rows, layout_cols, vip_rows, premium_rows, custom_seats)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, type = EXCLUDED.type, amenities = EXCLUDED.amenities,
         layout_rows = EXCLUDED.layout_rows, layout_cols = EXCLUDED.layout_cols,
         vip_rows = EXCLUDED.vip_rows, premium_rows = EXCLUDED.premium_rows,
         custom_seats = EXCLUDED.custom_seats, updated_at = CURRENT_TIMESTAMP`,
        [
          payload.id,
          payload.name,
          payload.type,
          JSON.stringify(payload.amenities || []),
          payload.layoutRows || 8,
          payload.layoutCols || 4,
          payload.vipRows || '',
          payload.premiumRows || '',
          JSON.stringify(payload.customSeats || [])
        ]
      );
    } else if (type === 'REMOVE_VESSEL') {
      await pool.query('DELETE FROM vessels WHERE id = $1', [payload.id]);
    } else if (type === 'ADD_SCHEDULE' || type === 'EDIT_SCHEDULE') {
      await pool.query(
        `INSERT INTO schedules (id, vessel_id, vessel_name, vessel_type, departure_time, arrival_time, available_seats, total_seats, price, route_from, route_to, recurrence, schedule_date, amenities, stops, disabled, maintenance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO UPDATE SET
         vessel_id = EXCLUDED.vessel_id, vessel_name = EXCLUDED.vessel_name, vessel_type = EXCLUDED.vessel_type,
         departure_time = EXCLUDED.departure_time, arrival_time = EXCLUDED.arrival_time,
         available_seats = EXCLUDED.available_seats, total_seats = EXCLUDED.total_seats,
         price = EXCLUDED.price, route_from = EXCLUDED.route_from, route_to = EXCLUDED.route_to,
         recurrence = EXCLUDED.recurrence, schedule_date = EXCLUDED.schedule_date,
         amenities = EXCLUDED.amenities, stops = EXCLUDED.stops,
         disabled = EXCLUDED.disabled, maintenance = EXCLUDED.maintenance, updated_at = CURRENT_TIMESTAMP`,
        [
          payload.id,
          payload.vesselId || null,
          payload.vesselName,
          payload.vesselType,
          payload.departureTime,
          payload.arrivalTime,
          payload.availableSeats,
          payload.totalSeats,
          payload.price,
          payload.routeFrom,
          payload.routeTo,
          payload.recurrence || 'Day',
          payload.scheduleDate || new Date().toISOString().split('T')[0],
          JSON.stringify(payload.amenities || []),
          JSON.stringify(payload.stops || []),
          payload.disabled || false,
          payload.maintenance || false
        ]
      );
    } else if (type === 'REMOVE_SCHEDULE') {
      await pool.query('DELETE FROM schedules WHERE id = $1', [payload.id]);
    } else if (type === 'ADD_BOOKING' || type === 'UPDATE_BOOKING') {
      await pool.query(
        `INSERT INTO bookings (id, schedule_id, vessel_name, vessel_type, departure_time, arrival_time, route_from, route_to, passengers, selected_seat_ids, total_amount, discount_applied, promo_code_used, payment_method, receipt_image, status, rejection_reason, agency_id, booked_by, user_id, passenger_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status, rejection_reason = EXCLUDED.rejection_reason,
         receipt_image = EXCLUDED.receipt_image, updated_at = CURRENT_TIMESTAMP`,
        [
          payload.id,
          payload.scheduleId,
          payload.vesselName,
          payload.vesselType,
          payload.departureTime,
          payload.arrivalTime,
          payload.routeFrom,
          payload.routeTo,
          JSON.stringify(payload.passengers || []),
          JSON.stringify(payload.selectedSeatIds || []),
          payload.totalAmount,
          payload.discountApplied || 0,
          payload.promoCodeUsed || null,
          payload.paymentMethod || 'card',
          payload.receiptImage || null,
          payload.status || 'pending_verification',
          payload.rejectionReason || null,
          payload.agencyId || null,
          payload.bookedBy || null,
          payload.userId || null,
          payload.passengerEmail || null
        ]
      );
    } else if (type === 'REMOVE_BOOKING') {
      await pool.query('DELETE FROM bookings WHERE id = $1', [payload.id]);
    }
  } catch (err) {
    console.error('[DB Broadcast Mutation Error]', err);
  }

  broadcastEvent(type, payload);
  res.json({ success: true });
});

// Audit Log endpoint (Writes directly to PostgreSQL audit_logs table)
app.post('/api/v1/audit-logs', async (req, res) => {
  const log = req.body;
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by_id, performed_by_name, performed_by_email, performed_by_role, changes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
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

  broadcastEvent('AUDIT_LOG_ADDED', log);
  res.json({ success: true, log });
});

app.listen(PORT, () => {
  console.log(`[PostgreSQL Database API Server] Listening on http://localhost:${PORT}`);
});
