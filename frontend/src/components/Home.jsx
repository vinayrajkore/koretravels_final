import API_URL from "../api";
// Home.jsx — Clean Landing Page with Banner Slideshow

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const todayStr    = new Date().toISOString().split("T")[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

/* ── Inline SVG icons ────────────────────────────────────────── */
const Icon = {
    search:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    swap:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
    arrow:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    check:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    calendar:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

/* ── Banner Slideshow Component ─────────────────────────────── */
function BannerSlideshow({ banners }) {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    const startTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 4000);
    };

    useEffect(() => {
        if (banners.length > 1) startTimer();
        return () => clearInterval(timerRef.current);
    }, [banners.length]);

    const goTo = (idx) => {
        setCurrent(idx);
        startTimer();
    };
    const prev = () => goTo((current - 1 + banners.length) % banners.length);
    const next = () => goTo((current + 1) % banners.length);

    if (!banners.length) return null;

    return (
        <div style={{ padding: "0 24px", marginTop: 40, marginBottom: 56 }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
                {/* Section label */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{
                        width: 4, height: 24, borderRadius: 2,
                        background: "linear-gradient(180deg, #c8ff00, #0d7a6f)",
                    }} />
                    <span style={{ color: "#062f29", fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>
                        Offers &amp; Announcements
                    </span>
                </div>

                {/* Slideshow */}
                <div style={{
                    position: "relative",
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
                    background: "#0d1f1d",
                    height: 320,
                }}>
                    {/* Slides */}
                    {banners.map((b, i) => (
                        <div key={b.id} style={{
                            position: "absolute", inset: 0,
                            opacity: i === current ? 1 : 0,
                            transition: "opacity 0.7s ease",
                            pointerEvents: i === current ? "auto" : "none",
                            background: "#ffffff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <img
                                src={b.image_filename}
                                alt={b.title || "Banner"}
                                style={{
                                    maxWidth: "100%", maxHeight: "100%",
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                            {/* Optional caption overlay */}
                            {b.title && (
                                <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "linear-gradient(transparent, rgba(3,26,23,0.85))",
                                    padding: "32px 28px 20px",
                                }}>
                                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                                        {b.title}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Prev / Next arrows */}
                    {banners.length > 1 && (<>
                        <button onClick={prev} style={{
                            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                            width: 38, height: 38, borderRadius: "50%",
                            background: "rgba(255,255,255,0.88)", border: "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.2)", zIndex: 2,
                            transition: "background 0.15s",
                        }}
                            onMouseOver={e => e.currentTarget.style.background = "#fff"}
                            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.88)"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062f29" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button onClick={next} style={{
                            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                            width: 38, height: 38, borderRadius: "50%",
                            background: "rgba(255,255,255,0.88)", border: "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.2)", zIndex: 2,
                            transition: "background 0.15s",
                        }}
                            onMouseOver={e => e.currentTarget.style.background = "#fff"}
                            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.88)"}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062f29" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </>)}

                    {/* Dots */}
                    {banners.length > 1 && (
                        <div style={{
                            position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
                            display: "flex", gap: 7, zIndex: 2,
                        }}>
                            {banners.map((_, i) => (
                                <button key={i} onClick={() => goTo(i)} style={{
                                    width: i === current ? 22 : 8,
                                    height: 8, borderRadius: 4,
                                    background: i === current ? "#c8ff00" : "rgba(255,255,255,0.55)",
                                    border: "none", cursor: "pointer", padding: 0,
                                    transition: "width 0.3s, background 0.3s",
                                }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Home() {
    const navigate = useNavigate();
    const [search, setSearch] = useState({ from_city: "", to_city: "", travel_date: todayStr });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [locationsList, setLocationsList] = useState([]);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await axios.get(`${API_URL}/locations`);
                setLocationsList(res.data);
            } catch (err) {
                console.error("Failed to load locations:", err);
            }
        };
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${API_URL}/banners`);
                setBanners(res.data);
            } catch (err) {
                console.error("Failed to load banners:", err);
            }
        };
        fetchLocations();
        fetchBanners();
    }, []);

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setSearch(prev => ({ ...prev, [name]: value }));
    };

    const swapCities = () => setSearch(prev => ({ ...prev, from_city: prev.to_city, to_city: prev.from_city }));
    const setQuickDate = (date) => setSearch(prev => ({ ...prev, travel_date: date }));

    const validate = () => {
        let errs = {};
        if (!search.from_city)  errs.from_city  = "Select departure city";
        if (!search.to_city)    errs.to_city    = "Select destination city";
        if (!search.travel_date) errs.travel_date = "Select travel date";
        if (search.from_city && search.to_city && search.from_city === search.to_city)
            errs.to_city = "Departure and destination can't be the same";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const searchHandler = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/searchbus`, search);
            navigate("/buses", { state: { buses: response.data, search } });
        } catch (err) {
            alert("Error searching buses: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const iStyle = {
        width: "100%", padding: "13px 16px",
        border: "1.5px solid #e2e8f0", borderRadius: 12,
        fontSize: 14, background: "#fff", color: "#0f172a",
        outline: "none", fontFamily: "inherit",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "border-color 0.2s, box-shadow 0.2s",
    };
    const lStyle = {
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 11, fontWeight: 700,
        color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px",
    };
    const errStyle = { color: "#dc2626", fontSize: 11, marginTop: 4, display: "block", fontWeight: 600 };

    const dropdownStyle = {
        position: "absolute", top: "100%", left: 0, right: 0,
        background: "#fff", border: "1.5px solid #e2e8f0",
        borderRadius: 12, marginTop: 4, maxHeight: 200, overflowY: "auto",
        zIndex: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    };
    const dropdownItemStyle = {
        padding: "10px 16px", cursor: "pointer",
        fontSize: 14, color: "#0f172a", borderBottom: "1px solid #f1f5f9",
    };

    return (
        <div>

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(150deg, #031a17 0%, #052822 30%, #0a5a52 65%, #15a393 100%)",
                padding: "72px 24px 100px",
                position: "relative", overflow: "hidden",
            }}>
                {/* Decorative orbs */}
                <div className="hero-blob" style={{
                    position: "absolute", top: -100, right: -100, width: 500, height: 500,
                    borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div className="hero-blob-2" style={{
                    position: "absolute", bottom: -80, left: -80, width: 400, height: 400,
                    borderRadius: "50%", background: "radial-gradient(circle, rgba(21,163,147,0.14) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.03,
                    backgroundImage: "linear-gradient(rgba(200,255,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.5) 1px, transparent 1px)",
                    backgroundSize: "50px 50px", pointerEvents: "none",
                }} />

                <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>

                    {/* Trust badge */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.28)",
                        borderRadius: 30, padding: "7px 20px", fontSize: 12, fontWeight: 700,
                        color: "#c8ff00", marginBottom: 22, letterSpacing: "0.5px",
                        backdropFilter: "blur(8px)",
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ height: 20, objectFit: "contain" }} />
                        India's Trusted Bus Booking Platform
                    </div>

                    <h1 style={{
                        color: "#ffffff", fontSize: "clamp(30px, 5.5vw, 52px)", fontWeight: 800,
                        marginBottom: 16, lineHeight: 1.12, letterSpacing: "-0.8px",
                    }}>
                        Book Your Journey with{" "}
                        <span style={{
                            background: "linear-gradient(135deg, #c8ff00, #e8ff80)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 20px rgba(200,255,0,0.4))",
                        }}>Kore Travels</span>
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, marginBottom: 50, fontWeight: 400, lineHeight: 1.65 }}>
                        Safe, comfortable &amp; affordable bus bookings across India.<br />
                        <span style={{ color: "rgba(200,255,0,0.85)", fontWeight: 600 }}>Register now and get 10% off your first booking.</span>
                    </p>

                    {/* ── SEARCH CARD ── */}
                    <div style={{
                        background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "clamp(20px, 4vw, 32px) clamp(16px, 5vw, 36px)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.1)",
                        textAlign: "left", backdropFilter: "blur(20px)",
                    }}>
                        {/* Card header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: "linear-gradient(135deg, #0d7a6f, #062f29)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#c8ff00",
                            }}>{Icon.search}</div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "#062f29" }}>Search Buses</div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>Find the best seats for your journey</div>
                            </div>
                        </div>

                        <form onSubmit={searchHandler}>
                            {/* Row 1: From & To */}
                            <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "nowrap", marginBottom: 20 }}>

                                {/* From */}
                                <div style={{ flex: "1 1 0", minWidth: 0, position: "relative" }}>
                                    <label style={lStyle}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                                        From
                                    </label>
                                    <input type="text" id="from_city" name="from_city" autoComplete="off" placeholder="Enter City or Pickup Point"
                                        value={search.from_city}
                                        onChange={(e) => { changeHandler(e); setShowFromDropdown(true); }}
                                        onFocus={() => setShowFromDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
                                        style={{ ...iStyle, borderColor: errors.from_city ? "#dc2626" : "#e2e8f0" }} />
                                    {showFromDropdown && locationsList.filter(loc => loc.toLowerCase().includes(search.from_city.toLowerCase())).length > 0 && (
                                        <div style={dropdownStyle}>
                                            {locationsList.filter(loc => loc.toLowerCase().includes(search.from_city.toLowerCase())).map(loc => (
                                                <div key={loc} style={dropdownItemStyle}
                                                    onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                                                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                                    onMouseDown={() => { setSearch(prev => ({ ...prev, from_city: loc })); setShowFromDropdown(false); }}>
                                                    {loc}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span style={errStyle}>{errors.from_city}</span>
                                </div>

                                {/* Swap */}
                                <div style={{ paddingTop: 24, flexShrink: 0 }}>
                                    <button type="button" onClick={swapCities} title="Swap cities"
                                        style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            border: "1.5px solid #e2e8f0", background: "#f8fafc",
                                            cursor: "pointer", display: "flex", alignItems: "center",
                                            justifyContent: "center", transition: "all 0.2s", color: "#0d7a6f",
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = "#0d7a6f"; e.currentTarget.style.color = "#c8ff00"; e.currentTarget.style.borderColor = "#0d7a6f"; e.currentTarget.style.transform = "rotate(180deg)"; }}
                                        onMouseOut={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0d7a6f"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "rotate(0)"; }}
                                    >{Icon.swap}</button>
                                </div>

                                {/* To */}
                                <div style={{ flex: "1 1 0", minWidth: 0, position: "relative" }}>
                                    <label style={lStyle}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>
                                        To
                                    </label>
                                    <input type="text" id="to_city" name="to_city" autoComplete="off" placeholder="Enter City or Drop Point"
                                        value={search.to_city}
                                        onChange={(e) => { changeHandler(e); setShowToDropdown(true); }}
                                        onFocus={() => setShowToDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
                                        style={{ ...iStyle, borderColor: errors.to_city ? "#dc2626" : "#e2e8f0" }} />
                                    {showToDropdown && locationsList.filter(loc => loc.toLowerCase().includes(search.to_city.toLowerCase())).length > 0 && (
                                        <div style={dropdownStyle}>
                                            {locationsList.filter(loc => loc.toLowerCase().includes(search.to_city.toLowerCase())).map(loc => (
                                                <div key={loc} style={dropdownItemStyle}
                                                    onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                                                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                                    onMouseDown={() => { setSearch(prev => ({ ...prev, to_city: loc })); setShowToDropdown(false); }}>
                                                    {loc}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <span style={errStyle}>{errors.to_city}</span>
                                </div>
                            </div>

                            {/* Row 2: Date */}
                            <div style={{ marginBottom: 20 }}>
                                {/* Date */}
                                <div style={{ width: "100%", position: "relative" }}>
                                    <label style={lStyle}>{Icon.calendar} Travel Date</label>
                                    <input id="travel_date" type="date" name="travel_date"
                                        value={search.travel_date} onChange={changeHandler}
                                        min={todayStr} style={iStyle} />
                                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                        {[["Today", todayStr], ["Tomorrow", tomorrowStr]].map(([label, date]) => (
                                            <button key={label} type="button" onClick={() => setQuickDate(date)} style={{
                                                flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 700,
                                                borderRadius: 8, border: "1.5px solid",
                                                cursor: "pointer", transition: "all 0.15s",
                                                borderColor: search.travel_date === date ? "#0d7a6f" : "#e2e8f0",
                                                background: search.travel_date === date ? "#0d7a6f" : "#f8fafc",
                                                color: search.travel_date === date ? "#c8ff00" : "#64748b",
                                            }}>{label}</button>
                                        ))}
                                    </div>
                                    <span style={errStyle}>{errors.travel_date}</span>
                                </div>
                            </div>

                            {/* Search Button */}
                            <button id="search-buses-btn" type="submit" disabled={loading} style={{
                                width: "100%", padding: "15px", fontSize: 15, fontWeight: 800,
                                background: loading ? "#94a3b8" : "linear-gradient(135deg, #0d7a6f 0%, #062f29 100%)",
                                color: "#c8ff00", border: "none", borderRadius: 14,
                                cursor: loading ? "not-allowed" : "pointer",
                                letterSpacing: "0.5px", transition: "all 0.2s",
                                boxShadow: loading ? "none" : "0 8px 24px rgba(13,122,111,0.4)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            }}
                                onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(13,122,111,0.5)"; }}}
                                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 8px 24px rgba(13,122,111,0.4)"; }}
                            >
                                {loading ? "Searching..." : <>{Icon.search} Search Available Buses</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ── STATS BAR ─────────────────────────────────────────────── */}
            <div className="stats-grid" style={{
                background: "linear-gradient(90deg, #031a17 0%, #0a5a52 50%, #031a17 100%)",
                borderBottom: "1px solid rgba(200,255,0,0.1)",
            }}>
                {[
                    { num: "50+",   label: "Bus Routes"      },
                    { num: "1000+", label: "Happy Travelers"  },
                    { num: "6+",    label: "Bus Layouts"      },
                    { num: "24/7",  label: "Support"          },
                ].map(({ num, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ color: "#c8ff00", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 800, lineHeight: 1 }}>{num}</div>
                        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 600, marginTop: 5, letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* ── BANNER SLIDESHOW ─────────────────────────────────────── */}
            <div style={{ background: "#f8fafc", paddingTop: 8 }}>
                <BannerSlideshow banners={banners} />
            </div>

            {/* ── QUICK CTA ─────────────────────────────────────────────── */}
            <div style={{ padding: "48px 24px 56px", background: "linear-gradient(150deg, #031a17, #062f29 60%, #094035)" }}>
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "rgba(200,255,0,0.12)", border: "1px solid rgba(200,255,0,0.3)",
                        borderRadius: 20, padding: "5px 16px", marginBottom: 20,
                    }}>
                        <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 12, letterSpacing: "0.5px" }}>🎉 WELCOME OFFER</span>
                    </div>
                    <h2 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, marginBottom: 14, letterSpacing: "-0.4px" }}>
                        Get 10% Off Your First Booking!
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
                        Create a free account today and unlock your exclusive welcome discount on your first bus booking with Kore Travels.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "nowrap" }}>
                        <a href="/register" style={{
                            background: "#c8ff00", color: "#062f29", fontWeight: 800, fontSize: 14,
                            padding: "14px 20px", borderRadius: 14, textDecoration: "none",
                            boxShadow: "0 8px 28px rgba(200,255,0,0.35)", transition: "transform 0.2s",
                            display: "inline-flex", alignItems: "center", gap: 8,
                        }}
                            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            Register Free {Icon.arrow}
                        </a>
                        <a href="/about" style={{
                            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
                            fontWeight: 700, fontSize: 14, padding: "14px 20px", borderRadius: 14,
                            textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.15)",
                            transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8,
                        }}
                            onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
                            onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                        >
                            About Us
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Home;
