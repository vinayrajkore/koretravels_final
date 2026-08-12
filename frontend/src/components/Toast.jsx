// Toast.jsx - Premium animated toast notification system
// Usage:
//   import { useToast, ToastContainer } from "./Toast";
//   const toast = useToast();
//   toast.success("Logged in successfully!");
//   toast.error("Something went wrong.");
//   toast.info("Redirecting...");
//   toast.warning("Session expiring soon.");
//   <ToastContainer />  ← place once in your component tree

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

const ICONS = {
    success: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    ),
    error: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    warning: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

const THEMES = {
    success: {
        bg: "linear-gradient(135deg, #052e16 0%, #14532d 100%)",
        border: "rgba(34,197,94,0.4)",
        iconColor: "#4ade80",
        bar: "#22c55e",
        title: "#86efac",
    },
    error: {
        bg: "linear-gradient(135deg, #1c0a0a 0%, #450a0a 100%)",
        border: "rgba(239,68,68,0.4)",
        iconColor: "#f87171",
        bar: "#ef4444",
        title: "#fca5a5",
    },
    warning: {
        bg: "linear-gradient(135deg, #1c1202 0%, #451a03 100%)",
        border: "rgba(251,191,36,0.4)",
        iconColor: "#fbbf24",
        bar: "#f59e0b",
        title: "#fcd34d",
    },
    info: {
        bg: "linear-gradient(135deg, #0a1628 0%, #0c2044 100%)",
        border: "rgba(59,130,246,0.4)",
        iconColor: "#60a5fa",
        bar: "#3b82f6",
        title: "#93c5fd",
    },
};

let toastId = 0;

function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const theme = THEMES[toast.type] || THEMES.info;
    const duration = toast.duration || 4000;

    useEffect(() => {
        // Mount animation
        const t1 = setTimeout(() => setVisible(true), 20);
        // Auto-remove
        const t2 = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => onRemove(toast.id), 350);
        }, duration);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleClose = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 350);
    };

    return (
        <div style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            minWidth: 320,
            maxWidth: 420,
            padding: "16px 18px 20px",
            borderRadius: 16,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
            overflow: "hidden",
            cursor: "pointer",
            transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.95)",
            opacity: visible && !leaving ? 1 : 0,
        }}
            onClick={handleClose}
            title="Click to dismiss"
        >
            {/* Animated progress bar */}
            <div style={{
                position: "absolute",
                bottom: 0, left: 0,
                height: 3,
                background: theme.bar,
                borderRadius: "0 0 0 16px",
                width: "100%",
                transformOrigin: "left",
                animation: `ktToastBar ${duration}ms linear forwards`,
            }} />

            {/* Icon */}
            <div style={{
                flexShrink: 0,
                color: theme.iconColor,
                marginTop: 1,
                filter: `drop-shadow(0 0 6px ${theme.iconColor}60)`,
            }}>
                {ICONS[toast.type]}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                    <div style={{
                        color: theme.title,
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 3,
                        letterSpacing: "0.2px",
                    }}>
                        {toast.title}
                    </div>
                )}
                <div style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                }}>
                    {toast.message}
                </div>
            </div>

            {/* Close ✕ */}
            <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    padding: "2px 4px",
                    fontSize: 18,
                    lineHeight: 1,
                    borderRadius: 4,
                    transition: "color 0.2s",
                }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
            >
                ×
            </button>

            <style>{`
                @keyframes ktToastBar {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type, title, message, duration }) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (message, title = "Success", duration) => addToast({ type: "success", title, message, duration }),
        error:   (message, title = "Error",   duration) => addToast({ type: "error",   title, message, duration }),
        warning: (message, title = "Warning", duration) => addToast({ type: "warning", title, message, duration }),
        info:    (message, title = "Info",    duration) => addToast({ type: "info",    title, message, duration }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div style={{
                position: "fixed",
                top: 20,
                right: 20,
                zIndex: 999999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                pointerEvents: "none",
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: "all" }}>
                        <ToastItem toast={t} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
