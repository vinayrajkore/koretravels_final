import API_URL from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

// SVG Icons
const IcUsers   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcShield  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcUser    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

function AdminUsers() {
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/allusers`);
            setUsers(res.data);
        } catch (err) { alert("Error: " + err.message); }
        finally { setLoading(false); }
    };

    const deleteUser = async (id, role) => {
        if (role === "admin" && id === 1) {
            alert("Cannot delete the main admin account!");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this user? This will also delete and cancel all of their bookings. This action cannot be undone.")) return;
        
        try {
            await axios.delete(`${API_URL}/admin/users/${id}`);
            alert("User deleted successfully!");
            loadUsers();
        } catch (err) {
            alert("Error deleting user: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <IcUsers /> Registered Users ({users.length})
                </h2>
                <button onClick={loadUsers} style={{ padding: "8px 16px", background: "#1a7a6e", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
                    <IcRefresh /> Refresh
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading users...</p>
            ) : (
                <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="kt-table">
                            <thead>
                                <tr>
                                    <th>#</th><th>Name</th><th>Email</th>
                                    <th>Phone</th><th>Registered On</th><th>Role</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>No users found</td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: "700", color: "#1a7a6e" }}>{u.id}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#1a7a6e,#0d3d35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8ff00", fontWeight: "700", fontSize: "14px" }}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: "600" }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: "#555" }}>{u.email}</td>
                                        <td style={{ color: "#555" }}>{u.phone}</td>
                                        <td style={{ color: "#888", fontSize: "13px" }}>{u.created_date}</td>
                                        <td>
                                            <span style={{
                                                background: u.role === "admin" ? "#c8ff00" : "#e8f5f2",
                                                color: u.role === "admin" ? "#0d3d35" : "#1a7a6e",
                                                padding: "4px 12px", borderRadius: "12px",
                                                fontSize: "12px", fontWeight: "700",
                                                display: "inline-flex", alignItems: "center", gap: 4
                                            }}>
                                                {u.role === "admin" ? <IcShield /> : <IcUser />}
                                                {u.role === "admin" ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td>
                                            {u.id !== 1 && (
                                                <button onClick={() => deleteUser(u.id, u.role)} style={{
                                                    background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626",
                                                    borderRadius: "7px", padding: "6px 12px", cursor: "pointer",
                                                    fontSize: "12px", fontWeight: "700", display: "inline-flex",
                                                    alignItems: "center", gap: 5, transition: "all 0.15s"
                                                }}
                                                    onMouseOver={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#dc2626"; }}
                                                >
                                                    <IcTrash /> Delete
                                                </button>
                                            )}
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

export default AdminUsers;
