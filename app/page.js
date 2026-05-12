"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://frltolbwpqhspcuoaznt.supabase.co";
const SUPABASE_KEY = "sb_publishable_NUFufKJZnldMXTtL-fE3Yg_ZFNFXwH4";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const C = {
  bg: "#080d1a", card: "#0f1829", cardHover: "#131f33", border: "#1a2840",
  accent: "#00c896", accentDim: "#00c89615", gold: "#f0b429", goldDim: "#f0b42915",
  text: "#e2e8f4", muted: "#4a5f80", danger: "#f43f5e", green: "#22c55e",
};

const fmt$ = (v) => v == null ? "—" : "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtPct = (v) => v == null ? "—" : Number(v).toFixed(2) + "%";
const calcMetrics = (prop) => {
  const a = prop.analysis;
  const monthlyExp = (parseFloat(prop.hoa || 0) + parseFloat(prop.taxes || 0) / 12 + parseFloat(prop.insurance || 0) / 12);
  const price = parseFloat(prop.price);
  const stCF = a.shortTermMonthly - monthlyExp - a.estimatedMortgage;
  const ltCF = a.longTermMonthly - monthlyExp - a.estimatedMortgage;
  const capRate = ((a.longTermMonthly * 12 - monthlyExp * 12) / price * 100);
  const grm = price / (a.longTermMonthly * 12);
  return { stCF, ltCF, capRate, grm, monthlyExp };
};
const blankForm = { address: "", price: "", beds: "", baths: "", sqft: "", hoa: "", taxes: "", insurance: "", notes: "" };

function generatePDF(list, title) {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const totalValue = list.properties.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const avgST = list.properties.length ? list.properties.reduce((s, p) => s + p.analysis.shortTermMonthly, 0) / list.properties.length : 0;
  const avgLT = list.properties.length ? list.properties.reduce((s, p) => s + p.analysis.longTermMonthly, 0) / list.properties.length : 0;
  const propRows = list.properties.map((prop, i) => {
    const a = prop.analysis; const m = calcMetrics(prop);
    return `<div class="prop-card"><div class="prop-header"><div><div class="prop-num">Property ${i + 1}</div><div class="prop-address">${prop.address}</div><div class="prop-sub">${prop.beds}bd · ${prop.baths}ba · ${Number(prop.sqft).toLocaleString()} sqft</div></div><div class="prop-price">${fmt$(parseFloat(prop.price))}</div></div><div class="metrics-grid"><div class="metric"><div class="metric-label">Short-Term Monthly</div><div class="metric-value accent">${fmt$(a.shortTermMonthly)}</div><div class="metric-sub">${a.shortTermOccupancy}% occ · ${a.strViability} viability</div></div><div class="metric"><div class="metric-label">Long-Term Monthly</div><div class="metric-value accent">${fmt$(a.longTermMonthly)}</div><div class="metric-sub">Est. market rent</div></div><div class="metric"><div class="metric-label">Est. Mortgage</div><div class="metric-value">${fmt$(a.estimatedMortgage)}</div><div class="metric-sub">7.5% · 30yr · 20% down</div></div><div class="metric"><div class="metric-label">Cap Rate</div><div class="metric-value gold">${fmtPct(m.capRate)}</div><div class="metric-sub">Net income / price</div></div><div class="metric"><div class="metric-label">ST Cash Flow</div><div class="metric-value ${m.stCF >= 0 ? "green" : "red"}">${fmt$(m.stCF)}/mo</div><div class="metric-sub">After all expenses</div></div><div class="metric"><div class="metric-label">LT Cash Flow</div><div class="metric-value ${m.ltCF >= 0 ? "green" : "red"}">${fmt$(m.ltCF)}/mo</div><div class="metric-sub">After all expenses</div></div></div><div class="analysis-box">${a.summary}</div>${prop.notes ? `<div class="notes">Notes: ${prop.notes}</div>` : ""}</div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${list.name}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;padding:40px;font-size:13px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #00c896;padding-bottom:20px;margin-bottom:28px}.brand{font-size:22px;font-weight:800;color:#00c896}.brand span{color:#1a1a2e}.report-title{font-size:26px;font-weight:800;color:#0f172a;margin-bottom:4px}.summary-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}.summary-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}.summary-box .label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:5px}.summary-box .value{font-size:18px;font-weight:700;color:#00c896;font-family:monospace}.prop-card{border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;page-break-inside:avoid}.prop-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.prop-num{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#f0b429;margin-bottom:3px;font-weight:700}.prop-address{font-size:16px;font-weight:700;color:#0f172a}.prop-sub{font-size:12px;color:#64748b;margin-top:2px}.prop-price{font-size:20px;font-weight:800;color:#0f172a;font-family:monospace}.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.metric{background:#f8fafc;border-radius:8px;padding:10px 12px}.metric-label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px}.metric-value{font-size:16px;font-weight:700;font-family:monospace}.metric-sub{font-size:10px;color:#94a3b8;margin-top:2px}.accent{color:#00c896}.gold{color:#f0b429}.green{color:#16a34a}.red{color:#dc2626}.analysis-box{background:#f0fdf9;border-left:3px solid #00c896;padding:10px 14px;border-radius:4px;font-size:12px;color:#334155;line-height:1.6;margin-bottom:8px}.notes{font-size:11px;color:#64748b;font-style:italic}.footer{margin-top:40px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;font-size:11px;color:#94a3b8}@media print{body{padding:20px}}</style></head><body><div class="header"><div><div class="brand">Prop<span>Analyzer</span></div></div><div style="text-align:right;color:#666;font-size:12px"><div style="font-weight:700;color:#0f172a">${list.name}</div><div>${dateStr}</div></div></div><div class="report-title">${title || list.name}</div><div style="color:#64748b;font-size:13px;margin-bottom:20px">Investment Portfolio Summary</div><div class="summary-bar"><div class="summary-box"><div class="label">Properties</div><div class="value">${list.properties.length}</div></div><div class="summary-box"><div class="label">Portfolio Value</div><div class="value">${fmt$(totalValue)}</div></div><div class="summary-box"><div class="label">Avg ST Monthly</div><div class="value">${fmt$(Math.round(avgST))}</div></div><div class="summary-box"><div class="label">Avg LT Monthly</div><div class="value">${fmt$(Math.round(avgLT))}</div></div></div>${propRows}<div class="footer">Generated by PropAnalyzer · For informational purposes only · Not financial advice</div></body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html); win.document.close();
  setTimeout(() => win.print(), 500);
}

function Chip({ label, value, color, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", flex: 1, minWidth: 120 }}>
      <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>{label}</div>
      <div style={{ color: color || C.accent, fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small, full }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, #0ea5e9)`, color: "#050b14", border: "none" },
    gold: { background: `linear-gradient(135deg, ${C.gold}, #f97316)`, color: "#050b14", border: "none" },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.danger}33` },
    accent: { background: C.accentDim, color: C.accent, border: `1px solid ${C.accent}44` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], borderRadius: 8, padding: small ? "6px 12px" : "10px 20px", fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit", whiteSpace: "nowrap", width: full ? "100%" : "auto" }}>
      {children}
    </button>
  );
}

function FieldInput({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>{label}</div>}
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type}
        style={{ width: "100%", background: "#070c17", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 13px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = async () => {
    if (!email || !password) { setError("Email and password required."); return; }
    setError(""); setLoading(true);
    if (mode === "login") {
      const { data, error: e } = await sb.auth.signInWithPassword({ email, password });
      if (e) setError(e.message); else onAuth(data.user);
    } else {
      const { error: e } = await sb.auth.signUp({ email, password });
      if (e) setError(e.message); else setSuccess("Account created! Check your email to confirm, then log in.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${C.accent}, #0ea5e9)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>PropAnalyzer</span>
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>AI-powered rental analysis for realtors</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32 }}>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, background: C.bg, borderRadius: 8, padding: 3 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, background: mode === m ? C.card : "transparent", border: "none", color: mode === m ? C.text : C.muted, borderRadius: 6, padding: "7px", fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer" }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FieldInput label="Email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            <FieldInput label="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </div>
          {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 12 }}>{error}</div>}
          {success && <div style={{ color: C.green, fontSize: 12, marginTop: 12 }}>{success}</div>}
          <div style={{ marginTop: 20 }}><Btn onClick={handle} disabled={loading} full>{loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}</Btn></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [view, setView] = useState("analyze");
  const [form, setForm] = useState(blankForm);
  const [analyzing, setAnalyzing] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [error, setError] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = C.accent) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setAuthLoading(false); });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  const loadLists = useCallback(async () => {
    if (!user) return;
    setDbLoading(true);
    const { data: listsData } = await sb.from("lists").select("*").order("created_at", { ascending: true });
    const { data: propsData } = await sb.from("properties").select("*").order("created_at", { ascending: true });
    setLists((listsData || []).map(l => ({ ...l, properties: (propsData || []).filter(p => p.list_id === l.id) })));
    setDbLoading(false);
  }, [user]);

  useEffect(() => { if (user) loadLists(); }, [user, loadLists]);

  const activeList = lists.find(l => l.id === activeListId);

  const createList = async () => {
    if (!newListName.trim()) return;
    const { data, error: e } = await sb.from("lists").insert({ name: newListName.trim(), user_id: user.id }).select().single();
    if (e) { showToast("Failed to create list", C.danger); return; }
    setLists(l => [...l, { ...data, properties: [] }]);
    setActiveListId(data.id); setNewListName(""); setShowNewList(false); setView("analyze");
    showToast(`"${data.name}" created`);
  };

  const renameList = async (id) => {
    if (!editingName.trim()) { setEditingListId(null); return; }
    await sb.from("lists").update({ name: editingName.trim() }).eq("id", id);
    setLists(l => l.map(x => x.id === id ? { ...x, name: editingName.trim() } : x));
    setEditingListId(null); showToast("List renamed");
  };

  const deleteList = async (id) => {
    await sb.from("lists").delete().eq("id", id);
    setLists(l => l.filter(x => x.id !== id));
    if (activeListId === id) setActiveListId(null);
    showToast("List deleted", C.danger);
  };

  const analyzeProperty = async () => {
    if (!activeListId) { setError("Select or create a list first."); return; }
    if (!form.address || !form.price || !form.beds || !form.baths || !form.sqft) { setError("Address, price, beds, baths, and sqft are required."); return; }
    setError(""); setAnalyzing(true);
    try {
      const prompt = `You are a real estate investment analyst. Analyze this property and return ONLY valid JSON with no markdown or explanation.\n\nProperty:\n- Address: ${form.address}\n- Price: $${form.price}\n- Beds: ${form.beds} | Baths: ${form.baths} | Sqft: ${form.sqft}\n- Monthly HOA: $${form.hoa || 0}\n- Annual Taxes: $${form.taxes || 0}\n- Annual Insurance: $${form.insurance || 0}\n- Notes: ${form.notes || "None"}\n\nReturn this exact JSON:\n{\n  "shortTermMonthly": <number>,\n  "shortTermOccupancy": <number 0-100>,\n  "longTermMonthly": <number>,\n  "estimatedMortgage": <number based on 7.5% 30yr fixed with 20% down>,\n  "strViability": "<High|Medium|Low>",\n  "neighborhood": "<1 sentence market context>",\n  "summary": "<2-3 sentence investment analysis with pros and cons>"\n}`;
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const apiData = await res.json();
      const text = apiData.content.map(i => i.text || "").join("");
      const analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
      const { data: saved, error: dbErr } = await sb.from("properties").insert({
        list_id: activeListId, user_id: user.id, address: form.address, price: parseFloat(form.price),
        beds: parseFloat(form.beds), baths: parseFloat(form.baths), sqft: parseFloat(form.sqft),
        hoa: parseFloat(form.hoa || 0), taxes: parseFloat(form.taxes || 0), insurance: parseFloat(form.insurance || 0),
        notes: form.notes, analysis,
      }).select().single();
      if (dbErr) throw new Error(dbErr.message);
      setLists(l => l.map(x => x.id === activeListId ? { ...x, properties: [...x.properties, saved] } : x));
      setForm(blankForm); showToast("Property analyzed & saved ✓");
    } catch (e) { setError("Analysis failed — please try again."); }
    setAnalyzing(false);
  };

  const removeProperty = async (propId) => {
    await sb.from("properties").delete().eq("id", propId);
    setLists(l => l.map(x => x.id === activeListId ? { ...x, properties: x.properties.filter(p => p.id !== propId) } : x));
    showToast("Property removed", C.danger);
  };

  const signOut = async () => { await sb.auth.signOut(); setUser(null); setLists([]); setActiveListId(null); };
  const inp = { onChange: (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value })) };

  if (authLoading) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading...</div>;
  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI','DM Sans',sans-serif", position: "relative" }}>
      <style>{`input::placeholder,textarea::placeholder{color:#1e3050}input:focus,textarea:focus{border-color:#00c89655!important;outline:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>

      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: C.card, border: `1px solid ${toast.color}`, borderRadius: 10, padding: "10px 18px", fontSize: 13, color: toast.color, boxShadow: "0 8px 32px #00000060" }}>{toast.msg}</div>}

      {/* Sidebar */}
      <div style={{ width: 240, minWidth: 240, background: C.card, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, #0ea5e9)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
            <span style={{ fontSize: 16, fontWeight: 800 }}>PropAnalyzer</span>
          </div>
          <div style={{ color: C.muted, fontSize: 10, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "12px 10px" }}>
          <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, padding: "0 6px", marginBottom: 8 }}>{dbLoading ? "Loading..." : "Property Lists"}</div>
          {lists.map(list => (
            <div key={list.id} onClick={() => { setActiveListId(list.id); setView("analyze"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: activeListId === list.id ? C.accentDim : "transparent", border: activeListId === list.id ? `1px solid ${C.accent}33` : "1px solid transparent", marginBottom: 2 }}>
              {editingListId === list.id ? (
                <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)} onBlur={() => renameList(list.id)} onKeyDown={e => e.key === "Enter" && renameList(list.id)} onClick={e => e.stopPropagation()} style={{ background: "transparent", border: "none", color: C.text, fontSize: 13, width: "100%", outline: "none" }} />
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: activeListId === list.id ? 600 : 400, color: activeListId === list.id ? C.accent : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{list.properties.length} propert{list.properties.length === 1 ? "y" : "ies"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 1, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingListId(list.id); setEditingName(list.name); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, padding: "2px 4px" }}>✏️</button>
                    <button onClick={() => deleteList(list.id)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, padding: "2px 4px" }}>🗑</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {showNewList ? (
            <div style={{ marginTop: 8 }}>
              <input autoFocus value={newListName} onChange={e => setNewListName(e.target.value)} onKeyDown={e => e.key === "Enter" && createList()} placeholder="List name..." style={{ width: "100%", background: "#070c17", border: `1px solid ${C.accent}`, borderRadius: 7, color: C.text, padding: "7px 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <Btn onClick={createList} small>Create</Btn>
                <Btn onClick={() => { setShowNewList(false); setNewListName(""); }} variant="ghost" small>Cancel</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewList(true)} style={{ width: "100%", marginTop: 6, background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, padding: "7px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>+ New List</button>
          )}
        </div>

        {activeList && (
          <div style={{ padding: "10px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7, paddingLeft: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeList.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button onClick={() => setView("analyze")} style={{ background: view === "analyze" ? C.accentDim : "transparent", border: `1px solid ${view === "analyze" ? C.accent + "44" : C.border}`, borderRadius: 7, color: view === "analyze" ? C.accent : C.muted, padding: "7px 10px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>⚡ Analyze Property</button>
              <button onClick={() => { setView("report"); setReportTitle(activeList.name + " — Investment Report"); }} style={{ background: view === "report" ? C.goldDim : "transparent", border: `1px solid ${view === "report" ? C.gold + "44" : C.border}`, borderRadius: 7, color: view === "report" ? C.gold : C.muted, padding: "7px 10px", fontSize: 12, cursor: "pointer", textAlign: "left" }}>📋 Investor Report</button>
            </div>
          </div>
        )}

        <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={signOut} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", padding: "4px 0" }}>← Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", height: "100vh" }}>
        {!activeList && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 16 }}>
            <div style={{ fontSize: 48 }}>🏘️</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Welcome{user.email ? `, ${user.email.split("@")[0]}` : ""}!</div>
            <div style={{ color: C.muted, maxWidth: 340, lineHeight: 1.7 }}>Create a property list to get started. Organize by client, neighborhood, or investment strategy.</div>
            <Btn onClick={() => setShowNewList(true)}>+ Create Your First List</Btn>
          </div>
        )}

        {activeList && view === "analyze" && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: C.gold, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{activeList.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Analyze a Property</div>
              <div style={{ color: C.muted, fontSize: 13 }}>AI-powered rental & investment analysis — saved automatically</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 28 }}>
              <div style={{ marginBottom: 14 }}><FieldInput label="Property Address" name="address" value={form.address} {...inp} placeholder="123 Ocean Dr, Miami Beach, FL 33139" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
                <FieldInput label="Purchase Price ($)" name="price" value={form.price} {...inp} placeholder="650000" type="number" />
                <FieldInput label="Beds" name="beds" value={form.beds} {...inp} placeholder="3" type="number" />
                <FieldInput label="Baths" name="baths" value={form.baths} {...inp} placeholder="2" type="number" />
                <FieldInput label="Sqft" name="sqft" value={form.sqft} {...inp} placeholder="1800" type="number" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
                <FieldInput label="Monthly HOA ($)" name="hoa" value={form.hoa} {...inp} placeholder="0" type="number" />
                <FieldInput label="Annual Taxes ($)" name="taxes" value={form.taxes} {...inp} placeholder="8500" type="number" />
                <FieldInput label="Annual Insurance ($)" name="insurance" value={form.insurance} {...inp} placeholder="3200" type="number" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>Notes</div>
                <textarea name="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pool, waterfront, recently renovated..." style={{ width: "100%", background: "#070c17", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 13px", fontSize: 13, outline: "none", boxSizing: "border-box", height: 68, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              {error && <div style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <Btn onClick={analyzeProperty} disabled={analyzing}>{analyzing ? "⏳ Analyzing with AI..." : "⚡ Analyze & Save to List"}</Btn>
            </div>

            {activeList.properties.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "48px 20px", border: `1px dashed ${C.border}`, borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🏠</div>
                <div>No properties yet — analyze your first one above</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{activeList.properties.length} Propert{activeList.properties.length === 1 ? "y" : "ies"}</div>
                {activeList.properties.map((prop, i) => {
                  const m = calcMetrics(prop); const a = prop.analysis;
                  return (
                    <div key={prop.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                          <div style={{ color: C.gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>Property {i + 1}</div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{prop.address}</div>
                          <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{prop.beds}bd · {prop.baths}ba · {Number(prop.sqft).toLocaleString()} sqft · {fmt$(prop.price)}</div>
                        </div>
                        <Btn onClick={() => removeProperty(prop.id)} variant="danger" small>Remove</Btn>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        <Chip label="ST Monthly" value={fmt$(a.shortTermMonthly)} sub={`${a.shortTermOccupancy}% occ · ${a.strViability}`} color={C.accent} />
                        <Chip label="LT Monthly" value={fmt$(a.longTermMonthly)} sub="Market rent" color={C.accent} />
                        <Chip label="Cap Rate" value={fmtPct(m.capRate)} sub="Net / price" color={C.gold} />
                        <Chip label="GRM" value={m.grm.toFixed(1) + "x"} color={C.gold} />
                        <Chip label="ST Cash Flow" value={fmt$(m.stCF) + "/mo"} color={m.stCF >= 0 ? C.green : C.danger} />
                        <Chip label="LT Cash Flow" value={fmt$(m.ltCF) + "/mo"} color={m.ltCF >= 0 ? C.green : C.danger} />
                      </div>
                      <div style={{ background: C.accentDim, border: `1px solid ${C.accent}22`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                        <span style={{ color: C.accent, fontWeight: 600 }}>AI: </span>{a.summary}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeList && view === "report" && (
          <div style={{ padding: "28px 32px" }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: C.gold, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{activeList.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Investor Report</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{activeList.properties.length} propert{activeList.properties.length === 1 ? "y" : "ies"} · Export as PDF</div>
            </div>
            {activeList.properties.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "60px 20px", border: `1px dashed ${C.border}`, borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div style={{ marginBottom: 14 }}>Add properties first</div>
                <Btn onClick={() => setView("analyze")} variant="accent">← Analyze Properties</Btn>
              </div>
            ) : (
              <>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Report Title</div>
                  <input value={reportTitle} onChange={e => setReportTitle(e.target.value)} style={{ width: "100%", background: "#070c17", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 13px", fontSize: 14, outline: "none", boxSizing: "border-box", fontWeight: 600 }} />
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                  {[
                    { label: "Properties", value: activeList.properties.length, color: C.text },
                    { label: "Portfolio Value", value: fmt$(activeList.properties.reduce((s, p) => s + parseFloat(p.price), 0)), color: C.gold },
                    { label: "Avg ST Monthly", value: fmt$(Math.round(activeList.properties.reduce((s, p) => s + p.analysis.shortTermMonthly, 0) / activeList.properties.length)), color: C.accent },
                    { label: "Avg LT Monthly", value: fmt$(Math.round(activeList.properties.reduce((s, p) => s + p.analysis.longTermMonthly, 0) / activeList.properties.length)), color: C.accent },
                  ].map((m, i) => <Chip key={i} label={m.label} value={m.value} color={m.color} />)}
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                  {activeList.properties.map((prop, i) => {
                    const m = calcMetrics(prop);
                    return (
                      <div key={prop.id} style={{ padding: "14px 20px", borderBottom: i < activeList.properties.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{prop.address}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{prop.beds}bd · {prop.baths}ba · {fmt$(prop.price)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                          <span>ST <span style={{ color: C.accent, fontWeight: 600 }}>{fmt$(prop.analysis.shortTermMonthly)}</span></span>
                          <span>LT <span style={{ color: C.accent, fontWeight: 600 }}>{fmt$(prop.analysis.longTermMonthly)}</span></span>
                          <span>Cap <span style={{ color: C.gold, fontWeight: 600 }}>{fmtPct(m.capRate)}</span></span>
                          <span>CF <span style={{ color: m.ltCF >= 0 ? C.green : C.danger, fontWeight: 600 }}>{fmt$(m.ltCF)}/mo</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Btn onClick={() => generatePDF(activeList, reportTitle)} variant="gold">📄 Export PDF Report</Btn>
                  <div style={{ color: C.muted, fontSize: 12 }}>Opens print dialog — save as PDF or print directly</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
