// LoadingOverlay.jsx
// Full-screen branded loading overlay with logo, spinner, and animated text.
// Usage: <LoadingOverlay show={loading} text="Signing you in..." />

import React from "react";

const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(3, 26, 23, 0.88)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    animation: "ktFadeIn 0.25s ease",
};

const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(200,255,0,0.15)",
    borderRadius: 24,
    padding: "44px 52px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    animation: "ktScaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

function LoadingOverlay({ show, text = "Please wait..." }) {
    if (!show) return null;

    return (
        <div style={overlayStyle} aria-live="polite" aria-label="Loading">
            <div style={cardStyle}>
                {/* Logo */}
                <img
                    src="/logo.png"
                    alt="Kore Travels"
                    style={{
                        height: 64,
                        filter: "drop-shadow(0 0 20px rgba(200,255,0,0.6))",
                        animation: "ktPulse 1.8s ease-in-out infinite",
                    }}
                />

                {/* Spinner ring */}
                <div style={{ position: "relative", width: 52, height: 52 }}>
                    <div style={{
                        width: 52, height: 52,
                        borderRadius: "50%",
                        border: "3px solid rgba(200,255,0,0.15)",
                        borderTopColor: "#c8ff00",
                        animation: "ktSpin 0.8s linear infinite",
                        position: "absolute",
                        inset: 0,
                    }} />
                    <div style={{
                        width: 36, height: 36,
                        borderRadius: "50%",
                        border: "2px solid rgba(13,122,111,0.3)",
                        borderBottomColor: "#0d7a6f",
                        animation: "ktSpin 1.2s linear infinite reverse",
                        position: "absolute",
                        top: 8, left: 8,
                    }} />
                </div>

                {/* Text */}
                <div style={{ textAlign: "center" }}>
                    <p style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 17,
                        margin: 0,
                        letterSpacing: "0.3px",
                    }}>
                        {text}
                    </p>
                    <p style={{
                        color: "rgba(200,255,0,0.6)",
                        fontSize: 12,
                        marginTop: 6,
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                        animation: "ktDots 1.5s steps(3,end) infinite",
                    }}>
                        Kore Travels
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes ktFadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes ktScaleUp { from { transform: scale(0.85); opacity:0; } to { transform: scale(1); opacity:1; } }
                @keyframes ktSpin    { to { transform: rotate(360deg); } }
                @keyframes ktPulse   {
                    0%, 100% { filter: drop-shadow(0 0 16px rgba(200,255,0,0.5)); transform: scale(1); }
                    50%       { filter: drop-shadow(0 0 28px rgba(200,255,0,0.9)); transform: scale(1.05); }
                }
                @keyframes ktDots {
                    0%   { content: ''; }
                    33%  { content: '.'; }
                    66%  { content: '..'; }
                    100% { content: '...'; }
                }
            `}</style>
        </div>
    );
}

export default LoadingOverlay;
