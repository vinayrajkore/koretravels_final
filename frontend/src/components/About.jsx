// About.jsx — Kore Travels About Us Page
import { useNavigate } from "react-router-dom";

const Icon = {
    map:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
    seat:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    lock:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    mail:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    cancel: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    moon:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    bus:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    check:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    phone:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    whatsapp: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    office: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    user:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

function About() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ── HERO ──────────────────────────────────────────────────── */}
            <div style={{
                background: "linear-gradient(150deg, #031a17 0%, #052822 30%, #0a5a52 65%, #15a393 100%)",
                padding: "72px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center",
            }}>
                <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,255,0,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 10,
                        background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.28)",
                        borderRadius: 30, padding: "7px 20px", fontSize: 12, fontWeight: 700,
                        color: "#c8ff00", marginBottom: 22, letterSpacing: "0.5px",
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ height: 20 }} />
                        About Kore Travels
                    </div>
                    <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, marginBottom: 18, letterSpacing: "-0.8px" }}>
                        Your Trusted Journey Partner
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 32px" }}>
                        Kore Travels is Maharashtra's trusted bus booking platform — connecting thousands of passengers to their destinations with comfort, safety, and reliability.
                    </p>
                    <button onClick={() => navigate("/")} style={{
                        background: "#c8ff00", color: "#062f29", fontWeight: 800, fontSize: 15,
                        padding: "13px 30px", borderRadius: 14, border: "none", cursor: "pointer",
                        boxShadow: "0 8px 28px rgba(200,255,0,0.35)", transition: "transform 0.2s",
                    }}
                        onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        Book a Bus Now →
                    </button>
                </div>
            </div>

            {/* ── WHY CHOOSE US ─────────────────────────────────────────── */}
            <div style={{ padding: "64px 24px 72px", background: "#f8fafc" }}>
                <div style={{ maxWidth: 960, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{
                            display: "inline-block", background: "#edf9f8", color: "#0d7a6f",
                            fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 30,
                            letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 12,
                        }}>Why Choose Us</div>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#062f29", marginBottom: 10, letterSpacing: "-0.5px" }}>
                            Travel with Kore Travels
                        </h2>
                        <p style={{ color: "#64748b", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
                            Everything you need for a seamless, comfortable journey
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 22 }}>
                        {[
                            { icon: Icon.map,    title: "50+ Routes",       desc: "Wide network across Maharashtra, Goa & all major cities", color: "#0d7a6f", bg: "#edf9f8" },
                            { icon: Icon.seat,   title: "6 Seat Layouts",   desc: "AC Sleeper, Non-AC, Semi-Sleeper, Seater & more options",  color: "#2563eb", bg: "#eff6ff" },
                            { icon: Icon.lock,   title: "Secure Booking",   desc: "Your data and payments are protected at every step",        color: "#7c3aed", bg: "#f5f3ff" },
                            { icon: Icon.mail,   title: "Instant Confirm",  desc: "Email confirmation the moment admin approves your booking", color: "#059669", bg: "#ecfdf5" },
                            { icon: Icon.cancel, title: "Easy Management",  desc: "Cancel or view bookings anytime from My Bookings page",    color: "#be185d", bg: "#fdf2f8" },
                            { icon: Icon.moon,   title: "Night Journeys",   desc: "Comfortable sleeper buses for overnight long-distance travel", color: "#d97706", bg: "#fffbeb" },
                        ].map((item, i) => (
                            <div key={i} className="feature-card animate-in" style={{ animationDelay: `${i * 0.07}s` }}
                                onMouseOver={e => e.currentTarget.style.borderColor = item.color + "44"}
                                onMouseOut={e => e.currentTarget.style.borderColor = "#f1f5f9"}
                            >
                                <div style={{
                                    width: 60, height: 60, borderRadius: 18,
                                    background: `linear-gradient(135deg, ${item.bg}, ${item.color}18)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: item.color, marginBottom: 16,
                                    boxShadow: `0 6px 18px ${item.color}20`,
                                    border: `1.5px solid ${item.color}20`,
                                }}>{item.icon}</div>
                                <h4 style={{ color: item.color, marginBottom: 8, fontWeight: 800, fontSize: 15 }}>{item.title}</h4>
                                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.65 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BUS TYPES ─────────────────────────────────────────────── */}
            <div style={{ padding: "64px 24px 72px", background: "#fff" }}>
                <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
                    <div style={{
                        display: "inline-block", background: "#f5f3ff", color: "#7c3aed",
                        fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 30,
                        letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 12,
                    }}>Bus Types</div>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: "#062f29", marginBottom: 42, letterSpacing: "-0.5px" }}>
                        Choose Your Comfort
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                        {[
                            { name: "2+2 Seater",        icon: Icon.seat, color: "#0d7a6f", bg: "#edf9f8", detail: "40 seats · Single deck",     badge: "Economy"    },
                            { name: "2+1 Seater",        icon: Icon.seat, color: "#2563eb", bg: "#eff6ff", detail: "30 seats · Extra legroom",    badge: "Comfort"    },
                            { name: "Semi-Sleeper",      icon: Icon.moon, color: "#7c3aed", bg: "#f5f3ff", detail: "Lower chairs + Upper berths", badge: "Semi-Sleeper"},
                            { name: "Full Sleeper",      icon: Icon.moon, color: "#be185d", bg: "#fdf2f8", detail: "60 berths · Double-deck",     badge: "Premium"    },
                            { name: "AC Seater/Sleeper", icon: Icon.lock, color: "#0891b2", bg: "#ecfeff", detail: "43 seats · A/C comfort",      badge: "AC Premium" },
                            { name: "NON-AC Seater",     icon: Icon.bus,  color: "#d97706", bg: "#fffbeb", detail: "48 seats · Budget travel",    badge: "Budget"     },
                        ].map((t, i) => (
                            <div key={i} style={{
                                background: t.bg, borderRadius: 18, padding: "26px 20px",
                                border: `1.5px solid ${t.color}25`,
                                transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s",
                                cursor: "default", position: "relative", overflow: "hidden",
                            }}
                                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${t.color}25`; }}
                                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, borderRadius: "50%", background: `${t.color}10`, pointerEvents: "none" }} />
                                <div style={{ width: 44, height: 44, borderRadius: 12, margin: "0 auto 14px", background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: t.color }}>{t.icon}</div>
                                <div style={{ display: "inline-block", background: t.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 30, marginBottom: 12, letterSpacing: "0.5px" }}>{t.badge}</div>
                                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15, marginBottom: 6 }}>{t.name}</div>
                                <div style={{ color: "#64748b", fontSize: 12 }}>{t.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <div style={{ padding: "64px 24px 72px", background: "linear-gradient(150deg, #031a17, #062f29 60%, #094035)" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.5px" }}>How It Works</h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, marginBottom: 48 }}>Book your seat in just 3 simple steps</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 28 }}>
                        {[
                            { step: "01", icon: Icon.search, title: "Search Buses",   desc: "Enter your origin, destination & travel date" },
                            { step: "02", icon: Icon.seat,   title: "Pick Your Seat", desc: "Choose from available seats on an interactive map" },
                            { step: "03", icon: Icon.check,  title: "Get Confirmed",  desc: "Receive email confirmation and board your bus" },
                        ].map((s, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "32px 24px",
                                border: "1px solid rgba(200,255,0,0.1)", transition: "background 0.2s, border-color 0.2s",
                            }}
                                onMouseOver={e => { e.currentTarget.style.background = "rgba(200,255,0,0.07)"; e.currentTarget.style.borderColor = "rgba(200,255,0,0.25)"; }}
                                onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(200,255,0,0.1)"; }}
                            >
                                <div style={{ color: "#c8ff00", fontSize: 11, fontWeight: 800, letterSpacing: "1px", marginBottom: 16, opacity: 0.6 }}>STEP {s.step}</div>
                                <div style={{ width: 52, height: 52, borderRadius: 16, margin: "0 auto 16px", background: "rgba(200,255,0,0.1)", border: "1px solid rgba(200,255,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8ff00" }}>{s.icon}</div>
                                <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{s.title}</div>
                                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CONTACT ──────────────────────────────────────────────── */}
            <div style={{ padding: "64px 24px 72px", background: "#f8fafc" }}>
                <div style={{ maxWidth: 960, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 42 }}>
                        <div style={{ display: "inline-block", background: "#edf9f8", color: "#0d7a6f", fontSize: 11, fontWeight: 700, padding: "5px 16px", borderRadius: 30, letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 12 }}>Get In Touch</div>
                        <h2 style={{ fontSize: 30, fontWeight: 800, color: "#062f29", letterSpacing: "-0.4px" }}>Contact Kore Travels</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22 }}>
                        <div style={{ background: "#fff", borderRadius: 20, padding: "30px", border: "1.5px solid #e2e8f0", boxShadow: "0 6px 24px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: "#edf9f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <img src="/logo.png" alt="Logo" style={{ height: 36, objectFit: "contain" }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: "#062f29" }}>Kore Travels</div>
                                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Official Contact Details</div>
                                </div>
                            </div>
                            {[
                                { icon: Icon.user,   label: "Owner",     value: "Vinayraj Kore" },
                                { icon: Icon.office, label: "Office",    value: "02324299042" },
                            ].map(({ icon, label, value }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9", marginBottom: 10 }}>
                                    <span style={{ color: "#0d7a6f" }}>{icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <a href="tel:8554886526" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", textDecoration: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(37,99,235,0.3)", transition: "transform 0.2s" }}
                                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                            >{Icon.phone} Call Us — 8554886526</a>
                            <a href="https://wa.me/918669427006" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", textDecoration: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(22,163,74,0.3)", transition: "transform 0.2s" }}
                                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
                            >{Icon.whatsapp} WhatsApp — 8669427006</a>
                            <a href="tel:02324299042" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 20px", background: "#f1f5f9", color: "#475569", textDecoration: "none", borderRadius: 14, fontWeight: 700, fontSize: 15, border: "1.5px solid #e2e8f0", transition: "all 0.2s" }}
                                onMouseOver={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseOut={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.transform = "translateY(0)"; }}
                            >{Icon.office} Contact Office — 02324299042</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
