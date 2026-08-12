// BusList.jsx - Bus Search Results
// Same .map() table/card pattern as ListProduct.jsx from internship (Week 7)
// useLocation to get search results passed via navigate state

import { useLocation, useNavigate } from "react-router-dom";
import API_URL from "../api";

function BusList() {

    const location = useLocation();
    const navigate = useNavigate();

    // Get buses and search params from navigate state (passed from Home.jsx)
    const buses = location.state?.buses || [];
    const search = location.state?.search || {};

    // Navigate to seat selection (same useNavigate pattern as internship)
    const selectSeats = (bus) => {
        navigate(`/seats/${bus.id}`, { state: { bus } });
    };

    return (
        <div className="page-wrapper">
            <div style={{ maxWidth: "850px", margin: "0 auto" }}>

                {/* Page Header */}
                <div className="kt-card" style={{ marginBottom: "20px" }}>
                    <div className="kt-card-header">
                        <h2>Available Buses</h2>
                        <p>
                            {search.from_city} → {search.to_city} &nbsp;|&nbsp; {search.travel_date}
                            &nbsp;| Found {buses.length} bus{buses.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </div>

                {/* Bus List - same .map() pattern as ListProduct.jsx */}
                {buses.length === 0 ? (

                    <div className="kt-card" style={{ padding: "50px", textAlign: "center" }}>
                        <div style={{ fontSize: "48px", marginBottom: "15px", opacity: 0.4 }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a7a6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        </div>
                        <h3 style={{ color: "#1a7a6e" }}>No Buses Found</h3>
                        <p style={{ color: "#666", marginBottom: "20px" }}>
                            No buses available for this route on the selected date.
                        </p>
                        <button
                            className="btn-kt-primary"
                            onClick={() => navigate("/")}
                        >
                            ← Search Again
                        </button>
                    </div>

                ) : (

                    buses.map((bus) => (

                        <div key={bus.id} className="bus-card">

                            {/* Bus Card Header */}
                            <div className="bus-card-header">
                                <h3>{bus.bus_name}</h3>
                                <div>
                                    {/* Badge same pattern as internship products */}
                                    <span className={
                                        bus.bus_type === "AC" ? "badge-ac" :
                                        bus.bus_type === "Sleeper" ? "badge-sleeper" : "badge-nonac"
                                    }>
                                        {bus.bus_type}
                                    </span>
                                </div>
                            </div>

                            {/* Bus Card Body */}
                            <div className="bus-card-body">

                                {/* Route Info */}
                                <div className="route-info">
                                    <div style={{ textAlign: "center" }}>
                                        <div className="city">{bus.from_city}</div>
                                        <div className="time-info">{bus.departure_time}</div>
                                    </div>
                                    <div className="arrow">→→→</div>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="city">{bus.to_city}</div>
                                        <div className="time-info">{bus.arrival_time}</div>
                                    </div>
                                </div>

                                {/* Seats Info */}
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "13px", color: "#888", marginBottom: "5px" }}>Seats Left</div>
                                    <div style={{ fontSize: "22px", fontWeight: "700", color: bus.available_seats < 10 ? "#e53935" : "#1a7a6e" }}>
                                        {bus.available_seats}
                                    </div>
                                </div>

                                {/* Price + Book Button */}
                                <div className="bus-action-section" style={{ textAlign: "right", width: "100%" }}>
                                    <div>
                                        <div className="price-big">₹{bus.price}</div>
                                        <div className="seats-left" style={{ marginBottom: "10px" }}>per seat</div>
                                    </div>
                                    <button
                                        className="btn-kt-accent"
                                        onClick={() => selectSeats(bus)}
                                        disabled={bus.available_seats === 0}
                                    >
                                        {bus.available_seats === 0 ? "Full" : "Select Seats →"}
                                    </button>
                                </div>

                            </div>

                            {/* Bus Number + Date Info */}
                            <div style={{ padding: "8px 20px", background: "#f0f8f6", fontSize: "13px", color: "#777", display: "flex", gap: "20px" }}>
                                <span>Bus No: {bus.bus_number}</span>
                                <span>{bus.travel_date}</span>
                                <span>Total: {bus.total_seats} seats</span>
                            </div>

                        </div>

                    ))
                )}

                {/* Back Button */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button className="btn-kt-primary" onClick={() => navigate("/")}>
                        ← Search Different Route
                    </button>
                </div>

            </div>
        </div>
    );
}

export default BusList;
