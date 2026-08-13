// KoreBot.jsx — Kore Travels AI + Bus-Search Chatbot (v2)
// Floating widget, two modes: Search & AI (OpenRouter)

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

// ── Time Greeting (IST) ──────────────────────────────────────────
function getGreeting() {
    const hour = parseInt(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }));
    if (hour < 5)  return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
}

// ── Natural language route parser ───────────────────────────────
function parseRouteQuery(text) {
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    const toRe  = /from\s+(.+?)\s+to\s+(.+?)(?:\s+on\s+|\s*$)/i;
    const toRe2 = /(.+?)\s+to\s+(.+?)(?:\s+on\s+|\s*$)/i;
    const dateRe = /(?:on\s+)?(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i;
    const isoRe  = /(\d{4}-\d{2}-\d{2})/;
    const todayRe = /\btoday\b/i;
    const tomorrowRe = /\btomorrow\b/i;

    let from_city = null, to_city = null, travel_date = null;

    const mRoute = toRe.exec(text) || toRe2.exec(text);
    if (mRoute) {
        from_city = mRoute[1].trim();
        to_city   = mRoute[2].replace(/\s+(on|for|today|tomorrow)\s*.*/i, "").trim();
    }

    if (todayRe.test(text)) {
        travel_date = new Date().toISOString().split("T")[0];
    } else if (tomorrowRe.test(text)) {
        const d = new Date(); d.setDate(d.getDate()+1);
        travel_date = d.toISOString().split("T")[0];
    } else {
        const mIso = isoRe.exec(text);
        if (mIso) { travel_date = mIso[1]; }
        else {
            const mDate = dateRe.exec(text);
            if (mDate) {
                const day = mDate[1].padStart(2,"0");
                const mon = months[mDate[2].toLowerCase().slice(0,3)];
                const yr  = mDate[3] || new Date().getFullYear();
                if (mon) travel_date = `${yr}-${String(mon).padStart(2,"0")}-${day}`;
            }
        }
    }

    if (!from_city || !to_city || !travel_date) return null;
    return { from_city, to_city, travel_date };
}

// ── FAQ Knowledge Base ───────────────────────────────────────────
const FAQ = [
    { keys: ["cancel","cancellation","refund","money back"],
      ans: "**Cancellation Policy:**\nYou can cancel your booking from **My Bookings** page before the journey date.\n\n• Cancelled bookings are reviewed by our team.\n• Refunds are processed within 3–5 working days.\n• Contact us on WhatsApp for urgent cancellations." },
    { keys: ["how to book","booking process","book a bus","how do i book"],
      ans: "**How to Book a Bus:**\n1. Search your route on the home page\n2. Pick your bus from results\n3. Select your seats on the seat map\n4. Fill passenger details & confirm\n5. Wait for admin confirmation email ✅" },
    { keys: ["payment","pay","price","cost","fare","charge"],
      ans: "**Payment Info:**\n• Prices are shown on each bus card (per seat)\n• Payment is done at the time of booking\n• You'll get a confirmation email with your ticket details\n• For exact fares, search your route on the home page." },
    { keys: ["seat","seats","sleeper","ac","non-ac","window","aisle"],
      ans: "**Seat Types Available:**\n🛋️ **Sleeper** — Full flat berths for overnight travel\n❄️ **AC** — Air-conditioned seating\n🪑 **Non-AC** — Comfortable standard seating\n\nSeat map is shown during booking so you can pick exactly where you want to sit!" },
    { keys: ["luggage","baggage","bag","bags"],
      ans: "**Luggage Policy:**\n• 1 medium bag (up to 15kg) is allowed per person\n• Small handbags/backpacks can be kept on your seat\n• Extra luggage may be charged by the driver\n• Fragile or oversized items — contact us before booking" },
    { keys: ["boarding","pickup","pickup point","where to board","where to catch"],
      ans: "**Boarding Points:**\nEach bus has specific pickup points listed during booking. Please:\n• Arrive **15 minutes before departure**\n• Check your confirmation email for exact boarding location\n• Call us if you're unsure: **8554886526**" },
    { keys: ["drop","drop point","destination","where drop","dropoff"],
      ans: "**Drop Points:**\nDrop points are shown in your booking confirmation email.\nIf you need a custom drop arrangement, please contact us on WhatsApp before your journey." },
    { keys: ["safety","safe","secure","driver","trained"],
      ans: "**Safety at Kore Travels:**\n• All buses are maintained regularly\n• Experienced & licensed drivers\n• GPS tracking on all routes\n• 24/7 support contact available\n• Your safety is our top priority 🛡️" },
    { keys: ["timing","time","departure","arrival","schedule","schedule"],
      ans: "**Bus Timings:**\nDeparture and arrival times are shown on every bus card when you search.\n• Timings are in **IST (Indian Standard Time)**\n• Board at least 15 mins before departure\n• Delays are rare but contact us if your bus is late." },
    { keys: ["route","which route","routes available","cities","where do you go"],
      ans: "**Available Routes:**\nWe operate buses across Maharashtra including routes from/to:\n• Kolhapur, Pune, Mumbai, Gargoti, Sangli, Satara and more!\n\nSearch your route on the home page to see live availability 🗺️" },
    { keys: ["amenities","wifi","charging","water","food","snack"],
      ans: "**Bus Amenities:**\nAmenities vary by bus and are shown on each bus card:\n• WiFi (select buses)\n• Charging ports\n• Water bottles\n• Blankets (sleeper buses)\nCheck the bus listing for specific amenities." },
    { keys: ["contact","phone","call","whatsapp","support","help","owner","reach"],
      ans: "__CONTACT__" },
    { keys: ["ticket","e-ticket","confirmation"],
      ans: "**Your Ticket/Confirmation:**\nAfter booking, you'll receive:\n1. A **Booking Received** email immediately\n2. A **Booking Confirmed** email once admin approves your booking\n\nThe confirmed email is your e-ticket — it contains all journey details. Check your spam folder if you don't see it!" },
    { keys: ["my booking","my bookings","view booking","booking status"],
      ans: "**View Your Bookings:**\nGo to **My Bookings** from the top navigation menu.\n\nYou'll see all your past and upcoming bookings with their status:\n• ⏳ Pending — Waiting for admin confirmation\n• ✅ Confirmed — Your seat is reserved!\n• ❌ Cancelled" },
    { keys: ["discount","offer","promo","first time","10%","first booking"],
      ans: "**Offers & Discounts:**\n🎉 **First Booking Discount:** Register and get **10% off** your first bus booking!\n\nCheck our **Offers & Announcements** section on the home page for the latest deals." },
    { keys: ["register","sign up","create account","new account"],
      ans: "**How to Register:**\n1. Click **Register Free** in the top navigation\n2. Fill your name, email, phone & password\n3. You're all set to book buses!\n\nRegistration is **100% free** and unlocks the 10% first booking discount 🎁" },
    { keys: ["password","forgot","reset","login issue"],
      ans: "**Login / Password Issues:**\nIf you're having trouble logging in:\n• Double-check your email & password\n• Passwords are case-sensitive\n• Contact us on WhatsApp for account help: **8669427006**" },
];

function findFaqAnswer(text) {
    const lower = text.toLowerCase();
    for (const entry of FAQ) {
        if (entry.keys.some(k => lower.includes(k))) {
            return entry.ans;
        }
    }
    return null;
}

// ── Icons ────────────────────────────────────────────────────────
const IcSend  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcClose = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcSearch= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcSpark = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IcBus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcSeat  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg>;
const IcTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcPhone = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

// ── KoreBot Avatar ───────────────────────────────────────────────
function BotAvatar({ size = 32 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)",
            border: "2px solid #c8ff00",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(13,61,53,0.35)",
            color: "#c8ff00", userSelect: "none"
        }}>
            <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M12 3a2 2 0 0 1 2 2v4H10V5a2 2 0 0 1 2-2z" />
                <circle cx="9" cy="16" r="1.5" fill="currentColor" />
                <circle cx="15" cy="16" r="1.5" fill="currentColor" />
                <path d="M8 11V9" />
                <path d="M16 11V9" />
            </svg>
        </div>
    );
}

// ── Contact Card ─────────────────────────────────────────────────
function ContactCard() {
    return (
        <div style={{ background: "#fff", border: "1.5px solid #e0eeea", borderRadius: 12, padding: "12px 14px", width: "100%", boxSizing: "border-box" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#0d3d35", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                📞 Contact Kore Travels
            </div>
            <a href="https://wa.me/918669427006?text=Hello%2C%20I%20need%20help%20with%20my%20bus%20booking"
                target="_blank" rel="noreferrer"
                style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
                    textDecoration: "none", color: "#166534", fontSize: 12, fontWeight: 700,
                    marginBottom: 8,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp: +91 86694 27006
            </a>
            <a href="tel:8554886526"
                style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                    background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
                    textDecoration: "none", color: "#1d4ed8", fontSize: 12, fontWeight: 700,
                }}>
                <IcPhone /> Call: +91 85548 86526
            </a>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>
                Office: 02324299042 • Mon–Sat, 8AM–8PM
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────
export default function KoreBot() {
    const navigate   = useNavigate();
    const userName   = localStorage.getItem("u_name") || null;
    const greeting   = getGreeting();

    const welcomeMsg = {
        role: "bot", type: "welcome",
        text: userName
            ? `${greeting}, **${userName}**! 👋\n\nI'm **KoreBot**, your Kore Travels assistant.\n\n🔍 **Search Mode** — Find buses by asking:\n*"Gargoti to Pune on 28 Sep"*\n\n✨ **AI Mode** — Ask anything about travel, safety, tips & more!`
            : `${greeting}! 👋\n\nI'm **KoreBot**, your Kore Travels assistant.\n\n🔍 Ask me to search buses like:\n*"Gargoti to Pune on 28 Sep"*\n\n✨ Or switch to **AI Mode** for travel tips!`,
    };

    const [open, setOpen]         = useState(false);
    const [mode, setMode]         = useState("search");
    const [input, setInput]       = useState("");
    const [messages, setMessages] = useState([welcomeMsg]);
    const [aiHistory, setAiHistory] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [pulse, setPulse]       = useState(true);
    const [aiModelName, setAiModelName] = useState("AI Model");
    const msgEnd   = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
    useEffect(() => { if (open) { setTimeout(() => inputRef.current?.focus(), 200); } }, [open]);
    useEffect(() => { const t = setTimeout(() => setPulse(false), 5000); return () => clearTimeout(t); }, []);
    
    // Fetch active AI model for display
    useEffect(() => {
        axios.get(`${API_URL}/chat/config`)
            .then(res => {
                const map = {
                    "meta-llama/llama-3.1-8b-instruct:free": "Llama 3.1 8B",
                    "google/gemini-2.5-flash-free": "Gemini 2.5 Flash",
                    "google/gemini-2.0-pro-exp-02-05:free": "Gemini 2.0 Pro",
                    "mistralai/mistral-7b-instruct:free": "Mistral 7B",
                    "qwen/qwen-2-7b-instruct:free": "Qwen 2 7B",
                    "microsoft/phi-3-mini-128k-instruct:free": "Phi-3 Mini"
                };
                setAiModelName(map[res.data.model] || "AI Model");
            })
            .catch(() => {});
    }, []);

    const addMsg = useCallback((role, text, extra = {}) =>
        setMessages(prev => [...prev, { role, text, ...extra }]), []);

    const clearChat = () => {
        setMessages([welcomeMsg]);
        setAiHistory([]);
    };

    const handleSend = async () => {
        const q = input.trim();
        if (!q || loading) return;
        setInput("");
        // Reset textarea height
        if (inputRef.current) inputRef.current.style.height = "auto";
        addMsg("user", q);

        if (mode === "search") {
            // 1. Try FAQ first
            const faqAns = findFaqAnswer(q);
            if (faqAns === "__CONTACT__") {
                addMsg("bot", "I'll connect you with our team right away! Here are the quickest ways to reach us:", { type: "contact" });
                return;
            }
            if (faqAns) { addMsg("bot", faqAns); return; }

            // 2. Try route search
            const parsed = parseRouteQuery(q);
            if (parsed) {
                setLoading(true);
                try {
                    const { data } = await axios.post(`${API_URL}/chat/search`, parsed);
                    if (!data.buses || data.buses.length === 0) {
                        addMsg("bot", `😔 No buses found for **${parsed.from_city} → ${parsed.to_city}** on ${parsed.travel_date}.\n\nTry a different date or check your spelling. Need help?`, { type: "searchEmpty" });
                    } else {
                        addMsg("bot", `🎉 Found **${data.buses.length} bus${data.buses.length > 1 ? "es" : ""}** for **${parsed.from_city} → ${parsed.to_city}** on ${parsed.travel_date}:`, {
                            type: "buses", buses: data.buses, search: parsed,
                        });
                    }
                } catch {
                    addMsg("bot", "Sorry, I couldn't search right now. Please try again in a moment.");
                } finally { setLoading(false); }
                return;
            }

            // 3. Generic fallback
            addMsg("bot", "I didn't quite understand that. You can:\n• Search a bus route: *\"Kolhapur to Pune on 15 Aug\"*\n• Ask about bookings, seats, cancellation, luggage...\n• Or contact our team directly:", { type: "fallback" });

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
                const errMsg = e?.response?.data?.message || "";
                if (errMsg.includes("not configured")) {
                    addMsg("bot", "⚠️ AI mode isn't configured yet. The admin needs to add an OpenRouter API key from the Admin Panel.\n\nMeanwhile, switch to **Search Mode** to find buses or ask general questions!");
                } else {
                    addMsg("bot", `⚠️ ${errMsg || "AI is temporarily unavailable. Please try again."}`);
                }
            } finally { setLoading(false); }
        }
    };

    const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

    const switchMode = (m) => {
        setMode(m);
        if (m === "search") addMsg("bot", "🔍 **Search Mode** on!\nAsk me about buses like:\n*\"Pune to Mumbai on 20 Aug\"*\nOr ask about cancellation, seats, luggage...");
        else addMsg("bot", "✨ **AI Mode** on!\nAsk me anything about travel, journey tips, or bus services.\n\n*Note: I can only answer travel & tourism related questions.*");
    };

    // Markdown renderer
    const renderText = (text) =>
        text.split("\n").map((line, li, arr) => (
            <span key={li}>
                {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
                    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
                    if (p.startsWith("*")  && p.endsWith("*"))  return <em key={i}>{p.slice(1,-1)}</em>;
                    return p;
                })}
                {li < arr.length-1 && <br/>}
            </span>
        ));

    // Quick chip sets
    const searchChips = ["Gargoti to Pune today", "Kolhapur to Pune tomorrow", "How to cancel booking?", "What seats are available?"];
    const aiChips     = ["Tips for long bus journeys", "What to carry on overnight trips?", "Is bus travel safe at night?"];

    return (
        <>
            {/* ── Floating Toggle ─────────────────────────────── */}
            <button id="korebot-toggle" onClick={() => setOpen(o => !o)} title="Chat with KoreBot"
                style={{
                    position:"fixed", bottom:"100px", right:"30px",
                    width:"56px", height:"56px", borderRadius:"50%",
                    background:"linear-gradient(135deg,#0d3d35,#1a7a6e)",
                    border:"2.5px solid #c8ff00", color:"#c8ff00",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 8px 28px rgba(13,61,53,0.5)",
                    cursor:"pointer", zIndex:10000,
                    transition:"transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
                    animation: pulse ? "korebot-pulse 2s 3" : "none",
                    fontFamily:"'Poppins','Segoe UI',sans-serif",
                    fontWeight: 900, fontSize: 14, letterSpacing: "-0.5px",
                }}
                onMouseOver={e => e.currentTarget.style.transform="scale(1.12)"}
                onMouseOut={e  => e.currentTarget.style.transform="scale(1)"}
            >
                {open ? <IcClose /> : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <path d="M12 3a2 2 0 0 1 2 2v4H10V5a2 2 0 0 1 2-2z" />
                        <circle cx="9" cy="16" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="16" r="1.5" fill="currentColor" />
                        <path d="M8 11V9" />
                        <path d="M16 11V9" />
                    </svg>
                )}
                {!open && (
                    <span style={{
                        position:"absolute", top:"1px", right:"1px",
                        width:"11px", height:"11px", borderRadius:"50%",
                        background:"#c8ff00", border:"2px solid #0d3d35",
                    }}/>
                )}
            </button>

            {/* ── Chat Window ──────────────────────────────────── */}
            <div style={{
                position:"fixed", bottom:"168px", right:"20px",
                width:"min(390px, calc(100vw - 24px))",
                maxHeight:"560px",
                background:"#fff", borderRadius:"20px",
                boxShadow:"0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(13,61,53,0.08)",
                display:"flex", flexDirection:"column", overflow:"hidden",
                zIndex:9999,
                transition:"opacity 0.25s, transform 0.25s",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
                transformOrigin:"bottom right",
            }}>

                {/* Header */}
                <div style={{
                    background:"linear-gradient(135deg,#0d3d35 0%,#1a7a6e 100%)",
                    padding:"12px 14px", display:"flex", alignItems:"center", gap:10, flexShrink:0,
                }}>
                    <BotAvatar size={40} />
                    <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:"#fff", fontWeight:800, fontSize:14, lineHeight:1 }}>KoreBot</div>
                        <div style={{ color:"rgba(200,255,0,0.75)", fontSize:11, marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {loading ? "Typing…" : (mode === "ai" ? `Powered by ${aiModelName}` : "Kore Travels Assistant • Online")}
                        </div>
                    </div>

                    {/* Mode toggle */}
                    <div style={{ display:"flex", background:"rgba(0,0,0,0.2)", borderRadius:"20px", padding:"3px", flexShrink:0 }}>
                        {[{id:"search",icon:<IcSearch/>,label:"Search"},{id:"ai",icon:<IcSpark/>,label:"AI"}].map(m=>(
                            <button key={m.id} onClick={()=>switchMode(m.id)} style={{
                                padding:"5px 9px", borderRadius:"16px", border:"none",
                                fontSize:11, fontWeight:700, cursor:"pointer",
                                display:"flex", alignItems:"center", gap:4,
                                background: mode===m.id ? "#c8ff00" : "transparent",
                                color: mode===m.id ? "#0d3d35" : "rgba(255,255,255,0.7)",
                                transition:"all 0.15s",
                            }}>{m.icon}{m.label}</button>
                        ))}
                    </div>

                    {/* Clear chat */}
                    <button onClick={clearChat} title="Clear chat" style={{
                        background:"rgba(255,255,255,0.12)", border:"none",
                        borderRadius:"8px", width:28, height:28,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:"rgba(255,255,255,0.7)", cursor:"pointer", flexShrink:0,
                    }}><IcTrash /></button>

                    {/* Close */}
                    <button onClick={()=>setOpen(false)} style={{
                        background:"rgba(255,255,255,0.12)", border:"none",
                        borderRadius:"50%", width:28, height:28,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        color:"#fff", cursor:"pointer", flexShrink:0,
                    }}><IcClose /></button>
                </div>

                {/* Mode hint */}
                <div style={{
                    padding:"6px 14px",
                    background: mode==="search" ? "#f0fdf4" : "#fdf4ff",
                    borderBottom:"1px solid #f0f0f0",
                    fontSize:11, color: mode==="search" ? "#166534" : "#7c3aed",
                    fontWeight:600, display:"flex", alignItems:"center", gap:5, flexShrink:0,
                }}>
                    {mode==="search"
                        ? <><IcSearch /> Ask: "Gargoti to Pune on 28 Sep" or about bookings</>
                        : <><IcSpark /> AI Travel Assistant — travel &amp; tourism questions only</>}
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:"auto", padding:"12px 10px 4px" }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            marginBottom:10, display:"flex",
                            justifyContent: msg.role==="user" ? "flex-end" : "flex-start",
                            alignItems:"flex-end", gap:6,
                        }}>
                            {msg.role==="bot" && <BotAvatar size={26} />}

                            <div style={{ maxWidth:"84%", display:"flex", flexDirection:"column", gap:6, alignItems: msg.role==="user" ? "flex-end" : "flex-start" }}>
                                {/* Text bubble */}
                                <div style={{
                                    padding:"9px 13px", fontSize:13, lineHeight:1.65,
                                    background: msg.role==="user"
                                        ? "linear-gradient(135deg,#0d3d35,#1a7a6e)"
                                        : "#f8fafc",
                                    color: msg.role==="user" ? "#fff" : "#1e293b",
                                    borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    border: msg.role==="bot" ? "1px solid #e8f0ee" : "none",
                                }}>
                                    {renderText(msg.text)}
                                </div>

                                {/* Bus result cards */}
                                {msg.type==="buses" && msg.buses?.map(bus=>(
                                    <div key={bus.id} style={{
                                        background:"#fff", border:"1.5px solid #e0eeea",
                                        borderRadius:12, padding:"10px 12px", width:"100%", boxSizing:"border-box",
                                    }}>
                                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                                            <div>
                                                <div style={{ fontWeight:800, fontSize:13, color:"#0d3d35", display:"flex", alignItems:"center", gap:4 }}>
                                                    <IcBus/> {bus.bus_name}
                                                </div>
                                                <div style={{ fontSize:10, color:"#64748b", marginTop:1 }}>{bus.bus_number} • {bus.bus_type}</div>
                                            </div>
                                            <div style={{ background:"#c8ff00", color:"#0d3d35", borderRadius:6, padding:"3px 8px", fontSize:12, fontWeight:800 }}>₹{bus.price}</div>
                                        </div>

                                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                                            <div style={{ textAlign:"center" }}>
                                                <div style={{ fontWeight:800, color:"#0d3d35", fontSize:15 }}>{bus.departure_time}</div>
                                                <div style={{ color:"#64748b", fontSize:10 }}>{bus.from_city}</div>
                                            </div>
                                            <div style={{ fontSize:10, color:"#94a3b8", alignSelf:"center" }}>
                                                {bus.duration || "Direct"}<br/>
                                                <div style={{ height:1, background:"linear-gradient(90deg,#1a7a6e,#c8ff00)", margin:"3px 0" }}/>
                                            </div>
                                            <div style={{ textAlign:"center" }}>
                                                <div style={{ fontWeight:800, color:"#0d3d35", fontSize:15 }}>{bus.arrival_time}</div>
                                                <div style={{ color:"#64748b", fontSize:10 }}>{bus.to_city}</div>
                                            </div>
                                        </div>

                                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                            <div style={{ fontSize:11, color: bus.available_seats<10 ? "#dc2626":"#16a34a", fontWeight:700, display:"flex", alignItems:"center", gap:3 }}>
                                                <IcSeat/> {bus.available_seats} seats {bus.available_seats<10?"⚡ Hurry!":"available"}
                                            </div>
                                            <button onClick={()=>{ navigate(`/seats/${bus.id}`,{state:{bus}}); setOpen(false); }} style={{
                                                padding:"6px 13px",
                                                background:"linear-gradient(135deg,#0d3d35,#1a7a6e)",
                                                color:"#c8ff00", border:"none", borderRadius:8,
                                                fontSize:11, fontWeight:800, cursor:"pointer",
                                            }}>Book Now →</button>
                                        </div>
                                    </div>
                                ))}

                                {/* Contact card */}
                                {(msg.type==="contact" || msg.type==="fallback") && <ContactCard />}
                                {msg.type==="searchEmpty" && (
                                    <div style={{ width:"100%", boxSizing:"border-box" }}>
                                        <ContactCard />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div style={{ display:"flex", alignItems:"flex-end", gap:6, marginBottom:10 }}>
                            <BotAvatar size={26}/>
                            <div style={{ background:"#f8fafc", border:"1px solid #e8f0ee", borderRadius:"16px 16px 16px 4px", padding:"10px 14px", display:"flex", gap:5, alignItems:"center" }}>
                                {[0,1,2].map(i=>(
                                    <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#1a7a6e", animation:`korebot-dot 1.2s infinite ${i*0.2}s` }}/>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={msgEnd}/>
                </div>

                {/* Quick chips — shown only at start */}
                {!loading && messages.length <= 2 && (
                    <div style={{ padding:"4px 10px 0", display:"flex", gap:5, flexWrap:"wrap", flexShrink:0 }}>
                        {(mode==="search" ? searchChips : aiChips).map(s=>(
                            <button key={s} onClick={()=>setInput(s)} style={{
                                fontSize:10, padding:"4px 8px", borderRadius:20,
                                border:`1px solid ${mode==="search" ? "#c8ff0066":"#a78bfa55"}`,
                                background: mode==="search" ? "#f0fdf4":"#faf5ff",
                                color: mode==="search" ? "#166534":"#7c3aed",
                                cursor:"pointer", fontWeight:600,
                            }}>{s}</button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{ padding:"10px 10px 10px", borderTop:"1px solid #f0f0f0", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0 }}>
                    <textarea ref={inputRef} value={input}
                        onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                        placeholder={mode==="search" ? "Gargoti to Pune on 28 Sep… or ask anything" : "Ask about travel, safety, tips…"}
                        rows={1}
                        style={{
                            flex:1, border:"1.5px solid #e2e8f0", borderRadius:12,
                            padding:"9px 12px", fontSize:13, resize:"none",
                            outline:"none", fontFamily:"inherit", lineHeight:1.5,
                            maxHeight:80, overflowY:"auto",
                        }}
                        onInput={e=>{ e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,80)+"px"; }}
                    />
                    <button onClick={handleSend} disabled={!input.trim()||loading} style={{
                        width:38, height:38, flexShrink:0,
                        background: input.trim()&&!loading ? "linear-gradient(135deg,#0d3d35,#1a7a6e)" : "#e2e8f0",
                        border:"none", borderRadius:10,
                        color: input.trim()&&!loading ? "#c8ff00":"#94a3b8",
                        cursor: input.trim()&&!loading ? "pointer":"not-allowed",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"all 0.15s",
                    }}><IcSend/></button>
                </div>

                <div style={{ textAlign:"center", padding:"0 0 8px", fontSize:10, color:"#94a3b8" }}>
                    Powered by Kore Travels • KoreBot v2.0
                </div>
            </div>

            <style>{`
                @keyframes korebot-pulse {
                    0%,100% { box-shadow: 0 8px 28px rgba(13,61,53,0.5), 0 0 0 0 rgba(200,255,0,0.5); }
                    50% { box-shadow: 0 8px 28px rgba(13,61,53,0.5), 0 0 0 12px rgba(200,255,0,0); }
                }
                @keyframes korebot-dot {
                    0%,80%,100% { transform:scale(0.6); opacity:0.4; }
                    40% { transform:scale(1); opacity:1; }
                }
                #korebot-toggle { font-family:'Poppins','Segoe UI',sans-serif; }
            `}</style>
        </>
    );
}
