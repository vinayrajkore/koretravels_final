// Navbar.jsx - Kore Travels navigation bar

import { Link, useNavigate } from "react-router-dom";

/* ── Inline SVG Icons ─────────────────────────────────────── */
const HomeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);
const BookingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
);
const UserIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const ShieldIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const LogoutIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
);

function Navbar() {
    const navigate = useNavigate();
    const uname   = localStorage.getItem("u_name");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    function logout() {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
    }

    return (
        <div className="kt-navbar">

            {/* Logo + Brand */}
            <Link to="/" className="logo-area">
                <img src="/logo.png" alt="Kore Travels Logo" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="site-name">Kore Travels</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 500, letterSpacing: "0.8px", marginTop: -1 }}>BOOKING PLATFORM</span>
                </div>
            </Link>

            {/* Navigation */}
            <nav>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <HomeIcon /> Home
                </Link>
                <Link to="/about" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    About Us
                </Link>
                <Link to="/mybookings" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <BookingIcon /> My Bookings
                </Link>

                {uname ? (
                    <>
                        {isAdmin && (
                            <Link to="/admin" style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                color: "#c8ff00", fontWeight: "700",
                                background: "rgba(200,255,0,0.1)", borderRadius: "20px",
                                border: "1px solid rgba(200,255,0,0.22)",
                            }}>
                                <ShieldIcon /> Admin
                            </Link>
                        )}
                        <span className="user-name" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <UserIcon /> {uname}
                        </span>
                        <button className="btn-logout" onClick={logout}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <LogoutIcon /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" style={{
                            background: "var(--accent)", color: "#062f29",
                            borderRadius: "20px", fontWeight: "800", padding: "8px 18px",
                        }}>
                            Register Free
                        </Link>
                        <Link to="/admin-login" style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            color: "rgba(255,255,255,0.4)", fontSize: "12px", padding: "6px 10px",
                        }}>
                            <ShieldIcon /> Admin
                        </Link>
                    </>
                )}
            </nav>

        </div>
    );
}

export default Navbar;
