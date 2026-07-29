-- PostgreSQL Database DDL Schema for FeridhooTours Platform
-- Includes Core Logistics Tables and Audit Log History Tracking

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'passenger', -- 'passenger' | 'agency' | 'admin'
  phone VARCHAR(64),
  agency_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Jetties / Locations Table
CREATE TABLE IF NOT EXISTS jetties (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vessels Table
CREATE TABLE IF NOT EXISTS vessels (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'Speedboat', -- 'Speedboat' | 'Ferry'
  amenities JSONB DEFAULT '[]'::jsonb,
  layout_rows INT NOT NULL DEFAULT 8,
  layout_cols INT NOT NULL DEFAULT 4,
  vip_rows VARCHAR(64) DEFAULT '',
  premium_rows VARCHAR(64) DEFAULT '',
  custom_seats JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id VARCHAR(64) PRIMARY KEY,
  vessel_id VARCHAR(64) REFERENCES vessels(id) ON DELETE SET NULL,
  vessel_name VARCHAR(255) NOT NULL,
  vessel_type VARCHAR(32) NOT NULL DEFAULT 'Speedboat',
  departure_time VARCHAR(64) NOT NULL,
  arrival_time VARCHAR(64) NOT NULL,
  available_seats INT NOT NULL,
  total_seats INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  route_from VARCHAR(32) NOT NULL REFERENCES jetties(id),
  route_to VARCHAR(32) NOT NULL REFERENCES jetties(id),
  amenities JSONB DEFAULT '[]'::jsonb,
  stops JSONB DEFAULT '[]'::jsonb,
  disabled BOOLEAN DEFAULT FALSE,
  maintenance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  schedule_id VARCHAR(64) NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  vessel_name VARCHAR(255) NOT NULL,
  vessel_type VARCHAR(32) NOT NULL,
  departure_time VARCHAR(64) NOT NULL,
  arrival_time VARCHAR(64) NOT NULL,
  route_from VARCHAR(32) NOT NULL,
  route_to VARCHAR(32) NOT NULL,
  passengers JSONB NOT NULL, -- Array of passenger objects
  selected_seat_ids JSONB NOT NULL, -- Array of seat IDs
  total_amount NUMERIC(10, 2) NOT NULL,
  discount_applied NUMERIC(10, 2) DEFAULT 0,
  promo_code_used VARCHAR(64),
  payment_method VARCHAR(32) NOT NULL DEFAULT 'card',
  receipt_image TEXT, -- Base64 Data URL or filename
  status VARCHAR(32) NOT NULL DEFAULT 'pending_verification', -- 'pending_verification' | 'verified' | 'rejected' | 'cancelled'
  rejection_reason TEXT,
  agency_id VARCHAR(64),
  booked_by VARCHAR(255),
  user_id VARCHAR(64),
  passenger_email VARCHAR(255),
  refund_amount NUMERIC(10, 2),
  cancellation_fee NUMERIC(10, 2),
  refund_percentage NUMERIC(5, 2),
  refund_status VARCHAR(32) DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit Logs Table (Full Mutation & Deletion History)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  action VARCHAR(64) NOT NULL, -- 'CREATE' | 'UPDATE' | 'DELETE' | 'RECEIPT_DELETED' | 'VERIFY_PAYMENT' | 'REJECT_PAYMENT' | 'REFUND' | 'CANCEL'
  entity_type VARCHAR(64) NOT NULL, -- 'BOOKING' | 'SCHEDULE' | 'VESSEL' | 'USER' | 'JETTY' | 'RECEIPT'
  entity_id VARCHAR(64) NOT NULL,
  performed_by_id VARCHAR(64),
  performed_by_name VARCHAR(255) NOT NULL,
  performed_by_email VARCHAR(255),
  performed_by_role VARCHAR(32) NOT NULL,
  changes JSONB, -- { before: ..., after: ... }
  metadata JSONB, -- Extra context (e.g. deleted receipt data URL, deleted booking summary, price changes)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Fast Queries
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
