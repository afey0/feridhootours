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
  saved_passengers TEXT DEFAULT '[]',
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

-- Seed Jetties / Locations
INSERT OR IGNORE INTO jetties (id, name) VALUES ('APO', 'Airport (Velana International Airport Pier)');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('MLE', 'Male'' (Malé Central Ferry Terminal)');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('FER', 'Feridhoo Harbor Terminal');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('MAL', 'Maalhos Island Jetty');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('HIM', 'Himandhoo Island Pier');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('BTH', 'Bathala Resort Jetty');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('HLV', 'Halaveli Resort Pier');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('WMV', 'W Maldives Resort Pier');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('ATH', 'Athuruga Resort Pier');
INSERT OR IGNORE INTO jetties (id, name) VALUES ('SAF', 'Safari Island Resort Pier');

-- Seed Users
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES ('usr-123', 'Ahmed F.', 'ahmed@example.com', 'password123', 'passenger');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, agency_name) VALUES ('age-777', 'Maldives Travel Agency', 'bookings@mvtravel.com', 'agency123', 'agency', 'Maldives Travel Agency');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES ('adm-999', 'System Admin', 'admin@smartferry.mv', 'admin123', 'admin');
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES ('sadm-001', 'Super Admin', 'superadmin@smartferry.mv', 'superadmin123', 'super_admin');

-- Seed Vessels
INSERT OR IGNORE INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows) VALUES ('VES-38A', 'Touring 38 (27 Pax)', 'Speedboat', 27, '["AC", "Life Jacket", "Water", "WiFi", "USB Charger"]', 7, 4, '1', '2-3');
INSERT OR IGNORE INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows) VALUES ('VES-38B', 'Touring 38 (30 Pax)', 'Speedboat', 30, '["AC", "Life Jacket", "Water", "USB Charger"]', 8, 4, '1-2', '3-4');
INSERT OR IGNORE INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows) VALUES ('VES-43A', 'Touring 43 (50 Pax)', 'Speedboat', 50, '["AC", "Life Jacket", "Water", "WiFi", "Toilets", "USB Charger"]', 10, 5, '1-2', '3-5');
INSERT OR IGNORE INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows) VALUES ('VES-001', 'Senora Wave', 'Speedboat', 42, '["AC", "Life Jacket", "Water", "WiFi"]', 9, 5, '1-2', '3-4');
INSERT OR IGNORE INTO vessels (id, name, type, capacity, amenities, layout_rows, layout_cols, vip_rows, premium_rows) VALUES ('VES-002', 'Kaani Princess', 'Speedboat', 32, '["AC", "Water", "Life Jacket", "USB Charger"]', 8, 4, '1-2', '3-4');

-- Seed Schedules
INSERT OR IGNORE INTO schedules (id, vessel_id, vessel_name, vessel_type, departure_time, arrival_time, available_seats, total_seats, price, category_prices, route_from, route_to, recurrence, schedule_date, amenities, stops) VALUES ('SCH-001', 'VES-001', 'Senora Wave', 'Speedboat', '09:30 AM', '11:00 AM', 18, 42, 35.00, '{"Tourist": 35.00, "Local": 15.00, "Work Permit": 20.00, "Resort": 50.00}', 'APO', 'FER', 'Day', '2026-08-03', '["AC", "Water", "Life Jacket", "WiFi"]', '["Male''", "Bathala"]');
INSERT OR IGNORE INTO schedules (id, vessel_id, vessel_name, vessel_type, departure_time, arrival_time, available_seats, total_seats, price, category_prices, route_from, route_to, recurrence, schedule_date, amenities, stops) VALUES ('SCH-002', 'VES-38A', 'Touring 38 (27 Pax)', 'Speedboat', '02:00 PM', '03:30 PM', 27, 27, 35.00, '{"Tourist": 35.00, "Local": 15.00, "Work Permit": 20.00, "Resort": 50.00}', 'APO', 'FER', '7 Days', '2026-08-03', '["AC", "Water", "Life Jacket", "USB Charger"]', '["Halaveli", "W Maldives"]');
INSERT OR IGNORE INTO schedules (id, vessel_id, vessel_name, vessel_type, departure_time, arrival_time, available_seats, total_seats, price, category_prices, route_from, route_to, recurrence, schedule_date, amenities, stops) VALUES ('SCH-003', 'VES-43A', 'Touring 43 (50 Pax)', 'Speedboat', '11:30 AM', '01:00 PM', 45, 50, 35.00, '{"Tourist": 35.00, "Local": 15.00, "Work Permit": 20.00, "Resort": 50.00}', 'MLE', 'HIM', '30 Days', '2026-08-03', '["AC", "Water", "Life Jacket", "WiFi", "Toilets"]', '["Maalhos", "Safari Island"]');
