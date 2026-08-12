// Protectroute.jsx - Authentication Guard with 5-min auto-logout
// Checks sessionStorage for login, redirects to /login if not logged in.
// Auto-logs out after 5 minutes of inactivity and shows a warning at 4 minutes.

import { useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAutoLogout } from "../hooks/useAutoLogout";

function SessionWarningBanner({ secondsLeft }) {
    if (secondsLeft === null) return null;
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
            background: "linear-gradient(90deg, #b45309, #d97706)",
            color: "#fff", textAlign: "center",
            padding: "10px 16px", fontSize: 14, fontWeight: 600,
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            animation: "slideDown 0.3s ease",
        }}>
            ⚠️ You will be automatically logged out due to inactivity in{" "}
            <strong>1 minute</strong>. Move your mouse or press any key to stay logged in.
        </div>
    );
}

function ProtectedRoute({ children }) {
    const email = sessionStorage.getItem("useremail");
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);

    const handleLogout = useCallback(() => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    }, [navigate]);

    const handleWarn = useCallback(() => {
        setShowWarning(true);
        // Hide warning when they come back (activity resets timers)
        const hide = () => setShowWarning(false);
        window.addEventListener("mousemove", hide, { once: true, passive: true });
        window.addEventListener("keydown",   hide, { once: true, passive: true });
    }, []);

    useAutoLogout(!!email, handleLogout, handleWarn);

    if (!email) return <Navigate to="/login" replace />;

    return (
        <>
            <SessionWarningBanner secondsLeft={showWarning ? 60 : null} />
            {children}
        </>
    );
}

export default ProtectedRoute;
