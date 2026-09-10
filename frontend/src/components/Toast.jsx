// Toast.jsx - Premium toast notification system matching Kore Travels brand
// Brand: Dark teal #062f29 | Accent #c8ff00 | Font: Plus Jakarta Sans
//
// Usage:
//   const toast = useToast();
//   toast.success("Done!", "Title");
//   toast.error("Failed!", "Title");
//   <ToastProvider> wraps the entire app in main.jsx

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

// ── Icons ──────────────────────────────────────────────────────
const IcSuccess = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IcError = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const IcWarning = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IcInfo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

// ── Brand-matched themes ───────────────────────────────────────
// All share the same dark teal base; only accent color changes
const THEMES = {
    success: {
        bg:         "linear-gradient(135deg, #031a17 0%, #062f29 60%, #073d33 100%)",
        border:     "rgba(200, 255, 0, 0.35)",
        iconBg:     "rgba(200, 255, 0, 0.12)",
        iconColor:  "#c8ff00",
        bar:        "#c8ff00",
        titleColor: "#c8ff00",
        label:      "SUCCESS",
        labelColor: "rgba(200, 255, 0, 0.55)",
    },
    error: {
        bg:         "linear-gradient(135deg, #1c0505 0%, #2d0a0a 60%, #3a0d0d 100%)",
        border:     "rgba(239, 68, 68, 0.4)",
        iconBg:     "rgba(239, 68, 68, 0.12)",
        iconColor:  "#f87171",
        bar:        "#ef4444",
        titleColor: "#fca5a5",
        label:      "ERROR",
        labelColor: "rgba(248, 113, 113, 0.6)",
    },
    warning: {
        bg:         "linear-gradient(135deg, #1c1002 0%, #2d1a03 60%, #3a2205 100%)",
        border:     "rgba(251, 191, 36, 0.4)",
        iconBg:     "rgba(251, 191, 36, 0.12)",
        iconColor:  "#fbbf24",
        bar:        "#f59e0b",
        titleColor: "#fcd34d",
        label:      "WARNING",
        labelColor: "rgba(251, 191, 36, 0.6)",
    },
    info: {
        bg:         "linear-gradient(135deg, #031a17 0%, #062f29 60%, #073d33 100%)",
        border:     "rgba(13, 122, 111, 0.5)",
        iconBg:     "rgba(13, 122, 111, 0.15)",
        iconColor:  "#5eead4",
        bar:        "#0d7a6f",
        titleColor: "#99f6e4",
        label:      "INFO",
        labelColor: "rgba(94, 234, 212, 0.5)",
    },
};

const ICONS = { success: <IcSuccess />, error: <IcError />, warning: <IcWarning />, info: <IcInfo /> };

let _id = 0;

// ── Single Toast Card ─────────────────────────────────────────
function ToastCard({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const t = THEMES[toast.type] || THEMES.info;
    const dur = toast.duration || 4500;

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 30);
        const t2 = setTimeout(() => dismiss(), dur);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const dismiss = () => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 380);
    };

    return (
        <div
            onClick={dismiss}
            title="Click to dismiss"
            style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                minWidth: 300,
                maxWidth: 400,
                padding: "14px 16px 18px",
                borderRadius: 14,
                background: t.bg,
                border: `1px solid ${t.border}`,
                boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)`,
                backdropFilter: "blur(16px)",
                cursor: "pointer",
                overflow: "hidden",
                // Slide + fade animation
                transition: "transform 0.38s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
                transform: visible && !leaving ? "translateX(0) scale(1)" : "translateX(120%) scale(0.9)",
                opacity: visible && !leaving ? 1 : 0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {/* Left accent bar */}
            <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: 3,
                background: t.bar,
                borderRadius: "14px 0 0 14px",
            }} />

            {/* Progress bar (bottom) */}
            <div style={{
                position: "absolute",
                bottom: 0, left: 0,
                height: 2,
                background: t.bar,
                opacity: 0.5,
                animation: `ktBar ${dur}ms linear forwards`,
                transformOrigin: "left",
            }} />

            {/* Icon bubble */}
            <div style={{
                flexShrink: 0,
                width: 36, height: 36,
                borderRadius: 10,
                background: t.iconBg,
                border: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.iconColor,
                marginLeft: 6,
            }}>
                {ICONS[toast.type]}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: t.labelColor,
                    marginBottom: 2,
                }}>
                    {t.label}
                </div>
                {toast.title && (
                    <div style={{
                        color: t.titleColor,
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 3,
                        lineHeight: 1.3,
                    }}>
                        {toast.title}
                    </div>
                )}
                <div style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                }}>
                    {toast.message}
                </div>
            </div>

            {/* Close button */}
            <button
                onClick={e => { e.stopPropagation(); dismiss(); }}
                style={{
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    width: 24, height: 24,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    lineHeight: 1,
                    marginTop: 1,
                    transition: "all 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
                ×
            </button>

            <style>{`
                @keyframes ktBar {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}

// ── Context Provider ──────────────────────────────────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const add = useCallback(({ type, title, message, duration }) => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (message, title = "Success", duration) => add({ type: "success", title, message, duration }),
        error:   (message, title = "Error",   duration) => add({ type: "error",   title, message, duration }),
        warning: (message, title = "Warning", duration) => add({ type: "warning", title, message, duration }),
        info:    (message, title = "Info",    duration) => add({ type: "info",    title, message, duration }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div style={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 999999,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                pointerEvents: "none",
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{ pointerEvents: "all" }}>
                        <ToastCard toast={t} onRemove={remove} />
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
