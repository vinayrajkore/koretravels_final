// KoreBot.jsx — Kore Travels AI + Bus-Search Chatbot
// Floating widget, two modes: Search & AI (OpenRouter)

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

// ── helpers ──────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

function parseRouteQuery(text) {
    // Attempt to parse "Ajara to Pune on 12 Aug" style queries
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    const toRe  = /from\s+(.+?)\s+to\s+(.+?)(?:\s+on\s+|\s*$)/i;
    const toRe2 = /(.+?)\s+to\s+(.+?)(?:\s+on\s+|\s*$)/i;
    const dateRe = /(?:on\s+)?(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i;
    const isoRe = /(\d{4}-\d{2}-\d{2})/;

    let from_city = null, to_city = null, travel_date = null;

    const mRoute = toRe.exec(text) || toRe2.exec(text);
    if (mRoute) {
        from_city = mRoute[1].trim();
        to_city = mRoute[2].replace(/\s+(on|for)\s+.*/i, "").trim();
    }

    const mIso = isoRe.exec(text);
    if (mIso) {
        travel_date = mIso[1];
    } else {
        const mDate = dateRe.exec(text);
        if (mDate) {
            const day = mDate[1].padStart(2, "0");
            const mon = months[mDate[2].toLowerCase().slice(0,3)];
            const yr = mDate[3] || new Date().getFullYear();
            if (mon) travel_date = `${yr}-${String(mon).padStart(2,"0")}-${day}`;
        }
    }

    if (!from_city || !to_city || !travel_date) return null;
    return { from_city, to_city, travel_date };
}

// ── Icons ────────────────────────────────────────────────────────
const IcSend    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcClose   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcBot     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3a2 2 0 0 1 2 2v4H10V5a2 2 0 0 1 2-2z"/><circle cx="9" cy="16" r="1.2" fill="currentColor"/><circle cx="15" cy="16" r="1.2" fill="currentColor"/><path d="M8 11V9"/><path d="M16 11V9"/></svg>;
const IcSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcSpark   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IcBus     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcSeat    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>;

// ── FloatingKoreBot ──────────────────────────────────────────────
export default function KoreBot() {
    const navigate = useNavigate();
    const [open, setOpen]       = useState(false);
    const [mode, setMode]       = useState("search"); // "search" | "ai"
    const [input, setInput]     = useState("");
    const [messages, setMessages] = useState([
        { role: "bot", type: "welcome",
          text: "👋 Hi! I'm **KoreBot**, your Kore Travels assistant.\n\nAsk me to search buses like:\n*\"Ajara to Pune on 12 Aug\"*\n\nOr switch to **AI Mode** for travel tips!" }
    ]);
    const [aiHistory, setAiHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pulse, setPulse]    = useState(true);
    const msgEnd = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
    useEffect(() => { const t = setTimeout(() => setPulse(false), 4000); return () => clearTimeout(t); }, []);

    const addMsg = (role, text, extra = {}) =>
        setMessages(prev => [...prev, { role, text, ...extra }]);

    const handleSend = async () => {
        const q = input.trim();
        if (!q || loading) return;
        setInput("");
        addMsg("user", q);

        if (mode === "search") {
            const parsed = parseRouteQuery(q);
            if (!parsed) {
                addMsg("bot", "I couldn't find a route in your message. Try: *\"Kolhapur to Pune on 2026-08-15\"* or *\"Ajara to Pune on 15 Aug\"*");
                return;
            }
            setLoading(true);
            try {
                const { data } = await axios.post(`${API_URL}/chat/search`, parsed);
                if (!data.buses || data.buses.length === 0) {
                    addMsg("bot", `🚌 No buses found for **${parsed.from_city} → ${parsed.to_city}** on ${parsed.travel_date}. Try a different date or route.`);
                } else {
                    addMsg("bot", `Found **${data.buses.length}** bus${data.buses.length > 1 ? "es" : ""} for **${parsed.from_city} → ${parsed.to_city}** on ${parsed.travel_date}:`, {
                        type: "buses", buses: data.buses, search: parsed
                    });
                }
            } catch(e) {
                addMsg("bot", "Sorry, couldn't search buses right now. Try again.");
            } finally { setLoading(false); }

        } else {
            // AI mode
            const newHistory = [...aiHistory, { role: "user", content: q }];
            setAiHistory(newHistory);
            setLoading(true);
            try {
                const { data } = await axios.post(`${API_URL}/chat/ai`, { messages: newHistory });
                addMsg("bot", data.reply);
                setAiHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
            } catch(e) {
                const msg = e?.response?.data?.message || "AI mode is unavailable. Please try again.";
                addMsg("bot", `⚠️ ${msg}`);
            } finally { setLoading(false); }
        }
    };

    const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const switchMode = (m) => {
        setMode(m);
        if (m === "search") {
            addMsg("bot", "🔍 **Search Mode** activated!\nAsk me something like:\n*\"Pune to Mumbai on 20 Aug\"*");
        } else {
            addMsg("bot", "✨ **AI Mode** activated!\nAsk me anything about travel, routes, tips or Kore Travels services.");
        }
    };

    // ── Render helpers ──────────────────────────────────────────
    const renderText = (text) => {
        // basic markdown: **bold**, *italic*, newlines
        return text.split("\n").map((line, li) => {
            const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
                if (p.startsWith("**") && p.endsWith("**"))
                    return <strong key={i}>{p.slice(2, -2)}</strong>;
                if (p.startsWith("*") && p.endsWith("*"))
                    return <em key={i}>{p.slice(1, -1)}</em>;
                return p;
            });
            return <span key={li}>{parts}{li < text.split("\n").length - 1 && <br/>}</span>;
        });
    };

    return (
        <>
            {/* ── Floating Toggle Button ─────────────────────── */}
            <button
                id="korebot-toggle"
                onClick={() => setOpen(o => !o)}
                title="Chat with KoreBot"
                style={{
                    position: "fixed", bottom: "100px", right: "30px",
                    width: "56px", height: "56px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #0d3d35, #1a7a6e)",
                    border: "2px solid #c8ff00",
                    color: "#c8ff00",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 28px rgba(13,61,53,0.45)",
                    cursor: "pointer", zIndex: 10000,
                    transition: "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
                    animation: pulse ? "korebot-pulse 2s infinite" : "none",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
                {open ? <IcClose /> : <IcBot />}

                {/* Notification dot */}
                {!open && (
                    <span style={{
                        position: "absolute", top: "2px", right: "2px",
                        width: "10px", height: "10px", borderRadius: "50%",
                        background: "#c8ff00", border: "2px solid #0d3d35",
                    }} />
                )}
            </button>

            {/* ── Chat Window ───────────────────────────────── */}
            <div style={{
                position: "fixed", bottom: "170px", right: "20px",
                width: "min(380px, calc(100vw - 24px))",
                maxHeight: "520px",
                background: "#fff",
                borderRadius: "20px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(13,61,53,0.08)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                zIndex: 9999,
                transition: "opacity 0.25s, transform 0.25s",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
                transformOrigin: "bottom right",
            }}>

                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
                    padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: "rgba(200,255,0,0.15)",
                        border: "1.5px solid rgba(200,255,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#c8ff00", flexShrink: 0,
                    }}>
                        <IcBot />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1 }}>KoreBot</div>
                        <div style={{ color: "rgba(200,255,0,0.75)", fontSize: 11, marginTop: 2 }}>
                            {loading ? "Typing..." : "Kore Travels Assistant • Online"}
                        </div>
                    </div>

                    {/* Mode toggle */}
                    <div style={{
                        display: "flex", background: "rgba(0,0,0,0.2)",
                        borderRadius: "20px", padding: "3px",
                    }}>
                        {[
                            { id: "search", icon: <IcSearch />, label: "Search" },
                            { id: "ai",     icon: <IcSpark />,  label: "AI" },
                        ].map(m => (
                            <button key={m.id} onClick={() => switchMode(m.id)} style={{
                                padding: "5px 10px", borderRadius: "16px", border: "none",
                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                                background: mode === m.id ? "#c8ff00" : "transparent",
                                color: mode === m.id ? "#0d3d35" : "rgba(255,255,255,0.7)",
                                transition: "all 0.15s",
                            }}>{m.icon}{m.label}</button>
                        ))}
                    </div>

                    <button onClick={() => setOpen(false)} style={{
                        background: "rgba(255,255,255,0.12)", border: "none",
                        borderRadius: "50%", width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", cursor: "pointer", flexShrink: 0,
                    }}><IcClose /></button>
                </div>

                {/* Mode hint bar */}
                <div style={{
                    padding: "7px 14px",
                    background: mode === "search" ? "#f0fdf4" : "#fdf4ff",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: 11, color: mode === "search" ? "#166534" : "#7c3aed",
                    fontWeight: 600, display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                }}>
                    {mode === "search" ? <><IcSearch />Ask: "Ajara to Pune on 12 Aug"</> : <><IcSpark />AI Travel Assistant — Ask anything!</>}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 4px" }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom: 10,
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}>
                            {msg.role === "bot" && (
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #0d3d35, #1a7a6e)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#c8ff00", flexShrink: 0, marginRight: 6, alignSelf: "flex-end",
                                }}><IcBot /></div>
                            )}

                            <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: 6, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                {/* Text bubble */}
                                <div style={{
                                    padding: "9px 13px",
                                    background: msg.role === "user"
                                        ? "linear-gradient(135deg, #0d3d35, #1a7a6e)"
                                        : "#f8fafc",
                                    color: msg.role === "user" ? "#fff" : "#1e293b",
                                    borderRadius: msg.role === "user"
                                        ? "16px 16px 4px 16px"
                                        : "16px 16px 16px 4px",
                                    fontSize: 13, lineHeight: 1.6,
                                    border: msg.role === "bot" ? "1px solid #e8f0ee" : "none",
                                }}>
                                    {renderText(msg.text)}
                                </div>

                                {/* Bus results */}
                                {msg.type === "buses" && msg.buses?.map(bus => (
                                    <div key={bus.id} style={{
                                        background: "#fff",
                                        border: "1.5px solid #e0eeea",
                                        borderRadius: 12, padding: "10px 12px",
                                        width: "100%", boxSizing: "border-box",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: 13, color: "#0d3d35", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <IcBus /> {bus.bus_name}
                                                </div>
                                                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{bus.bus_number}</div>
                                            </div>
                                            <div style={{
                                                background: "#c8ff00", color: "#0d3d35",
                                                borderRadius: 6, padding: "2px 8px",
                                                fontSize: 11, fontWeight: 800,
                                            }}>₹{bus.price}</div>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontWeight: 800, color: "#0d3d35", fontSize: 14 }}>{bus.departure_time}</div>
                                                <div style={{ color: "#64748b", fontSize: 11 }}>{bus.from_city}</div>
                                            </div>
                                            <div style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>✈ {bus.duration || "Direct"}</div>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontWeight: 800, color: "#0d3d35", fontSize: 14 }}>{bus.arrival_time}</div>
                                                <div style={{ color: "#64748b", fontSize: 11 }}>{bus.to_city}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ fontSize: 11, color: bus.available_seats < 10 ? "#dc2626" : "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                                                <IcSeat /> {bus.available_seats} seats left
                                                {bus.available_seats < 10 ? " ⚡" : ""}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/seats/${bus.id}`, { state: { bus } })}
                                                style={{
                                                    padding: "6px 14px",
                                                    background: "linear-gradient(135deg, #0d3d35, #1a7a6e)",
                                                    color: "#c8ff00", border: "none",
                                                    borderRadius: 8, fontSize: 11, fontWeight: 800,
                                                    cursor: "pointer",
                                                }}
                                            >Book Now →</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Loading dots */}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "0 4px" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #0d3d35,#1a7a6e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8ff00" }}>
                                <IcBot />
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e8f0ee", borderRadius: "16px 16px 16px 4px", padding: "10px 14px", display: "flex", gap: 5, alignItems: "center" }}>
                                {[0,1,2].map(i => (
                                    <div key={i} style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: "#1a7a6e",
                                        animation: `korebot-dot 1.2s infinite ${i*0.2}s`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={msgEnd} />
                </div>

                {/* Quick chips */}
                {!loading && messages.length <= 2 && (
                    <div style={{ padding: "4px 12px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {mode === "search"
                            ? ["Kolhapur to Pune today", "Ajara to Pune on 12 Aug", "Mumbai to Pune tomorrow"].map(s => (
                                <button key={s} onClick={() => { setInput(s); }} style={{
                                    fontSize: 10, padding: "4px 9px", borderRadius: 20,
                                    border: "1px solid #c8ff0055", background: "#f0fdf4",
                                    color: "#166534", cursor: "pointer", fontWeight: 600,
                                }}>{s}</button>
                            ))
                            : ["Travel tips for long journeys", "Best time to travel to Pune", "What luggage can I carry?"].map(s => (
                                <button key={s} onClick={() => setInput(s)} style={{
                                    fontSize: 10, padding: "4px 9px", borderRadius: 20,
                                    border: "1px solid #a78bfa55", background: "#faf5ff",
                                    color: "#7c3aed", cursor: "pointer", fontWeight: 600,
                                }}>{s}</button>
                            ))
                        }
                    </div>
                )}

                {/* Input bar */}
                <div style={{ padding: "10px 12px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={mode === "search" ? "Ajara to Pune on 12 Aug…" : "Ask anything about travel…"}
                        rows={1}
                        style={{
                            flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12,
                            padding: "9px 12px", fontSize: 13, resize: "none",
                            outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                            maxHeight: 80, overflowY: "auto",
                        }}
                        onInput={e => {
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        style={{
                            width: 38, height: 38,
                            background: input.trim() && !loading
                                ? "linear-gradient(135deg, #0d3d35, #1a7a6e)"
                                : "#e2e8f0",
                            border: "none", borderRadius: 10,
                            color: input.trim() && !loading ? "#c8ff00" : "#94a3b8",
                            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "all 0.15s",
                        }}
                    ><IcSend /></button>
                </div>

                <div style={{ textAlign: "center", padding: "0 0 8px", fontSize: 10, color: "#94a3b8" }}>
                    Powered by Kore Travels • KoreBot v1.0
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes korebot-pulse {
                    0%,100% { box-shadow: 0 8px 28px rgba(13,61,53,0.45), 0 0 0 0 rgba(200,255,0,0.4); }
                    50% { box-shadow: 0 8px 28px rgba(13,61,53,0.45), 0 0 0 10px rgba(200,255,0,0); }
                }
                @keyframes korebot-dot {
                    0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}
