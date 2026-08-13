// database.js - Kore Travels Bus Booking - Complete API
// Same patterns as NODE/database.js learned during internship
// express + mysql2 + cors + multer + nodemailer
// dotenv added for deployment-ready configuration

require("dotenv").config();   // Load .env variables first

const express  = require("express");
const mysql    = require("mysql2");
const cors     = require("cors");
const path     = require("path");
const multer   = require("multer");
const transporter = require("./mailer");

const app = express();
app.use(express.json());
app.use(cors());

// ─── DATABASE (uses .env — change for deployment) ────────────────────────────
const db = mysql.createConnection({
    host:     process.env.DB_HOST     || "localhost",
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "busbooking",
    ssl:      process.env.DB_HOST && process.env.DB_HOST !== "localhost" ? { rejectUnauthorized: false } : false,
    dateStrings: true
}).promise();
console.log("Database Connected !!");


// ─── MULTER & CLOUDINARY ────────────────────────────
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'busbooking',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});
const upload = multer({ storage });

app.listen(process.env.PORT || 3001, () =>
    console.log(`Kore Travels Server on Port ${process.env.PORT || 3001}`)
);


// ════════════════════════════════════════════════════════════
//  AUTH — Register + Login (same pattern as internship)
// ════════════════════════════════════════════════════════════

app.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const [existing] = await db.query("SELECT id FROM users WHERE email=?", [email]);
        if (existing.length > 0) return res.json({ message: "Email Already Exists !!", flag: 0 });

        const today = new Date().toISOString().split("T")[0];
        await db.query(
            "INSERT INTO users(name,email,password,phone,created_date) VALUES(?,?,?,?,?)",
            [name, email, password, phone, today]
        );

        try {
            transporter.sendMail({
                from: '"Kore Travels" <ranuh441@gmail.com>', to: email,
                subject: "Welcome to Kore Travels! 🎉",
                html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%);padding:40px 30px;text-align:center;">
                            <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:65px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
                            <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:-0.5px;">Welcome to Kore Travels!</h1>
                            <p style="color:#c8ff00;margin:10px 0 0 0;font-size:16px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Your Journey Begins Here</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:40px 40px 30px 40px;">
                            <h2 style="color:#0d3d35;margin-top:0;font-size:22px;">Hello ${name}, 👋</h2>
                            <p style="color:#475569;font-size:16px;line-height:1.6;margin-bottom:25px;">We are thrilled to have you on board! You have successfully registered on the <strong>Kore Travels Booking Portal</strong>. Get ready to experience the most comfortable and reliable bus journeys across India.</p>
                            
                            <div style="background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);border:1px solid #fde68a;padding:20px;text-align:center;border-radius:12px;margin:30px 0;">
                              <h3 style="color:#d97706;margin:0 0 8px 0;font-size:18px;">🎉 Exclusive Welcome Offer!</h3>
                              <p style="color:#b45309;margin:0;font-size:15px;font-weight:600;">Enjoy <strong>10% OFF</strong> on your very first booking with us.</p>
                            </div>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center">
                                  <a href="http://localhost:5173/login" style="display:inline-block;padding:14px 36px;background-color:#1a7a6e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;box-shadow:0 4px 12px rgba(26,122,110,0.3);">Book Your First Bus →</a>
                                </td>
                              </tr>
                            </table>
                            
                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:35px 0;" />
                            
                            <h4 style="color:#0d3d35;margin:0 0 15px 0;font-size:16px;text-transform:uppercase;letter-spacing:0.5px;">Need Assistance?</h4>
                            <p style="color:#64748b;font-size:14px;margin:0 0 15px 0;">Our support team is always here to help you.</p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="left">
                                  <a href="tel:8554886526" style="display:inline-block;padding:10px 16px;background-color:#f1f5f9;color:#334155;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-right:10px;margin-bottom:10px;">📞 Call: 8554886526</a>
                                  <a href="https://wa.me/918669427006" style="display:inline-block;padding:10px 16px;background-color:#dcfce7;color:#166534;text-decoration:none;border-radius:6px;font-weight:600;font-size:13px;margin-bottom:10px;">💬 WhatsApp Support</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#0f172a;padding:20px;text-align:center;">
                            <p style="color:#94a3b8;margin:0;font-size:13px;">© ${new Date().getFullYear()} Kore Travels. All rights reserved.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>`
            }).catch(e => console.error("Register email error:", e.message));
        } catch (e) { console.error("Sync Register email error:", e.message); }

        res.json({ message: "Registration Successful !!", flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [mailData] = await db.query("SELECT id,name,email,role FROM users WHERE email=?", [email]);
        const [passData] = await db.query("SELECT id FROM users WHERE password=?", [password]);

        if (mailData.length > 0 && passData.length === 0)
            return res.json({ message: "Password Is Incorrect !!", flag: 0 });

        if (mailData.length > 0 && passData.length > 0) {
            const u = mailData[0];
            try {
                transporter.sendMail({
                    from: '"Kore Travels" <ranuh441@gmail.com>', to: u.email,
                    subject: "Security Alert: New Login - Kore Travels",
                    html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                        <tr><td align="center">
                          <table width="500" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                            <tr>
                              <td style="background:linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%);padding:30px;text-align:center;">
                                <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:50px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
                                <h2 style="color:#ffffff;margin:0;font-size:22px;">Login Alert</h2>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:35px 30px;text-align:center;">
                                <h3 style="color:#0d3d35;margin-top:0;font-size:20px;">Welcome back, ${u.name}!</h3>
                                <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:20px;">We noticed a new login to your Kore Travels account on <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' })}</strong> (IST).</p>
                                <p style="color:#64748b;font-size:14px;margin-bottom:25px;">If this was you, you can safely ignore this email. If you did not authorize this login, please contact support immediately.</p>
                                <a href="${process.env.FRONTEND_URL || 'https://koretravels-final.pages.dev'}/mybookings" style="display:inline-block;padding:12px 28px;background-color:#1a7a6e;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Go to Dashboard</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color:#0f172a;padding:15px;text-align:center;">
                                <p style="color:#94a3b8;margin:0;font-size:12px;">© ${new Date().getFullYear()} Kore Travels</p>
                              </td>
                            </tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>`
                }).catch(e => console.error("Login email error:", e.message));
            } catch (e) { console.error("Sync Login email error:", e.message); }

            return res.json({
                message: "Logged In Successfully !!",
                flag: 1,
                uid: u.id, uname: u.name, umail: u.email,
                role: u.role   // ← send role so frontend knows if admin
            });
        }

        res.json({ message: "Invalid Credentials Or User Not Found !!", flag: 0 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// ════════════════════════════════════════════════════════════
//  BUS ROUTES
// ════════════════════════════════════════════════════════════

// GET all buses
app.get("/buses", async (req, res) => {
    try {
        const [buses] = await db.query(`
            SELECT *, depart AS departure_time, arrive AS arrival_time,
                   type AS bus_type, seats_left AS available_seats
            FROM buses ORDER BY travel_date ASC, depart ASC
        `);
        res.json(buses);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single bus
app.get("/bus/:id", async (req, res) => {
    try {
        const [data] = await db.query("SELECT * FROM buses WHERE id=?", [req.params.id]);
        if (!data.length) return res.status(404).json({ message: "Bus Not Found" });
        res.json(data[0]);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET unique locations (cities + pickup/drop points)
app.get("/locations", async (req, res) => {
    try {
        const [buses] = await db.query("SELECT from_city, to_city, pickup_points, drop_points FROM buses WHERE status = 'active'");
        
        const toTitleCase = (str) => {
            if (!str) return "";
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };

        let rawAll = new Set();
        let mapping = {}; // origin -> Set of destinations

        const addMapping = (orig, dest) => {
            if (!orig || !dest) return;
            const o = toTitleCase(orig.trim());
            const d = toTitleCase(dest.trim());
            rawAll.add(o);
            rawAll.add(d);
            if (!mapping[o]) mapping[o] = new Set();
            mapping[o].add(d);
        };

        buses.forEach(bus => {
            let origins = [];
            let destinations = [];

            if (bus.from_city) origins.push(bus.from_city);
            try {
                const pickups = JSON.parse(bus.pickup_points || "[]");
                pickups.forEach(p => p.name && origins.push(p.name));
            } catch(e) {}

            if (bus.to_city) destinations.push(bus.to_city);
            try {
                const drops = JSON.parse(bus.drop_points || "[]");
                drops.forEach(d => d.name && destinations.push(d.name));
            } catch(e) {}

            origins.forEach(o => {
                destinations.forEach(d => {
                    addMapping(o, d);
                });
            });
        });

        const allLocations = Array.from(rawAll).sort();
        const destinationsMap = {};
        for (let o in mapping) {
            destinationsMap[o] = Array.from(mapping[o]).sort();
        }

        res.json({
            all: allLocations,
            destinationsMap: destinationsMap
        });
        
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST search buses
app.post("/searchbus", async (req, res) => {
    try {
        const { from_city, to_city, travel_date } = req.body;
        const sql = `SELECT *, depart AS departure_time, arrive AS arrival_time,
                     type AS bus_type, seats_left AS available_seats
                     FROM buses
                     WHERE (from_city LIKE ? OR pickup_points LIKE ?) 
                     AND (to_city LIKE ? OR drop_points LIKE ?)
                     AND travel_date = ? AND seats_left > 0
                     AND status = 'active'
                     ORDER BY depart ASC`;
        const searchFrom = `%${from_city}%`;
        const searchTo = `%${to_city}%`;
        const [buses] = await db.query(sql, [searchFrom, searchFrom, searchTo, searchTo, travel_date]);
        res.json(buses);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST add bus with multiple images
app.post("/addbus", upload.array("bus_images", 10), async (req, res) => {
    try {
        const { bus_name, bus_number, from_city, to_city, pickup_points, drop_points,
            depart, arrive, duration, travel_date, total_seats, price, type, rating, amenities, seat_layout } = req.body;
        
        const uploadedPhotos = req.files && req.files.length > 0 
            ? JSON.stringify(req.files.map(f => f.path)) 
            : "[]";
        
        const first_image = req.files && req.files.length > 0 ? req.files[0].path : null;

        const sql = `INSERT INTO buses(bus_name,bus_number,from_city,to_city,pickup_points,drop_points,
                     depart,arrive,duration,travel_date,total_seats,seats_left,price,type,rating,photos,amenities,bus_image,seat_layout)
                     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
        await db.query(sql, [bus_name, bus_number, from_city, to_city, pickup_points || "[]", drop_points || "[]",
            depart, arrive, duration || "", travel_date, total_seats, total_seats, price, type, rating || 0.0, uploadedPhotos, amenities || "", first_image, seat_layout || "2+2 Seater"]);
        res.json({ message: "Bus Added Successfully !!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update bus photos only (for delete individual / clear all)
app.put("/bus/:id/photos", async (req, res) => {
    try {
        const { photos } = req.body; // array of URL strings
        const photosJson = JSON.stringify(Array.isArray(photos) ? photos : []);
        const first_image = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        await db.query("UPDATE buses SET photos=?, bus_image=? WHERE id=?", [photosJson, first_image, req.params.id]);
        res.json({ message: "Photos updated successfully", flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT edit bus with multiple images
app.put("/editbus/:id", upload.array("bus_images", 10), async (req, res) => {
    try {
        const { id } = req.params;
        const { bus_name, bus_number, from_city, to_city, pickup_points, drop_points,
            depart, arrive, duration, travel_date, price, type, rating, amenities, status, seat_layout } = req.body;

        // If new images uploaded use them, else keep old
        let updateSql, updateParams;
        if (req.files && req.files.length > 0) {
            const uploadedPhotos = JSON.stringify(req.files.map(f => f.path));
            const first_image = req.files[0].path;
            updateSql = `UPDATE buses SET bus_name=?,bus_number=?,from_city=?,to_city=?,pickup_points=?,
                         drop_points=?,depart=?,arrive=?,duration=?,travel_date=?,price=?,
                         type=?,rating=?,photos=?,amenities=?,bus_image=?,status=?,seat_layout=? WHERE id=?`;
            updateParams = [bus_name, bus_number, from_city, to_city, pickup_points || "[]", drop_points || "[]",
                depart, arrive, duration || "", travel_date, price, type, rating || 0.0, uploadedPhotos, amenities || "", first_image, status || "active", seat_layout || "2+2 Seater", id];
        } else {
            updateSql = `UPDATE buses SET bus_name=?,bus_number=?,from_city=?,to_city=?,pickup_points=?,
                         drop_points=?,depart=?,arrive=?,duration=?,travel_date=?,price=?,
                         type=?,rating=?,amenities=?,status=?,seat_layout=? WHERE id=?`;
            updateParams = [bus_name, bus_number, from_city, to_city, pickup_points || "[]", drop_points || "[]",
                depart, arrive, duration || "", travel_date, price, type, rating || 0.0, amenities || "", status || "active", seat_layout || "2+2 Seater", id];
        }

        const [result] = await db.query(updateSql, updateParams);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Bus Not Found" });
        res.json({ message: "Bus Updated Successfully !!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE bus (same DELETE pattern as internship)
app.delete("/deletebus/:id", async (req, res) => {
    try {
        const busId = req.params.id;
        
        // Fetch bus photos before deleting
        const [rows] = await db.query("SELECT photos, bus_image FROM buses WHERE id=?", [busId]);
        
        // Delete foreign key dependencies first
        await db.query("DELETE FROM booked_seats WHERE bus_id=?", [busId]);
        await db.query("DELETE FROM blocked_seats WHERE bus_id=?", [busId]);
        await db.query("DELETE FROM bookings WHERE bus_id=?", [busId]);
        
        const [result] = await db.query("DELETE FROM buses WHERE id=?", [busId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Bus Not Found" });
        
        // Delete images from Cloudinary
        if (rows.length > 0) {
            const bus = rows[0];
            const urlsToDelete = [];
            if (bus.bus_image && bus.bus_image.startsWith('http')) urlsToDelete.push(bus.bus_image);
            try {
                const photos = JSON.parse(bus.photos || "[]");
                photos.forEach(p => { if (p && p.startsWith('http') && !urlsToDelete.includes(p)) urlsToDelete.push(p); });
            } catch(e) {}
            
            for (let url of urlsToDelete) {
                try {
                    const urlParts = url.split('/');
                    const filenameWithExt = urlParts[urlParts.length - 1];
                    const folderName = urlParts[urlParts.length - 2];
                    const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch(e) { console.error("Cloudinary delete error:", e.message); }
            }
        }
        
        res.json({ message: "Bus Deleted Successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST image upload (same Multer pattern as internship)
app.post("/upload", upload.single("image"), (req, res) => {
    res.json({ message: "Image Uploaded", image: req.file.path });
});


// ════════════════════════════════════════════════════════════
//  SEAT ROUTES
// ════════════════════════════════════════════════════════════

// GET booked + blocked seats for a bus (combined for SeatMap.jsx)
app.get("/bookedseats/:bus_id", async (req, res) => {
    try {
        const { bus_id } = req.params;
        const [booked]  = await db.query("SELECT seat_number FROM booked_seats WHERE bus_id=?", [bus_id]);
        const [blocked] = await db.query("SELECT seat_number FROM blocked_seats WHERE bus_id=?", [bus_id]);
        const all = [
            ...booked.map(s => ({ seat: s.seat_number, type: "booked" })),
            ...blocked.map(s => ({ seat: s.seat_number, type: "blocked" }))
        ];
        // Return unique seat numbers
        const unique = [...new Map(all.map(s => [s.seat, s])).values()];
        res.json(unique);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// ════════════════════════════════════════════════════════════
//  BOOKING ROUTES
// ════════════════════════════════════════════════════════════

// POST bookbus — status is now PENDING (admin must confirm)
app.post("/bookbus", async (req, res) => {
    try {
        const { user_id, bus_id, seat_numbers, passenger_name, passenger_phone, total_amount,
                boarding_point, drop_point, passenger_age, passenger_gender, passenger_email } = req.body;

        // Save booking as PENDING (admin approves)
        const [bookResult] = await db.query(
            `INSERT INTO bookings(user_id,bus_id,seat_numbers,passenger_name,passenger_phone,total_amount,status,boarding_point,drop_point,passenger_age,passenger_gender,passenger_email)
             VALUES(?,?,?,?,?,?,'pending',?,?,?,?,?)`,
            [user_id, bus_id, seat_numbers.join(","), passenger_name, passenger_phone, total_amount,
             boarding_point||'', drop_point||'', passenger_age||'', passenger_gender||'', passenger_email||'']
        );
        const booking_id = bookResult.insertId;

        // Reserve seats in booked_seats
        for (let seat of seat_numbers) {
            await db.query("INSERT INTO booked_seats(bus_id,seat_number,booking_id) VALUES(?,?,?)", [bus_id, seat, booking_id]);
        }
        // Reduce seats_left
        await db.query("UPDATE buses SET seats_left = seats_left - ? WHERE id=?", [seat_numbers.length, bus_id]);

        // Get bus + user info for email
        const [busData]  = await db.query("SELECT * FROM buses WHERE id=?", [bus_id]);
        const [userData] = await db.query("SELECT name,email FROM users WHERE id=?", [user_id]);
        const bus = busData[0]; const user = userData[0];

        // Send PENDING confirmation email
        try {
            transporter.sendMail({
                from: '"Kore Travels" <ranuh441@gmail.com>', to: user.email,
                subject: `Booking Request Received #${booking_id} ⏳`,
                html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%);padding:35px 30px;text-align:center;">
                            <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:60px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
                            <h2 style="color:#ffffff;margin:0;font-size:24px;">Booking Received</h2>
                            <div style="display:inline-block;background-color:rgba(255,255,255,0.2);color:#c8ff00;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-top:12px;letter-spacing:1px;text-transform:uppercase;">⏳ Pending Confirmation</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:35px 40px;">
                            <h3 style="color:#0d3d35;margin-top:0;font-size:20px;">Hello ${passenger_name.split(',')[0].trim()},</h3>
                            <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:25px;">We've received your booking request for <strong>${bus.from_city} to ${bus.to_city}</strong>. Your seats have been temporarily reserved and are awaiting final confirmation from our administration team.</p>
                            
                            <table width="100%" cellpadding="12" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                              <tr><td style="background-color:#f8fafc;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e2e8f0;" colspan="2">Booking Details</td></tr>
                              <tr>
                                <td width="35%" style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Booking ID</td>
                                <td style="color:#0f172a;font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;">#${booking_id}</td>
                              </tr>
                              <tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Route</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${bus.from_city} → ${bus.to_city}</td>
                              </tr>
                              ${boarding_point ? `<tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">🟢 Boarding Point</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${boarding_point}</td>
                              </tr>` : ''}
                              ${drop_point ? `<tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">🔴 Drop Point</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${drop_point}</td>
                              </tr>` : ''}
                              <tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Travel Date</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${bus.travel_date}</td>
                              </tr>
                              ${seat_numbers.map((seat, i) => {
                                  const name = passenger_name.split(",")[i]?.trim() || "N/A";
                                  const age = (passenger_age||"").split(",")[i]?.trim() || "N/A";
                                  const gender = (passenger_gender||"").split(",")[i]?.trim() || "N/A";
                                  return `<tr>
                                    <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Seat ${seat}</td>
                                    <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${name} (${gender}, ${age} yrs)</td>
                                  </tr>`;
                              }).join("")}
                              <tr>
                                <td style="color:#0d3d35;font-size:14px;font-weight:700;background-color:#f0fdf4;border-right:1px solid #e2e8f0;">Total Amount</td>
                                <td style="color:#0d3d35;font-size:18px;font-weight:800;background-color:#f0fdf4;">₹${total_amount}</td>
                              </tr>
                            </table>
                            
                            <p style="color:#64748b;font-size:14px;margin-top:25px;text-align:center;">You will receive another email once your booking is confirmed.</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#0f172a;padding:20px;text-align:center;">
                            <p style="color:#94a3b8;margin:0;font-size:13px;">© ${new Date().getFullYear()} Kore Travels. All rights reserved.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>`
            }).catch(e => console.error("Booking email error:", e.message));
        } catch (e) { console.error("Sync Booking email error:", e.message); }

        res.json({ message: "Booking Received! Awaiting Admin Confirmation.", booking_id, status: "pending" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// GET my bookings
app.get("/mybookings/:user_id", async (req, res) => {
    try {
        const sql = `SELECT b.*, buses.bus_name, buses.from_city, buses.to_city,
                     buses.depart AS departure_time, buses.arrive AS arrival_time,
                     buses.travel_date, buses.type AS bus_type
                     FROM bookings b JOIN buses ON b.bus_id = buses.id
                     WHERE b.user_id=? ORDER BY b.booking_date DESC`;
        const [bookings] = await db.query(sql, [req.params.user_id]);
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT cancel booking (user cancels their own) — same PUT pattern as internship
app.put("/cancelbooking/:id", async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT b.*, u.name AS uname, u.email AS uemail, buses.bus_name, buses.from_city, buses.to_city, buses.travel_date, buses.depart AS departure_time
            FROM bookings b JOIN users u ON b.user_id = u.id JOIN buses ON b.bus_id = buses.id
            WHERE b.id=?`, [req.params.id]);
            
        if (!data.length) return res.status(404).json({ message: "Booking Not Found" });
        const b = data[0];

        await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [req.params.id]);
        const seatCount = b.seat_numbers.split(",").length;
        await db.query("UPDATE buses SET seats_left = seats_left + ? WHERE id=?", [seatCount, b.bus_id]);
        await db.query("DELETE FROM booked_seats WHERE booking_id=?", [req.params.id]);

        // Send cancellation email
        try {
            transporter.sendMail({
                from: '"Kore Travels" <ranuh441@gmail.com>', to: b.uemail,
                subject: `🚫 Booking Cancelled #${b.id}`,
                html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg, #e53935 0%, #b71c1c 100%);padding:35px 30px;text-align:center;">
                            <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:60px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
                            <h2 style="color:#ffffff;margin:0;font-size:26px;">Booking Cancelled</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:35px 40px;">
                            <h3 style="color:#e53935;margin-top:0;font-size:20px;">Hello ${b.passenger_name},</h3>
                            <p style="color:#475569;font-size:16px;line-height:1.6;margin-bottom:25px;">Your bus booking has been successfully cancelled. The seats have been released.</p>
                            <table width="100%" cellpadding="12" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                              <tr><td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;" width="35%">Booking ID</td><td style="border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">#${b.id}</td></tr>
                              <tr><td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Route</td><td style="border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${b.from_city} → ${b.to_city}</td></tr>
                              <tr><td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Travel Date</td><td style="border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;">${b.travel_date} at ${b.departure_time}</td></tr>
                              <tr><td style="background-color:#f8fafc;color:#64748b;font-size:14px;">Refund Amount</td><td style="color:#e53935;font-weight:700;font-size:16px;">₹${b.total_amount}</td></tr>
                            </table>
                            <p style="color:#64748b;font-size:14px;margin-top:25px;">Refunds (if applicable) will be processed within 5-7 business days to your original payment method.</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>`
            }).catch(e => console.error("Cancel email error:", e.message));
        } catch (e) { console.error("Sync Cancel email error:", e.message); }

        res.json({ message: "Booking Cancelled Successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// ════════════════════════════════════════════════════════════
//  ADMIN ROUTES — Dashboard + Booking Control + Seat Control
// ════════════════════════════════════════════════════════════

// GET /admin/stats — dashboard numbers
app.get("/admin/stats", async (req, res) => {
    try {
        const [[{ total_buses }]]    = await db.query("SELECT COUNT(*) AS total_buses FROM buses");
        const [[{ total_users }]]    = await db.query("SELECT COUNT(*) AS total_users FROM users WHERE role='user'");
        const [[{ total_bookings }]] = await db.query("SELECT COUNT(*) AS total_bookings FROM bookings");
        const [[{ pending }]]        = await db.query("SELECT COUNT(*) AS pending FROM bookings WHERE status='pending'");
        const [[{ confirmed }]]      = await db.query("SELECT COUNT(*) AS confirmed FROM bookings WHERE status='confirmed'");
        const [[{ cancelled }]]      = await db.query("SELECT COUNT(*) AS cancelled FROM bookings WHERE status='cancelled'");
        const [[{ revenue }]]        = await db.query("SELECT COALESCE(SUM(total_amount),0) AS revenue FROM bookings WHERE status='confirmed'");
        const [[{ blocked }]]        = await db.query("SELECT COUNT(*) AS blocked FROM blocked_seats");
        res.json({ total_buses, total_users, total_bookings, pending, confirmed, cancelled, revenue, blocked });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /admin/allbookings — all bookings with user + bus info
app.get("/admin/allbookings", async (req, res) => {
    try {
        const sql = `SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
                     buses.bus_name, buses.from_city, buses.to_city,
                     buses.depart AS departure_time, buses.arrive AS arrival_time,
                     buses.travel_date, buses.type AS bus_type
                     FROM bookings b
                     JOIN users  u    ON b.user_id = u.id
                     JOIN buses       ON b.bus_id  = buses.id
                     ORDER BY b.booking_date DESC`;
        const [bookings] = await db.query(sql);
        res.json(bookings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /admin/confirmbooking/:id — admin confirms a pending booking + sends email
app.put("/admin/confirmbooking/:id", async (req, res) => {
    try {
        const [data] = await db.query(
            `SELECT b.*, u.name AS uname, u.email AS uemail, buses.bus_name, buses.from_city,
             buses.to_city, buses.travel_date, buses.depart AS departure_time, buses.photos
             FROM bookings b JOIN users u ON b.user_id=u.id JOIN buses ON b.bus_id=buses.id
             WHERE b.id=?`, [req.params.id]
        );
        if (!data.length) return res.status(404).json({ message: "Booking Not Found" });
        const b = data[0];

        await db.query("UPDATE bookings SET status='confirmed' WHERE id=?", [req.params.id]);

        let imagesHtml = "";
        try {
            const photosArray = JSON.parse(b.photos || "[]");
            if (photosArray.length > 0) {
                const limitedPhotos = photosArray
                    .filter(p => p && typeof p === 'string' && p.startsWith('https://res.cloudinary.com/'))
                    .map(p => p.includes('/upload/') ? p.replace('/upload/', '/upload/c_scale,w_300,q_auto,f_auto/') : p)
                    .slice(0, 3);
                
                if (limitedPhotos.length > 0) {
                imagesHtml = `
                <div style="margin-top:25px;text-align:center;">
                    <p style="color:#64748b;font-size:14px;font-weight:700;text-transform:uppercase;margin-bottom:15px;letter-spacing:1px;">Your Bus Interior</p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            ${limitedPhotos.map(p => `
                            <td align="center" style="padding:0 5px;">
                                <img src="${p}" alt="Bus Image" width="160" height="100" style="width:160px;height:100px;object-fit:cover;border-radius:8px;display:block;border:1px solid #e2e8f0;" />
                            </td>`).join("")}
                        </tr>
                    </table>
                </div>`;
                }
            }
        } catch(e) {}

        // Send confirmation email to customer
        try {
            transporter.sendMail({
                from: '"Kore Travels" <ranuh441@gmail.com>', to: b.uemail,
                subject: `✅ Booking Confirmed #${b.id} - Get Ready to Travel!`,
                html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%);padding:35px 30px;text-align:center;">
                            <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:60px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
                            <h2 style="color:#ffffff;margin:0;font-size:26px;">Booking Confirmed!</h2>
                            <div style="display:inline-block;background-color:#c8ff00;color:#0d3d35;padding:6px 18px;border-radius:20px;font-size:14px;font-weight:800;margin-top:12px;letter-spacing:1px;text-transform:uppercase;">✅ Confirmed</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:35px 40px;">
                            <h3 style="color:#0d3d35;margin-top:0;font-size:20px;">Hello ${b.passenger_name.split(',')[0].trim()}! 🎉</h3>
                            <p style="color:#475569;font-size:16px;line-height:1.6;margin-bottom:25px;">Great news! Your bus booking has been confirmed. Pack your bags and get ready for a comfortable journey with Kore Travels.</p>
                            
                            <table width="100%" cellpadding="12" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                              <tr><td style="background-color:#1a7a6e;color:#ffffff;font-size:13px;font-weight:700;text-transform:uppercase;" colspan="2">Your Ticket Details</td></tr>
                              <tr>
                                <td width="35%" style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Booking ID</td>
                                <td style="color:#0f172a;font-size:16px;font-weight:800;border-bottom:1px solid #e2e8f0;">#${b.id}</td>
                              </tr>
                              <tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Route</td>
                                <td style="color:#0f172a;font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;">${b.from_city} → ${b.to_city}</td>
                              </tr>
                              ${b.boarding_point ? `<tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">🟢 Boarding Point</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #e2e8f0;">${b.boarding_point}</td>
                              </tr>` : ''}
                              ${b.drop_point ? `<tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">🔴 Drop Point</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #e2e8f0;">${b.drop_point}</td>
                              </tr>` : ''}
                              <tr>
                                <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Bus & Date</td>
                                <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${b.bus_name}<br/>${b.travel_date} at ${b.departure_time}</td>
                              </tr>
                              ${b.seat_numbers.split(",").map((seat, i) => {
                                  const name = b.passenger_name.split(",")[i]?.trim() || "N/A";
                                  const age = (b.passenger_age||"").split(",")[i]?.trim() || "N/A";
                                  const gender = (b.passenger_gender||"").split(",")[i]?.trim() || "N/A";
                                  return `<tr>
                                    <td style="color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">Seat ${seat.trim()}</td>
                                    <td style="color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${name} (${gender}, ${age} yrs)</td>
                                  </tr>`;
                              }).join("")}
                              <tr>
                                <td style="color:#0d3d35;font-size:14px;font-weight:700;background-color:#f8fafc;border-right:1px solid #e2e8f0;">Amount Paid</td>
                                <td style="color:#0d3d35;font-size:18px;font-weight:800;background-color:#f8fafc;">₹${b.total_amount}</td>
                              </tr>
                            </table>

                            ${imagesHtml}
                            
                            <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:15px 20px;margin-top:25px;border-radius:0 8px 8px 0;">
                              <p style="color:#166534;margin:0;font-size:14px;font-weight:600;">Please arrive at the boarding point at least 15 minutes before the departure time.</p>
                            </div>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:30px;">
                              <tr>
                                <td align="center">
                                  <a href="${process.env.FRONTEND_URL || 'https://koretravels-final.pages.dev'}/mybookings" style="display:inline-block;padding:14px 36px;background-color:#1a7a6e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(26,122,110,0.3);">View Booking online</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#0f172a;padding:20px;text-align:center;">
                            <p style="color:#94a3b8;margin:0;font-size:13px;">© ${new Date().getFullYear()} Kore Travels | Have a safe journey! 🚌</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>`
            }).catch(e => console.error("Confirm email error:", e.message));
        } catch (e) { console.error("Sync Confirm email error:", e.message); }

        res.json({ message: "Booking Confirmed & Email Sent!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /admin/denybooking/:id — admin denies booking + unlocks seats + sends email
app.put("/admin/denybooking/:id", async (req, res) => {
    try {
        const { reason } = req.body;
        const [data] = await db.query(
            `SELECT b.*, u.name AS uname, u.email AS uemail, buses.bus_name
             FROM bookings b JOIN users u ON b.user_id=u.id JOIN buses ON b.bus_id=buses.id
             WHERE b.id=?`, [req.params.id]
        );
        if (!data.length) return res.status(404).json({ message: "Booking Not Found" });
        const b = data[0];

        // Cancel booking
        await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [req.params.id]);

        // Unlock seats — restore available_seats + remove from booked_seats
        const seatCount = b.seat_numbers.split(",").length;
        await db.query("UPDATE buses SET seats_left = seats_left + ? WHERE id=?", [seatCount, b.bus_id]);
        await db.query("DELETE FROM booked_seats WHERE booking_id=?", [req.params.id]);

        // Send denial email to customer
        try {
            transporter.sendMail({
                from: '"Kore Travels" <ranuh441@gmail.com>', to: b.uemail,
                subject: `Booking Request Declined #${b.id}`,
                html: `<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f7f6;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7f6;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background:linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%);padding:35px 30px;text-align:center;">
                            <img src="https://res.cloudinary.com/xg8ljc6l/image/upload/v1786572822/busbooking/kore_travels_email_logo.png" alt="Kore Travels Logo" style="background-color:#ffffff; padding:10px; border-radius:10px; height:60px;margin-bottom:15px;display:block;margin-left:auto;margin-right:auto;" />
                            <h2 style="color:#ffffff;margin:0;font-size:24px;">Booking Declined</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:35px 40px;">
                            <h3 style="color:#7f1d1d;margin-top:0;font-size:20px;">Hello ${b.passenger_name.split(',')[0].trim()},</h3>
                            <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:20px;">We regret to inform you that your booking request <strong>#${b.id}</strong> could not be confirmed at this time.</p>
                            
                            ${reason ? `
                            <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:15px 20px;margin-bottom:25px;border-radius:0 8px 8px 0;">
                              <p style="color:#991b1b;margin:0;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
                            </div>` : ""}
                            
                            <p style="color:#64748b;font-size:14px;margin-bottom:30px;">Your temporarily reserved seats have been released. Any payments made will be refunded to your original payment method according to our refund policy. We sincerely apologize for any inconvenience caused.</p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td align="center">
                                  <a href="http://localhost:5173/" style="display:inline-block;padding:12px 32px;background-color:#0d3d35;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(13,61,53,0.3);">Search Alternative Buses</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#0f172a;padding:20px;text-align:center;">
                            <p style="color:#94a3b8;margin:0;font-size:13px;">© ${new Date().getFullYear()} Kore Travels</p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>`
                }).catch(e => console.error("Deny email error:", e.message));
            } catch (e) { console.error("Sync Deny email error:", e.message); }

        res.json({ message: "Booking Denied, Seats Unlocked & Email Sent!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /admin/blockedseats/:bus_id — admin view of blocked seats
app.get("/admin/blockedseats/:bus_id", async (req, res) => {
    try {
        const [seats] = await db.query("SELECT * FROM blocked_seats WHERE bus_id=? ORDER BY seat_number", [req.params.bus_id]);
        res.json(seats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /admin/blockseat — admin manually blocks a seat
app.post("/admin/blockseat", async (req, res) => {
    try {
        const { bus_id, seat_number, reason } = req.body;
        // Check if already blocked
        const [existing] = await db.query("SELECT id FROM blocked_seats WHERE bus_id=? AND seat_number=?", [bus_id, seat_number]);
        if (existing.length > 0) return res.json({ message: "Seat Already Blocked", flag: 0 });
        await db.query("INSERT INTO blocked_seats(bus_id,seat_number,reason) VALUES(?,?,?)", [bus_id, seat_number, reason || "Admin blocked"]);
        // Reduce seats_left
        await db.query("UPDATE buses SET seats_left = seats_left - 1 WHERE id=?", [bus_id]);
        res.json({ message: `Seat ${seat_number} Blocked Successfully`, flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /admin/unblockseat — admin unblocks a seat
app.delete("/admin/unblockseat", async (req, res) => {
    try {
        const { bus_id, seat_number } = req.body;
        const [result] = await db.query("DELETE FROM blocked_seats WHERE bus_id=? AND seat_number=?", [bus_id, seat_number]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Seat Not Found in Blocked List" });
        // Restore seats_left
        await db.query("UPDATE buses SET seats_left = seats_left + 1 WHERE id=?", [bus_id]);
        res.json({ message: `Seat ${seat_number} Unblocked Successfully` });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// GET /admin/allusers — all registered users
app.get("/admin/allusers", async (req, res) => {
    try {
        const [users] = await db.query("SELECT id,name,email,phone,created_date,role FROM users ORDER BY id DESC");
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /admin/users/:id — delete a user (and their bookings)
app.delete("/admin/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't allow deleting the default admin
        if (userId === "1") return res.status(400).json({ message: "Cannot delete the main admin account" });

        // Get user's bookings
        const [bookings] = await db.query("SELECT id, bus_id, seat_numbers, status FROM bookings WHERE user_id=?", [userId]);
        
        // Clean up bookings and release seats
        for (const b of bookings) {
            if (b.status !== 'cancelled') {
                const seatCount = b.seat_numbers.split(",").length;
                await db.query("UPDATE buses SET seats_left = seats_left + ? WHERE id=?", [seatCount, b.bus_id]);
                await db.query("DELETE FROM booked_seats WHERE booking_id=?", [b.id]);
            }
            await db.query("DELETE FROM bookings WHERE id=?", [b.id]);
        }
        
        // Finally, delete the user
        const [result] = await db.query("DELETE FROM users WHERE id=?", [userId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        
        res.json({ message: "User deleted successfully", flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  BANNERS — Homepage Slideshow
// ════════════════════════════════════════════════════════════

// Auto-create banners table if it doesn't exist
db.query(`CREATE TABLE IF NOT EXISTS banners (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) DEFAULT '',
    image_filename  VARCHAR(255) NOT NULL,
    sort_order      INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
)`).catch(e => console.error("Banners table error:", e.message));

// GET /banners — all active banners (public)
app.get("/banners", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM banners ORDER BY sort_order ASC, created_at ASC");
        res.json(rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /admin/banners — upload a new banner image
app.post("/admin/banners", upload.single("banner_image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image uploaded" });
        
        // Cloudinary gives us req.file.path as the secure URL
        // req.file.filename is the public_id
        const imageUrl = req.file.path;   // e.g. https://res.cloudinary.com/...
        
        if (!imageUrl || !imageUrl.startsWith('http')) {
            return res.status(500).json({ message: "Cloudinary upload failed — image URL not returned. Check Cloudinary credentials in .env" });
        }
        
        const { title } = req.body;
        await db.query(
            "INSERT INTO banners (title, image_filename) VALUES (?, ?)",
            [title || "", imageUrl]
        );
        res.json({ message: "Banner uploaded successfully", flag: 1, url: imageUrl });
    } catch (err) { 
        console.error("Banner upload error:", err.message);
        res.status(500).json({ message: "Upload error: " + err.message }); 
    }
});

// PUT /admin/banners/:id — update banner title
app.put("/admin/banners/:id", async (req, res) => {
    try {
        const { title } = req.body;
        await db.query("UPDATE banners SET title=? WHERE id=?", [title || "", req.params.id]);
        res.json({ message: "Banner updated successfully", flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /admin/banners/:id — delete a banner
app.delete("/admin/banners/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT image_filename FROM banners WHERE id=?", [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: "Banner not found" });
        
        const imageUrl = rows[0].image_filename;
        if (imageUrl && imageUrl.startsWith('http')) {
            try {
                const urlParts = imageUrl.split('/');
                const filenameWithExt = urlParts[urlParts.length - 1];
                const folderName = urlParts[urlParts.length - 2];
                const publicId = `${folderName}/${filenameWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch(e) { console.error("Cloudinary delete error:", e.message); }
        } else if (imageUrl) {
            // Old fallback just in case
            const filePath = require("path").join(__dirname, "uploads", imageUrl);
            const fs = require("fs");
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        await db.query("DELETE FROM banners WHERE id=?", [req.params.id]);
        res.json({ message: "Banner deleted", flag: 1 });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /user-stats/:user_id — get booking stats for a user (used for first-time discount)
app.get("/user-stats/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const [rows] = await db.query("SELECT COUNT(*) as bookingCount FROM bookings WHERE user_id=?", [user_id]);
        res.json({ bookingCount: rows[0].bookingCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ════════════════════════════════════════════════════════════
//  SETTINGS (admin-managed key-value store)
// ════════════════════════════════════════════════════════════

// Ensure settings table exists
(async () => {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS settings (
            \`key\` VARCHAR(100) PRIMARY KEY,
            \`value\` TEXT
        )`);
    } catch(e) { console.error("Settings table error:", e.message); }
})();

// GET /admin/settings
app.get("/admin/settings", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT `key`, `value` FROM settings");
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value; });
        res.json(settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /admin/settings — upsert key-value
app.put("/admin/settings", async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ message: "key required" });
        await db.query("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value`=?", [key, value, value]);
        res.json({ message: "Setting saved" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  KOREBOT — Chat API
// ════════════════════════════════════════════════════════════

// POST /chat/search — search buses for chatbot
//  KOREBOT - Chat Config
app.get("/chat/config", async (req, res) => {
    try {
        const [[modelRow]] = await db.query("SELECT `value` FROM settings WHERE `key`='openrouter_model'").catch(() => [[null]]);
        const aiModel = modelRow?.value || "meta-llama/llama-3.1-8b-instruct:free";
        res.json({ model: aiModel });
    } catch(err) {
        res.status(500).json({ model: "meta-llama/llama-3.1-8b-instruct:free" });
    }
});

app.post("/chat/search", async (req, res) => {
    try {
        const { from_city, to_city, travel_date } = req.body;
        if (!from_city || !to_city || !travel_date)
            return res.status(400).json({ message: "from_city, to_city and travel_date required" });

        const sql = `SELECT id, bus_name, bus_number, from_city, to_city, depart AS departure_time,
                     arrive AS arrival_time, duration, travel_date, price,
                     seats_left AS available_seats, type AS bus_type, amenities, rating
                     FROM buses
                     WHERE (from_city LIKE ? OR pickup_points LIKE ?)
                     AND (to_city LIKE ? OR drop_points LIKE ?)
                     AND travel_date = ? AND seats_left > 0 AND status = 'active'
                     ORDER BY depart ASC`;
        const sf = `%${from_city}%`, st = `%${to_city}%`;
        const [buses] = await db.query(sql, [sf, sf, st, st, travel_date]);
        res.json({ buses });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /chat/ai — proxy to OpenRouter
const https = require("https");
app.post("/chat/ai", async (req, res) => {
    try {
        const { messages } = req.body;

        // Get the API key and model from settings table
        const [[settingRow]] = await db.query("SELECT `value` FROM settings WHERE `key`='openrouter_api_key'").catch(() => [[null]]);
        const apiKey = settingRow?.value;
        if (!apiKey) return res.status(503).json({ message: "AI mode not configured. Admin has not set the OpenRouter API key yet." });

        const [[modelRow]] = await db.query("SELECT `value` FROM settings WHERE `key`='openrouter_model'").catch(() => [[null]]);
        const aiModel = modelRow?.value || "meta-llama/llama-3.1-8b-instruct:free";

        const body = JSON.stringify({
            model: aiModel,
            messages: [
                {
                    role: "system",
                    content: `You are KoreBot, a helpful AI travel assistant for Kore Travels - India's trusted bus booking platform in Maharashtra. You ONLY answer questions about: travel, tourism, bus journeys, transportation, journey planning, travel safety, packing tips, Indian destinations, seat types, cancellation, luggage, boarding points, or Kore Travels services. STRICT RULES: (1) If someone asks about unrelated topics like politics, PM of India, coding, science, sports, celebrities, or general knowledge - politely say: I am KoreBot, specialized only in travel and bus booking assistance. I cannot help with that topic, but I would love to assist with your journey plans! (2) Never write code, essays, or answer factual non-travel questions. (3) For specific bus availability or booking questions, tell them to use the Search Mode in this chat or visit the home page. (4) Be friendly, warm and concise. Always reply in the same language as the user (Hindi, Marathi, or English). (5) If you cannot fully answer a travel question, suggest contacting Kore Travels: WhatsApp 8669427006 or Call 8554886526.`
                },
                ...messages
            ],
            max_tokens: 512
        });

        const options = {
            hostname: "openrouter.ai",
            path: "/api/v1/chat/completions",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://koretravels-final.pages.dev",
                "X-Title": "Kore Travels KoreBot"
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = "";
            proxyRes.on("data", chunk => data += chunk);
            proxyRes.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    if (json.error) return res.status(500).json({ message: json.error.message || "AI error" });
                    const reply = json.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
                    res.json({ reply });
                } catch(e) { res.status(500).json({ message: "Failed to parse AI response" }); }
            });
        });
        proxyReq.on("error", e => res.status(500).json({ message: e.message }));
        proxyReq.write(body);
        proxyReq.end();

    } catch (err) { res.status(500).json({ message: err.message }); }
});

