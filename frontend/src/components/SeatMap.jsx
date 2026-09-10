import API_URL from "../api";
// SeatMap.jsx - Interactive Seat Selection with 4 Layout Types
// Layouts: 2+2 Seater | 2+1 Seater | Semi-Sleeper (2+1) | Full Sleeper

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

// ── Seat status color palette ────────────────────────────────────
const COLORS = {
    available: { bg: "#edf9f8", border: "#5ecec3", color: "#0d6156" },
    selected: { bg: "#c8ff00", border: "#094035", color: "#094035" },
    booked: { bg: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
    blocked: { bg: "#f1f5f9", border: "#94a3b8", color: "#94a3b8" },
};

// ── Individual Seat Components ───────────────────────────────────

// Chair Seat — square with top border headrest
function ChairSeat({ num, status, onToggle }) {
    const c = COLORS[status];
    const taken = status === "booked" || status === "blocked";
    return (
        <div onClick={() => onToggle(num)} title={`Seat ${num}`}
            style={{
                width: 44, height: 44,
                borderRadius: "8px 8px 5px 5px",
                background: c.bg, border: `1.5px solid ${c.border}`,
                borderTop: `4px solid ${c.border}`,
                color: c.color, fontSize: 11, fontWeight: 700,
                cursor: taken ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.12s, box-shadow 0.12s",
                userSelect: "none", flexShrink: 0,
                transform: status === "selected" ? "scale(1.08)" : "scale(1)",
                boxShadow: status === "selected" ? "0 4px 14px rgba(200,255,0,0.4)" : "none",
            }}>
            {taken ? (
                status === "blocked"
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : num}
        </div>
    );
}

// Berth Seat — tall vertical rectangle (like RedBus sleeper)
function BerthSeat({ num, status, onToggle, isDouble = false, height = 78 }) {
    const c = COLORS[status];
    const taken = status === "booked" || status === "blocked";
    return (
        <div onClick={() => onToggle(num)} title={`Berth ${num}`}
            style={{
                width: isDouble ? 44 : 44, height: height,
                borderRadius: 8,
                background: c.bg, border: `1.5px solid ${c.border}`,
                color: c.color, fontSize: 11, fontWeight: 700,
                cursor: taken ? "not-allowed" : "pointer",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                paddingBottom: 6,
                transition: "transform 0.12s, box-shadow 0.12s",
                userSelect: "none", flexShrink: 0,
                transform: status === "selected" ? "scale(1.06)" : "scale(1)",
                boxShadow: status === "selected" ? "0 4px 14px rgba(200,255,0,0.4)" : "none",
                position: "relative",
            }}>
            {/* pillow icon at top */}
            <div style={{
                position: "absolute", top: 5, left: "50%", transform: "translateX(-50%)",
                width: 28, height: 8, background: taken ? c.border : "#a7f3d0",
                borderRadius: 4, opacity: 0.6,
            }} />
            {taken ? (
                status === "blocked"
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : num}
        </div>
    );
}

// Aisle gap
function Aisle() {
    return <div style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 10 }}>|</div>;
}

// ── Main SeatMap Component ────────────────────────────────────────
function SeatMap() {
    const { busId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const bus = location.state?.bus || {};
    const layout = bus.seat_layout || "2+2 Seater";

    // Parse pickup/drop points — support both old string-array and new {name,time} format
    const parsePoints = (raw) => {
        if (!raw) return [];
        try {
            const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
            return arr.map(p => typeof p === "string" ? { name: p, time: "" } : p);
        } catch { return []; }
    };
    const pickupPoints = parsePoints(bus.pickup_points);
    const dropPoints = parsePoints(bus.drop_points);

    const parsePhotos = (raw) => {
        if (!raw) return [];
        try {
            return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch { return []; }
    };
    const busPhotos = parsePhotos(bus.photos);

    const [takenSeats, setTakenSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDeck, setActiveDeck] = useState("lower");
    const [boardingPoint, setBoardingPoint] = useState("");
    const [dropPoint, setDropPoint] = useState("");
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const isDualDeck = layout === "Semi-Sleeper (2+1)" || layout === "Full Sleeper" || layout === "2+1 AC Sleeper" || layout === "Non A/C Seater / Sleeper (2+1)" || layout === "A/C Seater / Sleeper (2+1)";

    useEffect(() => { loadTakenSeats(); }, []);

    const loadTakenSeats = async () => {
        try {
            const res = await axios.get(`${API_URL}/bookedseats/${busId}`);
            let taken = [];
            res.data.forEach(row => {
                if (row.seat) {
                    const seatsArr = String(row.seat).split(",").map(s => s.trim());
                    seatsArr.forEach(s => taken.push({ seat: s, type: row.type }));
                }
            });
            setTakenSeats(taken);
        } catch (err) { console.error("Seat load error:", err.message); }
        finally { setLoading(false); }
    };

    // Helpers
    const isTaken = (n) => takenSeats.some(s => s.seat === String(n));
    const isBlocked = (n) => takenSeats.some(s => s.seat === String(n) && s.type === "blocked");
    const isSelected = (n) => selectedSeats.includes(n);

    const getStatus = (n) => {
        if (isTaken(n)) return isBlocked(n) ? "blocked" : "booked";
        if (isSelected(n)) return "selected";
        return "available";
    };

    const toggleSeat = (n) => {
        if (isTaken(n)) return;
        if (isSelected(n)) {
            setSelectedSeats(prev => prev.filter(s => s !== n));
        } else {
            if (selectedSeats.length >= 6) { toast.warning("Max 6 seats at a time!", "Limit Reached"); return; }
            setSelectedSeats(prev => [...prev, n]);
        }
    };

    const proceedToBook = () => {
        if (!selectedSeats.length) { toast.warning("Please select at least 1 seat!", "Selection Required"); return; }
        if (pickupPoints.length > 0 && !boardingPoint) { toast.warning("Please select a Boarding Point!", "Missing Point"); return; }
        if (dropPoints.length > 0 && !dropPoint) { toast.warning("Please select a Drop Point!", "Missing Point"); return; }
        // Check if user is logged in
        const isLoggedIn = !!sessionStorage.getItem("useremail");
        if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
        }
        navigate(`/book/${busId}`, { state: { bus, selectedSeats, boardingPoint, dropPoint } });
    };

    // ── Layout Renderers ─────────────────────────────────────────

    // 2+2 Seater — 10 rows × 4 chairs = 40 seats
    // Row r: seats [r*4+1, r*4+2, r*4+3, r*4+4]
    const render22Seater = () =>
        Array.from({ length: 10 }, (_, r) => {
            const b = r * 4;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={b + 1} status={getStatus(b + 1)} onToggle={toggleSeat} />
                    <ChairSeat num={b + 2} status={getStatus(b + 2)} onToggle={toggleSeat} />
                    <Aisle />
                    <ChairSeat num={b + 3} status={getStatus(b + 3)} onToggle={toggleSeat} />
                    <ChairSeat num={b + 4} status={getStatus(b + 4)} onToggle={toggleSeat} />
                </div>
            );
        });

    // 2+1 Seater — 10 rows × 3 chairs = 30 seats
    // Row r: seats [r*3+1, r*3+2, r*3+3]
    const render21Seater = () =>
        Array.from({ length: 10 }, (_, r) => {
            const b = r * 3;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={b + 1} status={getStatus(b + 1)} onToggle={toggleSeat} />
                    <ChairSeat num={b + 2} status={getStatus(b + 2)} onToggle={toggleSeat} />
                    <Aisle />
                    <ChairSeat num={b + 3} status={getStatus(b + 3)} onToggle={toggleSeat} />
                </div>
            );
        });

    // Semi-Sleeper (2+1)
    // Lower deck: 10 rows × 3 CHAIRS = seats 1-30
    // Upper deck: 10 rows × 3 BERTHS = seats 31-60
    const renderSemiSleeper = (deck) => {
        const offset = deck === "lower" ? 0 : 30;
        const isUpper = deck === "upper";
        return Array.from({ length: 10 }, (_, r) => {
            const b = offset + r * 3;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    {isUpper
                        ? <BerthSeat num={b + 1} status={getStatus(b + 1)} onToggle={toggleSeat} />
                        : <ChairSeat num={b + 1} status={getStatus(b + 1)} onToggle={toggleSeat} />}
                    {isUpper
                        ? <BerthSeat num={b + 2} status={getStatus(b + 2)} onToggle={toggleSeat} />
                        : <ChairSeat num={b + 2} status={getStatus(b + 2)} onToggle={toggleSeat} />}
                    <Aisle />
                    {isUpper
                        ? <BerthSeat num={b + 3} status={getStatus(b + 3)} onToggle={toggleSeat} />
                        : <ChairSeat num={b + 3} status={getStatus(b + 3)} onToggle={toggleSeat} />}
                </div>
            );
        });
    };

    // Full Sleeper
    // Lower deck (10 rows):
    //   Left col:  1 single berth  → seats 1-10
    //   Right col: 2 chairs        → seats 11-30 (11+r*2, 12+r*2)
    // Upper deck (10 rows):
    //   Left col:  1 single berth  → seats 31-40
    //   Right col: double berth    → seats 41-60 (two adjacent berths per row)
    const renderFullSleeper = (deck) =>
        Array.from({ length: 10 }, (_, r) => {
            if (deck === "lower") {
                const leftN = r + 1;
                const rightA = 11 + r * 2;
                const rightB = 12 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN} status={getStatus(leftN)} onToggle={toggleSeat} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={toggleSeat} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={toggleSeat} />
                    </div>
                );
            } else {
                const leftN = 31 + r;
                const rightA = 41 + r * 2;
                const rightB = 42 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN} status={getStatus(leftN)} onToggle={toggleSeat} />
                        <Aisle />
                        {/* Double berth — two adjacent berths, visually joined */}
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={toggleSeat} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={toggleSeat} />
                        </div>
                    </div>
                );
            }
        });

    // 2+1 AC Sleeper
    // Lower Deck: L1 to L15
    // Upper Deck: U1 to U15
    const render21ACSleeper = (deck) =>
        Array.from({ length: 5 }, (_, r) => {
            const prefix = deck === "lower" ? "L" : "U";
            const leftN = `${prefix}${r * 3 + 1}`;
            const rightA = `${prefix}${r * 3 + 2}`;
            const rightB = `${prefix}${r * 3 + 3}`;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <BerthSeat num={leftN} status={getStatus(leftN)} onToggle={toggleSeat} />
                    <Aisle />
                    {/* Double berth — two adjacent berths, visually joined */}
                    <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                        <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={toggleSeat} />
                        <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={toggleSeat} />
                    </div>
                </div>
            );
        });

    // Non A/C Seater / Sleeper (2+1)
    const renderNonAcSeaterSleeper = (deck) => {
        if (deck === "lower") {
            const leftCol = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
            const rightInner = [1, 4, 5, 8, 9, 12, 13, 16, 17, 20, 21];
            const rightWindow = ["2W", "3W", "6W", "7W", "10W", "11W", "14W", "15W", "18W", "19W", "22W"];
            return Array.from({ length: 11 }, (_, r) => {
                const leftN = leftCol[r];
                const rightA = rightInner[r];
                const rightB = rightWindow[r];
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <ChairSeat num={leftN} status={getStatus(leftN)} onToggle={toggleSeat} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={toggleSeat} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={toggleSeat} />
                    </div>
                );
            });
        } else {
            const leftCol = ["11U", "12U", "13U", "14U", "15U"];
            const rightInner = ["1U", "4U", "5U", "8U", "9U"];
            const rightWindow = ["2U", "3U", "6U", "7U", "10U"];
            return Array.from({ length: 5 }, (_, r) => {
                const leftN = leftCol[r];
                const rightA = rightInner[r];
                const rightB = rightWindow[r];
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN} status={getStatus(leftN)} onToggle={toggleSeat} />
                        <Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={toggleSeat} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={toggleSeat} />
                        </div>
                    </div>
                );
            });
        }
    };

    // NON A/C Seater (2+2)
    const renderNonAcSeater22 = () => {
        const rows = [
            ["VIP", null, "A", "B"],
            ["F", "E", "D", "C"],
            ["G", "H", "I", "J"],
            ["K", "L", "1", "2"],
            ["6", "5", "4", "3"],
            ["7", "8", "9", "10"],
            ["14", "13", "12", "11"],
            ["15", "16", "17", "18"],
            ["22", "21", "20", "19"],
            ["23", "24", "25", "26"],
            ["30", "29", "28", "27"]
        ];
        const lastRow = ["31", "32", "33", "34", "35"];

        return (
            <div>
                {rows.map((row, r) => (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        {row[0] ? <ChairSeat num={row[0]} status={getStatus(row[0])} onToggle={toggleSeat} /> : <div style={{ width: 47 }} />}
                        {row[1] ? <ChairSeat num={row[1]} status={getStatus(row[1])} onToggle={toggleSeat} /> : <div style={{ width: 47 }} />}
                        <Aisle />
                        <ChairSeat num={row[2]} status={getStatus(row[2])} onToggle={toggleSeat} />
                        <ChairSeat num={row[3]} status={getStatus(row[3])} onToggle={toggleSeat} />
                    </div>
                ))}
                {/* Last Row - 5 Seats (Aisle converted to seat) */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={lastRow[0]} status={getStatus(lastRow[0])} onToggle={toggleSeat} />
                    <ChairSeat num={lastRow[1]} status={getStatus(lastRow[1])} onToggle={toggleSeat} />
                    <ChairSeat num={lastRow[2]} status={getStatus(lastRow[2])} onToggle={toggleSeat} />
                    <ChairSeat num={lastRow[3]} status={getStatus(lastRow[3])} onToggle={toggleSeat} />
                    <ChairSeat num={lastRow[4]} status={getStatus(lastRow[4])} onToggle={toggleSeat} />
                </div>
            </div>
        );
    };

    // A/C Seater / Sleeper (2+1)
    const renderAcSeaterSleeper21 = (deck) => {
        if (deck === "lower") {
            const leftBerths = ["CL", "DL", "IL", "JL", "OL"];
            const rightChairs = [
                [1, 2], [4, 3], [5, 6], [8, 7], [9, 10],
                [12, 11], [13, 14], [16, 15], [17, 18], [20, 19]
            ];

            return (
                <div>
                    {leftBerths.map((berth, i) => {
                        const row1 = rightChairs[i * 2];
                        const row2 = rightChairs[i * 2 + 1];
                        return (
                            <div key={i} style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                                <div style={{ display: "flex", alignItems: "stretch" }}>
                                    <BerthSeat num={berth} status={getStatus(berth)} onToggle={toggleSeat} height={96} />
                                </div>
                                <Aisle />
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row1[0]} status={getStatus(row1[0])} onToggle={toggleSeat} />
                                        <ChairSeat num={row1[1]} status={getStatus(row1[1])} onToggle={toggleSeat} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row2[0]} status={getStatus(row2[0])} onToggle={toggleSeat} />
                                        <ChairSeat num={row2[1]} status={getStatus(row2[1])} onToggle={toggleSeat} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Row 11: 23 (aisle space), 22, 21 */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 44 }} />
                        <ChairSeat num={23} status={getStatus(23)} onToggle={toggleSeat} />
                        <ChairSeat num={22} status={getStatus(22)} onToggle={toggleSeat} />
                        <ChairSeat num={21} status={getStatus(21)} onToggle={toggleSeat} />
                    </div>
                </div>
            );
        } else {
            const leftBerths = ["CU", "DU", "IU", "JU", "OU"];
            const rightInner = ["A", "E", "H", "K", "N"];
            const rightOuter = ["B", "F", "G", "L", "M"];
            return (
                <div>
                    {leftBerths.map((berth, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                            <BerthSeat num={berth} status={getStatus(berth)} onToggle={toggleSeat} />
                            <Aisle />
                            <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                                <BerthSeat num={rightInner[i]} status={getStatus(rightInner[i])} onToggle={toggleSeat} />
                                <BerthSeat num={rightOuter[i]} status={getStatus(rightOuter[i])} onToggle={toggleSeat} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };

    // ── Render active grid based on layout ──────────────────────
    const renderGrid = () => {
        switch (layout) {
            case "2+2 Seater": return render22Seater();
            case "2+1 Seater": return render21Seater();
            case "Semi-Sleeper (2+1)": return renderSemiSleeper(activeDeck);
            case "Full Sleeper": return renderFullSleeper(activeDeck);
            case "2+1 AC Sleeper": return render21ACSleeper(activeDeck);
            case "Non A/C Seater / Sleeper (2+1)": return renderNonAcSeaterSleeper(activeDeck);
            case "A/C Seater / Sleeper (2+1)": return renderAcSeaterSleeper21(activeDeck);
            case "NON A/C Seater (2+2)": return renderNonAcSeater22();
            default: return render22Seater();
        }
    };

    // Deck label descriptions
    const getDeckDesc = () => {
        if (layout === "Semi-Sleeper (2+1)")
            return activeDeck === "lower" ? "Lower Deck — Seater Chairs (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        if (layout === "Full Sleeper")
            return activeDeck === "lower" ? "Lower Deck — Single Berths + 2 Chairs per row" : "Upper Deck — Single Berths + Double Berths per row";
        if (layout === "2+1 AC Sleeper")
            return activeDeck === "lower" ? "Lower Deck — Sleeper Berths (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        if (layout === "Non A/C Seater / Sleeper (2+1)" || layout === "A/C Seater / Sleeper (2+1)")
            return activeDeck === "lower" ? "Lower Deck — Seater Chairs (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        return "";
    };

    const totalFare = selectedSeats.length * (parseFloat(bus.price) || 0);

    // ── Loading State ────────────────────────────────────────────
    if (loading) return (
        <div className="page-wrapper" style={{ textAlign: "center", paddingTop: "80px" }}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#0d7a6f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 16px" }}>
                <rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <p style={{ color: "#0d7a6f", fontSize: 18, marginTop: 8, fontWeight: 600 }}>Loading seat map...</p>
        </div>
    );

    // ── Main Render ──────────────────────────────────────────────
    return (
        <>
        {/* ── Register to Book Modal ──────────────────────────── */}
        {showAuthModal && (
            <div onClick={() => setShowAuthModal(false)} style={{
                position: "fixed", inset: 0, zIndex: 99999,
                background: "rgba(3,26,23,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20px",
            }}>
                <div onClick={e => e.stopPropagation()} style={{
                    background: "#fff",
                    borderRadius: 24,
                    maxWidth: 420,
                    width: "100%",
                    overflow: "hidden",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                    animation: "modalPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
                }}>
                    {/* Modal Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #031a17 0%, #0d7a6f 100%)",
                        padding: "32px 28px 24px",
                        textAlign: "center",
                        position: "relative",
                    }}>
                        {/* Close button */}
                        <button onClick={() => setShowAuthModal(false)} style={{
                            position: "absolute", top: 14, right: 14,
                            background: "rgba(255,255,255,0.1)", border: "none",
                            borderRadius: "50%", width: 32, height: 32,
                            color: "#fff", cursor: "pointer", fontSize: 16,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>

                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: "50%", background: "#f8fafc",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d7a6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <h3 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: 800 }}>Sign In to Book</h3>
                        </div>

                        {/* Offer badge */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "rgba(200,255,0,0.15)", border: "1px solid rgba(200,255,0,0.4)",
                            borderRadius: 20, padding: "4px 14px", marginBottom: 14,
                        }}>
                            <span style={{ fontSize: 14 }}>🎉</span>
                            <span style={{ color: "#c8ff00", fontWeight: 700, fontSize: 12, letterSpacing: "0.5px" }}>EXCLUSIVE OFFER</span>
                        </div>

                        {/* Headline */}
                        <div style={{ color: "#c8ff00", fontSize: 36, fontWeight: 800, lineHeight: 1 }}>10% OFF</div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 6, fontWeight: 500 }}>on your first booking!</div>

                        {/* Bus info chip */}
                        <div style={{
                            marginTop: 16, background: "rgba(255,255,255,0.1)",
                            borderRadius: 10, padding: "8px 16px",
                            color: "rgba(255,255,255,0.7)", fontSize: 12,
                        }}>
                            {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected &nbsp;&bull;&nbsp; ₹{(selectedSeats.length * (parseFloat(bus.price) || 0)).toLocaleString("en-IN")} total
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div style={{ padding: "28px" }}>
                        <p style={{ color: "#334155", fontSize: 14, lineHeight: 1.7, textAlign: "center", marginBottom: 24 }}>
                            Create a free account to complete your booking and unlock your
                            <strong style={{ color: "#0d7a6f" }}> 10% welcome discount</strong>!
                        </p>

                        {/* CTA buttons */}
                        <a href="/register" style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            background: "linear-gradient(135deg, #0d7a6f, #062f29)",
                            color: "#c8ff00", textDecoration: "none",
                            padding: "14px", borderRadius: 14,
                            fontWeight: 800, fontSize: 15, letterSpacing: "0.3px",
                            boxShadow: "0 8px 24px rgba(13,122,111,0.35)",
                            marginBottom: 12,
                            transition: "transform 0.15s",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Create Free Account
                        </a>
                        <a href="/login" style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            background: "#f1f5f9",
                            color: "#0d7a6f", textDecoration: "none",
                            padding: "13px", borderRadius: 14,
                            fontWeight: 700, fontSize: 14,
                            border: "1.5px solid #e2e8f0",
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Already have an account? Log In
                        </a>

                        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 11, marginTop: 14 }}>
                            Your seat selection will be saved while you register.
                        </p>
                    </div>
                </div>
            </div>
        )}
        <style>{`@keyframes modalPop { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }`}</style>
        <div className="page-wrapper">
            <div style={{ maxWidth: 860, margin: "0 auto" }}>

                {/* Bus Info Header */}
                <div className="kt-card" style={{ marginBottom: 18 }}>
                    <div className="kt-card-header">
                        <h2 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                            {bus.bus_name}
                            {bus.bus_number && <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.1)", padding: "2px 10px", borderRadius: 12 }}>{bus.bus_number}</span>}
                        </h2>
                        <p style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "center", margin: 0 }}>
                            <span>{bus.from_city} → {bus.to_city}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                {bus.departure_time}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                {bus.travel_date}
                            </span>
                            <span>₹{bus.price}/seat</span>
                            <span style={{ background: "rgba(200,255,0,0.18)", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" }}>
                                {layout}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="seatmap-container" style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

                    {/* ── Left Column (Seat Map + Points) ─────────────────── */}
                    <div className="seatmap-left-col" style={{ flex: "1", minWidth: "min(100%, 260px)" }}>

                        {/* ── Seat Map Panel ─────────────────────────────────── */}
                        <div className="kt-card">
                            <div className="kt-card-body" style={{ padding: "20px 24px" }}>

                                {/* Legend */}
                                <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
                                    {[
                                        { label: "Available", s: "available" },
                                        { label: "Selected", s: "selected" },
                                        { label: "Booked", s: "booked" },
                                        { label: "Blocked", s: "blocked" },
                                    ].map(({ label, s }) => {
                                        const c = COLORS[s];
                                        return (
                                            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555", fontWeight: 500 }}>
                                                <div style={{ width: 22, height: 22, borderRadius: 5, background: c.bg, border: `2px solid ${c.border}` }} />
                                                {label}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Deck Tabs for dual-deck layouts */}
                                {isDualDeck && (
                                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
                                        {["lower", "upper"].map(deck => (
                                            <button key={deck} onClick={() => setActiveDeck(deck)} style={{
                                                padding: "9px 22px", borderRadius: 20, border: "none", cursor: "pointer",
                                                fontWeight: 700, fontSize: 13, transition: "all 0.18s",
                                                background: activeDeck === deck
                                                    ? "linear-gradient(135deg, #0d7a6f, #062f29)"
                                                    : "#f1f5f9",
                                                color: activeDeck === deck ? "#c8ff00" : "#475569",
                                                boxShadow: activeDeck === deck ? "0 4px 14px rgba(13,122,111,0.3)" : "none",
                                                display: "flex", alignItems: "center", gap: 6
                                            }}>
                                                {deck === "lower" ? (
                                                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" /><path d="M4 13v8" /><path d="M20 13v8" /><path d="M4 13h16" /></svg> Lower Deck</>
                                                ) : (
                                                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg> Upper Deck</>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Deck description */}
                                {isDualDeck && (
                                    <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginBottom: 14, fontWeight: 500 }}>
                                        {getDeckDesc()}
                                    </div>
                                )}

                                {/* Double berth legend for Full Sleeper upper */}
                                {layout === "Full Sleeper" && activeDeck === "upper" && (
                                    <div style={{
                                        textAlign: "center", fontSize: 11, color: "#7c3aed",
                                        background: "#f5f3ff", padding: "6px 12px", borderRadius: 8,
                                        marginBottom: 14, border: "1px dashed #c4b5fd",
                                    }}>
                                        Dashed purple box = Double berth (2 adjacent sleeper berths)
                                    </div>
                                )}

                                {/* Driver — Front of Bus */}
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    borderBottom: "2px dashed #d1fae5", paddingBottom: 14, marginBottom: 18,
                                    background: "linear-gradient(to right, transparent, #e8f5f2 30%, #e8f5f2 70%, transparent)",
                                    borderRadius: "8px 8px 0 0", padding: "10px 16px 14px",
                                }}>
                                    {/* Steering Wheel SVG */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a7a6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="3" />
                                        <line x1="12" y1="2" x2="12" y2="9" />
                                        <line x1="4.22" y1="6.22" x2="7.76" y2="9.76" />
                                        <line x1="19.78" y1="6.22" x2="16.24" y2="9.76" />
                                        <line x1="2" y1="12" x2="9" y2="12" />
                                        <line x1="22" y1="12" x2="15" y2="12" />
                                        <line x1="12" y1="22" x2="12" y2="15" />
                                    </svg>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1a7a6e", letterSpacing: "0.5px", textTransform: "uppercase" }}>Driver</div>
                                        <div style={{ fontSize: 10, color: "#64748b" }}>Front of Bus</div>
                                    </div>
                                </div>

                                {/* Seat Grid */}
                                <div style={{ maxWidth: 300, margin: "0 auto", marginBottom: "30px", overflowX: "auto" }}>
                                    {renderGrid()}
                                </div>

                                {/* Multiple Bus Photos Gallery (Moved below chart) */}
                                {busPhotos.length > 0 && (
                                    <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            Bus Photos Gallery
                                        </div>
                                        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin" }}>
                                            {busPhotos.map((photo, i) => (
                                                <div key={i} onClick={() => setSelectedPhotoIndex(i)} style={{ flexShrink: 0, width: "180px", height: "120px", borderRadius: "10px", overflow: "hidden", border: "2px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.2s" }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                                    <img src={photo} alt={`${bus.bus_name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Click an image to enlarge</div>
                                    </div>
                                )}

                            </div>

                        </div>

                        {/* ── Pickup & Drop Points Panel ─────────────────── */}
                        {(pickupPoints.length > 0 || dropPoints.length > 0) && (
                            <div id="points-section" className="kt-card" style={{ marginTop: 20 }}>
                                <div className="kt-card-header" style={{ padding: "14px 22px" }}>
                                    <h2 style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        Select Pickup &amp; Drop Points
                                        <span style={{ fontSize: 12, fontWeight: 500, color: "#e53935", marginLeft: 4 }}>* Required</span>
                                    </h2>
                                </div>
                                <div className="kt-card-body" style={{ padding: "20px 22px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>

                                        {/* Boarding Points */}
                                        {pickupPoints.length > 0 && (
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: "#1a7a6e", marginBottom: 14, paddingBottom: 8, borderBottom: "2px solid #e8f5f2", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                                    BOARDING POINTS
                                                </div>
                                                <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "6px" }} className="kt-scrollbar">
                                                    {pickupPoints.map((pt, i) => {
                                                        const ptStr = `${pt.time ? pt.time + ' - ' : ''}${pt.name}`;
                                                        const isSelected = boardingPoint === ptStr;
                                                        return (
                                                        <label key={i} onClick={() => setBoardingPoint(ptStr)}
                                                            style={{
                                                            display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                                                            marginBottom: 8, borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                                                            border: isSelected ? "2px solid #1a7a6e" : "2px solid #e2e8f0",
                                                            background: isSelected ? "#edf9f8" : "#fff",
                                                        }}>
                                                            <div style={{
                                                                width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: 2,
                                                                border: isSelected ? "5px solid #1a7a6e" : "2px solid #cbd5e1",
                                                                background: "#fff", transition: "all 0.2s"
                                                            }} />
                                                        <div>
                                                            {pt.time && <div style={{ fontSize: 12, fontWeight: 800, color: "#0d3d35", fontVariantNumeric: "tabular-nums" }}>{pt.time}</div>}
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{pt.name}</div>
                                                        </div>
                                                        </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Drop Points */}
                                        {dropPoints.length > 0 && (
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: "#e53935", marginBottom: 14, paddingBottom: 8, borderBottom: "2px solid #ffebee", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                                                    DROP POINTS
                                                </div>
                                                <div style={{ maxHeight: "380px", overflowY: "auto", paddingRight: "6px" }} className="kt-scrollbar">
                                                    {dropPoints.map((pt, i) => {
                                                        const ptStr = `${pt.time ? pt.time + ' - ' : ''}${pt.name}`;
                                                        const isSelected = dropPoint === ptStr;
                                                        return (
                                                        <label key={i} onClick={() => setDropPoint(ptStr)}
                                                            style={{
                                                            display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                                                            marginBottom: 8, borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                                                            border: isSelected ? "2px solid #e53935" : "2px solid #e2e8f0",
                                                            background: isSelected ? "#fff0f2" : "#fff",
                                                        }}>
                                                            <div style={{
                                                                width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: 2,
                                                                border: isSelected ? "5px solid #e53935" : "2px solid #cbd5e1",
                                                                background: "#fff", transition: "all 0.2s"
                                                            }} />
                                                        <div>
                                                            {pt.time && <div style={{ fontSize: 12, fontWeight: 800, color: "#c62828", fontVariantNumeric: "tabular-nums" }}>{pt.time}</div>}
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{pt.name}</div>
                                                        </div>
                                                        </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                    </div> {/* End Left Column */}

                    {/* ── Summary Panel ─────────────────────────────────── */}
                    <div className="kt-card booking-summary-panel" style={{ width: 224, alignSelf: "flex-start", position: "sticky", top: 80 }}>
                        <div className="kt-card-header" style={{ padding: "14px 18px" }}>
                            <h2 style={{ fontSize: 15 }}>Booking Summary</h2>
                        </div>
                        <div className="kt-card-body" style={{ padding: 16 }}>

                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.3px" }}>Selected Seats</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, minHeight: 28 }}>
                                    {selectedSeats.length === 0 ? (
                                        <span style={{ color: "#cbd5e1", fontSize: 12 }}>None selected</span>
                                    ) : selectedSeats.sort((a, b) => a - b).map(s => (
                                        <span key={s} style={{
                                            background: "#c8ff00", color: "#062f29",
                                            padding: "2px 9px", borderRadius: 12,
                                            fontSize: 12, fontWeight: 700,
                                        }}>{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: 10, marginBottom: 14 }}>
                                {[
                                    { label: "Seats", value: selectedSeats.length },
                                    { label: "Price/seat", value: `₹${bus.price || 0}` },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 5 }}>
                                        <span>{label}</span><span style={{ fontWeight: 700, color: "#334155" }}>{value}</span>
                                    </div>
                                ))}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "#0d7a6f", marginTop: 10, borderTop: "1px solid #e2e8f0", paddingTop: 8 }}>
                                    <span>Total</span><span>₹{totalFare.toFixed(0)}</span>
                                </div>
                            </div>

                            <button
                                className="btn-kt-accent"
                                style={{ width: "100%", padding: 12, fontSize: 14 }}
                                onClick={() => {
                                    const needsPoints = (pickupPoints.length > 0 && !boardingPoint) || (dropPoints.length > 0 && !dropPoint);
                                    if (needsPoints) {
                                        document.getElementById("points-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                    } else {
                                        proceedToBook();
                                    }
                                }}
                                disabled={selectedSeats.length === 0}
                            >
                                {((pickupPoints.length > 0 && !boardingPoint) || (dropPoints.length > 0 && !dropPoint)) ? "Select Points ↓" : "Proceed →"}
                            </button>
                            <button
                                className="btn-kt-primary"
                                style={{ width: "100%", padding: 10, marginTop: 8, fontSize: 12 }}
                                onClick={() => navigate(-1)}
                            >
                                ← Back
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>

            {/* Modal for Images */ }
    {
        selectedPhotoIndex !== null && busPhotos.length > 0 && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)" }}>
                <button onClick={() => setSelectedPhotoIndex(null)} style={{ position: "absolute", top: 20, right: 30, background: "transparent", border: "none", color: "#fff", fontSize: 40, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#c8ff00"} onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}>&times;</button>

                <div style={{ position: "relative", width: "90%", maxWidth: "900px", height: "80%", display: "flex", alignItems: "center", justifyContent: "center" }}>

                    {busPhotos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(prev => (prev === 0 ? busPhotos.length - 1 : prev - 1)); }}
                            style={{ position: "absolute", left: -50, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", width: 50, height: 50, borderRadius: "50%", cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "scale(1.1)" }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)" }}>
                            &#10094;
                        </button>
                    )}

                    <img src={busPhotos[selectedPhotoIndex]} alt="Bus Full Size" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }} />

                    {busPhotos.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPhotoIndex(prev => (prev === busPhotos.length - 1 ? 0 : prev + 1)); }}
                            style={{ position: "absolute", right: -50, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", width: 50, height: 50, borderRadius: "50%", cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "scale(1.1)" }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)" }}>
                            &#10095;
                        </button>
                    )}
                </div>

                <div style={{ marginTop: 24, color: "#fff", fontSize: 16, fontWeight: 500, background: "rgba(0,0,0,0.5)", padding: "6px 16px", borderRadius: 20 }}>
                    {selectedPhotoIndex + 1} / {busPhotos.length}
                </div>
            </div>
        )
    }
        </>
    );
}

export default SeatMap;
