// AdminLogin.jsx - Dedicated Admin Login Page
// Separate from user login — dark admin-themed UI
// Same axios.post + localStorage pattern as internship Login.jsx

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function AdminLogin() {

    const navigate = useNavigate();

    const [creds, setCreds] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // changeHandler - same spread pattern as internship
    const changeHandler = (e) => {
        setCreds({ ...creds, [e.target.name]: e.target.value });
        setError("");
    };

    // submitHandler - same axios.post pattern as internship Login.jsx
    const submitHandler = async (e) => {
        e.preventDefault();

        if (!creds.email || !creds.password) {
            setError("Please enter email and password");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${API_URL}/login`, creds);

            if (res.data.flag > 0) {

                // Check if user is actually admin
                if (res.data.role !== "admin") {
                    setError("Access Denied. You are not an admin.");
                    return;
                }

                // Save to localStorage - same as internship Login.jsx
                localStorage.setItem("u_id",    res.data.uid);
                localStorage.setItem("u_name",  res.data.uname);
                localStorage.setItem("u_email", res.data.umail);
                localStorage.setItem("role",    res.data.role);
                localStorage.setItem("isAdmin", "true");

                sessionStorage.setItem("userid",    res.data.uid);
                sessionStorage.setItem("useremail", res.data.umail);

                navigate("/admin");   // Go to admin dashboard

            } else {
                setError(res.data.message);
            }

        } catch (err) {
            setError("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #071a17 0%, #0d3d35 50%, #1a5c51 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "'Poppins', sans-serif"
        }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>

                {/* Logo + Title */}
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <img src="/logo.png" alt="Kore Travels" style={{ height: "70px", marginBottom: "14px" }} />
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.28)", borderRadius: "20px", padding: "5px 16px", marginBottom: "10px" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8ff00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span style={{ color: "#c8ff00", fontSize: "11px", fontWeight: "700", letterSpacing: "2px" }}>ADMIN ACCESS</span>
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", margin: 0 }}>Admin Portal</h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "5px" }}>Kore Travels Management System</p>
                </div>

                {/* Login Card */}
                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(200,255,0,0.2)",
                    borderRadius: "16px",
                    padding: "32px",
                    backdropFilter: "blur(10px)"
                }}>

                    <form onSubmit={submitHandler}>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: "rgba(229,57,53,0.15)", border: "1px solid rgba(229,57,53,0.4)",
                                borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
                                color: "#ff6b6b", fontSize: "13px", fontWeight: "500"
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Email Field */}
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", color: "rgba(200,255,0,0.8)", fontWeight: "600", marginBottom: "7px", fontSize: "13px" }}>
                                Admin Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@koretravels.com"
                                value={creds.email}
                                onChange={changeHandler}
                                style={{
                                    width: "100%", padding: "12px 16px",
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(200,255,0,0.25)",
                                    borderRadius: "9px", color: "#fff",
                                    fontSize: "14px", outline: "none",
                                    fontFamily: "Poppins,sans-serif",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", color: "rgba(200,255,0,0.8)", fontWeight: "600", marginBottom: "7px", fontSize: "13px" }}>
                                Admin Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter admin password"
                                value={creds.password}
                                onChange={changeHandler}
                                style={{
                                    width: "100%", padding: "12px 16px",
                                    background: "rgba(255,255,255,0.08)",
                                    border: "1px solid rgba(200,255,0,0.25)",
                                    borderRadius: "9px", color: "#fff",
                                    fontSize: "14px", outline: "none",
                                    fontFamily: "Poppins,sans-serif",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%", padding: "13px",
                                background: loading ? "#5a7a50" : "linear-gradient(135deg, #c8ff00, #a0d400)",
                                color: "#0d3d35", border: "none",
                                borderRadius: "9px", fontWeight: "700",
                                fontSize: "15px", cursor: loading ? "not-allowed" : "pointer",
                                transition: "opacity 0.2s",
                                fontFamily: "Poppins,sans-serif"
                            }}
                        >
                            {loading ? "Verifying..." : "Sign In to Admin"}
                        </button>

                    </form>

                    {/* Back to site */}
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Link to="/login" style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textDecoration: "none" }}>
                            ← Back to Customer Login
                        </Link>
                    </div>

                </div>


                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "11px", marginTop: "20px" }}>
                    © 2026 Kore Travels Booking — Admin Portal
                </p>

            </div>
        </div>
    );
}

export default AdminLogin;
