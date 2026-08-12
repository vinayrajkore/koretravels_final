-- ============================================================
--  Kore Travels Booking - COMPLETE Database Setup (v2)
--  Includes Admin Panel tables and columns
--  Run this FRESH in phpMyAdmin
-- ============================================================

DROP DATABASE IF EXISTS busbooking;
CREATE DATABASE busbooking;
USE busbooking;

-- ── 1. USERS TABLE (role column added for admin) ─────────────
CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(100)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  phone        VARCHAR(15),
  created_date DATE,
  role         ENUM('user','admin') DEFAULT 'user'
);

-- Default admin account (password: admin123)
INSERT INTO users (name, email, password, phone, created_date, role)
VALUES ('Admin', 'admin@koretravels.com', 'admin123', '9999999999', CURDATE(), 'admin');

-- Default customer account (password: customer123)
INSERT INTO users (name, email, password, phone, created_date, role)
VALUES ('Demo Customer', 'customer@koretravels.com', 'customer123', '8888888888', CURDATE(), 'user');

-- ── 2. BUSES TABLE (pickup/drop points + amenities + seat_layout added) ────
CREATE TABLE buses (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  bus_name         VARCHAR(100)  NOT NULL,
  bus_number       VARCHAR(30)   NOT NULL UNIQUE,
  from_city        VARCHAR(100)  NOT NULL,
  to_city          VARCHAR(100)  NOT NULL,
  pickup_points    TEXT,
  drop_points      TEXT,
  depart           VARCHAR(10)   NOT NULL,
  arrive           VARCHAR(10)   NOT NULL,
  duration         VARCHAR(50)   DEFAULT '',
  travel_date      DATE          NOT NULL,
  total_seats      INT           DEFAULT 40,
  seats_left       INT           DEFAULT 40,
  price            DECIMAL(10,2) NOT NULL,
  type             VARCHAR(100)  DEFAULT '',
  rating           DECIMAL(3,1)  DEFAULT 0.0,
  photos           TEXT,
  seat_layout      VARCHAR(50)   DEFAULT '2+2 Seater',
  amenities        VARCHAR(500)  DEFAULT '',
  bus_image        VARCHAR(255)  DEFAULT NULL,
  status           ENUM('active','inactive') DEFAULT 'active'
);

-- ── 3. BOOKINGS TABLE (pending status added for admin approval)
CREATE TABLE bookings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  bus_id           INT           NOT NULL,
  seat_numbers     VARCHAR(255)  NOT NULL,
  passenger_name   VARCHAR(100)  NOT NULL,
  passenger_phone  VARCHAR(15)   NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  booking_date     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  status           ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bus_id)  REFERENCES buses(id)
);

-- ── 4. BOOKED SEATS TABLE ────────────────────────────────────
CREATE TABLE booked_seats (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  bus_id       INT NOT NULL,
  seat_number  VARCHAR(10) NOT NULL,
  booking_id   INT NOT NULL,
  FOREIGN KEY (bus_id)      REFERENCES buses(id),
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)
);

-- ── 5. ADMIN BLOCKED SEATS TABLE ─────────────────────────────
CREATE TABLE blocked_seats (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  bus_id       INT          NOT NULL,
  seat_number  VARCHAR(10) NOT NULL,
  reason       VARCHAR(255) DEFAULT 'Admin blocked',
  blocked_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- ── 6. SAMPLE BUS DATA ───────────────────────────────────────
INSERT INTO buses
  (bus_name,       bus_number, from_city, to_city,  pickup_points,           drop_points,              depart, arrive, duration, travel_date,  total_seats, seats_left, price,  type, rating, photos, seat_layout,             amenities)
VALUES
  ('Kore Express', 'KT-001',  'Pune',    'Mumbai',  '["Swargate Bus Stand"]',   '["Dadar Bus Stop"]',        '07:00',        '10:00', '03h 00m',      '2026-08-20', 40,          40,              350.00, 'AC', 4.5, '[]',      '2+2 Seater',            'WiFi,Water Bottle,Charging Point'),
  ('Kore Deluxe',  'KT-002',  'Mumbai',  'Goa',     '["Dadar Station"]',        '["Panaji Bus Stand"]',      '08:00',        '16:00', '08h 00m',      '2026-08-20', 60,          60,              750.00, 'Sleeper', 4.8, '[]', 'Full Sleeper',          'WiFi,Blanket,Pillow,Charging Point'),
  ('Kore Premium', 'KT-003',  'Pune',    'Nashik',  '["Shivajinagar"]',         '["Nashik CBS"]',            '09:00',        '12:00', '03h 00m',      '2026-08-20', 30,          30,              280.00, 'Non-AC', 4.2, '[]',   '2+1 Seater',            'Water Bottle'),
  ('Kore Super',   'KT-004',  'Mumbai',  'Pune',    '["Borivali Station"]',     '["Swargate Bus Stand"]',    '10:00',        '13:00', '03h 00m',      '2026-08-20', 60,          60,              320.00, 'AC', 4.0, '[]',       'Semi-Sleeper (2+1)',    'WiFi,Water Bottle,Charging Point'),
  ('Kore Comfort', 'KT-005',  'Nashik',  'Mumbai',  '["Nashik CBS"]',           '["Dadar Station"]',         '06:00',        '10:00', '04h 00m',      '2026-08-20', 40,          40,              400.00, 'Sleeper', 4.7, '[]',  '2+2 Seater',            'WiFi,Blanket,Charging Point'),
  ('Kore Night',   'KT-007',  'Mumbai',  'Goa',     '["Mumbai Central"]',       '["Mapusa Bus Stand"]',      '22:00',        '07:00', '09h 00m',      '2026-08-21', 60,          60,              850.00, 'Sleeper', 4.9, '[]',  'Full Sleeper',          'WiFi,Blanket,Pillow,Snacks,Charging Point');

