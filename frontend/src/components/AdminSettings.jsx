// AdminSettings.jsx — Admin page to configure KoreBot AI (OpenRouter key)
import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import API_URL from "../api";

function AdminSettings() {
    const [key, setKey]         = useState("");
    const [saved, setSaved]     = useState("");
    const [model, setModel]     = useState("meta-llama/llama-3.1-8b-instruct:free");
    const [savedModel, setSavedModel] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [show, setShow]       = useState(false);
    const [msg, setMsg]         = useState(null);

    const availableModels = [
        { value: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B Instruct (Free/Reliable)" },
        { value: "google/gemini-2.5-flash-free", label: "Google Gemini 2.5 Flash (Free)" },
        { value: "google/gemini-2.0-pro-exp-02-05:free", label: "Google Gemini 2.0 Pro Exp (Free)" },
        { value: "mistralai/mistral-7b-instruct:free", label: "Mistral 7B Instruct (Free/Often Offline)" },
        { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Paid)" },
        { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo (Paid)" }
    ];

    useEffect(() => {
        axios.get(`${API_URL}/admin/settings`)
            .then(r => { 
                if (r.data?.openrouter_api_key) { setSaved(r.data.openrouter_api_key); setKey(r.data.openrouter_api_key); } 
                if (r.data?.openrouter_model) { setSavedModel(r.data.openrouter_model); setModel(r.data.openrouter_model); }
            })
            .catch(() => {})
            .finally(() => setFetching(false));
    }, []);

    const handleSave = async () => {
        if (!key.trim()) return;
        setLoading(true); setMsg(null);
        try {
            await axios.put(`${API_URL}/admin/settings`, { key: "openrouter_api_key", value: key.trim() });
            await axios.put(`${API_URL}/admin/settings`, { key: "openrouter_model", value: model });
            setSaved(key.trim());
            setSavedModel(model);
            setMsg({ type: "success", text: "✅ OpenRouter AI settings saved! KoreBot AI mode is now updated." });
        } catch(e) {
            setMsg({ type: "error", text: "❌ Failed to save: " + (e?.response?.data?.message || e.message) });
        } finally { setLoading(false); }
    };

    const handleClear = async () => {
        if (!window.confirm("Remove the API key? AI mode will be disabled.")) return;
        setLoading(true);
        try {
            await axios.put(`${API_URL}/admin/settings`, { key: "openrouter_api_key", value: "" });
            setKey(""); setSaved("");
            setMsg({ type: "success", text: "✅ API key removed. AI mode disabled." });
        } catch(e) {
            setMsg({ type: "error", text: "Failed to remove key." });
        } finally { setLoading(false); }
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>

                {/* Page title */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ color: "#062f29", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.4px" }}>
                        ⚙️ Bot & AI Settings
                    </h1>
                    <p style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                        Configure KoreBot's AI mode using an OpenRouter API key and model selection.
                    </p>
                </div>

                {/* KoreBot AI Card */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 24 }}>

                    {/* Card header */}
                    <div style={{ background: "linear-gradient(135deg, #0d3d35 0%, #1a7a6e 100%)", padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(200,255,0,0.15)", border: "1.5px solid rgba(200,255,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3a2 2 0 0 1 2 2v4H10V5a2 2 0 0 1 2-2z"/><circle cx="9" cy="16" r="1.2" fill="#c8ff00"/><circle cx="15" cy="16" r="1.2" fill="#c8ff00"/></svg>
                        </div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>KoreBot AI Mode</div>
                            <div style={{ color: "rgba(200,255,0,0.7)", fontSize: 12 }}>Powered by OpenRouter</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                            <span style={{
                                background: saved ? "rgba(200,255,0,0.2)" : "rgba(255,255,255,0.1)",
                                border: `1px solid ${saved ? "rgba(200,255,0,0.4)" : "rgba(255,255,255,0.2)"}`,
                                color: saved ? "#c8ff00" : "rgba(255,255,255,0.5)",
                                borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700,
                            }}>
                                {fetching ? "Loading..." : saved ? "● Active" : "○ Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "24px" }}>

                        {/* Info box */}
                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
                            <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4 }}>How to get your free OpenRouter API key:</div>
                            <ol style={{ color: "#166534", margin: 0, paddingLeft: 18, lineHeight: 1.9, fontSize: 12 }}>
                                <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noreferrer" style={{ color: "#0d7a6e", fontWeight: 700 }}>openrouter.ai</a> and sign up (free)</li>
                                <li>Click your profile → <strong>API Keys</strong> → Create a new key</li>
                                <li>Copy and paste the key below</li>
                                <li>Select a reliable free model like <strong>Llama 3.1</strong> or <strong>Gemini</strong>.</li>
                            </ol>
                        </div>

                        {/* Key input */}
                        <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            OpenRouter API Key
                        </label>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <input
                                type={show ? "text" : "password"}
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    padding: "11px 44px 11px 14px",
                                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                                    fontSize: 13, fontFamily: "monospace",
                                    outline: "none", color: "#0f172a",
                                    background: "#f8fafc",
                                }}
                            />
                            <button onClick={() => setShow(s => !s)} style={{
                                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", color: "#64748b",
                                fontSize: 12, fontWeight: 600, padding: "2px 4px",
                            }}>{show ? "Hide" : "Show"}</button>
                        </div>

                        {/* Model input */}
                        <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            AI Model
                        </label>
                        <div style={{ marginBottom: 16 }}>
                            <select
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    padding: "11px 14px",
                                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                                    fontSize: 13,
                                    outline: "none", color: "#0f172a",
                                    background: "#f8fafc", cursor: "pointer"
                                }}
                            >
                                {availableModels.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button
                                onClick={handleSave}
                                disabled={loading || !key.trim() || (key === saved && model === savedModel)}
                                style={{
                                    flex: 1, padding: "11px", borderRadius: 10, border: "none",
                                    background: (!loading && key.trim() && (key !== saved || model !== savedModel))
                                        ? "linear-gradient(135deg, #0d3d35, #1a7a6e)"
                                        : "#e2e8f0",
                                    color: (!loading && key.trim() && (key !== saved || model !== savedModel)) ? "#c8ff00" : "#94a3b8",
                                    fontWeight: 800, fontSize: 13, cursor: (!loading && key.trim() && (key !== saved || model !== savedModel)) ? "pointer" : "not-allowed",
                                    transition: "all 0.2s",
                                }}
                            >
                                {loading ? "Saving..." : (key === saved && model === savedModel && saved) ? "✓ Saved" : "Save Settings"}
                            </button>
                            {saved && (
                                <button onClick={handleClear} disabled={loading} style={{
                                    padding: "11px 18px", borderRadius: 10,
                                    border: "1.5px solid #fca5a5", background: "#fff5f5",
                                    color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer",
                                }}>Remove Key</button>
                            )}
                        </div>

                        {/* Feedback message */}
                        {msg && (
                            <div style={{
                                marginTop: 14, padding: "10px 14px", borderRadius: 8,
                                background: msg.type === "success" ? "#f0fdf4" : "#fff5f5",
                                border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fca5a5"}`,
                                color: msg.type === "success" ? "#166534" : "#dc2626",
                                fontSize: 13, fontWeight: 600,
                            }}>{msg.text}</div>
                        )}
                    </div>
                </div>

                {/* Status card */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>KoreBot Features</div>
                    {[
                        { icon: "🔍", label: "Route Search Mode", desc: "Always active — searches live bus data", active: true },
                        { icon: "🤖", label: "AI Assistant Mode", desc: "Answers travel questions using OpenRouter", active: !!saved },
                        { icon: "📱", label: "Mobile Responsive", desc: "Works on all screen sizes", active: true },
                        { icon: "🚌", label: "Live Bus Results", desc: "Shows real-time bus availability with Book Now button", active: true },
                    ].map((f, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                            <span style={{ fontSize: 18 }}>{f.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{f.label}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>{f.desc}</div>
                            </div>
                            <span style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                background: f.active ? "#f0fdf4" : "#f8fafc",
                                color: f.active ? "#166534" : "#94a3b8",
                                border: `1px solid ${f.active ? "#bbf7d0" : "#e2e8f0"}`,
                            }}>{f.active ? "Active" : "Inactive"}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminSettings;
