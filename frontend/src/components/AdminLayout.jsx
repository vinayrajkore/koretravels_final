// AdminLayout.jsx - Sidebar layout for all admin pages
// CSS sidebar navigation like navdemo.html from internship

import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminLayout({ children }) {
    const navigate  = useNavigate();
    const location  = useLocation();

    const adminName = localStorage.getItem("u_name") || "Admin";

    const logout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
    };

    // Nav links
    const links = [
        { path: "/admin",           label: "Dashboard",    svgPath: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
        { path: "/admin/bookings",  label: "Bookings",     svgPath: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" },
        { path: "/admin/buses",     label: "Manage Buses", svgPath: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
        { path: "/admin/addbus",    label: "Add Bus",      svgPath: "M12 5v14 M5 12h14" },
        { path: "/admin/seats",     label: "Seat Manager", svgPath: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" },
        { path: "/admin/users",     label: "Users",        svgPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
        { path: "/admin/banners",   label: "Banners",      svgPath: "M3 3h18v18H3z M3 9h18 M9 21V9" },
    ];


    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>

            {/* ── Sidebar ─────────────────────────────────── */}
            <div style={{
                width: "240px", minHeight: "100vh",
                background: "linear-gradient(180deg, #0d3d35 0%, #1a7a6e 100%)",
                display: "flex", flexDirection: "column",
                position: "fixed", top: 0, left: 0, zIndex: 100,
                boxShadow: "4px 0 20px rgba(0,0,0,0.2)"
            }}>
                {/* Logo */}
                <div style={{ padding: "20px 16px 15px", borderBottom: "1px solid rgba(200,255,0,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <img src="/logo.png" alt="logo" style={{ height: "38px" }} />
                        <span style={{ color: "#c8ff00", fontWeight: "700", fontSize: "14px", lineHeight: "1.2" }}>
                            Kore Travels<br />
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: "400" }}>Admin Panel</span>
                        </span>
                    </div>
                    <div style={{ background: "rgba(200,255,0,0.12)", borderRadius: "6px", padding: "7px 10px", marginTop: "8px" }}>
                        <div style={{ color: "#c8ff00", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            {adminName}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>Administrator</div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav style={{ flex: 1, padding: "12px 10px" }}>
                    {links.map(link => (
                        <Link key={link.path} to={link.path} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 14px", borderRadius: "8px", marginBottom: "4px",
                            textDecoration: "none", fontSize: "14px", fontWeight: "500",
                            transition: "background 0.15s",
                            background: location.pathname === link.path
                                ? "rgba(200,255,0,0.18)" : "transparent",
                            color: location.pathname === link.path ? "#c8ff00" : "rgba(255,255,255,0.8)",
                            borderLeft: location.pathname === link.path
                                ? "3px solid #c8ff00" : "3px solid transparent"
                        }}>
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={link.svgPath} />
                                </svg>
                            </span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Back to site + Logout */}
                <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(200,255,0,0.2)" }}>
                        <Link to="/" style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "9px 14px", borderRadius: "7px",
                            textDecoration: "none", color: "rgba(255,255,255,0.7)",
                            fontSize: "13px", marginBottom: "6px",
                            background: "rgba(255,255,255,0.06)"
                        }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            View Website
                        </Link>
                    <button onClick={logout} style={{
                        width: "100%", padding: "9px 14px", borderRadius: "7px",
                        border: "none", background: "#c8ff00", color: "#0d3d35",
                        fontWeight: "700", fontSize: "13px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────── */}
            <div style={{ marginLeft: "240px", flex: 1, background: "#f0f4f3", minHeight: "100vh" }}>

                {/* Top bar */}
                <div style={{
                    background: "#fff", padding: "14px 28px",
                    borderBottom: "2px solid #e0eeec",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    <h2 style={{ color: "#0d3d35", fontSize: "18px", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d3d35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Kore Travels — Admin Panel
                    </h2>
                    <span style={{
                        background: "#c8ff00", color: "#0d3d35", fontWeight: "700",
                        padding: "4px 14px", borderRadius: "20px", fontSize: "12px"
                    }}>
                        ADMIN MODE
                    </span>
                </div>

                {/* Page Content */}
                <div style={{ padding: "24px 28px" }}>
                    {children}
                </div>

            </div>
        </div>
    );
}

export default AdminLayout;
