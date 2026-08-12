import API_URL from "../api";
// AddBus.jsx - Admin Add New Bus Form
// Same form pattern as AddUser.jsx from internship (Week 7)
// Multer image upload - same as internship FormData pattern
// seat_layout added with live mini-preview

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// ── Seat layout configs ──────────────────────────────────────────
const LAYOUT_CONFIG = {
    "2+2 Seater":        { seats: 40, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, desc: "40 chair seats — 2+2 per row, single deck" },
    "2+1 Seater":        { seats: 30, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, desc: "30 chair seats — 2+1 per row, single deck" },
    "Semi-Sleeper (2+1)":{ seats: 60, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, desc: "60 seats — lower seater chairs + upper sleeper berths (2+1)" },
    "Full Sleeper":      { seats: 60, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, desc: "60 seats — lower single berths + chairs, upper single + double berths" },
    "2+1 AC Sleeper":    { seats: 30, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, desc: "30 berths — 5 rows lower/upper, 2+1 layout" },
    "Non A/C Seater / Sleeper (2+1)": { seats: 48, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, desc: "48 seats — 33 lower chairs, 15 upper berths" },
    "NON A/C Seater (2+2)": { seats: 48, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, desc: "48 seats — 12 rows, 2+2 layout with 5 back seats" },
    "A/C Seater / Sleeper (2+1)": { seats: 43, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, desc: "43 seats — 5 lower berths + 23 chairs, 15 upper berths" },
};

// ── Mini Layout Preview Component ───────────────────────────────
function LayoutPreview({ layout }) {
    const S = { bg: "#e8f5f2", border: "#1a7a6e", color: "#1a7a6e" };  // seat color
    const B = { bg: "#f3e8ff", border: "#7c3aed", color: "#7c3aed" };  // berth color
    const D = { bg: "#fff0f3", border: "#e11d48", color: "#e11d48" };  // double berth color

    const Cell = ({ w = 22, h = 22, c = S, label = "" }) => (
        <div style={{
            width: w, height: h, borderRadius: 5, background: c.bg,
            border: `2px solid ${c.border}`, color: c.color,
            fontSize: 8, fontWeight: 700, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{label}</div>
    );
    const Aisle = () => <div style={{ width: 10 }} />;
    const Row = ({ children, style = {} }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3, ...style }}>{children}</div>
    );
    const DeckLabel = ({ label, color = "#1a7a6e" }) => (
        <div style={{ fontSize: 9, color, fontWeight: 700, marginBottom: 3, textAlign: "center" }}>{label}</div>
    );

    if (layout === "2+2 Seater") return (
        <div>
            {[1,2,3].map(r => (
                <Row key={r}>
                    <Cell /><Cell /><Aisle /><Cell /><Cell />
                </Row>
            ))}
            <div style={{ fontSize: 9, color: "#888", marginTop: 4, textAlign: "center" }}>... 10 rows × 4 chairs = 40 seats</div>
        </div>
    );

    if (layout === "2+1 Seater") return (
        <div>
            {[1,2,3].map(r => (
                <Row key={r}>
                    <Cell /><Cell /><Aisle /><Cell />
                </Row>
            ))}
            <div style={{ fontSize: 9, color: "#888", marginTop: 4, textAlign: "center" }}>... 10 rows × 3 chairs = 30 seats</div>
        </div>
    );

    if (layout === "Semi-Sleeper (2+1)") return (
        <div style={{ display: "flex", gap: 16 }}>
            <div>
                <DeckLabel label="Lower — Seater" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell /><Cell /><Aisle /><Cell />
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>chairs ×30</div>
            </div>
            <div style={{ width: 1, background: "#eee" }} />
            <div>
                <DeckLabel label="Upper — Sleeper" color="#7c3aed" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Cell h={32} c={B} /><Aisle /><Cell h={32} c={B} />
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berths ×30</div>
            </div>
        </div>
    );

    if (layout === "Full Sleeper") return (
        <div style={{ display: "flex", gap: 16 }}>
            <div>
                <DeckLabel label="Lower Deck" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Aisle /><Cell /><Cell />
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berth+2chairs ×10</div>
            </div>
            <div style={{ width: 1, background: "#eee" }} />
            <div>
                <DeckLabel label="Upper Deck" color="#e11d48" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Aisle />
                        <div style={{ display: "flex", gap: 2 }}>
                            <Cell w={20} h={32} c={D} /><Cell w={20} h={32} c={D} />
                        </div>
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berth+dbl-berth ×10</div>
            </div>
        </div>
    );

    if (layout === "2+1 AC Sleeper") return (
        <div style={{ display: "flex", gap: 16 }}>
            <div>
                <DeckLabel label="Lower Deck" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 6, padding: 1, border: "1px dashed #7c3aed" }}>
                            <Cell w={20} h={32} c={B} /><Cell w={20} h={32} c={B} />
                        </div>
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berths ×15</div>
            </div>
            <div style={{ width: 1, background: "#eee" }} />
            <div>
                <DeckLabel label="Upper Deck" color="#e11d48" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 6, padding: 1, border: "1px dashed #7c3aed" }}>
                            <Cell w={20} h={32} c={B} /><Cell w={20} h={32} c={B} />
                        </div>
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berths ×15</div>
            </div>
        </div>
    );

    if (layout === "Non A/C Seater / Sleeper (2+1)") return (
        <div style={{ display: "flex", gap: 16 }}>
            <div>
                <DeckLabel label="Lower (Chairs)" />
                {[1,2,3].map(r => (
                    <Row key={r}>
                        <Cell c={S} /><Aisle /><Cell c={S} /><Cell c={S} />
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>chairs ×33 (11 rows)</div>
            </div>
            <div style={{ width: 1, background: "#eee" }} />
            <div>
                <DeckLabel label="Upper (Berths)" color="#7c3aed" />
                {[1,2].map(r => (
                    <Row key={r}>
                        <Cell h={32} c={B} /><Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 6, padding: 1, border: "1px dashed #7c3aed" }}>
                            <Cell w={20} h={32} c={B} /><Cell w={20} h={32} c={B} />
                        </div>
                    </Row>
                ))}
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>berths ×15 (5 rows)</div>
            </div>
        </div>
    );

    if (layout === "NON A/C Seater (2+2)") return (
        <div>
            {[1,2,3].map(r => (
                <Row key={r}>
                    <Cell c={S} /><Cell c={S} /><Aisle /><Cell c={S} /><Cell c={S} />
                </Row>
            ))}
            <div style={{ fontSize: 9, color: "#888", marginTop: 4, textAlign: "center" }}>... 11 rows × 4 + 5 back = 48 seats</div>
        </div>
    );

    if (layout === "A/C Seater / Sleeper (2+1)") return (
        <div style={{ display: "flex", gap: 16 }}>
            <div>
                <DeckLabel label="Lower Deck" />
                <Row>
                    <Cell h={50} c={B} /><Aisle />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", gap: 2 }}><Cell c={S}/><Cell c={S}/></div>
                        <div style={{ display: "flex", gap: 2 }}><Cell c={S}/><Cell c={S}/></div>
                    </div>
                </Row>
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>28 seats</div>
            </div>
            <div style={{ width: 1, background: "#eee" }} />
            <div>
                <DeckLabel label="Upper Deck" color="#7c3aed" />
                <Row>
                    <Cell h={32} c={B} /><Aisle />
                    <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 6, padding: 1, border: "1px dashed #7c3aed" }}>
                        <Cell w={20} h={32} c={B} /><Cell w={20} h={32} c={B} />
                    </div>
                </Row>
                <div style={{ fontSize: 8, color: "#888", textAlign: "center" }}>15 berths</div>
            </div>
        </div>
    );

    return null;
}

function AddBus() {
    const navigate = useNavigate();

    const [bus, setBus] = useState({
        bus_name: "", bus_number: "", from_city: "", to_city: "",
        depart: "", arrive: "", duration: "", travel_date: "", total_seats: 40,
        price: "", type: "AC", rating: "0.0", photos: "", amenities: "", seat_layout: "2+2 Seater"
    });

    const [pickupPoints, setPickupPoints] = useState([]);
    const [dropPoints, setDropPoints] = useState([]);

    const handlePointChange = (type, index, field, value) => {
        const setter = type === 'pickup' ? setPickupPoints : setDropPoints;
        const points = type === 'pickup' ? pickupPoints : dropPoints;
        const newPoints = [...points];
        newPoints[index][field] = value;
        setter(newPoints);
    };

    const addPoint = (type) => {
        const setter = type === 'pickup' ? setPickupPoints : setDropPoints;
        const points = type === 'pickup' ? pickupPoints : dropPoints;
        setter([...points, { time: "", name: "" }]);
    };

    const removePoint = (type, index) => {
        const setter = type === 'pickup' ? setPickupPoints : setDropPoints;
        const points = type === 'pickup' ? pickupPoints : dropPoints;
        setter(points.filter((_, i) => i !== index));
    };

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    // Auto-update total_seats when seat_layout changes
    useEffect(() => {
        const config = LAYOUT_CONFIG[bus.seat_layout];
        if (config) setBus(prev => ({ ...prev, total_seats: config.seats }));
    }, [bus.seat_layout]);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setBus(prev => ({ ...prev, [name]: value }));
    };

    const fileHandler = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    const validate = () => {
        let errs = {};
        if (!bus.bus_name.trim())     errs.bus_name     = "Bus name required";
        if (!bus.bus_number.trim())   errs.bus_number   = "Bus number required";
        if (!bus.from_city.trim())    errs.from_city    = "From city required";
        if (!bus.to_city.trim())      errs.to_city      = "To city required";
        if (!bus.depart)              errs.depart       = "Departure time required";
        if (!bus.arrive)              errs.arrive       = "Arrival time required";
        if (!bus.travel_date)         errs.travel_date    = "Travel date required";
        if (!bus.price || bus.price <= 0) errs.price    = "Valid price required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            const formData = new FormData();
            Object.entries(bus).forEach(([k, v]) => formData.append(k, v));
            formData.append("pickup_points", JSON.stringify(pickupPoints));
            formData.append("drop_points", JSON.stringify(dropPoints));
            
            selectedFiles.forEach(file => {
                formData.append("bus_images", file);
            });

            await axios.post(`${API_URL}/addbus`, formData);
            alert("✅ Bus Added Successfully!!");
            navigate("/admin/buses");

        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const cities = ["Village", "Pune", "Mumbai"];

    const inputStyle = { width: "100%", padding: "10px 14px", border: "2px solid #d0e8e4", borderRadius: "8px", fontSize: "14px", background: "#fff", color: "#222", outline: "none", fontFamily: "Poppins,sans-serif" };
    const labelStyle = { display: "block", fontWeight: "600", color: "#1a7a6e", marginBottom: "6px", fontSize: "13px" };
    const errStyle   = { color: "#e53935", fontSize: "12px", marginTop: "3px", display: "block" };

    return (
        <AdminLayout>
            <div style={{ maxWidth: "820px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add New Bus
                    </h2>
                    <button onClick={() => navigate("/admin/buses")}
                        style={{ padding: "8px 16px", background: "#eee", color: "#333", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px" }}>
                        ← Back to Buses
                    </button>
                </div>

                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>

                    <div style={{ background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", padding: "16px 22px" }}>
                        <h3 style={{ color: "#c8ff00", margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            Bus Information
                        </h3>
                        <p style={{ color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontSize: "13px" }}>Fill all details to add a new bus to the system</p>
                    </div>

                    <form onSubmit={submitHandler} style={{ padding: "24px" }}>

                        {/* Row 1: Bus Name + Bus Number */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>Bus Name *</label>
                                <input name="bus_name" placeholder="e.g. Kore Express" value={bus.bus_name} onChange={changeHandler} style={inputStyle} />
                                <span style={errStyle}>{errors.bus_name}</span>
                            </div>
                            <div>
                                <label style={labelStyle}>Bus Number *</label>
                                <input name="bus_number" placeholder="e.g. KT-008" value={bus.bus_number} onChange={changeHandler} style={inputStyle} />
                                <span style={errStyle}>{errors.bus_number}</span>
                            </div>
                        </div>

                        {/* Row 2: From + To */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>From City *</label>
                                <input list="cities_list" name="from_city" value={bus.from_city} onChange={changeHandler} style={inputStyle} placeholder="Type or select city" />
                                <span style={errStyle}>{errors.from_city}</span>
                            </div>
                            <div>
                                <label style={labelStyle}>To City *</label>
                                <input list="cities_list" name="to_city" value={bus.to_city} onChange={changeHandler} style={inputStyle} placeholder="Type or select city" />
                                <span style={errStyle}>{errors.to_city}</span>
                            </div>
                            <datalist id="cities_list">
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </datalist>
                        </div>

                        {/* Row 3: Pickup + Drop Points (Dynamic Tables) */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            {/* Pickup Points Table */}
                            <div style={{ border: "2px solid #e2e8f0", borderRadius: "8px", padding: "12px", background: "#f8fafc" }}>
                                <label style={{...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        Pickup Points
                                    </span>
                                    <button type="button" onClick={() => addPoint('pickup')} style={{ background: "#1a7a6e", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>+ Add</button>
                                </label>
                                {pickupPoints.length === 0 && <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "10px" }}>No points added</div>}
                                {pickupPoints.map((pt, i) => (
                                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                                        <input type="time" value={pt.time} onChange={(e) => handlePointChange('pickup', i, 'time', e.target.value)} style={{ ...inputStyle, padding: "6px 8px", width: "100px" }} />
                                        <input type="text" placeholder="Location Name" value={pt.name} onChange={(e) => handlePointChange('pickup', i, 'name', e.target.value)} style={{ ...inputStyle, padding: "6px 8px" }} />
                                        <button type="button" onClick={() => removePoint('pickup', i)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px" }}>X</button>
                                    </div>
                                ))}
                            </div>

                            {/* Drop Points Table */}
                            <div style={{ border: "2px solid #e2e8f0", borderRadius: "8px", padding: "12px", background: "#f8fafc" }}>
                                <label style={{...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"}}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#e53935" }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                                        Drop Points
                                    </span>
                                    <button type="button" onClick={() => addPoint('drop')} style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>+ Add</button>
                                </label>
                                {dropPoints.length === 0 && <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", padding: "10px" }}>No points added</div>}
                                {dropPoints.map((pt, i) => (
                                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                                        <input type="time" value={pt.time} onChange={(e) => handlePointChange('drop', i, 'time', e.target.value)} style={{ ...inputStyle, padding: "6px 8px", width: "100px" }} />
                                        <input type="text" placeholder="Location Name" value={pt.name} onChange={(e) => handlePointChange('drop', i, 'name', e.target.value)} style={{ ...inputStyle, padding: "6px 8px" }} />
                                        <button type="button" onClick={() => removePoint('drop', i)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "12px" }}>X</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Row 4: Times & Duration */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Departure Time *
                                </label>
                                <input type="time" name="depart" value={bus.depart} onChange={changeHandler} style={inputStyle} />
                                <span style={errStyle}>{errors.depart}</span>
                            </div>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Arrival Time *
                                </label>
                                <input type="time" name="arrive" value={bus.arrive} onChange={changeHandler} style={inputStyle} />
                                <span style={errStyle}>{errors.arrive}</span>
                            </div>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Duration
                                </label>
                                <input name="duration" placeholder="e.g. 07h 45m" value={bus.duration} onChange={changeHandler} style={inputStyle} />
                            </div>
                        </div>

                        {/* Row 5: Date + Price + Bus Type + Rating */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Travel Date *
                                </label>
                                <input type="date" name="travel_date" value={bus.travel_date} onChange={changeHandler}
                                    min={new Date().toISOString().split("T")[0]} style={inputStyle} />
                                <span style={errStyle}>{errors.travel_date}</span>
                            </div>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Price (₹) *
                                </label>
                                <input type="number" name="price" placeholder="350" value={bus.price} onChange={changeHandler} style={inputStyle} />
                                <span style={errStyle}>{errors.price}</span>
                            </div>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                    Bus Type
                                </label>
                                <input name="type" placeholder="e.g. AC Sleeper" value={bus.type} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    Rating
                                </label>
                                <input type="number" step="0.1" name="rating" placeholder="4.5" value={bus.rating} onChange={changeHandler} style={inputStyle} />
                            </div>
                        </div>

                        {/* Photos field removed as it is now handled by bus_images file upload */}

                        {/* ── SEAT LAYOUT SELECTOR ─────────────────────────── */}
                        <div style={{ background: "#f0f8f6", borderRadius: "10px", padding: "18px", marginBottom: "16px", border: "2px solid #c8ff00" }}>
                            <label style={{ ...labelStyle, fontSize: "15px", color: "#0d3d35", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                Seat Layout *
                            </label>

                            {/* Layout Radio Cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                                {Object.entries(LAYOUT_CONFIG).map(([key, cfg]) => (
                                    <label key={key} style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                                        border: bus.seat_layout === key ? "2px solid #1a7a6e" : "2px solid #d0e8e4",
                                        background: bus.seat_layout === key ? "#e8f5f2" : "#fff",
                                        transition: "all 0.15s",
                                    }}>
                                        <input
                                            type="radio" name="seat_layout" value={key}
                                            checked={bus.seat_layout === key}
                                            onChange={changeHandler}
                                            style={{ accentColor: "#1a7a6e", width: "18px", height: "18px" }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "700", color: "#0d3d35", fontSize: "13px" }}>
                                                {cfg.icon} {key}
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                                                {cfg.desc}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Live Preview + Total Seats */}
                            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                                <div style={{
                                    background: "#fff", borderRadius: "8px", padding: "14px",
                                    border: "1.5px solid #d0e8e4", flex: "1",
                                }}>
                                    <div style={{ fontSize: "11px", color: "#1a7a6e", fontWeight: "700", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Layout Preview
                                    </div>
                                    <LayoutPreview layout={bus.seat_layout} />
                                </div>
                                <div style={{
                                    background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", borderRadius: "8px",
                                    padding: "14px 18px", textAlign: "center", minWidth: "100px",
                                }}>
                                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: "600", marginBottom: "4px" }}>TOTAL SEATS</div>
                                    <div style={{ color: "#c8ff00", fontSize: "32px", fontWeight: "800" }}>{bus.total_seats}</div>
                                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px" }}>auto-calculated</div>
                                </div>
                            </div>
                        </div>
                        {/* ──────────────────────────────────────────────────── */}

                        {/* Amenities */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Amenities (comma separated)
                            </label>
                            <input name="amenities" placeholder="e.g. WiFi, Water Bottle, Charging Point, Blanket" value={bus.amenities} onChange={changeHandler} style={inputStyle} />
                        </div>

                        {/* Image Upload */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{...labelStyle, display: "flex", alignItems: "center", gap: "4px"}}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                Bus Photos (You can select multiple files)
                            </label>
                            <input type="file" multiple accept="image/*" onChange={fileHandler}
                                style={{ ...inputStyle, padding: "8px", cursor: "pointer" }} />
                            
                            {previews.length > 0 && (
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", border: "2px solid #d0e8e4", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                                    {previews.map((src, i) => (
                                        <img key={i} src={src} alt="preview" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button type="submit" disabled={loading}
                                style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    {loading ? "Adding..." : "Add Bus"}
                                </span>
                            </button>
                            <button type="button" onClick={() => navigate("/admin/buses")}
                                style={{ padding: "13px 24px", background: "#eee", color: "#333", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AddBus;
