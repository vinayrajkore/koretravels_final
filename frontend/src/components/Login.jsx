// Login.jsx - User Login Form with Forgot Password modal
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import LoadingOverlay from "./LoadingOverlay";
import { useToast } from "./Toast";

function Login() {
    const navigate = useNavigate();
    const toast = useToast();

    // ── Login state ─────────────────────────────────────────
    const [user, setUser] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ── Forgot Password state ────────────────────────────────
    const [showForgot, setShowForgot] = useState(false);
    const [fpData, setFpData] = useState({ name: "", phone: "", email: "" });
    const [fpErrors, setFpErrors] = useState({});
    const [fpLoading, setFpLoading] = useState(false);
    const [fpSuccess, setFpSuccess] = useState(false);

    // ── Login handlers ───────────────────────────────────────
    const changeHandler = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const validate = () => {
        let newErrors = {};
        if (user.email.trim() === "") newErrors.email = "Email Is Required";
        if (user.password === "") newErrors.password = "Password Is Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                setLoading(true);
                const response = await axios.post(`${API_URL}/login`, user);
                if (response.data.flag > 0) {
                    localStorage.setItem("u_id",    response.data.uid);
                    localStorage.setItem("u_name",  response.data.uname);
                    localStorage.setItem("u_email", response.data.umail);
                    localStorage.setItem("role",    response.data.role);
                    const isAdmin = response.data.role === "admin";
                    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
                    sessionStorage.setItem("userid",    response.data.uid);
                    sessionStorage.setItem("useremail", response.data.umail);
                    toast.success(`Welcome back, ${response.data.uname}! Redirecting...`, "Logged In Successfully 🎉", 3000);
                    setTimeout(() => { navigate(isAdmin ? "/admin" : "/"); }, 1200);
                } else {
                    toast.error(response.data.message, "Login Failed");
                }
            } catch (err) {
                toast.error("Unable to connect. Please try again.", "Connection Error");
            } finally {
                setLoading(false);
            }
        }
    };

    // ── Forgot Password handlers ─────────────────────────────
    const fpChangeHandler = (e) => {
        const { name, value } = e.target;
        setFpData({ ...fpData, [name]: value });
        setFpErrors({ ...fpErrors, [name]: "" });
    };

    const fpValidate = () => {
        let errs = {};
        if (!fpData.name.trim())  errs.name  = "Full name is required";
        if (!fpData.phone.trim()) errs.phone = "Mobile number is required";
        else if (!/^\d{10}$/.test(fpData.phone.trim())) errs.phone = "Enter a valid 10-digit mobile number";
        if (!fpData.email.trim()) errs.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(fpData.email)) errs.email = "Enter a valid email address";
        setFpErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const fpSubmitHandler = async (e) => {
        e.preventDefault();
        if (!fpValidate()) return;
        try {
            setFpLoading(true);
            const res = await axios.post(`${API_URL}/forgot-password`, fpData);
            if (res.data.flag === 1) {
                setFpSuccess(true);
            } else {
                setFpErrors({ form: res.data.message });
            }
        } catch (err) {
            setFpErrors({ form: "Unable to connect. Please try again." });
        } finally {
            setFpLoading(false);
        }
    };

    const closeForgot = () => {
        setShowForgot(false);
        setFpData({ name: "", phone: "", email: "" });
        setFpErrors({});
        setFpSuccess(false);
    };

    // ── Styles ───────────────────────────────────────────────
    const inputStyle = {
        width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db",
        borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s",
        fontFamily: "inherit"
    };
    const labelStyle = { display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, color: "#374151" };
    const errorStyle = { color: "#ef4444", fontSize: 12, marginTop: 4, display: "block" };

    return (
        <>
            <LoadingOverlay show={loading} text="Signing you in..." />

            {/* ── Main Login Card ── */}
            <div style={{
                minHeight: "100vh", display: "flex", justifyContent: "center",
                alignItems: "center", padding: "30px 20px",
                background: "linear-gradient(150deg, #031a17 0%, #062f29 40%, #0a5a52 100%)",
            }}>
                <div style={{
                    width: "100%", maxWidth: "440px",
                    background: "rgba(255,255,255,0.97)",
                    borderRadius: 24,
                    boxShadow: "0 24px 80px rgba(3,26,23,0.45), 0 0 0 1px rgba(200,255,0,0.08)",
                    overflow: "hidden",
                    backdropFilter: "blur(20px)",
                }}>
                    <div className="kt-card-header" style={{ textAlign: "center", padding: "32px 30px 28px" }}>
                        <div style={{ marginBottom: 14 }}>
                            <img src="/logo.png" alt="Kore Travels" style={{ height: "58px", filter: "drop-shadow(0 0 12px rgba(200,255,0,0.5))" }} />
                        </div>
                        <h2 style={{ marginBottom: 4 }}>Welcome Back</h2>
                        <p>Sign in to your Kore Travels account</p>
                    </div>

                    <div className="kt-card-body">
                        <form onSubmit={submitHandler} className="kt-form">
                            {/* Email */}
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="text" name="email" placeholder="Enter your email"
                                    value={user.email} onChange={changeHandler} />
                                <span className="error-msg">{errors.email}</span>
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder="Enter your password"
                                    value={user.password} onChange={changeHandler} />
                                <span className="error-msg">{errors.password}</span>
                            </div>

                            {/* Forgot Password link */}
                            <div style={{ textAlign: "right", marginTop: -4, marginBottom: 12 }}>
                                <button type="button" onClick={() => setShowForgot(true)} style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "#1a7a6e", fontSize: 13, fontWeight: 600, padding: 0,
                                    textDecoration: "underline", textUnderlineOffset: 3
                                }}>
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn-kt-primary"
                                style={{ width: "100%", padding: "13px", fontSize: "16px", marginTop: "5px" }}
                                disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: "18px", color: "#666", fontSize: "14px" }}>
                            New user?{" "}
                            <Link to="/register" style={{ color: "#1a7a6e", fontWeight: "600" }}>Register here</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Forgot Password Modal ── */}
            {showForgot && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(3,26,23,0.72)", backdropFilter: "blur(6px)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    padding: "20px", animation: "fadeIn 0.2s ease"
                }}>
                    <div style={{
                        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420,
                        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                        animation: "slideUp 0.25s ease",
                        overflow: "hidden"
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
                            padding: "24px 28px 20px", position: "relative"
                        }}>
                            <h3 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 700 }}>
                                🔑 Forgot Password
                            </h3>
                            <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 13 }}>
                                Enter your details and we'll send your password to your email.
                            </p>
                            <button onClick={closeForgot} style={{
                                position: "absolute", top: 16, right: 18,
                                background: "rgba(255,255,255,0.15)", border: "none",
                                borderRadius: "50%", width: 30, height: 30,
                                color: "#fff", fontSize: 16, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontWeight: 700, lineHeight: 1
                            }}>✕</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: "24px 28px 28px" }}>
                            {fpSuccess ? (
                                /* ── Success State ── */
                                <div style={{ textAlign: "center", padding: "10px 0" }}>
                                    <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                                    <h4 style={{ color: "#0d3d35", margin: "0 0 8px", fontSize: 18 }}>
                                        Password Sent!
                                    </h4>
                                    <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: "0 0 22px" }}>
                                        Your password has been sent to <strong>{fpData.email}</strong>.<br />
                                        Please check your inbox (and spam folder).
                                    </p>
                                    <button onClick={closeForgot} style={{
                                        background: "linear-gradient(135deg,#0d3d35,#1a7a6e)",
                                        color: "#fff", border: "none", borderRadius: 8,
                                        padding: "11px 32px", fontSize: 14, fontWeight: 600,
                                        cursor: "pointer", width: "100%"
                                    }}>
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                /* ── Form State ── */
                                <form onSubmit={fpSubmitHandler}>
                                    {/* Global form error */}
                                    {fpErrors.form && (
                                        <div style={{
                                            background: "#fef2f2", border: "1px solid #fecaca",
                                            borderRadius: 8, padding: "10px 14px",
                                            color: "#dc2626", fontSize: 13, marginBottom: 16
                                        }}>
                                            ⚠️ {fpErrors.form}
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={labelStyle}>Full Name</label>
                                        <input
                                            id="fp-name"
                                            type="text"
                                            name="name"
                                            placeholder="Enter your registered name"
                                            value={fpData.name}
                                            onChange={fpChangeHandler}
                                            style={{
                                                ...inputStyle,
                                                borderColor: fpErrors.name ? "#ef4444" : "#d1d5db"
                                            }}
                                        />
                                        {fpErrors.name && <span style={errorStyle}>{fpErrors.name}</span>}
                                    </div>

                                    {/* Mobile Number */}
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={labelStyle}>Mobile Number</label>
                                        <input
                                            id="fp-phone"
                                            type="tel"
                                            name="phone"
                                            placeholder="Enter your 10-digit mobile number"
                                            value={fpData.phone}
                                            onChange={fpChangeHandler}
                                            maxLength={10}
                                            style={{
                                                ...inputStyle,
                                                borderColor: fpErrors.phone ? "#ef4444" : "#d1d5db"
                                            }}
                                        />
                                        {fpErrors.phone && <span style={errorStyle}>{fpErrors.phone}</span>}
                                    </div>

                                    {/* Email */}
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={labelStyle}>Email Address</label>
                                        <input
                                            id="fp-email"
                                            type="email"
                                            name="email"
                                            placeholder="Enter your registered email"
                                            value={fpData.email}
                                            onChange={fpChangeHandler}
                                            style={{
                                                ...inputStyle,
                                                borderColor: fpErrors.email ? "#ef4444" : "#d1d5db"
                                            }}
                                        />
                                        {fpErrors.email && <span style={errorStyle}>{fpErrors.email}</span>}
                                    </div>

                                    {/* Submit */}
                                    <button type="submit" disabled={fpLoading} style={{
                                        width: "100%",
                                        background: fpLoading
                                            ? "#9ca3af"
                                            : "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
                                        color: "#fff", border: "none", borderRadius: 8,
                                        padding: "12px", fontSize: 15, fontWeight: 600,
                                        cursor: fpLoading ? "not-allowed" : "pointer",
                                        transition: "opacity 0.2s"
                                    }}>
                                        {fpLoading ? "Sending..." : "Send My Password 📧"}
                                    </button>

                                    <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#9ca3af" }}>
                                        Remembered it?{" "}
                                        <button type="button" onClick={closeForgot} style={{
                                            background: "none", border: "none", color: "#1a7a6e",
                                            fontWeight: 600, cursor: "pointer", fontSize: 12, padding: 0
                                        }}>Back to Login</button>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Animations ── */}
            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
            `}</style>
        </>
    );
}

export default Login;
