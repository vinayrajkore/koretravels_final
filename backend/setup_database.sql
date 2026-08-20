-- ============================================================
--  Kore Travels Booking - COMPLETE Database Setup (v3)
--  Matches ALL backend routes in database.js exactly
--  Run this FRESH in phpMyAdmin on XAMPP
--  Created: 2026-08-21
-- ============================================================

DROP DATABASE IF EXISTS busbooking;
CREATE DATABASE busbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE busbooking;

-- 1. USERS TABLE
CREATE TABLE users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  email        VARCHAR(100)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  phone        VARCHAR(15),
  created_date DATE,
  role         ENUM('user','admin') DEFAULT 'user'
);

INSERT INTO users (name, email, password, phone, created_date, role) VALUES
  ('Admin', 'admin@koretravels.com', 'admin123', '9999999999', CURDATE(), 'admin'),
  ('Demo Customer', 'customer@koretravels.com', 'customer123', '8888888888', CURDATE(), 'user'),
  ('Vinayraj Kore', 'merakore25@gmail.com', 'test1234', '8554886526', CURDATE(), 'user');

-- 2. BUSES TABLE
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

INSERT INTO buses (bus_name,bus_number,from_city,to_city,pickup_points,drop_points,depart,arrive,duration,travel_date,total_seats,seats_left,price,type,rating,photos,seat_layout,amenities,status) VALUES
  ('Kore Express','KT-001','Gargoti','Pune','[{"name":"Gargoti Bus Stand"},{"name":"Bhadgaon Naka"}]','[{"name":"Swargate Bus Stand"},{"name":"Katraj"}]','07:00','11:30','04h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,350.00,'AC',4.5,'[]','2+2 Seater','WiFi,Water Bottle,Charging Point','active'),
  ('Kore Deluxe','KT-002','Kolhapur','Mumbai','[{"name":"Kolhapur CBS"},{"name":"Ichalkaranji"}]','[{"name":"Dadar Station"},{"name":"Borivali"}]','20:00','06:00','10h 00m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),60,60,750.00,'Sleeper',4.8,'[]','Full Sleeper','WiFi,Blanket,Pillow,Charging Point','active'),
  ('Kore Premium','KT-003','Pune','Kolhapur','[{"name":"Shivajinagar"},{"name":"Katraj"}]','[{"name":"Kolhapur CBS"},{"name":"Shahupuri"}]','09:00','14:30','05h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),30,30,280.00,'Non-AC',4.2,'[]','2+1 Seater','Water Bottle','active'),
  ('Kore Super','KT-004','Mumbai','Pune','[{"name":"Dadar Station"},{"name":"Borivali Station"}]','[{"name":"Swargate Bus Stand"},{"name":"Hadapsar"}]','06:00','09:30','03h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),60,60,320.00,'AC',4.0,'[]','Semi-Sleeper (2+1)','WiFi,Water Bottle,Charging Point','active'),
  ('Kore Comfort','KT-005','Nashik','Mumbai','[{"name":"Nashik CBS"},{"name":"Malegaon"}]','[{"name":"Dadar Station"},{"name":"Andheri"}]','06:00','10:30','04h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,400.00,'Sleeper',4.7,'[]','2+2 Seater','WiFi,Blanket,Charging Point','active'),
  ('Kore Night Rider','KT-006','Gargoti','Pune','[{"name":"Gargoti Bus Stand"}]','[{"name":"Swargate Bus Stand"}]','22:00','02:30','04h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,400.00,'Sleeper',4.9,'[]','Full Sleeper','WiFi,Blanket,Pillow,Snacks,Charging Point','active'),
  ('Kore Shivneri','KT-007','Mumbai','Goa','[{"name":"Mumbai Central"},{"name":"Dadar Station"}]','[{"name":"Panaji Bus Stand"},{"name":"Mapusa"}]','22:00','07:00','09h 00m',DATE_ADD(CURDATE(),INTERVAL 2 DAY),60,60,850.00,'Sleeper',4.9,'[]','Full Sleeper','WiFi,Blanket,Pillow,Snacks,Charging Point','active'),
  ('Kore Sahayadri','KT-008','Pune','Mumbai','[{"name":"Swargate Bus Stand"},{"name":"Hadapsar"}]','[{"name":"Dadar Station"},{"name":"Borivali"}]','14:00','17:30','03h 30m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,330.00,'AC',4.3,'[]','2+2 Seater','Water Bottle,Charging Point','active'),
  ('Kore Kolhapuri','KT-009','Kolhapur','Pune','[{"name":"Kolhapur CBS"}]','[{"name":"Swargate Bus Stand"},{"name":"Kothrud"}]','07:30','12:30','05h 00m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,310.00,'Non-AC',4.1,'[]','2+2 Seater','Water Bottle','active'),
  ('Kore Sangli Express','KT-010','Sangli','Pune','[{"name":"Sangli Bus Stand"},{"name":"Miraj"}]','[{"name":"Swargate Bus Stand"}]','08:00','13:00','05h 00m',DATE_ADD(CURDATE(),INTERVAL 1 DAY),40,40,290.00,'AC',4.0,'[]','2+2 Seater','Water Bottle,Charging Point','active');

-- 3. BOOKINGS TABLE (ALL columns the backend uses)
CREATE TABLE bookings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  bus_id           INT           NOT NULL,
  seat_numbers     VARCHAR(255)  NOT NULL,
  passenger_name   VARCHAR(255)  NOT NULL,
  passenger_phone  VARCHAR(50)   NOT NULL,
  passenger_email  VARCHAR(255)  DEFAULT '',
  passenger_age    VARCHAR(255)  DEFAULT '',
  passenger_gender VARCHAR(255)  DEFAULT '',
  boarding_point   VARCHAR(255)  DEFAULT '',
  drop_point       VARCHAR(255)  DEFAULT '',
  total_amount     DECIMAL(10,2) NOT NULL,
  booking_date     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  status           ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bus_id)  REFERENCES buses(id)
);

-- 4. BOOKED SEATS TABLE
CREATE TABLE booked_seats (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  bus_id       INT NOT NULL,
  seat_number  VARCHAR(10) NOT NULL,
  booking_id   INT NOT NULL,
  FOREIGN KEY (bus_id)      REFERENCES buses(id),
  FOREIGN KEY (booking_id)  REFERENCES bookings(id)
);

-- 5. BLOCKED SEATS TABLE
CREATE TABLE blocked_seats (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  bus_id       INT          NOT NULL,
  seat_number  VARCHAR(10)  NOT NULL,
  reason       VARCHAR(255) DEFAULT 'Admin blocked',
  blocked_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- 6. BANNERS TABLE (homepage slideshow)
CREATE TABLE banners (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) DEFAULT '',
  image_filename VARCHAR(255) NOT NULL,
  sort_order     INT          DEFAULT 0,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO banners (title, image_filename, sort_order) VALUES
  ('Welcome to Kore Travels — Book Your Bus Today!','https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=960&q=80',1),
  ('10% OFF on Your First Booking — Register Now!','https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=960&q=80',2),
  ('Comfortable Sleeper Buses for Long Journeys','https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=960&q=80',3);

-- 7. SETTINGS TABLE
CREATE TABLE settings (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT
);

INSERT INTO settings (`key`, `value`) VALUES
  ('openrouter_api_key',''),
  ('openrouter_model','meta-llama/llama-3.1-8b-instruct:free'),
  ('site_name','Kore Travels'),
  ('contact_phone','8554886526'),
  ('contact_whatsapp','8669427006');

-- VERIFY
SHOW TABLES;
SELECT 'v3 Setup complete!' AS status;
