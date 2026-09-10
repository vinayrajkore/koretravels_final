// AdminProtectRoute.jsx - Admin Authentication Guard with 5-min auto-logout
// Checks localStorage for admin role. Auto-logs out after 5 minutes of inactivity.

import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAutoLogout } from "../hooks/useAutoLogout";

function AdminWarningBanner({ show }) {
    if (!show) return null;
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
            background: "linear-gradient(90deg, #b45309, #d97706)",
            color: "#fff", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
            padding: "10px 16px", fontSize: 14, fontWeight: 600,
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            animation: "slideDown 0.3s ease",
        }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>You will be automatically logged out due to inactivity in <strong>1 minute</strong>. Move your mouse or press any key to stay logged in.</span>
        </div>
    );
}

function AdminProtectRoute({ children }) {
    const isAdmin = localStorage.getItem("isAdmin");
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        navigate("/admin-login", { replace: true });
    }, [navigate]);

    const handleWarn = useCallback(() => {
        setShowWarning(true);
        const hide = () => setShowWarning(false);
        window.addEventListener("mousemove", hide, { once: true, passive: true });
        window.addEventListener("keydown",   hide, { once: true, passive: true });
    }, []);

    useAutoLogout(isAdmin === "true", handleLogout, handleWarn);

    if (isAdmin !== "true") return <Navigate to="/admin-login" replace />;

    return (
        <>
            <AdminWarningBanner show={showWarning} />
            {children}
        </>
    );
}

export default AdminProtectRoute;
