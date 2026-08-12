// BusList.jsx - Bus Search Results (Premium Redesign)

import { useLocation, useNavigate } from "react-router-dom";

const IcBus     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcSeat    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>;
const IcClock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcCalendar= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcStar    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#c8ff00" stroke="#c8ff00" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcSearch  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

function BusList() {
    const location = useLocation();
    const navigate = useNavigate();

    const buses  = location.state?.buses  || [];
    const search = location.state?.search || {};

    const selectSeats = (bus) => navigate(`/seats/${bus.id}`, { state: { bus } });

    const typeColor = (t) => t === "AC" ? { bg:"#e8f5f2", color:"#0d7a6e", border:"#0d7a6e" } : t === "Sleeper" ? { bg:"#f3e8ff", color:"#7c3aed", border:"#7c3aed" } : { bg:"#fff3e0", color:"#d97706", border:"#d97706" };

    return (
        <div className="page-wrapper">
            <div style={{ maxWidth: "860px", margin: "0 auto" }}>

                {/* ── Header ─────────────────────────────────────── */}
                <div style={{
                    background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
                    borderRadius: "16px", padding: "28px 32px", marginBottom: "24px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    boxShadow: "0 8px 32px rgba(13,61,53,0.25)"
                }}>
                    <div>
                        <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: "22px", fontWeight: "800", display:"flex", alignItems:"center", gap:8 }}>
                            <IcBus /> Available Buses
                        </h2>
                        <p style={{ color: "#c8ff00", margin: 0, fontSize: "14px", fontWeight: "600" }}>
                            {search.from_city} &nbsp;→&nbsp; {search.to_city}
                            <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, margin: "0 10px" }}>|</span>
                            <IcCalendar />&nbsp;{search.travel_date}
                            <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, margin: "0 10px" }}>|</span>
                            {buses.length} {buses.length === 1 ? "bus" : "buses"} found
                        </p>
                    </div>
                    <button onClick={() => navigate("/")} style={{
                        padding: "10px 20px", background: "rgba(255,255,255,0.12)",
                        color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)",
                        borderRadius: "10px", cursor: "pointer", fontSize: "13px",
                        fontWeight: "600", backdropFilter: "blur(4px)", display:"flex", alignItems:"center", gap:6
                    }}>
                        <IcSearch /> New Search
                    </button>
                </div>

                {/* ── No Buses ──────────────────────────────────── */}
                {buses.length === 0 ? (
                    <div style={{
                        background: "#fff", borderRadius: "16px", padding: "60px 40px",
                        textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
                    }}>
                        <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }}>🚌</div>
                        <h3 style={{ color: "#1a7a6e", fontSize: "20px", marginBottom: "8px" }}>No Buses Found</h3>
                        <p style={{ color: "#888", marginBottom: "24px" }}>No buses available for this route on the selected date.</p>
                        <button className="btn-kt-primary" onClick={() => navigate("/")}>Search Again</button>
                    </div>
                ) : (

                    // ── Bus Cards ────────────────────────────────────
                    buses.map((bus) => {
                        const tc = typeColor(bus.bus_type || bus.type);
                        const seatsLow = bus.available_seats < 10;
                        return (
                            <div key={bus.id} style={{
                                background: "#fff", borderRadius: "16px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                                marginBottom: "18px", overflow: "hidden",
                                border: "1px solid #e8f0ee",
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(13,61,53,0.12)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
                            >
                                {/* Card Top Bar */}
                                <div style={{
                                    background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
                                    padding: "14px 22px",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ background: "rgba(200,255,0,0.15)", borderRadius: "8px", padding: "6px 8px", display:"flex" }}>
                                            <IcBus />
                                        </div>
                                        <div>
                                            <div style={{ color: "#fff", fontWeight: "800", fontSize: "15px" }}>{bus.bus_name}</div>
                                            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>No. {bus.bus_number}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {bus.rating > 0 && (
                                            <span style={{ background: "rgba(200,255,0,0.15)", borderRadius: "6px", padding: "3px 8px", fontSize: "12px", color: "#c8ff00", display: "flex", alignItems: "center", gap: 3 }}>
                                                <IcStar /> {bus.rating}
                                            </span>
                                        )}
                                        <span style={{
                                            background: tc.bg, color: tc.color,
                                            border: `1.5px solid ${tc.border}`,
                                            borderRadius: "8px", padding: "3px 12px",
                                            fontSize: "12px", fontWeight: "700"
                                        }}>{bus.bus_type || bus.type}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>

                                    {/* Departure */}
                                    <div style={{ minWidth: "110px" }}>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Departure</div>
                                        <div style={{ fontSize: "26px", fontWeight: "800", color: "#0d3d35", lineHeight: 1 }}>{bus.departure_time}</div>
                                        <div style={{ fontSize: "13px", color: "#1a7a6e", fontWeight: "700", marginTop: "4px" }}>{bus.from_city}</div>
                                    </div>

                                    {/* Journey Line */}
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "100px" }}>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", display: "flex", alignItems: "center", gap: 4 }}>
                                            <IcClock /> {bus.duration || "Direct"}
                                        </div>
                                        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 0 }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a7a6e", flexShrink: 0 }} />
                                            <div style={{ flex: 1, height: "2px", background: "linear-gradient(90deg, #1a7a6e, #c8ff00)" }} />
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c8ff00", flexShrink: 0 }} />
                                        </div>
                                        <div style={{ fontSize: "10px", color: "#c0c0c0" }}>{bus.travel_date}</div>
                                    </div>

                                    {/* Arrival */}
                                    <div style={{ minWidth: "110px", textAlign: "right" }}>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Arrival</div>
                                        <div style={{ fontSize: "26px", fontWeight: "800", color: "#0d3d35", lineHeight: 1 }}>{bus.arrival_time}</div>
                                        <div style={{ fontSize: "13px", color: "#1a7a6e", fontWeight: "700", marginTop: "4px" }}>{bus.to_city}</div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ width: "1px", height: "60px", background: "#e2e8f0", flexShrink: 0 }} />

                                    {/* Seats */}
                                    <div style={{ textAlign: "center", minWidth: "80px" }}>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px", display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
                                            <IcSeat /> Seats
                                        </div>
                                        <div style={{
                                            fontSize: "28px", fontWeight: "900", lineHeight: 1,
                                            color: seatsLow ? "#e53935" : "#1a7a6e"
                                        }}>{bus.available_seats}</div>
                                        <div style={{ fontSize: "11px", color: seatsLow ? "#e53935" : "#94a3b8", fontWeight: "600", marginTop: "4px" }}>
                                            {seatsLow ? "Filling fast!" : "available"}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ width: "1px", height: "60px", background: "#e2e8f0", flexShrink: 0 }} />

                                    {/* Price + CTA */}
                                    <div style={{ textAlign: "center", minWidth: "130px" }}>
                                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginBottom: "4px" }}>PRICE PER SEAT</div>
                                        <div style={{ fontSize: "28px", fontWeight: "900", color: "#0d3d35", lineHeight: 1 }}>₹{bus.price}</div>
                                        <button
                                            onClick={() => selectSeats(bus)}
                                            disabled={bus.available_seats === 0}
                                            style={{
                                                marginTop: "10px", width: "100%",
                                                padding: "10px 0",
                                                background: bus.available_seats === 0 ? "#e2e8f0" : "linear-gradient(135deg, #c8ff00, #a8e000)",
                                                color: bus.available_seats === 0 ? "#999" : "#0d3d35",
                                                border: "none", borderRadius: "10px",
                                                fontWeight: "800", fontSize: "13px",
                                                cursor: bus.available_seats === 0 ? "not-allowed" : "pointer",
                                                boxShadow: bus.available_seats === 0 ? "none" : "0 4px 12px rgba(200,255,0,0.35)",
                                                transition: "all 0.15s"
                                            }}
                                        >
                                            {bus.available_seats === 0 ? "Fully Booked" : "Select Seats"}
                                        </button>
                                    </div>
                                </div>

                                {/* Amenities Strip */}
                                {bus.amenities && (
                                    <div style={{
                                        padding: "10px 22px", borderTop: "1px solid #f0f4f2",
                                        background: "#fafffe", display: "flex", gap: "12px", flexWrap: "wrap"
                                    }}>
                                        {bus.amenities.split(",").map((a, i) => (
                                            <span key={i} style={{
                                                fontSize: "11px", color: "#1a7a6e", fontWeight: "600",
                                                background: "#e8f5f2", borderRadius: "6px",
                                                padding: "3px 8px", display: "flex", alignItems: "center", gap: 4
                                            }}>✓ {a.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* Back Button */}
                {buses.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "8px", paddingBottom: "20px" }}>
                        <button onClick={() => navigate("/")} style={{
                            padding: "11px 28px", background: "transparent",
                            color: "#1a7a6e", border: "2px solid #1a7a6e",
                            borderRadius: "10px", cursor: "pointer",
                            fontSize: "14px", fontWeight: "700"
                        }}>Search Different Route</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BusList;
