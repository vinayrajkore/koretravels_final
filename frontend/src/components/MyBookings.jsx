import API_URL from "../api";
// MyBookings.jsx - View All Bookings + Cancel
// Same useEffect + axios.get + .map() table pattern as UserList.jsx internship (Week 7)

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

function MyBookings() {

    const navigate = useNavigate();
    const toast = useToast();

    // Get logged-in user ID from localStorage - same as ListProduct.jsx
    const user_id = localStorage.getItem("u_id");
    const u_name = localStorage.getItem("u_name");

    // useState for bookings - same as internship UserList.jsx
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

    // useEffect to load bookings on page load - same pattern as internship
    useEffect(() => {
        if (user_id) {
            getBookings();
        }
    }, []);

    // getBookings - same axios.get pattern as internship getUsers()
    const getBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/mybookings/${user_id}`);
            console.log(res.data);
            setBookings(res.data);
        } catch (err) {
            console.error("Error loading bookings:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // cancelBooking - same axios.put pattern as internship putdata route
    const cancelBooking = (id) => {
        setConfirmModal({ open: true, id });
    };

    const doCancelBooking = async () => {
        const id = confirmModal.id;
        setConfirmModal({ open: false, id: null });

        try {
            const res = await axios.put(`${API_URL}/cancelbooking/${id}`);
            toast.success(res.data.message || "Booking cancelled", "Cancelled");
            getBookings(); // Reload list - same pattern as internship delete + reload
        } catch (err) {
            toast.error("Error: " + err.message, "Cancellation Failed");
        }
    };

    if (!user_id) {
        return (
            <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "60px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px", color: "#1a7a6e" }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h3 style={{ color: "#1a7a6e", margin: "15px 0" }}>Please Login First</h3>
                <button className="btn-kt-primary" onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "60px" }}>
                <div style={{ display: "flex", justifyContent: "center", color: "#1a7a6e" }}>
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>
                </div>
                <p style={{ color: "#1a7a6e", fontSize: "18px", marginTop: "15px" }}>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <>
        {/* Cancel Confirmation Modal */}
        {confirmModal.open && (
            <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(3,26,23,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ background:"linear-gradient(135deg,#062f29,#0a4a3f)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:18,padding:"28px 30px",minWidth:320,maxWidth:460,boxShadow:"0 24px 60px rgba(0,0,0,0.5)",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    <h3 style={{ margin:"0 0 8px",color:"#f87171",fontSize:17 }}>Cancel Booking?</h3>
                    <p style={{ margin:"0 0 22px",color:"rgba(255,255,255,0.6)",fontSize:13,lineHeight:1.6 }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>
                    <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                        <button onClick={() => setConfirmModal({ open:false,id:null })} style={{ padding:"9px 20px",borderRadius:9,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13,fontWeight:600 }}>No, Keep It</button>
                        <button onClick={doCancelBooking} style={{ padding:"9px 22px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:800 }}>Yes, Cancel Booking</button>
                    </div>
                </div>
            </div>
        )}
        <div className="page-wrapper">
            <div style={{ maxWidth: "950px", margin: "0 auto" }}>

                {/* Page Header */}
                <div className="kt-card" style={{ marginBottom: "20px" }}>
                    <div className="kt-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#1a7a6e" }}><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>
                            <div>
                                <h2>My Bookings</h2>
                                <p>Welcome, {u_name}! You have {bookings.length} booking(s)</p>
                            </div>
                        </div>
                        <button className="btn-kt-accent" onClick={() => navigate("/")}>
                            + New Booking
                        </button>
                    </div>
                </div>

                {/* No Bookings */}
                {bookings.length === 0 ? (

                    <div className="kt-card" style={{ padding: "60px", textAlign: "center" }}>
                        <div style={{ marginBottom: "20px" }}>
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#1a7a6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <h3 style={{ color: "#1a7a6e", marginBottom: "10px" }}>No Bookings Yet</h3>
                        <p style={{ color: "#666", marginBottom: "25px" }}>
                            You haven't booked any bus tickets yet.
                        </p>
                        <button className="btn-kt-accent" onClick={() => navigate("/")}>
                            Book Your First Ticket
                        </button>
                    </div>

                ) : (

                    /* Booking Cards - same .map() pattern as internship UserList.jsx */
                    bookings.map((booking) => (

                        <div key={booking.id} className="kt-card" style={{ marginBottom: "16px" }}>

                            {/* Booking Header */}
                            <div style={{
                                background: booking.status === "confirmed"
                                    ? "linear-gradient(135deg, #1a7a6e, #0d3d35)"
                                    : booking.status === "pending"
                                    ? "linear-gradient(135deg, #b86e00, #7a4500)"
                                    : "linear-gradient(135deg, #888, #555)",
                                padding: "12px 20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div>
                                    <span style={{ color: "#c8ff00", fontWeight: "700", fontSize: "16px" }}>
                                        Booking #{booking.id}
                                    </span>
                                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginLeft: "15px" }}>
                                        {booking.booking_date}
                                    </span>
                                </div>
                                <span className={
                                    booking.status === "confirmed" ? "badge-confirmed"
                                    : booking.status === "pending" ? "badge-pending"
                                    : "badge-cancelled"
                                }>
                                    {booking.status === "confirmed" ? "Confirmed"
                                     : booking.status === "pending" ? "Awaiting Confirmation"
                                     : "Cancelled"}
                                </span>
                            </div>

                            {/* Booking Body */}
                            <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>

                                {/* Bus + Route Info */}
                                <div>
                                    <p style={{ fontWeight: "700", color: "#0d3d35", fontSize: "17px", marginBottom: "8px" }}>
                                        {booking.bus_name}
                                    </p>
                                    <p style={{ color: "#555", marginBottom: "5px" }}>
                                        <strong>{booking.from_city}</strong> → <strong>{booking.to_city}</strong>
                                    </p>
                                    <p style={{ color: "#777", fontSize: "14px", marginBottom: "4px" }}>
                                        {booking.travel_date} &nbsp;|&nbsp;
                                        {booking.departure_time} - {booking.arrival_time}
                                    </p>
                                    <p style={{ color: "#777", fontSize: "14px" }}>
                                        Type: {booking.bus_type}
                                    </p>
                                </div>

                                {/* Passenger + Seats */}
                                <div>
                                    <div style={{ marginBottom: "8px" }}>
                                        {booking.seat_numbers.split(",").map((seat, i) => {
                                            const name = booking.passenger_name.split(",")[i]?.trim() || "N/A";
                                            const age = (booking.passenger_age||"").split(",")[i]?.trim() || "N/A";
                                            const gender = (booking.passenger_gender||"").split(",")[i]?.trim() || "N/A";
                                            return (
                                                <div key={i} style={{ marginBottom: "6px", padding: "6px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                                    <p style={{ fontWeight: "600", color: "#333", marginBottom: "2px", fontSize: "14px" }}>
                                                        {name} <span style={{ fontSize: "12px", color: "#1a7a6e", marginLeft: "4px" }}>(Seat {seat.trim()})</span>
                                                    </p>
                                                    <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
                                                        {gender} • {age} yrs
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 6}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                        {booking.passenger_phone} | {booking.passenger_email || "N/A"}
                                    </p>

                                    {(booking.boarding_point || booking.drop_point) && (
                                        <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #e2e8f0" }}>
                                            {booking.boarding_point && <div style={{ fontSize: "12px", color: "#334155", marginBottom: "4px" }}><strong>Boarding:</strong> {booking.boarding_point}</div>}
                                            {booking.drop_point && <div style={{ fontSize: "12px", color: "#334155" }}><strong>Drop:</strong> {booking.drop_point}</div>}
                                        </div>
                                    )}

                                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "5px" }}>Seats:</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                        {booking.seat_numbers.split(",").map(s => (
                                            <span key={s} style={{
                                                background: booking.status === "confirmed" ? "#c8ff00"
                                                           : booking.status === "pending" ? "#ffe082"
                                                           : "#ddd",
                                                color: booking.status === "confirmed" ? "#0d3d35"
                                                       : booking.status === "pending" ? "#7a4500"
                                                       : "#888",
                                                padding: "2px 9px", borderRadius: "10px",
                                                fontSize: "13px", fontWeight: "700"
                                            }}>
                                                {s.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount + Cancel */}
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a7a6e", marginBottom: "5px" }}>
                                        ₹{booking.total_amount}
                                    </p>
                                    <p style={{ fontSize: "13px", color: "#888", marginBottom: "15px" }}>
                                        Total Paid
                                    </p>

                                    {/* Cancel Button - only if confirmed */}
                                    {booking.status === "confirmed" && (
                                        <button
                                            className="btn-kt-danger"
                                            onClick={() => cancelBooking(booking.id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                    {booking.status === "pending" && (
                                        <span style={{ fontSize: "12px", color: "#ff8c00", fontWeight: "600", display: "block", marginTop: 8 }}>
                                            Waiting for admin approval
                                        </span>
                                    )}
                                </div>

                            </div>

                        </div>

                    ))
                )}

            </div>
        </div>
        </>
    );
}

export default MyBookings;
