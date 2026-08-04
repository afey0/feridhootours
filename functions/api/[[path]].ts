// Cloudflare Workers / Pages Functions Serverless API Handler
// Connects natively to Cloudflare D1 Database via env.DB Prepared Statements

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    // 1. Initial State Sync from Cloudflare D1 Database
    if (path === '/api/v1/sync' && request.method === 'GET') {
      const vessels = await env.DB.prepare('SELECT * FROM vessels ORDER BY created_at DESC').all();
      const schedules = await env.DB.prepare('SELECT * FROM schedules ORDER BY created_at DESC').all();
      const bookings = await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
      const jetties = await env.DB.prepare('SELECT * FROM jetties ORDER BY created_at DESC').all();
      const users = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
      const auditLogs = await env.DB.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500').all();

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'Cloudflare Workers & D1 Database',
          data: {
            vessels: (vessels.results || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              type: v.type,
              capacity: v.capacity,
              amenities: JSON.parse(v.amenities || '[]'),
              layoutRows: v.layout_rows,
              layoutCols: v.layout_cols,
              vipRows: v.vip_rows || '',
              premiumRows: v.premium_rows || '',
              customSeats: JSON.parse(v.custom_seats || '[]')
            })),
            schedules: (schedules.results || []).map((s: any) => ({
              id: s.id,
              vesselId: s.vessel_id,
              vesselName: s.vessel_name,
              vesselType: s.vessel_type,
              departureTime: s.departure_time,
              arrivalTime: s.arrival_time,
              availableSeats: s.available_seats,
              totalSeats: s.total_seats,
              price: Number(s.price),
              categoryPrices: JSON.parse(s.category_prices || '{}'),
              routeFrom: s.route_from,
              routeTo: s.route_to,
              recurrence: s.recurrence || 'Day',
              scheduleDate: s.schedule_date,
              amenities: JSON.parse(s.amenities || '[]'),
              stops: JSON.parse(s.stops || '[]'),
              disabled: Boolean(s.disabled),
              maintenance: Boolean(s.maintenance)
            })),
            bookings: (bookings.results || []).map((b: any) => ({
              id: b.id,
              scheduleId: b.schedule_id,
              vesselName: b.vessel_name,
              vesselType: b.vessel_type,
              departureTime: b.departure_time,
              arrivalTime: b.arrival_time,
              routeFrom: b.route_from,
              routeTo: b.route_to,
              passengers: JSON.parse(b.passengers || '[]'),
              selectedSeatIds: JSON.parse(b.selected_seat_ids || '[]'),
              fareCategory: b.fare_category || 'Tourist',
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
            locations: jetties.results || [],
            users: users.results || [],
            auditLogs: (auditLogs.results || []).map((a: any) => ({
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
              changes: JSON.parse(a.changes || '{}'),
              metadata: JSON.parse(a.metadata || '{}'),
              createdAt: a.created_at
            }))
          }
        }),
        { headers }
      );
    }

    // 2. Broadcast & Mutations to Cloudflare D1
    if (path === '/api/v1/broadcast' && request.method === 'POST') {
      const body: any = await request.json();
      const { type, payload } = body;

      if (type === 'ADD_VESSEL' || type === 'EDIT_VESSEL' || type === 'VESSEL_CREATED' || type === 'VESSEL_UPDATED') {
        await env.DB.prepare(
          `INSERT INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows, custom_seats)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
           name=excluded.name, type=excluded.type, capacity=excluded.capacity, amenities=excluded.amenities,
           layout_rows=excluded.layout_rows, layout_cols=excluded.layout_cols,
           vip_rows=excluded.vip_rows, premium_rows=excluded.premium_rows, custom_seats=excluded.custom_seats`
        ).bind(
          payload.id,
          payload.name,
          payload.type,
          payload.capacity || 30,
          JSON.stringify(payload.amenities || []),
          payload.layoutRows || 8,
          payload.layoutCols || 4,
          payload.vipRows || '',
          payload.premiumRows || '',
          JSON.stringify(payload.customSeats || [])
        ).run();
      } else if (type === 'REMOVE_VESSEL' || type === 'VESSEL_DELETED') {
        await env.DB.prepare('DELETE FROM vessels WHERE id = ?').bind(payload.id).run();
      } else if (type === 'ADD_SCHEDULE' || type === 'EDIT_SCHEDULE' || type === 'SCHEDULE_CREATED' || type === 'SCHEDULE_UPDATED') {
        await env.DB.prepare(
          `INSERT INTO schedules (id, vessel_id, vessel_name, vessel_type, departure_time, arrival_time, available_seats, total_seats, price, category_prices, route_from, route_to, recurrence, schedule_date, amenities, stops, disabled, maintenance)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
           vessel_id=excluded.vessel_id, vessel_name=excluded.vessel_name, vessel_type=excluded.vessel_type,
           departure_time=excluded.departure_time, arrival_time=excluded.arrival_time,
           available_seats=excluded.available_seats, total_seats=excluded.total_seats,
           price=excluded.price, category_prices=excluded.category_prices, route_from=excluded.route_from, route_to=excluded.route_to,
           recurrence=excluded.recurrence, schedule_date=excluded.schedule_date,
           amenities=excluded.amenities, stops=excluded.stops,
           disabled=excluded.disabled, maintenance=excluded.maintenance`
        ).bind(
          payload.id,
          payload.vesselId || null,
          payload.vesselName,
          payload.vesselType,
          payload.departureTime,
          payload.arrivalTime,
          payload.availableSeats,
          payload.totalSeats,
          payload.price,
          JSON.stringify(payload.categoryPrices || {}),
          payload.routeFrom,
          payload.routeTo,
          payload.recurrence || 'Day',
          payload.scheduleDate || new Date().toISOString().split('T')[0],
          JSON.stringify(payload.amenities || []),
          JSON.stringify(payload.stops || []),
          payload.disabled ? 1 : 0,
          payload.maintenance ? 1 : 0
        ).run();
      } else if (type === 'REMOVE_SCHEDULE' || type === 'SCHEDULE_DELETED') {
        await env.DB.prepare('DELETE FROM schedules WHERE id = ?').bind(payload.id).run();
      } else if (type === 'ADD_BOOKING' || type === 'BOOKING_CREATED') {
        await env.DB.prepare(
          `INSERT INTO bookings (id, schedule_id, vessel_name, vessel_type, departure_time, arrival_time, route_from, route_to, passengers, selected_seat_ids, fare_category, total_amount, discount_applied, promo_code_used, payment_method, receipt_image, status, rejection_reason, agency_id, booked_by, user_id, passenger_email)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
           status=excluded.status, rejection_reason=excluded.rejection_reason, receipt_image=excluded.receipt_image`
        ).bind(
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
          payload.fareCategory || 'Tourist',
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
        ).run();
      } else if (type === 'UPDATE_BOOKING' || type === 'BOOKING_UPDATED') {
        const bookingId = payload.bookingId || payload.id;
        const status = payload.status || payload.updatedFields?.status;
        const rejectionReason = payload.rejectionReason || payload.updatedFields?.rejectionReason;
        const receiptImage = payload.receiptImage || payload.updatedFields?.receiptImage;

        if (status !== undefined) {
          await env.DB.prepare('UPDATE bookings SET status = ? WHERE id = ?').bind(status, bookingId).run();
        }
        if (rejectionReason !== undefined) {
          await env.DB.prepare('UPDATE bookings SET rejection_reason = ? WHERE id = ?').bind(rejectionReason, bookingId).run();
        }
        if (receiptImage !== undefined) {
          await env.DB.prepare('UPDATE bookings SET receipt_image = ? WHERE id = ?').bind(receiptImage, bookingId).run();
        }
      } else if (type === 'REMOVE_BOOKING' || type === 'BOOKING_DELETED') {
        const bookingId = payload.bookingId || payload.id;
        await env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(bookingId).run();
      } else if (type === 'BOOKING_REFUND_REQUESTED') {
        const bookingId = payload.bookingId;
        await env.DB.prepare("UPDATE bookings SET status = 'refund_requested' WHERE id = ?")
          .bind(bookingId).run();
      } else if (type === 'REFUND_PAYOUT_COMPLETED') {
        const bookingId = payload.bookingId;
        await env.DB.prepare("UPDATE bookings SET status = 'refunded' WHERE id = ?")
          .bind(bookingId).run();
      } else if (type === 'JETTY_CREATED' || type === 'ADD_JETTY') {
        await env.DB.prepare(
          `INSERT INTO jetties (id, name) VALUES (?, ?)
           ON CONFLICT(id) DO UPDATE SET name=excluded.name`
        ).bind(payload.id, payload.name).run();
      } else if (type === 'JETTY_DELETED' || type === 'REMOVE_JETTY') {
        await env.DB.prepare('DELETE FROM jetties WHERE id = ?').bind(payload.id).run();
      } else if (type === 'SEATS_BOOKED') {
        const { scheduleId, seatIds } = payload;
        await env.DB.prepare(
          `UPDATE schedules SET available_seats = CASE WHEN available_seats - ? < 0 THEN 0 ELSE available_seats - ? END WHERE id = ?`
        ).bind(seatIds.length, seatIds.length, scheduleId).run();
      }

      return new Response(JSON.stringify({ success: true, message: 'Cloudflare D1 updated' }), { headers });
    }

    // 3. Audit Log Ingestion to Cloudflare D1
    if (path === '/api/v1/audit-logs' && request.method === 'POST') {
      const log: any = await request.json();
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by_id, performed_by_name, performed_by_email, performed_by_role, changes, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO NOTHING`
      ).bind(
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
      ).run();

      return new Response(JSON.stringify({ success: true, log }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Endpoint not found' }), { status: 404, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers });
  }
};
