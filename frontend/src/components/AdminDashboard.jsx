import API_URL from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

// SVG icon helpers
const IcBus     = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcUsers   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcTicket  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>;
const IcClock   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcCheck   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcX       = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcMoney   = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcLock    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcHistory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>;
const IcChart   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

function AdminDashboard() {
    const [stats, setStats]     = useState({});
    const [recent, setRecent]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            const [statsRes, bookRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`),
                axios.get(`${API_URL}/admin/allbookings`)
            ]);
            setStats(statsRes.data);
            setRecent(bookRes.data.slice(0, 8));
        } catch (err) {
            console.error("Dashboard error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (s) =>
        s === "confirmed" ? "#1a7a6e" : s === "pending" ? "#ff8c00" : "#e53935";
    const statusBg = (s) =>
        s === "confirmed" ? "#e8f5f2" : s === "pending" ? "#fff3e0" : "#ffebee";

    const statusIcon = (s) => {
        if (s === "confirmed") return <IcCheck />;
        if (s === "pending")   return <IcClock />;
        return <IcX />;
    };

    if (loading) return (
        <AdminLayout>
            <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, color: "#1a7a6e" }}><IcChart /></div>
                <p style={{ color: "#1a7a6e", fontSize: "18px" }}>Loading dashboard...</p>
            </div>
        </AdminLayout>
    );

    const cards = [
        { label: "Total Buses",    value: stats.total_buses,    Icon: IcBus,   color: "#1a7a6e", bg: "#e8f5f2" },
        { label: "Total Users",    value: stats.total_users,    Icon: IcUsers,  color: "#6a1b9a", bg: "#f3e5f5" },
        { label: "Total Bookings", value: stats.total_bookings, Icon: IcTicket, color: "#0277bd", bg: "#e1f5fe" },
        { label: "Pending",        value: stats.pending,        Icon: IcClock,  color: "#ff8c00", bg: "#fff3e0" },
        { label: "Confirmed",      value: stats.confirmed,      Icon: IcCheck,  color: "#2e7d32", bg: "#e8f5e9" },
        { label: "Cancelled",      value: stats.cancelled,      Icon: IcX,      color: "#c62828", bg: "#ffebee" },
        { label: "Revenue (₹)",    value: `₹${Number(stats.revenue||0).toLocaleString("en-IN")}`, Icon: IcMoney, color: "#00796b", bg: "#e0f2f1" },
        { label: "Blocked Seats",  value: stats.blocked,        Icon: IcLock,   color: "#5d4037", bg: "#efebe9" },
    ];

    return (
        <AdminLayout>
            <h2 style={{ color: "#0d3d35", marginBottom: "22px", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
                <IcChart /> Dashboard Overview
            </h2>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                {cards.map((c, i) => (
                    <div key={i} style={{
                        background: "#fff", borderRadius: "12px",
                        padding: "20px 18px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
                        borderTop: `4px solid ${c.color}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <div>
                            <div style={{ fontSize: "13px", color: "#888", marginBottom: "6px" }}>{c.label}</div>
                            <div style={{ fontSize: "26px", fontWeight: "700", color: c.color }}>{c.value}</div>
                        </div>
                        <div style={{
                            width: "50px", height: "50px", borderRadius: "12px",
                            background: c.bg, display: "flex", alignItems: "center",
                            justifyContent: "center", color: c.color
                        }}>
                            <c.Icon />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Bookings Table */}
            <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                <div style={{
                    background: "linear-gradient(135deg,#1a7a6e,#0d3d35)",
                    padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <h3 style={{ color: "#c8ff00", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: 8 }}>
                        <IcHistory /> Recent Bookings
                    </h3>
                    <a href="/admin/bookings" style={{ color: "#fff", fontSize: "13px", textDecoration: "none" }}>View All →</a>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table className="kt-table flat-head">
                        <thead>
                            <tr>
                                <th>#ID</th><th>Customer</th><th>Route</th>
                                <th>Date</th><th>Seats</th><th>Amount</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.map(b => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: "700", color: "#1a7a6e" }}>#{b.id}</td>
                                    <td>
                                        <div style={{ fontWeight: "600" }}>{b.passenger_name}</div>
                                        <div style={{ fontSize: "12px", color: "#888" }}>{b.user_email}</div>
                                    </td>
                                    <td>{b.from_city} → {b.to_city}</td>
                                    <td>{b.travel_date}</td>
                                    <td style={{ fontWeight: "600" }}>{b.seat_numbers}</td>
                                    <td style={{ fontWeight: "700", color: "#1a7a6e" }}>₹{b.total_amount}</td>
                                    <td>
                                        <span style={{
                                            background: statusBg(b.status), color: statusColor(b.status),
                                            padding: "3px 10px", borderRadius: "12px",
                                            fontSize: "12px", fontWeight: "700",
                                            display: "inline-flex", alignItems: "center", gap: 4
                                        }}>
                                            <span style={{ display: "flex", alignItems: "center" }}>{statusIcon(b.status)}</span>
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;
