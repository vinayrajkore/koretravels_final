import API_URL from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

// SVG Icons
const IcCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcX       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcClock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcList    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcPhone   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcTicket  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>;
const IcCancel  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;

function AdminBookings() {
    const [bookings, setBookings]   = useState([]);
    const [filtered, setFiltered]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState("all");
    const [denyModal, setDenyModal] = useState({ open: false, id: null });
    const [denyReason, setDenyReason] = useState("");

    useEffect(() => { loadBookings(); }, []);
    useEffect(() => {
        if (filter === "all") setFiltered(bookings);
        else setFiltered(bookings.filter(b => b.status === filter));
    }, [filter, bookings]);

    const loadBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/allbookings`);
            setBookings(res.data);
            setFiltered(res.data);
        } catch (err) { alert("Error: " + err.message); }
        finally { setLoading(false); }
    };

    const confirmBooking = async (id) => {
        if (!window.confirm("Confirm this booking? A confirmation email will be sent.")) return;
        try {
            const res = await axios.put(`${API_URL}/admin/confirmbooking/${id}`);
            alert(res.data.message);
            loadBookings();
        } catch (err) { alert("Error: " + err.message); }
    };

    const denyBooking = async () => {
        try {
            const res = await axios.put(`${API_URL}/admin/denybooking/${denyModal.id}`, { reason: denyReason });
            alert(res.data.message);
            setDenyModal({ open: false, id: null });
            setDenyReason("");
            loadBookings();
        } catch (err) { alert("Error: " + err.message); }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm("Cancel this booking? Seats will be released.")) return;
        try {
            const res = await axios.put(`${API_URL}/cancelbooking/${id}`);
            alert(res.data.message);
            loadBookings();
        } catch (err) { alert("Error: " + err.message); }
    };

    const statusColor = (s) => s === "confirmed" ? "#1a7a6e" : s === "pending" ? "#ff8c00" : "#e53935";
    const statusBg    = (s) => s === "confirmed" ? "#e8f5f2"  : s === "pending" ? "#fff3e0"  : "#ffebee";
    const statusIcon  = (s) => s === "confirmed" ? <IcCheck /> : s === "pending" ? <IcClock /> : <IcX />;

    const counts = {
        all:       bookings.length,
        pending:   bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length,
    };

    const filterTabs = [
        { key: "all",       label: "All",       color: "#1a7a6e", Icon: IcList   },
        { key: "pending",   label: "Pending",   color: "#ff8c00", Icon: IcClock  },
        { key: "confirmed", label: "Confirmed", color: "#2e7d32", Icon: IcCheck  },
        { key: "cancelled", label: "Cancelled", color: "#c62828", Icon: IcX      },
    ];

    return (
        <AdminLayout>

            {/* Deny Modal */}
            {denyModal.open && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
                }}>
                    <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", maxWidth: "440px", width: "100%", margin: "20px" }}>
                        <h3 style={{ color: "#e53935", marginBottom: "12px", display: "flex", alignItems: "center", gap: 8 }}>
                            <IcX /> Deny Booking #{denyModal.id}
                        </h3>
                        <p style={{ color: "#555", marginBottom: "16px", fontSize: "14px" }}>
                            This will cancel the booking, release the seats, and send a denial email to the customer.
                        </p>
                        <label style={{ fontWeight: "600", color: "#333", fontSize: "14px", display: "block", marginBottom: "6px" }}>
                            Reason (optional):
                        </label>
                        <input
                            style={{ width: "100%", padding: "10px", border: "2px solid #ddd", borderRadius: "7px",
                                     fontSize: "14px", marginBottom: "18px", background: "#fff", color: "#222" }}
                            placeholder="e.g. Bus full, technical issue..."
                            value={denyReason}
                            onChange={e => setDenyReason(e.target.value)}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={denyBooking}
                                style={{ flex: 1, padding: "11px", background: "#e53935", color: "#fff", border: "none", borderRadius: "7px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                                <IcX /> Deny &amp; Send Email
                            </button>
                            <button onClick={() => setDenyModal({ open: false, id: null })}
                                style={{ flex: 1, padding: "11px", background: "#eee", color: "#333", border: "none", borderRadius: "7px", fontWeight: "600", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <IcTicket /> Manage Bookings
                </h2>
                <button onClick={loadBookings}
                    style={{ padding: "8px 18px", background: "#1a7a6e", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
                    <IcRefresh /> Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                {filterTabs.map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: "8px 18px", borderRadius: "20px", border: "2px solid " + f.color,
                        background: filter === f.key ? f.color : "#fff",
                        color: filter === f.key ? "#fff" : f.color,
                        fontWeight: "700", fontSize: "13px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 5
                    }}>
                        <f.Icon /> {f.label} ({counts[f.key]})
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading bookings...</p>
            ) : (
                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="kt-table">
                            <thead>
                                <tr>
                                    <th>#ID</th><th>Customer</th><th>Bus / Route</th>
                                    <th>Travel Date</th><th>Seats</th><th>Amount</th>
                                    <th>Booked On</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>No bookings found</td></tr>
                                ) : filtered.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: "700", color: "#1a7a6e" }}>#{b.id}</td>
                                        <td>
                                            <div style={{ marginBottom: "6px" }}>
                                                {b.seat_numbers.split(",").map((seat, i) => {
                                                    const name = b.passenger_name.split(",")[i]?.trim() || "N/A";
                                                    const age = (b.passenger_age||"").split(",")[i]?.trim() || "N/A";
                                                    const gender = (b.passenger_gender||"").split(",")[i]?.trim() || "N/A";
                                                    return (
                                                        <div key={i} style={{ marginBottom: "4px", paddingBottom: "4px", borderBottom: i < b.seat_numbers.split(",").length - 1 ? "1px dashed #e2e8f0" : "none" }}>
                                                            <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>{name}</div>
                                                            <div style={{ fontSize: "11px", color: "#666" }}>
                                                                {gender} • Age: {age} • Seat: {seat.trim()}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#1a7a6e", fontWeight: "500", borderTop: "1px solid #e2e8f0", paddingTop: "6px" }}>{b.passenger_email || b.user_email}</div>
                                            <div style={{ fontSize: "11px", color: "#1a7a6e", fontWeight: "500", display: "flex", alignItems: "center", gap: 3, marginTop: "3px" }}>
                                                <IcPhone /> {b.passenger_phone || b.user_phone}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "600", fontSize: "13px" }}>{b.bus_name}</div>
                                            <div style={{ fontSize: "12px", color: "#555" }}>{b.from_city} → {b.to_city}</div>
                                            <div style={{ fontSize: "11px", color: "#888" }}>{b.departure_time}</div>
                                        </td>
                                        <td style={{ fontSize: "13px" }}>
                                            <div style={{ marginBottom: "4px" }}>{b.travel_date}</div>
                                            {(b.boarding_point || b.drop_point) && (
                                                <div style={{ fontSize: "11px", color: "#555", background: "#f8fafc", padding: "4px", borderRadius: "4px" }}>
                                                    {b.boarding_point && <div><strong>B:</strong> {b.boarding_point}</div>}
                                                    {b.drop_point && <div><strong>D:</strong> {b.drop_point}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                                {b.seat_numbers.split(",").map(s => (
                                                    <span key={s} style={{ background: "#c8ff00", color: "#0d3d35", padding: "1px 7px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>{s.trim()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: "700", color: "#1a7a6e" }}>₹{b.total_amount}</td>
                                        <td style={{ fontSize: "12px", color: "#888" }}>{b.booking_date?.slice(0,16)}</td>
                                        <td>
                                            <span style={{
                                                background: statusBg(b.status), color: statusColor(b.status),
                                                padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700",
                                                display: "inline-flex", alignItems: "center", gap: 4
                                            }}>
                                                {statusIcon(b.status)} {b.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                {b.status === "pending" && (<>
                                                    <button onClick={() => confirmBooking(b.id)} style={{
                                                        padding: "5px 10px", background: "#1a7a6e", color: "#fff",
                                                        border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                                                        display: "flex", alignItems: "center", gap: 4
                                                    }}><IcCheck /> Confirm</button>
                                                    <button onClick={() => setDenyModal({ open: true, id: b.id })} style={{
                                                        padding: "5px 10px", background: "#e53935", color: "#fff",
                                                        border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                                                        display: "flex", alignItems: "center", gap: 4
                                                    }}><IcX /> Deny</button>
                                                </>)}
                                                {b.status === "confirmed" && (
                                                    <button onClick={() => cancelBooking(b.id)} style={{
                                                        padding: "5px 10px", background: "#ff8c00", color: "#fff",
                                                        border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                                                        display: "flex", alignItems: "center", gap: 4
                                                    }}><IcCancel /> Cancel</button>
                                                )}
                                                {b.status === "cancelled" && (
                                                    <span style={{ fontSize: "11px", color: "#bbb" }}>No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminBookings;
