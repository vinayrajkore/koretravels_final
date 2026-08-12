import API_URL from "../api";
// AdminSeatManager.jsx - Block / Unblock individual seats per bus
// Same interactive seat grid as SeatMap.jsx
// Admin can manually block or unblock any seat

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

// ── Seat status color palette ────────────────────────────────────
const COLORS = {
    available: { bg: "#e8f5f2", border: "#1a7a6e", color: "#1a7a6e" },
    selected:  { bg: "#c8ff00", border: "#094035", color: "#094035" },
    booked:    { bg: "#fee2e2", border: "#fca5a5", color: "#dc2626" },
    blocked:   { bg: "#fff8e1", border: "#ff8c00", color: "#ff8c00" },
};

// ── Individual Seat Components ───────────────────────────────────

// Chair Seat — square with top border headrest
function ChairSeat({ num, status, onToggle }) {
    const c = COLORS[status];
    const taken = status === "booked" || status === "blocked";
    // ── Layout Renderers ─────────────────────────────────────────

    // 2+2 Seater — 10 rows × 4 chairs = 40 seats
    // Row r: seats [r*4+1, r*4+2, r*4+3, r*4+4]
    const render22Seater = () =>
        Array.from({ length: 10 }, (_, r) => {
            const b = r * 4;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+4} status={getStatus(b+4)} onToggle={handleSeatClick} />
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
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
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
                        ? <BerthSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />}
                    {isUpper
                        ? <BerthSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />}
                    <Aisle />
                    {isUpper
                        ? <BerthSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />}
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
                const leftN  = r + 1;
                const rightA = 11 + r * 2;
                const rightB = 12 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
                    </div>
                );
            } else {
                const leftN  = 31 + r;
                const rightA = 41 + r * 2;
                const rightB = 42 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        {/* Double berth — two adjacent berths, visually joined */}
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
            const leftN  = `${prefix}${r * 3 + 1}`;
            const rightA = `${prefix}${r * 3 + 2}`;
            const rightB = `${prefix}${r * 3 + 3}`;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                    <Aisle />
                    {/* Double berth — two adjacent berths, visually joined */}
                    <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                        <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <ChairSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        {row[0] ? <ChairSeat num={row[0]} status={getStatus(row[0])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        {row[1] ? <ChairSeat num={row[1]} status={getStatus(row[1])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        <Aisle />
                        <ChairSeat num={row[2]} status={getStatus(row[2])} onToggle={handleSeatClick} />
                        <ChairSeat num={row[3]} status={getStatus(row[3])} onToggle={handleSeatClick} />
                    </div>
                ))}
                {/* Last Row - 5 Seats (Aisle converted to seat) */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={lastRow[0]} status={getStatus(lastRow[0])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[1]} status={getStatus(lastRow[1])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[2]} status={getStatus(lastRow[2])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[3]} status={getStatus(lastRow[3])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[4]} status={getStatus(lastRow[4])} onToggle={handleSeatClick} />
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
                                    <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} height={96} />
                                </div>
                                <Aisle />
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row1[0]} status={getStatus(row1[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row1[1]} status={getStatus(row1[1])} onToggle={handleSeatClick} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row2[0]} status={getStatus(row2[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row2[1]} status={getStatus(row2[1])} onToggle={handleSeatClick} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Row 11: 23 (aisle space), 22, 21 */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 44 }} />
                        <ChairSeat num={23} status={getStatus(23)} onToggle={handleSeatClick} />
                        <ChairSeat num={22} status={getStatus(22)} onToggle={handleSeatClick} />
                        <ChairSeat num={21} status={getStatus(21)} onToggle={handleSeatClick} />
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
                            <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} />
                            <Aisle />
                            <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                                <BerthSeat num={rightInner[i]} status={getStatus(rightInner[i])} onToggle={handleSeatClick} />
                                <BerthSeat num={rightOuter[i]} status={getStatus(rightOuter[i])} onToggle={handleSeatClick} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };


    const renderGrid = () => {
        switch (layout) {
            case "2+2 Seater":         return render22Seater();
            case "2+1 Seater":         return render21Seater();
            case "Semi-Sleeper (2+1)": return renderSemiSleeper(activeDeck);
            case "Full Sleeper":       return renderFullSleeper(activeDeck);
            case "2+1 AC Sleeper":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>LOWER BERTH(15)</div>
                            {render21ACSleeper("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>UPPER BERTH(15)</div>
                            {render21ACSleeper("upper")}
                        </div>
                    </div>
                );
            case "Non A/C Seater / Sleeper (2+1)":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>LOWER BERTH(33)</div>
                            {renderNonAcSeaterSleeper("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>UPPER BERTH(15)</div>
                            {renderNonAcSeaterSleeper("upper")}
                        </div>
                    </div>
                );
            case "A/C Seater / Sleeper (2+1)":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>Lower Deck</div>
                            {renderAcSeaterSleeper21("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>Upper Deck</div>
                            {renderAcSeaterSleeper21("upper")}
                        </div>
                    </div>
                );
            case "NON A/C Seater (2+2)": return renderNonAcSeater22();
            default:                   return render22Seater();
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
        if (layout === "Non A/C Seater / Sleeper (2+1)")
            return activeDeck === "lower" ? "Lower Deck — Seater Chairs (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        return "";
    };




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
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : num}
        </div>
    );
}

// Berth Seat — tall vertical rectangle (like RedBus sleeper)
function BerthSeat({ num, status, onToggle, isDouble = false, height = 78 }) {
    const c = COLORS[status];
    const taken = status === "booked" || status === "blocked";
    // ── Layout Renderers ─────────────────────────────────────────

    // 2+2 Seater — 10 rows × 4 chairs = 40 seats
    // Row r: seats [r*4+1, r*4+2, r*4+3, r*4+4]
    const render22Seater = () =>
        Array.from({ length: 10 }, (_, r) => {
            const b = r * 4;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+4} status={getStatus(b+4)} onToggle={handleSeatClick} />
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
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
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
                        ? <BerthSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />}
                    {isUpper
                        ? <BerthSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />}
                    <Aisle />
                    {isUpper
                        ? <BerthSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />}
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
                const leftN  = r + 1;
                const rightA = 11 + r * 2;
                const rightB = 12 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
                    </div>
                );
            } else {
                const leftN  = 31 + r;
                const rightA = 41 + r * 2;
                const rightB = 42 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        {/* Double berth — two adjacent berths, visually joined */}
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
            const leftN  = `${prefix}${r * 3 + 1}`;
            const rightA = `${prefix}${r * 3 + 2}`;
            const rightB = `${prefix}${r * 3 + 3}`;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                    <Aisle />
                    {/* Double berth — two adjacent berths, visually joined */}
                    <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                        <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <ChairSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        {row[0] ? <ChairSeat num={row[0]} status={getStatus(row[0])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        {row[1] ? <ChairSeat num={row[1]} status={getStatus(row[1])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        <Aisle />
                        <ChairSeat num={row[2]} status={getStatus(row[2])} onToggle={handleSeatClick} />
                        <ChairSeat num={row[3]} status={getStatus(row[3])} onToggle={handleSeatClick} />
                    </div>
                ))}
                {/* Last Row - 5 Seats (Aisle converted to seat) */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={lastRow[0]} status={getStatus(lastRow[0])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[1]} status={getStatus(lastRow[1])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[2]} status={getStatus(lastRow[2])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[3]} status={getStatus(lastRow[3])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[4]} status={getStatus(lastRow[4])} onToggle={handleSeatClick} />
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
                                    <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} height={96} />
                                </div>
                                <Aisle />
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row1[0]} status={getStatus(row1[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row1[1]} status={getStatus(row1[1])} onToggle={handleSeatClick} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row2[0]} status={getStatus(row2[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row2[1]} status={getStatus(row2[1])} onToggle={handleSeatClick} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Row 11: 23 (aisle space), 22, 21 */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 44 }} />
                        <ChairSeat num={23} status={getStatus(23)} onToggle={handleSeatClick} />
                        <ChairSeat num={22} status={getStatus(22)} onToggle={handleSeatClick} />
                        <ChairSeat num={21} status={getStatus(21)} onToggle={handleSeatClick} />
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
                            <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} />
                            <Aisle />
                            <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                                <BerthSeat num={rightInner[i]} status={getStatus(rightInner[i])} onToggle={handleSeatClick} />
                                <BerthSeat num={rightOuter[i]} status={getStatus(rightOuter[i])} onToggle={handleSeatClick} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };


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
        if (layout === "Non A/C Seater / Sleeper (2+1)")
            return activeDeck === "lower" ? "Lower Deck — Seater Chairs (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        return "";
    };




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
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : num}
        </div>
    );
}

// Aisle gap
function Aisle() {
    return <div style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#d1d5db", fontSize: 10 }}>|</div>;
}


function AdminSeatManager() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const bus_id   = searchParams.get("bus_id");
    const bus_name = searchParams.get("bus_name") || "Bus";

    // useEffect - same as internship pattern
    const [bookedSeats,  setBookedSeats]  = useState([]);
    const [blockedSeats, setBlockedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockReason, setBlockReason] = useState("");
    const [activeDeck, setActiveDeck] = useState("lower");
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [buses, setBuses] = useState([]);
    const [currentBusId, setCurrentBusId] = useState(bus_id || "");

    useEffect(() => {
        axios.get(`${API_URL}/buses`).then(r => setBuses(r.data));
    }, []);

    useEffect(() => {
        if (currentBusId) loadSeats();
    }, [currentBusId]);

    const loadSeats = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/bookedseats/${currentBusId}`);
            let booked = [];
            let blocked = [];
            res.data.forEach(row => {
                const seatsArr = row.seat.split(",").map(s => s.trim());
                if (row.type === "booked") booked.push(...seatsArr);
                if (row.type === "blocked") blocked.push(...seatsArr);
            });
            setBookedSeats(booked);
            setBlockedSeats(blocked);
        } catch (err) { alert("Error: " + err.message); }
        finally { setLoading(false); }
    };

    const currentBus = buses.find(b => String(b.id) === String(currentBusId));
    const layout = currentBus?.seat_layout || "2+2 Seater";

    const getStatus = (seat) => {
        const strSeat = String(seat);
        if (bookedSeats.includes(strSeat))  return "booked";
        if (blockedSeats.includes(strSeat)) return "blocked";
        return "available";
    };

    const getSeatStatus = (seat) => {
        const strSeat = String(seat);
        if (bookedSeats.includes(strSeat))  return "booked";
        if (blockedSeats.includes(strSeat)) return "blocked";
        return "free";
    };

    const handleSeatClick = (seat) => {
        const status = getSeatStatus(seat);
        if (status === "booked") {
            alert(`Seat ${seat} is currently booked by a customer. Cancel the booking to free it.`);
            return;
        }
        if (status === "blocked") {
            // Unblock it
            if (window.confirm(`Unblock seat ${seat}?`)) unblockSeat(seat);
            return;
        }
        // Free - open block modal
        setSelectedSeat(seat);
        setShowModal(true);
    };

    // Block seat - axios.post to /admin/blockseat (same POST pattern as internship)
    const blockSeat = async () => {
        try {
            const res = await axios.post(`${API_URL}/admin/blockseat`, {
                bus_id: currentBusId, seat_number: selectedSeat, reason: blockReason || "Admin blocked"
            });
            alert(res.data.message);
            setShowModal(false);
            setBlockReason("");
            setSelectedSeat(null);
            loadSeats();
        } catch (err) { alert("Error: " + err.message); }
    };

    // Unblock seat - axios.delete to /admin/unblockseat (same DELETE pattern as internship)
    const unblockSeat = async (seat) => {
        try {
            const res = await axios.delete(`${API_URL}/admin/unblockseat`, {
                data: { bus_id: currentBusId, seat_number: seat }
            });
            alert(res.data.message);
            loadSeats();
        } catch (err) { alert("Error: " + err.message); }
    };

    // Seat color
    const getSeatStyle = (seat) => {
        const s = getSeatStatus(seat);
        if (s === "booked")  return { background: "#ffcdd2", borderColor: "#e53935", color: "#e53935", cursor: "not-allowed" };
        if (s === "blocked") return { background: "#fff8e1", borderColor: "#ff8c00", color: "#ff8c00", cursor: "pointer" };
        return { background: "#e8f5f2", borderColor: "#1a7a6e", color: "#1a7a6e", cursor: "pointer" };
    };



    const totalSeats = currentBus?.total_seats || 40;
    const freeCount    = totalSeats - bookedSeats.length - blockedSeats.length;
    const bookedCount  = bookedSeats.length;
    const blockedCount = blockedSeats.length;

    // ── Layout Renderers ─────────────────────────────────────────

    // 2+2 Seater — 10 rows × 4 chairs = 40 seats
    // Row r: seats [r*4+1, r*4+2, r*4+3, r*4+4]
    const render22Seater = () =>
        Array.from({ length: 10 }, (_, r) => {
            const b = r * 4;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+4} status={getStatus(b+4)} onToggle={handleSeatClick} />
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
                    <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                    <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                    <Aisle />
                    <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
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
                        ? <BerthSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+1} status={getStatus(b+1)} onToggle={handleSeatClick} />}
                    {isUpper
                        ? <BerthSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+2} status={getStatus(b+2)} onToggle={handleSeatClick} />}
                    <Aisle />
                    {isUpper
                        ? <BerthSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />
                        : <ChairSeat num={b+3} status={getStatus(b+3)} onToggle={handleSeatClick} />}
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
                const leftN  = r + 1;
                const rightA = 11 + r * 2;
                const rightB = 12 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
                    </div>
                );
            } else {
                const leftN  = 31 + r;
                const rightA = 41 + r * 2;
                const rightB = 42 + r * 2;
                return (
                    <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        {/* Double berth — two adjacent berths, visually joined */}
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
            const leftN  = `${prefix}${r * 3 + 1}`;
            const rightA = `${prefix}${r * 3 + 2}`;
            const rightB = `${prefix}${r * 3 + 3}`;
            return (
                <div key={r} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                    <Aisle />
                    {/* Double berth — two adjacent berths, visually joined */}
                    <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                        <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <ChairSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <ChairSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                        <ChairSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        <BerthSeat num={leftN}  status={getStatus(leftN)}  onToggle={handleSeatClick} />
                        <Aisle />
                        <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                            <BerthSeat num={rightA} status={getStatus(rightA)} onToggle={handleSeatClick} />
                            <BerthSeat num={rightB} status={getStatus(rightB)} onToggle={handleSeatClick} />
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
                        {row[0] ? <ChairSeat num={row[0]} status={getStatus(row[0])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        {row[1] ? <ChairSeat num={row[1]} status={getStatus(row[1])} onToggle={handleSeatClick} /> : <div style={{ width: 47 }} />}
                        <Aisle />
                        <ChairSeat num={row[2]} status={getStatus(row[2])} onToggle={handleSeatClick} />
                        <ChairSeat num={row[3]} status={getStatus(row[3])} onToggle={handleSeatClick} />
                    </div>
                ))}
                {/* Last Row - 5 Seats (Aisle converted to seat) */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <ChairSeat num={lastRow[0]} status={getStatus(lastRow[0])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[1]} status={getStatus(lastRow[1])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[2]} status={getStatus(lastRow[2])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[3]} status={getStatus(lastRow[3])} onToggle={handleSeatClick} />
                    <ChairSeat num={lastRow[4]} status={getStatus(lastRow[4])} onToggle={handleSeatClick} />
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
                                    <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} height={96} />
                                </div>
                                <Aisle />
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row1[0]} status={getStatus(row1[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row1[1]} status={getStatus(row1[1])} onToggle={handleSeatClick} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <ChairSeat num={row2[0]} status={getStatus(row2[0])} onToggle={handleSeatClick} />
                                        <ChairSeat num={row2[1]} status={getStatus(row2[1])} onToggle={handleSeatClick} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Row 11: 23 (aisle space), 22, 21 */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 44 }} />
                        <ChairSeat num={23} status={getStatus(23)} onToggle={handleSeatClick} />
                        <ChairSeat num={22} status={getStatus(22)} onToggle={handleSeatClick} />
                        <ChairSeat num={21} status={getStatus(21)} onToggle={handleSeatClick} />
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
                            <BerthSeat num={berth} status={getStatus(berth)} onToggle={handleSeatClick} />
                            <Aisle />
                            <div style={{ display: "flex", gap: 2, background: "#f5f3ff", borderRadius: 10, padding: 2, border: "1.5px dashed #7c3aed" }}>
                                <BerthSeat num={rightInner[i]} status={getStatus(rightInner[i])} onToggle={handleSeatClick} />
                                <BerthSeat num={rightOuter[i]} status={getStatus(rightOuter[i])} onToggle={handleSeatClick} />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    };


    const renderGrid = () => {
        switch (layout) {
            case "2+2 Seater":         return render22Seater();
            case "2+1 Seater":         return render21Seater();
            case "Semi-Sleeper (2+1)": return renderSemiSleeper(activeDeck);
            case "Full Sleeper":       return renderFullSleeper(activeDeck);
            case "2+1 AC Sleeper":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>LOWER BERTH(15)</div>
                            {render21ACSleeper("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>UPPER BERTH(15)</div>
                            {render21ACSleeper("upper")}
                        </div>
                    </div>
                );
            case "Non A/C Seater / Sleeper (2+1)":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>LOWER BERTH(33)</div>
                            {renderNonAcSeaterSleeper("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>UPPER BERTH(15)</div>
                            {renderNonAcSeaterSleeper("upper")}
                        </div>
                    </div>
                );
            case "A/C Seater / Sleeper (2+1)":
                return (
                    <div style={{ display: "flex", gap: 30, justifyContent: "center" }}>
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#1a7a6e", marginBottom: 16 }}>Lower Deck</div>
                            {renderAcSeaterSleeper21("lower")}
                        </div>
                        <div style={{ width: 1.5, background: "#e2e8f0" }} />
                        <div>
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#e11d48", marginBottom: 16 }}>Upper Deck</div>
                            {renderAcSeaterSleeper21("upper")}
                        </div>
                    </div>
                );
            case "NON A/C Seater (2+2)": return renderNonAcSeater22();
            default:                   return render22Seater();
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
        if (layout === "Non A/C Seater / Sleeper (2+1)")
            return activeDeck === "lower" ? "Lower Deck — Seater Chairs (2+1)" : "Upper Deck — Sleeper Berths (2+1)";
        return "";
    };




    return (
        <AdminLayout>

            {/* Block Seat Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", maxWidth: "400px", width: "100%", margin: "20px" }}>
                        <h3 style={{ color: "#ff8c00", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Block Seat {selectedSeat}
                        </h3>
                        <p style={{ color: "#555", fontSize: "14px", marginBottom: "14px" }}>This seat will be unavailable for booking until you unblock it.</p>
                        <label style={{ fontWeight: "600", color: "#333", fontSize: "13px", display: "block", marginBottom: "6px" }}>Reason:</label>
                        <input
                            value={blockReason} onChange={e => setBlockReason(e.target.value)}
                            placeholder="e.g. Seat damaged, Reserved for VIP..."
                            style={{ width: "100%", padding: "10px", border: "2px solid #ddd", borderRadius: "7px", fontSize: "14px", marginBottom: "18px", background: "#fff", color: "#222", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={blockSeat}
                                style={{ flex: 1, padding: "11px", background: "#ff8c00", color: "#fff", border: "none", borderRadius: "7px", fontWeight: "700", cursor: "pointer" }}>
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Block Seat
                                </span>
                            </button>
                            <button onClick={() => { setShowModal(false); setSelectedSeat(null); }}
                                style={{ flex: 1, padding: "11px", background: "#eee", color: "#333", border: "none", borderRadius: "7px", fontWeight: "600", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#0d3d35", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Seat Manager
                </h2>
                <button onClick={() => navigate("/admin/buses")}
                    style={{ padding: "8px 16px", background: "#eee", color: "#333", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px" }}>
                    ← Back to Buses
                </button>
            </div>

            {/* Bus Selector */}
            <div style={{ background: "#fff", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
                <label style={{ fontWeight: "700", color: "#1a7a6e", marginBottom: "8px", display: "block" }}>Select Bus:</label>
                <select value={currentBusId} onChange={e => setCurrentBusId(e.target.value)}
                    style={{ padding: "10px 14px", border: "2px solid #d0e8e4", borderRadius: "8px", fontSize: "14px", background: "#fff", color: "#222", minWidth: "300px" }}>
                    <option value="">-- Choose a Bus --</option>
                    {buses.map(b => (
                        <option key={b.id} value={b.id}>{b.bus_name} ({b.bus_number}) | {b.from_city} → {b.to_city} | {b.travel_date}</option>
                    ))}
                </select>
            </div>

            {!currentBusId ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px", color: "#888" }}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    </div>
                    <p>Select a bus above to manage its seats</p>
                </div>
            ) : loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>Loading seats...</p>
            ) : (
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                    {/* Seat Grid */}
                    <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", boxShadow: "0 3px 12px rgba(0,0,0,0.07)", flex: "1", minWidth: "320px" }}>

                        {/* Legend */}
                        <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
                            {[
                                { color: "#e8f5f2", border: "#1a7a6e", text: "#1a7a6e", label: "Free (click to block)" },
                                { color: "#fff8e1", border: "#ff8c00", text: "#ff8c00", label: "Blocked (click to unblock)" },
                                { color: "#ffcdd2", border: "#e53935", text: "#e53935", label: "Booked by customer" },
                            ].map((l, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px" }}>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "5px", background: l.color, border: "2px solid " + l.border }}></div>
                                    <span style={{ color: "#555" }}>{l.label}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: "center", marginBottom: "12px", fontSize: "12px", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
                            Driver | Front
                        </div>

                        {/* Seat Grid - same map pattern as internship */}
                        
                        {(layout === "Semi-Sleeper (2+1)" || layout === "Full Sleeper" || layout === "2+1 AC Sleeper" || layout === "Non A/C Seater / Sleeper (2+1)" || layout === "A/C Seater / Sleeper (2+1)") && (
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "20px", padding: "4px" }}>
                                    <button onClick={() => setActiveDeck("lower")}
                                        style={{ padding: "6px 20px", borderRadius: "16px", border: "none", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", background: activeDeck === "lower" ? "#1a7a6e" : "transparent", color: activeDeck === "lower" ? "#fff" : "#64748b" }}>
                                        Lower Deck
                                    </button>
                                    <button onClick={() => setActiveDeck("upper")}
                                        style={{ padding: "6px 20px", borderRadius: "16px", border: "none", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", background: activeDeck === "upper" ? "#1a7a6e" : "transparent", color: activeDeck === "upper" ? "#fff" : "#64748b" }}>
                                        Upper Deck
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ width: "100%", overflowX: "auto" }}>{renderGrid()}</div>
                    </div>

                    {/* Stats Panel */}
                    <div style={{ width: "200px" }}>
                        {[
                            { label: "Free Seats",    value: freeCount,    color: "#1a7a6e", bg: "#e8f5f2", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
                            { label: "Booked Seats",  value: bookedCount,  color: "#e53935", bg: "#ffebee", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M4 13v8"/><path d="M20 13v8"/><path d="M4 13h16"/></svg> },
                            { label: "Blocked Seats", value: blockedCount, color: "#ff8c00", bg: "#fff3e0", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                            { label: "Total Seats",   value: totalSeats,   color: "#333",    bg: "#f5f5f5", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
                        ].map((s, i) => (
                            <div key={i} style={{ background: s.bg, borderRadius: "10px", padding: "14px 16px", marginBottom: "12px", borderLeft: `4px solid ${s.color}` }}>
                                <div style={{ fontSize: "13px", color: "#666" }}>{s.icon} {s.label}</div>
                                <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.value}</div>
                            </div>
                        ))}

                        {blockedSeats.length > 0 && (
                            <div style={{ background: "#fff", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                                <div style={{ fontWeight: "700", color: "#ff8c00", marginBottom: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Blocked:
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                    {blockedSeats.sort((a,b) => a-b).map(s => (
                                        <span key={s} onClick={() => unblockSeat(s)}
                                            title="Click to unblock"
                                            style={{ background: "#fff8e1", color: "#ff8c00", border: "1px solid #ff8c00", padding: "2px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                                            {s} ×
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminSeatManager;
