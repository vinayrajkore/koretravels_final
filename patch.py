import re

# 1. Read SeatMap.jsx
with open('frontend/src/components/SeatMap.jsx', 'r', encoding='utf-8') as f:
    seatmap_content = f.read()

# 2. Extract colors and components
colors_match = re.search(r'// ── Seat status color palette ───.*?(?=(// ── Main SeatMap Component ───))', seatmap_content, re.DOTALL)
colors_code = colors_match.group(0)

# Replace 'available' colors to match Admin's Free colors (e8f5f2, 1a7a6e)
colors_code = colors_code.replace(
    'available: { bg: "#edf9f8", border: "#5ecec3", color: "#0d6156" }',
    'available: { bg: "#e8f5f2", border: "#1a7a6e", color: "#1a7a6e" }'
).replace(
    'blocked:   { bg: "#f1f5f9", border: "#94a3b8", color: "#94a3b8" }',
    'blocked:   { bg: "#fff8e1", border: "#ff8c00", color: "#ff8c00" }'
)

# 3. Extract Layout renderers
layouts_match = re.search(r'    // ── Layout Renderers ───.*?(?=(    // ── Render active grid based on layout ───))', seatmap_content, re.DOTALL)
layouts_code = layouts_match.group(0)

# 4. Extract renderGrid
renderGrid_match = re.search(r'    const renderGrid = \(\) => \{.*?(?=(    // ── Loading State ───|    // ── Main Render ───))', seatmap_content, re.DOTALL)
renderGrid_code = renderGrid_match.group(0)

# Replace 'toggleSeat' with 'handleSeatClick' in layouts_code
layouts_code = layouts_code.replace('onToggle={toggleSeat}', 'onToggle={handleSeatClick}')

# Read AdminSeatManager.jsx
with open('frontend/src/components/AdminSeatManager.jsx', 'r', encoding='utf-8') as f:
    admin_content = f.read()

# Inject Colors and Components
admin_content = re.sub(
    r'(function AdminSeatManager\(\) \{)', 
    colors_code + r'\n\1', 
    admin_content
)

# Add activeDeck state
admin_content = admin_content.replace(
    'const [blockReason, setBlockReason] = useState("");',
    'const [blockReason, setBlockReason] = useState("");\n    const [activeDeck, setActiveDeck] = useState("lower");'
)

# Extract getStatus and currentBus logic
admin_content = admin_content.replace(
    '    const getSeatStatus = (seat) => {',
    '    const currentBus = buses.find(b => String(b.id) === String(currentBusId));\n    const layout = currentBus?.seat_layout || "2+2 Seater";\n\n    const getStatus = (seat) => {\n        const strSeat = String(seat);\n        if (bookedSeats.includes(strSeat))  return "booked";\n        if (blockedSeats.includes(strSeat)) return "blocked";\n        return "available";\n    };\n\n    const getSeatStatus = (seat) => {'
)

# Inject Layout renderers before return
admin_content = admin_content.replace(
    '    return (',
    layouts_code + '\n' + renderGrid_code + '\n    return ('
)

# Remove hardcoded rows
admin_content = re.sub(
    r'    const totalSeats = 40;.*?rows\.push\(\[s, s\+1, s\+2, s\+3\]\);\n    \}',
    '',
    admin_content,
    flags=re.DOTALL
)

# Replace the grid DOM in AdminSeatManager
grid_replace_start = '<div style={{ maxWidth: "260px", margin: "0 auto" }}>'
grid_replace_end = '</div>\n                    </div>'
grid_regex = r'<div style={{ maxWidth: "260px", margin: "0 auto" }}>.*?</div>\n                    </div>'

admin_content = re.sub(
    grid_regex,
    '<div style={{ width: "100%", overflowX: "auto" }}>{renderGrid()}</div>\n                    </div>',
    admin_content,
    flags=re.DOTALL
)

# Add Deck Toggle if dual deck
deck_toggle = """
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
"""

admin_content = admin_content.replace(
    '<div style={{ width: "100%", overflowX: "auto" }}>{renderGrid()}</div>',
    deck_toggle + '\n                        <div style={{ width: "100%", overflowX: "auto" }}>{renderGrid()}</div>'
)

# Replace totalSeats hardcoded value
admin_content = admin_content.replace(
    'const freeCount    = totalSeats - bookedSeats.length - blockedSeats.length;',
    'const totalSeats = currentBus?.total_seats || 40;\n    const freeCount    = totalSeats - bookedSeats.length - blockedSeats.length;'
)

with open('frontend/src/components/AdminSeatManager.jsx', 'w', encoding='utf-8') as f:
    f.write(admin_content)
print("Patched AdminSeatManager.jsx")
