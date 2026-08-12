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
            background: "linear-gradient(90deg, #7c3aed, #6d28d9)",
            color: "#fff", textAlign: "center",
            padding: "10px 16px", fontSize: 14, fontWeight: 600,
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            animation: "slideDown 0.3s ease",
        }}>
            🔐 Admin session expiring in <strong>1 minute</strong> due to inactivity. Move mouse or press any key to stay active.
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
