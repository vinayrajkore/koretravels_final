import API_URL from "../api";
// EditBus.jsx - Admin Edit Bus Form
// Same useParams + useEffect + axios.get + axios.put pattern as EditUser.jsx internship

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useToast } from "./Toast";

// ── Seat layout configs (same as AddBus.jsx) ──────────────────
const LAYOUT_CONFIG = {
    "2+2 Seater":         { seats: 40, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>, desc: "40 chair seats — 2+2 per row, single deck" },
    "2+1 Seater":         { seats: 30, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>, desc: "30 chair seats — 2+1 per row, single deck" },
    "Semi-Sleeper (2+1)": { seats: 60, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>, desc: "60 seats — lower seater chairs + upper sleeper berths (2+1)" },
    "Full Sleeper":       { seats: 60, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>, desc: "60 seats — lower single berths + chairs, upper single + double berths" },
    "2+1 AC Sleeper":     { seats: 30, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>, desc: "30 berths — 5 rows lower/upper, 2+1 layout" },
    "Non A/C Seater / Sleeper (2+1)": { seats: 48, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>, desc: "48 seats — 33 lower chairs, 15 upper berths" },
    "NON A/C Seater (2+2)": { seats: 48, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>, desc: "48 seats — 12 rows, 2+2 layout with 5 back seats" },
    "A/C Seater / Sleeper (2+1)": { seats: 43, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>, desc: "43 seats — 5 lower berths + 23 chairs, 15 upper berths" },
};

// ── Mini Layout Preview ─────────────────────────────────────
function LayoutPreview({ layout }) {
    const S = { bg: "#e8f5f2", border: "#1a7a6e" };
    const B = { bg: "#f3e8ff", border: "#7c3aed" };
    const D = { bg: "#fff0f3", border: "#e11d48" };
    const Cell = ({ w=22, h=22, c=S }) => <div style={{ width:w, height:h, borderRadius:4, background:c.bg, border:`2px solid ${c.border}`, flexShrink:0 }} />;
    const Aisle = () => <div style={{ width:8 }} />;
    const Row = ({ children }) => <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:3 }}>{children}</div>;
    const DL = ({ t, c="#1a7a6e" }) => <div style={{ fontSize:9, color:c, fontWeight:700, marginBottom:4, textAlign:"center" }}>{t}</div>;

    if (layout === "2+2 Seater") return <div>{[1,2,3].map(r=><Row key={r}><Cell/><Cell/><Aisle/><Cell/><Cell/></Row>)}<div style={{fontSize:9,color:"#888",marginTop:4,textAlign:"center"}}>10 rows × 4 = 40 seats</div></div>;
    if (layout === "2+1 Seater") return <div>{[1,2,3].map(r=><Row key={r}><Cell/><Cell/><Aisle/><Cell/></Row>)}<div style={{fontSize:9,color:"#888",marginTop:4,textAlign:"center"}}>10 rows × 3 = 30 seats</div></div>;
    if (layout === "Semi-Sleeper (2+1)") return <div style={{display:"flex",gap:12}}><div><DL t="Lower-Seater"/>{[1,2,3].map(r=><Row key={r}><Cell/><Cell/><Aisle/><Cell/></Row>)}</div><div style={{width:1,background:"#eee"}}/><div><DL t="Upper-Sleeper" c="#7c3aed"/>{[1,2,3].map(r=><Row key={r}><Cell h={28} c={B}/><Cell h={28} c={B}/><Aisle/><Cell h={28} c={B}/></Row>)}</div></div>;
    if (layout === "Full Sleeper") return <div style={{display:"flex",gap:12}}><div><DL t="Lower"/>{[1,2,3].map(r=><Row key={r}><Cell h={28} c={B}/><Aisle/><Cell/><Cell/></Row>)}</div><div style={{width:1,background:"#eee"}}/><div><DL t="Upper" c="#e11d48"/>{[1,2,3].map(r=><Row key={r}><Cell h={28} c={B}/><Aisle/><Cell w={19} h={28} c={D}/><Cell w={19} h={28} c={D}/></Row>)}</div></div>;
    if (layout === "2+1 AC Sleeper") return <div style={{display:"flex",gap:12}}><div><DL t="Lower"/>{[1,2,3].map(r=><Row key={r}><Cell h={28} c={B}/><Aisle/><div style={{display:"flex",gap:2}}><Cell w={19} h={28} c={B}/><Cell w={19} h={28} c={B}/></div></Row>)}</div><div style={{width:1,background:"#eee"}}/><div><DL t="Upper" c="#e11d48"/>{[1,2,3].map(r=><Row key={r}><Cell h={28} c={B}/><Aisle/><div style={{display:"flex",gap:2}}><Cell w={19} h={28} c={B}/><Cell w={19} h={28} c={B}/></div></Row>)}</div></div>;
    if (layout === "Non A/C Seater / Sleeper (2+1)") return <div style={{display:"flex",gap:12}}><div><DL t="Lower"/><Row><Cell c={S}/><Aisle/><Cell c={S}/><Cell c={S}/></Row></div><div style={{width:1,background:"#eee"}}/><div><DL t="Upper" c="#e11d48"/><Row><Cell h={28} c={B}/><Aisle/><div style={{display:"flex",gap:2}}><Cell w={19} h={28} c={B}/><Cell w={19} h={28} c={B}/></div></Row></div></div>;
    if (layout === "NON A/C Seater (2+2)") return <div>{[1,2,3].map(r=><Row key={r}><Cell/><Cell/><Aisle/><Cell/><Cell/></Row>)}<div style={{fontSize:9,color:"#888",marginTop:4,textAlign:"center"}}>11 rows × 4 + 5 back = 48 seats</div></div>;
    if (layout === "A/C Seater / Sleeper (2+1)") return <div style={{display:"flex",gap:12}}><div><DL t="Lower"/><Row><Cell h={40} c={B}/><Aisle/><div style={{display:"flex",flexDirection:"column",gap:2}}><div style={{display:"flex",gap:2}}><Cell c={S}/><Cell c={S}/></div><div style={{display:"flex",gap:2}}><Cell c={S}/><Cell c={S}/></div></div></Row></div><div style={{width:1,background:"#eee"}}/><div><DL t="Upper" c="#e11d48"/><Row><Cell h={28} c={B}/><Aisle/><div style={{display:"flex",gap:2}}><Cell w={19} h={28} c={B}/><Cell w={19} h={28} c={B}/></div></Row></div></div>;
    return null;
}

function EditBus() {

    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    // useState - same as EditUser.jsx pattern
    const [bus, setBus] = useState({
        bus_name: "", bus_number: "", from_city: "", to_city: "",
        depart: "",
        arrive: "", duration: "", travel_date: "", total_seats: 40,
        price: "", type: "AC", rating: "0.0", photos: "", amenities: "", status: "active",
        seat_layout: "2+2 Seater"
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

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

    // useEffect load bus data - same as EditUser.jsx internship
    useEffect(() => {
        getBus();
    }, []);

    const getBus = async () => {
        try {
            const res = await axios.get(`${API_URL}/bus/${id}`);
            const b = res.data;
            setBus({
                bus_name: b.bus_name || "", bus_number: b.bus_number || "",
                from_city: b.from_city || "", to_city: b.to_city || "",
                depart: b.depart || "", arrive: b.arrive || "",
                duration: b.duration || "", travel_date: b.travel_date || "",
                total_seats: b.total_seats || 40,
                price: b.price || "", type: b.type || "AC", rating: b.rating || "0.0",
                photos: b.photos || "",
                amenities: b.amenities || "", status: b.status || "active",
                seat_layout: b.seat_layout || "2+2 Seater"
            });

            // Parse existing pickup/drop points (handle both old string-arrays and new object-arrays)
            const parsePoints = (raw) => {
                if (!raw) return [];
                try {
                    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
                    return arr.map(p => typeof p === "string" ? { name: p, time: "" } : p);
                } catch { return []; }
            };
            setPickupPoints(parsePoints(b.pickup_points));
            setDropPoints(parsePoints(b.drop_points));

            setOldImage(b.bus_image);
        } catch (err) { toast.error("Could not load bus: " + err.message, "Error"); }
        finally { setFetching(false); }
    };

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setBus({ ...bus, [name]: value });
    };

    const fileHandler = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };

    // submitHandler - same axios.put pattern as internship EditUser.jsx
    const submitHandler = async (e) => {
        e.preventDefault();
        if (!bus.bus_name.trim() || !bus.bus_number.trim() || !bus.from_city || !bus.to_city || !bus.price) {
            toast.warning("Please fill all required fields", "Missing Fields");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            Object.entries(bus).forEach(([k, v]) => formData.append(k, v));
            formData.append("pickup_points", JSON.stringify(pickupPoints));
            formData.append("drop_points", JSON.stringify(dropPoints));
            
            selectedFiles.forEach(file => {
                formData.append("bus_images", file);
            });

            await axios.put(`${API_URL}/editbus/${id}`, formData);
            toast.success("Bus Updated Successfully", "Success");
            navigate("/admin/buses");
        } catch (err) {
            toast.error("Error: " + err.message, "Update Failed");
        } finally {
            setLoading(false);
        }
    };

    const cities = ["Village", "Pune", "Mumbai"];
    const inputStyle = { width: "100%", padding: "10px 14px", border: "2px solid #d0e8e4", borderRadius: "8px", fontSize: "14px", background: "#fff", color: "#222", outline: "none", fontFamily: "Poppins,sans-serif" };
    const labelStyle = { display: "block", fontWeight: "600", color: "#1a7a6e", marginBottom: "6px", fontSize: "13px" };

    const parsePhotos = (raw) => {
        if (!raw) return [];
        try {
            return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch { return []; }
    };
    const busPhotos = parsePhotos(bus.photos);

    if (fetching) return (
        <AdminLayout>
            <p style={{ textAlign: "center", color: "#888", padding: "60px" }}>Loading bus data...</p>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div style={{ maxWidth: "800px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit Bus
                    </h2>
                    <button onClick={() => navigate("/admin/buses")}
                        style={{ padding: "8px 16px", background: "#eee", color: "#333", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px" }}>
                        ← Back to Buses
                    </button>
                </div>

                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>

                    <div style={{ background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", padding: "16px 22px" }}>
                        <h3 style={{ color: "#c8ff00", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Editing: {bus.bus_name} ({bus.bus_number})
                        </h3>
                    </div>

                    <form onSubmit={submitHandler} style={{ padding: "24px" }}>

                        {/* Bus Name + Number */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>Bus Name *</label>
                                <input name="bus_name" value={bus.bus_name} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Bus Number *</label>
                                <input name="bus_number" value={bus.bus_number} onChange={changeHandler} style={inputStyle} />
                            </div>
                        </div>

                        {/* From + To */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>From City *</label>
                                <input list="cities_list" name="from_city" value={bus.from_city} onChange={changeHandler} style={inputStyle} placeholder="Type or select city" />
                            </div>
                            <div>
                                <label style={labelStyle}>To City *</label>
                                <input list="cities_list" name="to_city" value={bus.to_city} onChange={changeHandler} style={inputStyle} placeholder="Type or select city" />
                            </div>
                            <datalist id="cities_list">
                                {cities.map(c => <option key={c} value={c}>{c}</option>)}
                            </datalist>
                        </div>

                        {/* Pickup + Drop Points (Dynamic Tables) */}
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

                        {/* Times & Duration */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>Departure Time</label>
                                <input type="time" name="depart" value={bus.depart} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Arrival Time</label>
                                <input type="time" name="arrive" value={bus.arrive} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Duration</label>
                                <input name="duration" value={bus.duration} onChange={changeHandler} style={inputStyle} />
                            </div>
                        </div>

                        {/* Date + Price + Type + Rating + Seats + Status */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>Date</label>
                                <input type="date" name="travel_date" value={bus.travel_date} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Price ₹</label>
                                <input type="number" name="price" value={bus.price} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Type</label>
                                <input name="type" value={bus.type} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Rating</label>
                                <input type="number" step="0.1" name="rating" value={bus.rating} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Seats</label>
                                <input type="number" name="total_seats" value={bus.total_seats} onChange={changeHandler} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select name="status" value={bus.status} onChange={changeHandler} style={inputStyle}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Photos text input removed, handled by bus_images file upload */}

                        {/* ── SEAT LAYOUT SELECTOR ─────────────────────────── */}
                        <div style={{ background: "#f0f8f6", borderRadius: "10px", padding: "16px", marginBottom: "16px", border: "2px solid #c8ff00" }}>
                            <label style={{ ...labelStyle, fontSize: "14px", color: "#0d3d35", marginBottom: "10px" }}>Seat Layout Selection</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                                {Object.entries(LAYOUT_CONFIG).map(([key, cfg]) => (
                                    <label key={key} style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        padding: "10px 12px", borderRadius: "7px", cursor: "pointer",
                                        border: bus.seat_layout === key ? "2px solid #1a7a6e" : "2px solid #d0e8e4",
                                        background: bus.seat_layout === key ? "#e8f5f2" : "#fff",
                                        transition: "all 0.15s",
                                    }}>
                                        <input type="radio" name="seat_layout" value={key}
                                            checked={bus.seat_layout === key} onChange={changeHandler}
                                            style={{ accentColor: "#1a7a6e", width: "16px", height: "16px" }} />
                                        <div>
                                            <div style={{ fontWeight: "700", color: "#0d3d35", fontSize: "12px", display: "flex", alignItems: "center", gap: 5 }}>{cfg.icon} {key}</div>
                                            <div style={{ fontSize: "10px", color: "#888" }}>{cfg.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{ background: "#fff", borderRadius: "8px", padding: "12px", border: "1.5px solid #d0e8e4", flex: 1 }}>
                                    <div style={{ fontSize: "10px", color: "#1a7a6e", fontWeight: "700", marginBottom: "8px" }}>LAYOUT PREVIEW</div>
                                    <LayoutPreview layout={bus.seat_layout} />
                                </div>
                                <div style={{ background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", borderRadius: "8px", padding: "12px 16px", textAlign: "center", minWidth: "90px" }}>
                                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: "600", marginBottom: "2px" }}>TOTAL SEATS</div>
                                    <div style={{ color: "#c8ff00", fontSize: "28px", fontWeight: "800" }}>{LAYOUT_CONFIG[bus.seat_layout]?.seats || bus.total_seats}</div>
                                </div>
                            </div>
                        </div>
                        {/* ──────────────────────────────────────────────────── */}

                        {/* Amenities */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={labelStyle}>Amenities (Comma-separated)</label>
                            <input name="amenities" value={bus.amenities} onChange={changeHandler} style={inputStyle} placeholder="WiFi, Water Bottle, Charging Point..." />
                        </div>

                        {/* Image */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={labelStyle}>Bus Photos Upload (Select Multiple)</label>
                            
                            {/* Show old JSON array of photos if we have them and no new files are selected */}
                            {busPhotos.length > 0 && previews.length === 0 ? (
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>Current image(s):</div>
                                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", border: "2px solid #d0e8e4", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                                        {busPhotos.map((src, i) => (
                                            <img key={i} src={src} alt="current"
                                                style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                                        ))}
                                    </div>
                                </div>
                            ) : oldImage && previews.length === 0 ? (
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>Current image(s):</div>
                                    <img src={oldImage} alt="current"
                                        style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "2px solid #d0e8e4" }} />
                                </div>
                            ) : null}

                            <input type="file" multiple accept="image/*" onChange={fileHandler} style={{ ...inputStyle, padding: "8px", cursor: "pointer" }} />
                            
                            {previews.length > 0 && (
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", border: "2px solid #c8ff00", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                                    {previews.map((src, i) => (
                                        <img key={i} src={src} alt="new" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button type="submit" disabled={loading}
                                style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                            <button type="button" onClick={() => navigate("/admin/buses")}
                                style={{ padding: "13px 24px", background: "#eee", color: "#333", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default EditBus;
