import API_URL from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => { loadBanners(); }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/banners`);
            setBanners(res.data);
        } catch (err) { alert("Error loading banners: " + err.message); }
        finally { setLoading(false); }
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) { alert("Please select an image!"); return; }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("banner_image", file);
            fd.append("title", title);
            await axios.post(`${API_URL}/admin/banners`, fd);
            setTitle(""); setFile(null); setPreview(null);
            document.getElementById("banner-file-input").value = "";
            await loadBanners();
        } catch (err) { alert("Upload failed: " + err.message); }
        finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try {
            await axios.delete(`${API_URL}/admin/banners/${id}`);
            await loadBanners();
        } catch (err) { alert("Delete failed: " + err.message); }
    };

    const handleEdit = async (id, currentTitle) => {
        const newTitle = window.prompt("Enter new caption/title:", currentTitle || "");
        if (newTitle === null) return; // User cancelled
        try {
            await axios.put(`${API_URL}/admin/banners/${id}`, { title: newTitle });
            await loadBanners();
        } catch (err) { alert("Edit failed: " + err.message); }
    };

    return (
        <AdminLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h2 style={{ color: "#0d3d35", fontSize: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    Manage Banners
                </h2>
                <span style={{ background: "#e0f2f1", color: "#0d7a6f", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {banners.length} Banner{banners.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Upload Card */}
            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 3px 12px rgba(0,0,0,0.07)", padding: "24px 26px", marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#062f29", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Upload New Banner
                </div>
                <form onSubmit={handleUpload}>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={{ flex: "1", minWidth: 200 }}>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                                Caption / Title (optional)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Summer Sale — 20% Off"
                                style={{
                                    width: "100%", padding: "11px 14px",
                                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                                    fontSize: 14, outline: "none", fontFamily: "inherit",
                                }}
                            />
                        </div>
                        <div style={{ flex: "2", minWidth: 240 }}>
                            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                                Banner Image * &nbsp;<span style={{ fontWeight: 500, textTransform: "none", color: "#94a3b8", letterSpacing: 0 }}>(JPG, JPEG, PNG, WebP, GIF)</span>
                            </label>
                            <input
                                id="banner-file-input"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleFile}
                                style={{
                                    width: "100%", padding: "9px 14px",
                                    border: "1.5px dashed #cbd5e1", borderRadius: 10,
                                    fontSize: 13, cursor: "pointer", background: "#f8fafc",
                                }}
                            />
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>
                                ✓ Supports: JPEG / JPG, PNG, WebP, GIF &nbsp;—&nbsp;
                                <span style={{ color: "#0d7a6f", fontWeight: 700 }}>Recommended: 1200×400px (3:1 ratio, landscape)</span>
                            </div>
                        </div>
                        <button type="submit" disabled={uploading} style={{
                            padding: "11px 28px", background: uploading ? "#94a3b8" : "linear-gradient(135deg, #0d7a6f, #062f29)",
                            color: "#c8ff00", border: "none", borderRadius: 10,
                            fontWeight: 800, fontSize: 14, cursor: uploading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(13,122,111,0.3)",
                        }}>
                            {uploading ? "Uploading..." : "Upload Banner"}
                        </button>
                    </div>

                    {/* Image Preview */}
                    {preview && (
                        <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: "1.5px solid #e2e8f0", background: "#0d1f1d", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
                            <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} />
                        </div>
                    )}
                </form>
            </div>

            {/* Banners Grid */}
            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: 40 }}>Loading banners...</p>
            ) : banners.length === 0 ? (
                <div style={{ background: "#fff", borderRadius: 14, padding: "60px 20px", textAlign: "center", boxShadow: "0 3px 12px rgba(0,0,0,0.07)" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 14px" }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <p style={{ color: "#94a3b8", fontWeight: 600 }}>No banners uploaded yet. Upload your first banner above!</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                    {banners.map((b, i) => (
                        <div key={b.id} style={{
                            background: "#fff", borderRadius: 14, overflow: "hidden",
                            boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
                            border: "1.5px solid #f1f5f9",
                            transition: "box-shadow 0.2s",
                        }}
                            onMouseOver={e => e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.12)"}
                            onMouseOut={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.07)"}
                        >
                            <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <img
                                    src={b.image_filename}
                                    alt={b.title || "Banner"}
                                    style={{ maxWidth: "100%", maxHeight: "180px", objectFit: "contain", display: "block" }}
                                />
                                <div style={{
                                    position: "absolute", top: 10, left: 10,
                                    background: "rgba(6,47,41,0.85)", color: "#c8ff00",
                                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                                }}>
                                    #{i + 1}
                                </div>
                            </div>
                            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                <div style={{ overflow: "hidden", flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {b.title || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No caption</span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {b.image_filename}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => handleEdit(b.id, b.title)} style={{
                                        background: "#f8fafc", border: "1px solid #cbd5e1",
                                        color: "#475569", borderRadius: 8, padding: "6px 10px",
                                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                                        display: "flex", alignItems: "center", gap: 5,
                                        transition: "all 0.15s",
                                    }}
                                        onMouseOver={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
                                        onMouseOut={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#475569"; }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} style={{
                                        background: "#fff5f5", border: "1px solid #fecaca",
                                        color: "#dc2626", borderRadius: 8, padding: "6px 10px",
                                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                                        display: "flex", alignItems: "center", gap: 5,
                                        transition: "all 0.15s",
                                    }}
                                        onMouseOver={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                                        onMouseOut={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#dc2626"; }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6 M14 11v6"/></svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminBanners;
