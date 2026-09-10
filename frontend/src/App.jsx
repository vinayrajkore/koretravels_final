// App.jsx - Main Router Setup
// Same BrowserRouter + Routes + Route pattern as front_react_1/src/App.jsx internship
// Admin routes added with AdminProtectRoute wrapper

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// ── User Components ─────────────────────────────────────────
import Navbar            from "./components/Navbar";
import Protectroute      from "./components/Protectroute";
import AdminProtectRoute from "./components/AdminProtectRoute";
import Register          from "./components/Register";
import Login             from "./components/Login";
import Home              from "./components/Home";
import BusList           from "./components/BusList";
import SeatMap           from "./components/SeatMap";
import BookingForm       from "./components/BookingForm";
import MyBookings        from "./components/MyBookings";

// ── Admin Components ────────────────────────────────────────
import AdminDashboard    from "./components/AdminDashboard";
import AdminBookings     from "./components/AdminBookings";
import AdminBuses        from "./components/AdminBuses";
import AddBus            from "./components/AddBus";
import EditBus           from "./components/EditBus";
import AdminSeatManager  from "./components/AdminSeatManager";
import AdminUsers        from "./components/AdminUsers";
import AdminBanners      from "./components/AdminBanners";
import AdminLogin        from "./components/AdminLogin";
import About             from "./components/About";
import KoreBot           from "./components/KoreBot";
import AdminSettings     from "./components/AdminSettings";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

// Layout wrapper - shows/hides Navbar based on route
function Layout() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <>
            {/* Navbar only on user-facing pages (not admin panel or admin login) */}
            {!isAdminPage && <Navbar />}
            <ScrollToTop />

            <Routes>
                {/* ── PUBLIC ───────────────────────────── */}
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* ── GUEST-BROWSABLE (no login needed) ── */}
                <Route path="/" element={<Home />} />
                <Route path="/buses" element={<BusList />} />
                <Route path="/seats/:busId" element={<SeatMap />} />
                <Route path="/about" element={<About />} />

                {/* ── USER PROTECTED (booking + my bookings) ── */}
                <Route path="/book/:busId" element={
                    <Protectroute><BookingForm /></Protectroute>
                } />
                <Route path="/mybookings" element={
                    <Protectroute><MyBookings /></Protectroute>
                } />

                {/* ── ADMIN PROTECTED ──────────────────── */}
                <Route path="/admin" element={
                    <AdminProtectRoute><AdminDashboard /></AdminProtectRoute>
                } />
                <Route path="/admin/bookings" element={
                    <AdminProtectRoute><AdminBookings /></AdminProtectRoute>
                } />
                <Route path="/admin/buses" element={
                    <AdminProtectRoute><AdminBuses /></AdminProtectRoute>
                } />
                <Route path="/admin/addbus" element={
                    <AdminProtectRoute><AddBus /></AdminProtectRoute>
                } />
                <Route path="/admin/editbus/:id" element={
                    <AdminProtectRoute><EditBus /></AdminProtectRoute>
                } />
                <Route path="/admin/seats" element={
                    <AdminProtectRoute><AdminSeatManager /></AdminProtectRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminProtectRoute><AdminUsers /></AdminProtectRoute>
                } />
                <Route path="/admin/banners" element={
                    <AdminProtectRoute><AdminBanners /></AdminProtectRoute>
                } />
                <Route path="/admin/settings" element={
                    <AdminProtectRoute><AdminSettings /></AdminProtectRoute>
                } />
            </Routes>

            {/* Premium Footer */}
            {!isAdminPage && (
                <footer style={{
                    background: "linear-gradient(150deg, #031a17 0%, #062f29 60%, #094035 100%)",
                    borderTop: "1px solid rgba(200,255,0,0.12)",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Shimmer bar on top */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                        background: "linear-gradient(90deg, transparent, #c8ff00, transparent)",
                        opacity: 0.5,
                    }} />

                    {/* Main footer content */}
                    <div className="footer-grid">
                        {/* Brand column */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                <img src="/logo.png" alt="Logo" style={{
                                    height: 44,
                                    filter: "drop-shadow(0 0 10px rgba(200,255,0,0.5))",
                                }} />
                                <div>
                                    <div style={{ color: "#c8ff00", fontWeight: 800, fontSize: 17 }}>Kore Travels</div>
                                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.5px" }}>BOOKING PLATFORM</div>
                                </div>
                            </div>
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
                                India's trusted bus booking platform. Safe, comfortable and affordable journeys across Maharashtra and beyond.
                            </p>
                            <div style={{ display: "flex", gap: 10 }}>
                                <a href="tel:8554886526" style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.3)", color: "#93c5fd", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    Call
                                </a>
                                <a href="https://wa.me/918669427006" target="_blank" rel="noreferrer" style={{ background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.3)", color: "#86efac", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 5 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 18, letterSpacing: "0.5px" }}>QUICK LINKS</div>
                            {[
                                { label: "Home", href: "/" },
                                { label: "Search Buses", href: "/" },
                                { label: "About Us", href: "/about" },
                                { label: "My Bookings", href: "/mybookings" },
                                { label: "Register", href: "/register" },
                                { label: "Login", href: "/login" },
                            ].map(({ label, href }) => (
                                <a key={label} href={href} style={{
                                    display: "block", color: "rgba(255,255,255,0.45)", fontSize: 13,
                                    textDecoration: "none", marginBottom: 10,
                                    transition: "color 0.2s",
                                }}
                                    onMouseOver={e => e.currentTarget.style.color = "#c8ff00"}
                                    onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                                >→ {label}</a>
                            ))}
                        </div>

                        {/* Contact info */}
                        <div>
                            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 18, letterSpacing: "0.5px" }}>CONTACT</div>
                            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.9 }}>
                                <div><span style={{ color: "rgba(200,255,0,0.6)" }}>Owner:</span><br />Vinayraj Kore</div>
                                <div style={{ marginTop: 10 }}><span style={{ color: "rgba(200,255,0,0.6)" }}>Mobile:</span><br />8554886526</div>
                                <div style={{ marginTop: 10 }}><span style={{ color: "rgba(200,255,0,0.6)" }}>WhatsApp:</span><br />8669427006</div>
                                <div style={{ marginTop: 10 }}><span style={{ color: "rgba(200,255,0,0.6)" }}>Office:</span><br />02324299042</div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        padding: "16px 24px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.25)",
                        fontSize: 12,
                    }}>
                        © 2026 Kore Travels Booking. All rights reserved.
                    </div>
                </footer>
            )}

            {/* Floating Call Button + KoreBot */}
            {!isAdminPage && (
                <>
                    {/* KoreBot floating chatbot */}
                    <KoreBot />

                    {/* Call button — above KoreBot */}
                    <a
                        href="tel:8554886526"
                        title="Call Us Now"
                        style={{
                            position: "fixed",
                            bottom: "90px",
                            right: "24px",
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #16a34a, #15803d)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 24px rgba(22, 163, 74, 0.4)",
                            zIndex: 9999,
                            cursor: "pointer",
                            transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                </>
            )}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}

export default App;
