-- Cloudflare D1 SQLite Database Schema for FeridhooTours Platform
-- Compatible with Cloudflare Workers / Pages Functions Serverless Compute

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'passenger',
  phone TEXT,
  agency_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jetties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vessels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Speedboat',
  capacity INTEGER DEFAULT 30,
  amenities TEXT DEFAULT '[]',
  layout_rows INTEGER NOT NULL DEFAULT 8,
  layout_cols INTEGER NOT NULL DEFAULT 4,
  vip_rows TEXT DEFAULT '',
  premium_rows TEXT DEFAULT '',
  custom_seats TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  vessel_id TEXT,
  vessel_name TEXT NOT NULL,
  vessel_type TEXT NOT NULL DEFAULT 'Speedboat',
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price REAL NOT NULL,
  category_prices TEXT DEFAULT '{}',
  route_from TEXT NOT NULL,
  route_to TEXT NOT NULL,
  recurrence TEXT DEFAULT 'Day',
  schedule_date TEXT,
  amenities TEXT DEFAULT '[]',
  stops TEXT DEFAULT '[]',
  disabled INTEGER DEFAULT 0,
  maintenance INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  vessel_type TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  route_from TEXT NOT NULL,
  route_to TEXT NOT NULL,
  passengers TEXT NOT NULL,
  selected_seat_ids TEXT NOT NULL,
  fare_category TEXT DEFAULT 'Tourist',
  total_amount REAL NOT NULL,
  discount_applied REAL DEFAULT 0,
  promo_code_used TEXT,
  payment_method TEXT NOT NULL DEFAULT 'card',
  receipt_image TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  rejection_reason TEXT,
  agency_id TEXT,
  booked_by TEXT,
  user_id TEXT,
  passenger_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  performed_by_id TEXT,
  performed_by_name TEXT NOT NULL,
  performed_by_email TEXT,
  performed_by_role TEXT NOT NULL,
  changes TEXT DEFAULT '{}',
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
