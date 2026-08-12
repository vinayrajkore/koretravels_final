import API_URL from "../api";
// BookingForm.jsx - Passenger Details + Confirm Booking
// Now includes: age, gender, pre-filled email, boarding/drop points

import { useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function BookingForm() {

    const { busId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const bus           = location.state?.bus           || {};
    const selectedSeats = location.state?.selectedSeats || [];
    const boardingPoint = location.state?.boardingPoint || "";
    const dropPoint     = location.state?.dropPoint     || "";

    const originalTotalAmount = (selectedSeats.length * bus.price).toFixed(2);
    const [bookingCount, setBookingCount] = useState(null);

    const user_id = localStorage.getItem("u_id");
    const u_name  = localStorage.getItem("u_name");
    const u_email = localStorage.getItem("u_email");

    useEffect(() => {
        if (user_id) {
            axios.get(`${API_URL}/user-stats/${user_id}`)
                .then(res => setBookingCount(res.data.bookingCount))
                .catch(err => console.error("Could not fetch user stats", err));
        }
    }, [user_id]);

    const isFirstBooking = bookingCount === 0;
    const finalTotalAmount = isFirstBooking ? (originalTotalAmount * 0.9).toFixed(2) : originalTotalAmount;

    const [contact, setContact] = useState({
        passenger_phone: "",
        passenger_email: u_email || ""
    });

    const [passengers, setPassengers] = useState(
        selectedSeats.map((seat, i) => ({
            name: i === 0 ? (u_name || "") : "",
            age: "",
            gender: ""
        }))
    );

    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContact({ ...contact, [name]: value });
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const validate = () => {
        let e = {};
        if (!contact.passenger_phone) e.passenger_phone = "Required";
        else if (!/^[6-9]\d{9}$/.test(contact.passenger_phone)) e.passenger_phone = "Invalid 10-Digit Mobile";
        if (!contact.passenger_email.trim()) e.passenger_email = "Required";

        passengers.forEach((p, i) => {
            if (!p.name.trim()) e[`p_${i}_name`] = "Required";
            if (!p.age) e[`p_${i}_age`] = "Required";
            if (p.age && (isNaN(p.age) || p.age < 1 || p.age > 120)) e[`p_${i}_age`] = "Invalid";
            if (!p.gender) e[`p_${i}_gender`] = "Required";
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!user_id) { alert("Please login to book!"); navigate("/login"); return; }
        if (validate()) {
            try {
                setLoading(true);
                const response = await axios.post(`${API_URL}/bookbus`, {
                    user_id:          parseInt(user_id),
                    bus_id:           parseInt(busId),
                    seat_numbers:     selectedSeats,
                    passenger_name:   passengers.map(p => p.name.trim()).join(", "),
                    passenger_phone:  contact.passenger_phone,
                    passenger_email:  contact.passenger_email,
                    passenger_age:    passengers.map(p => p.age).join(", "),
                    passenger_gender: passengers.map(p => p.gender).join(", "),
                    total_amount:     parseFloat(finalTotalAmount),
                    boarding_point:   boardingPoint,
                    drop_point:       dropPoint,
                });
                alert(`Booking Received! ID: #${response.data.booking_id}\nConfirmation email sent!`);
                navigate("/mybookings");
            } catch (err) {
                alert("Booking failed: " + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const inputStyle = {
        width: "100%", padding: "10px 14px", border: "2px solid #d0e8e4",
        borderRadius: "8px", fontSize: "14px", background: "#fff", color: "#222",
        outline: "none", fontFamily: "Poppins,sans-serif", boxSizing: "border-box",
    };
    const labelStyle = { display: "block", fontWeight: "600", color: "#1a7a6e", marginBottom: "6px", fontSize: "13px" };
    const errStyle   = { color: "#e53935", fontSize: "12px", marginTop: "4px", display: "block" };

    return (
        <div className="page-wrapper">
            <div style={{ maxWidth: "780px", margin: "0 auto" }}>

                {/* Page Header */}
                <div className="kt-card" style={{ marginBottom: "20px" }}>
                    <div className="kt-card-header">
                        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>
                            Confirm Booking
                        </h2>
                        <p>Review your details and confirm</p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>

                    {/* Booking Form */}
                    <div className="kt-card" style={{ flex: "1", minWidth: "260px" }}>
                        <div className="kt-card-body">

                            <form onSubmit={submitHandler}>

                                {/* Contact Info */}
                                <div style={{ marginBottom: "22px" }}>
                                    <h3 style={{ color: "#1a7a6e", marginBottom: "16px", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #e8f5f2", paddingBottom: "10px" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                        Contact Details (For Ticket)
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                                        <div>
                                            <label style={labelStyle}>Mobile Number *</label>
                                            <input type="tel" name="passenger_phone" value={contact.passenger_phone} onChange={handleContactChange} style={inputStyle} placeholder="10-digit mobile" maxLength="10" />
                                            <span style={errStyle}>{errors.passenger_phone}</span>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email Address *</label>
                                            <input type="email" name="passenger_email" value={contact.passenger_email} onChange={handleContactChange} style={inputStyle} placeholder="Ticket email" />
                                            <span style={errStyle}>{errors.passenger_email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Passenger Info */}
                                {selectedSeats.map((seat, i) => (
                                    <div key={seat} style={{ marginBottom: "22px", background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                        <h3 style={{ color: "#0d3d35", marginBottom: "12px", fontSize: "14px", fontWeight: "700" }}>
                                            Passenger {i + 1} (Seat: {seat})
                                        </h3>
                                        <div style={{ marginBottom: "12px" }}>
                                            <label style={labelStyle}>Full Name *</label>
                                            <input value={passengers[i].name} onChange={(e) => handlePassengerChange(i, 'name', e.target.value)} style={inputStyle} placeholder="Enter full name" />
                                            <span style={errStyle}>{errors[`p_${i}_name`]}</span>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                            <div>
                                                <label style={labelStyle}>Age *</label>
                                                <input type="number" min="1" max="120" value={passengers[i].age} onChange={(e) => handlePassengerChange(i, 'age', e.target.value)} style={inputStyle} placeholder="Age" />
                                                <span style={errStyle}>{errors[`p_${i}_age`]}</span>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Gender *</label>
                                                <select value={passengers[i].gender} onChange={(e) => handlePassengerChange(i, 'gender', e.target.value)} style={inputStyle}>
                                                    <option value="">-- Select --</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <span style={errStyle}>{errors[`p_${i}_gender`]}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Notice */}
                                <p style={{ fontSize: "12px", color: "#888", marginBottom: "18px", display: "flex", alignItems: "center", gap: "6px", background: "#f0f9f8", padding: "10px 14px", borderRadius: "8px", border: "1px solid #d0e8e4" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"/><polyline points="3 7 12 13 21 7"/></svg>
                                    Your booking confirmation will be sent to the email above.
                                </p>

                                {/* Confirm Button */}
                                <button type="submit" className="btn-kt-accent" style={{ width: "100%", padding: "13px", fontSize: "16px" }} disabled={loading}>
                                    {loading ? "Confirming..." : (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            Confirm &amp; Book ₹{finalTotalAmount}
                                        </span>
                                    )}
                                </button>

                                <button type="button" className="btn-kt-primary" style={{ width: "100%", padding: "10px", marginTop: "10px", fontSize: "14px" }} onClick={() => navigate(-1)}>
                                    ← Change Seats
                                </button>

                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="kt-card" style={{ width: "260px", alignSelf: "flex-start", position: "sticky", top: 80 }}>
                        <div className="kt-card-header" style={{ padding: "15px 20px" }}>
                            <h2 style={{ fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                Order Summary
                            </h2>
                        </div>
                        <div className="kt-card-body" style={{ padding: "16px 20px" }}>

                            {/* Bus Info */}
                            <div style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "2px solid #e0eeec" }}>
                                <p style={{ fontWeight: "700", color: "#0d3d35", marginBottom: "4px", fontSize: "14px" }}>{bus.bus_name}</p>
                                <p style={{ fontSize: "12px", color: "#888", marginBottom: "2px" }}>{bus.bus_number}</p>
                                <p style={{ fontSize: "13px", color: "#555" }}>{bus.from_city} → {bus.to_city}</p>
                                <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 4 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    {bus.travel_date} &nbsp;|&nbsp; Dep: {bus.departure_time}
                                </p>
                            </div>

                            {/* Boarding / Drop Points */}
                            {(boardingPoint || dropPoint) && (
                                <div style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "2px solid #e0eeec" }}>
                                    {boardingPoint && (
                                        <div style={{ marginBottom: "8px" }}>
                                            <div style={{ fontSize: "11px", color: "#1a7a6e", fontWeight: "700", marginBottom: "3px", textTransform: "uppercase" }}>Boarding</div>
                                            <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>{boardingPoint}</div>
                                        </div>
                                    )}
                                    {dropPoint && (
                                        <div>
                                            <div style={{ fontSize: "11px", color: "#e53935", fontWeight: "700", marginBottom: "3px", textTransform: "uppercase" }}>Drop</div>
                                            <div style={{ fontSize: "13px", color: "#1e293b", fontWeight: "600" }}>{dropPoint}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Selected Seats */}
                            <div style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "2px solid #e0eeec" }}>
                                <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>Selected Seats:</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {selectedSeats.map(s => (
                                        <span key={s} style={{ background: "#c8ff00", color: "#0d3d35", padding: "3px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: "700" }}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#666", marginBottom: "6px" }}>
                                    <span>{selectedSeats.length} seat(s)</span>
                                    <span>× ₹{bus.price}</span>
                                </div>
                                {isFirstBooking && (
                                    <>
                                        <div style={{ background: "#ecfdf5", color: "#059669", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", border: "1px solid #10b981" }}>
                                            🎉 10% OFF - First Booking!
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#94a3b8", textDecoration: "line-through", marginBottom: "2px" }}>
                                            <span>Original Total:</span>
                                            <span>₹{originalTotalAmount}</span>
                                        </div>
                                    </>
                                )}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "700", color: "#1a7a6e" }}>
                                    <span>Total:</span>
                                    <span>₹{finalTotalAmount}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default BookingForm;
