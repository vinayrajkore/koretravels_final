import API_URL from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { useToast } from "./Toast";

// SVG Icons
const IcBus    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcSeat   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>;
const IcTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcPlus   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcPin    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcFlag   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IcStar   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

function AdminBuses() {
    const navigate = useNavigate();
    const toast = useToast();
    const [buses, setBuses]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: "" });

    useEffect(() => { loadBuses(); }, []);

    const loadBuses = async () => {
        try {
            const res = await axios.get(`${API_URL}/buses`);
            setBuses(res.data);
        } catch (err) { toast.error("Could not load buses.", "Load Error"); }
        finally { setLoading(false); }
    };

    const deleteBus = (id, name) => {
        setConfirmDelete({ open: true, id, name });
    };

    const doDelete = async () => {
        const { id } = confirmDelete;
        setConfirmDelete({ open: false, id: null, name: "" });
        try {
            const res = await axios.delete(`${API_URL}/deletebus/${id}`);
            toast.success(res.data.message || "Bus deleted.", "Deleted");
            loadBuses();
        } catch (err) { toast.error("Could not delete bus.", "Delete Error"); }
    };

    const typeBadge = (t) => ({
        AC:       { bg: "#e8f5f2", color: "#1a7a6e" },
        "Non-AC": { bg: "#fff3e0", color: "#ff8c00" },
        Sleeper:  { bg: "#f3e5f5", color: "#6a1b9a" }
    }[t] || {});

    const statusBadge = (s) => s === "active"
        ? { bg: "#e8f5e9", color: "#2e7d32", label: "Active" }
        : { bg: "#ffebee", color: "#c62828", label: "Inactive" };

    return (
        <>
        {confirmDelete.open && (
            <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(3,26,23,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ background:"linear-gradient(135deg,#062f29,#0a4a3f)",border:"1px solid rgba(200,255,0,0.2)",borderRadius:18,padding:"28px 30px",minWidth:320,maxWidth:460,boxShadow:"0 24px 60px rgba(0,0,0,0.5)",color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    <h3 style={{ margin:"0 0 8px",color:"#f87171",fontSize:17 }}>Delete Bus?</h3>
                    <p style={{ margin:"0 0 22px",color:"rgba(255,255,255,0.6)",fontSize:13,lineHeight:1.6 }}>Delete <strong style={{color:"#fff"}}>'{confirmDelete.name}'</strong>? This action cannot be undone.</p>
                    <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                        <button onClick={() => setConfirmDelete({ open:false,id:null,name:"" })} style={{ padding:"9px 20px",borderRadius:9,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13,fontWeight:600 }}>Cancel</button>
                        <button onClick={doDelete} style={{ padding:"9px 22px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:800 }}>Yes, Delete</button>
                    </div>
                </div>
            </div>
        )}
        <AdminLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <IcBus /> Manage Buses ({buses.length})
                </h2>
                <button onClick={() => navigate("/admin/addbus")}
                    style={{ padding: "10px 20px", background: "#c8ff00", color: "#0d3d35", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <IcPlus /> Add New Bus
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading buses...</p>
            ) : (
                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="kt-table">
                            <thead>
                                <tr>
                                    <th>Image</th><th>Bus Info</th><th>Route</th>
                                    <th>Pickup → Drop</th><th>Time</th><th>Date</th>
                                    <th>Seats</th><th>Price</th><th>Type</th>
                                    <th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buses.length === 0 ? (
                                    <tr><td colSpan="11" style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>No buses found. Add one!</td></tr>
                                ) : buses.map(bus => {
                                    const tb = typeBadge(bus.bus_type);
                                    const sb = statusBadge(bus.status);
                                    let displayImage = bus.bus_image;
                                    if (!displayImage && bus.photos) {
                                        try {
                                            const photosArr = JSON.parse(bus.photos);
                                            if (photosArr.length > 0) displayImage = photosArr[0];
                                        } catch(e) {}
                                    }
                                    return (
                                        <tr key={bus.id}>
                                            <td>
                                                {displayImage ? (
                                                    <img src={displayImage} alt="bus"
                                                        style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "2px solid #d0e8e4" }} />
                                                ) : (
                                                    <div style={{ width: "60px", height: "40px", background: "#e8f5f2", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a7a6e" }}>
                                                        <IcBus />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: "700", color: "#0d3d35" }}>{bus.bus_name}</div>
                                                <div style={{ fontSize: "12px", color: "#888" }}>#{bus.bus_number}</div>
                                                {bus.amenities && (
                                                    <div style={{ fontSize: "11px", color: "#1a7a6e", marginTop: "2px" }}>
                                                        {bus.amenities.split(",").slice(0,2).join(", ")}{bus.amenities.split(",").length > 2 ? "..." : ""}
                                                    </div>
                                                )}
                                                {bus.rating && (
                                                    <div style={{ fontSize: "11px", color: "#ff8c00", display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}>
                                                        <IcStar /> {bus.rating}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: "600" }}>{bus.from_city}</div>
                                                <div style={{ color: "#1a7a6e" }}>→ {bus.to_city}</div>
                                            </td>
                                            <td style={{ fontSize: "12px", color: "#666", maxWidth: "150px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 3 }}><IcPin /> {bus.pickup_point || "—"}</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 3 }}><IcFlag /> {bus.drop_point || "—"}</div>
                                            </td>
                                            <td style={{ fontSize: "13px" }}>
                                                <div>{bus.departure_time}</div>
                                                <div style={{ color: "#888" }}>→ {bus.arrival_time}</div>
                                            </td>
                                            <td style={{ fontSize: "13px" }}>{bus.travel_date}</td>
                                            <td>
                                                <div style={{ fontWeight: "700" }}>{bus.available_seats}</div>
                                                <div style={{ fontSize: "11px", color: "#888" }}>/ {bus.total_seats}</div>
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#1a7a6e" }}>₹{bus.price}</td>
                                            <td>
                                                <span style={{ background: tb.bg, color: tb.color, padding: "3px 9px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
                                                    {bus.bus_type}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ background: sb.bg, color: sb.color, padding: "3px 9px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
                                                    {sb.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "90px" }}>
                                                    <button onClick={() => navigate(`/admin/editbus/${bus.id}`)}
                                                        style={{ padding: "5px 10px", background: "#1a7a6e", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <IcEdit /> Edit
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/seats?bus_id=${bus.id}&bus_name=${encodeURIComponent(bus.bus_name)}`)}
                                                        style={{ padding: "5px 10px", background: "#6a1b9a", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <IcSeat /> Seats
                                                    </button>
                                                    <button onClick={() => deleteBus(bus.id, bus.bus_name)}
                                                        style={{ padding: "5px 10px", background: "#e53935", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: 4 }}>
                                                        <IcTrash /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
        </>
    );
}

export default AdminBuses;
