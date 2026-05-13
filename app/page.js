"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://frltolbwpqhspcuoaznt.supabase.co";
const SUPABASE_KEY = "sb_publishable_NUFufKJZnldMXTtL-fE3Yg_ZFNFXwH4";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const C = {
  bg: "#f7f4ef",
  sidebar: "#faf8f4",
  card: "#ffffff",
  border: "#e8e0d5",
  borderLight: "#f0ebe3",
  accent: "#00c896",
  accentDark: "#00a87e",
  accentDim: "#00c89612",
  accentBorder: "#00c89630",
  gold: "#c9a84c",
  goldDim: "#c9a84c15",
  text: "#1a1612",
  textMid: "#4a3f35",
  muted: "#9a8c80",
  mutedLight: "#c5b9ae",
  danger: "#d94f4f",
  dangerDim: "#d94f4f12",
  green: "#1a9e6a",
  cream: "#fdf9f3",
};

const fmt$ = (v) => v == null ? "—" : "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtPct = (v) => v == null ? "—" : Number(v).toFixed(2) + "%";

const calcMetrics = (prop) => {
  const a = prop.analysis;
  const monthlyExp = parseFloat(prop.hoa || 0) + parseFloat(prop.taxes || 0) / 12 + parseFloat(prop.insurance || 0) / 12;
  const price = parseFloat(prop.price);
  const stCF = a.shortTermMonthly - monthlyExp - a.estimatedMortgage;
  const ltCF = a.longTermMonthly - monthlyExp - a.estimatedMortgage;
  const capRate = (a.longTermMonthly * 12 - monthlyExp * 12) / price * 100;
  const grm = price / (a.longTermMonthly * 12);
  return { stCF, ltCF, capRate, grm };
};

const blankForm = { address: "", price: "", beds: "", baths: "", sqft: "", hoa: "", taxes: "", insurance: "", notes: "" };

function generatePDF(list, title) {
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const totalValue = list.properties.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const avgST = list.properties.length ? list.properties.reduce((s, p) => s + p.analysis.shortTermMonthly, 0) / list.properties.length : 0;
  const avgLT = list.properties.length ? list.properties.reduce((s, p) => s + p.analysis.longTermMonthly, 0) / list.properties.length : 0;
  const rows = list.properties.map((prop, i) => {
    const a = prop.analysis; const m = calcMetrics(prop);
    return `<div class="prop"><div class="ph"><div><div class="pn">Property ${i+1}</div><div class="pa">${prop.address}</div><div class="ps">${prop.beds}bd · ${prop.baths}ba · ${Number(prop.sqft).toLocaleString()} sqft</div></div><div class="pp">${fmt$(parseFloat(prop.price))}</div></div><div class="mg"><div class="mc"><div class="ml">Short-Term Monthly</div><div class="mv ac">${fmt$(a.shortTermMonthly)}</div><div class="ms">${a.shortTermOccupancy}% occ · ${a.strViability}</div></div><div class="mc"><div class="ml">Long-Term Monthly</div><div class="mv ac">${fmt$(a.longTermMonthly)}</div></div><div class="mc"><div class="ml">Est. Mortgage</div><div class="mv">${fmt$(a.estimatedMortgage)}</div></div><div class="mc"><div class="ml">Cap Rate</div><div class="mv go">${fmtPct(m.capRate)}</div></div><div class="mc"><div class="ml">ST Cash Flow</div><div class="mv ${m.stCF>=0?"gr":"rd"}">${fmt$(m.stCF)}/mo</div></div><div class="mc"><div class="ml">LT Cash Flow</div><div class="mv ${m.ltCF>=0?"gr":"rd"}">${fmt$(m.ltCF)}/mo</div></div></div><div class="ab">${a.summary}</div></div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${list.name}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Georgia',serif;background:#fff;color:#1a1612;padding:48px;font-size:13px}.hd{display:flex;justify-content:space-between;border-bottom:2px solid #00c896;padding-bottom:24px;margin-bottom:32px}.br{font-size:24px;font-weight:700;color:#1a1612;letter-spacing:-0.5px}.br span{color:#00c896}.rm{text-align:right;color:#9a8c80;font-size:12px;line-height:1.8}.rt{font-size:28px;font-weight:700;color:#1a1612;margin-bottom:6px;letter-spacing:-0.5px}.rs{color:#9a8c80;font-size:13px;margin-bottom:28px}.sb{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:36px}.sx{background:#faf8f4;border:1px solid #e8e0d5;border-radius:10px;padding:16px}.sl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#9a8c80;margin-bottom:6px}.sv{font-size:20px;font-weight:700;color:#00c896;font-family:monospace}.prop{border:1px solid #e8e0d5;border-radius:12px;padding:24px;margin-bottom:20px;page-break-inside:avoid}.ph{display:flex;justify-content:space-between;margin-bottom:18px}.pn{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;font-weight:700;margin-bottom:4px}.pa{font-size:17px;font-weight:700;color:#1a1612}.ps{font-size:12px;color:#9a8c80;margin-top:2px}.pp{font-size:22px;font-weight:700;color:#1a1612;font-family:monospace}.mg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}.mc{background:#faf8f4;border-radius:8px;padding:12px}.ml{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#9a8c80;margin-bottom:4px}.mv{font-size:17px;font-weight:700;font-family:monospace}.ms{font-size:10px;color:#9a8c80;margin-top:2px}.ac{color:#00c896}.go{color:#c9a84c}.gr{color:#1a9e6a}.rd{color:#d94f4f}.ab{background:#f7f4ef;border-left:3px solid #00c896;padding:12px 16px;border-radius:4px;font-size:12px;color:#4a3f35;line-height:1.7}.ft{margin-top:48px;border-top:1px solid #e8e0d5;padding-top:18px;text-align:center;font-size:11px;color:#9a8c80}</style></head><body><div class="hd"><div><div class="br">Prop<span>Analyzer</span></div><div style="font-size:11px;color:#9a8c80;margin-top:4px">Investment Analysis Platform</div></div><div class="rm"><strong style="color:#1a1612">${list.name}</strong><br/>${dateStr}<br/>${list.properties.length} Properties</div></div><div class="rt">${title||list.name}</div><div class="rs">Investment Portfolio Summary</div><div class="sb"><div class="sx"><div class="sl">Properties</div><div class="sv">${list.properties.length}</div></div><div class="sx"><div class="sl">Portfolio Value</div><div class="sv">${fmt$(totalValue)}</div></div><div class="sx"><div class="sl">Avg ST Monthly</div><div class="sv">${fmt$(Math.round(avgST))}</div></div><div class="sx"><div class="sl">Avg LT Monthly</div><div class="sv">${fmt$(Math.round(avgLT))}</div></div></div>${rows}<div class="ft">Generated by PropAnalyzer · For informational purposes only · Not financial advice</div></body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

function Chip({ label, value, color, sub }) {
  return (
    <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", flex: 1, minWidth: 120 }}>
      <div style={{ color: C.mutedLight, fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
      <div style={{ color: color || C.accent, fontSize: 19, fontWeight: 700, fontFamily: "'Georgia', serif", letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, small, full }) {
  const s = {
    primary: { background: C.accent, color: "#fff", border: "none", boxShadow: "0 2px 8px #00c89630" },
    gold: { background: C.gold, color: "#fff", border: "none", boxShadow: "0 2px 8px #c9a84c30" },
    ghost: { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.danger}44` },
    accent: { background: C.accentDim, color: C.accentDark, border: `1px solid ${C.accentBorder}` },
    outline: { background: "transparent", color: C.textMid, border: `1px solid ${C.border}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s[variant], borderRadius: 8,
      padding: small ? "6px 14px" : "11px 22px",
      fontSize: small ? 12 : 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "inherit", whiteSpace: "nowrap",
      width: full ? "100%" : "auto",
      transition: "all 0.15s ease",
    }}>{children}</button>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type}
        style={{ width: "100%", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" }} />
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
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: -1, fontFamily: "'Georgia', serif" }}>PropAnalyzer</span>
          </div>
          <div style={{ color: C.muted, fontSize: 14 }}>Investment analysis for real estate professionals</div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36, boxShadow: "0 4px 24px #1a161208" }}>
          <div style={{ display: "flex", marginBottom: 28, background: C.bg, borderRadius: 10, padding: 4 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{ flex: 1, background: mode === m ? C.card : "transparent", border: "none", color: mode === m ? C.text : C.muted, borderRadius: 7, padding: "8px", fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer", boxShadow: mode === m ? "0 1px 4px #1a161210" : "none", transition: "all 0.15s" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Email Address" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            <Field label="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </div>
          {error && <div style={{ color: C.danger, fontSize: 12, marginTop: 14, padding: "10px 14px", background: C.dangerDim, borderRadius: 8 }}>{error}</div>}
          {success && <div style={{ color: C.green, fontSize: 12, marginTop: 14, padding: "10px 14px", background: C.accentDim, borderRadius: 8 }}>{success}</div>}
          <div style={{ marginTop: 22 }}><Btn onClick={handle} disabled={loading} full>{loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}</Btn></div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, color: C.muted, fontSize: 12 }}>
          Trusted by real estate professionals
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
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
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
    if (!form.address || !form.price || !form.beds || !form.baths || !form.sqft) {
      setError("Address, price, beds, baths, and sqft are required."); return;
    }
    setError(""); setAnalyzing(true);
    try {
      const prompt = `You are a real estate investment analyst. Analyze this property and return ONLY valid JSON with no markdown or explanation.\n\nProperty:\n- Address: ${form.address}\n- Price: $${form.price}\n- Beds: ${form.beds} | Baths: ${form.baths} | Sqft: ${form.sqft}\n- Monthly HOA: $${form.hoa || 0}\n- Annual Taxes: $${form.taxes || 0}\n- Annual Insurance: $${form.insurance || 0}\n- Notes: ${form.notes || "None"}\n\nReturn this exact JSON:\n{\n  "shortTermMonthly": <number>,\n  "shortTermOccupancy": <number 0-100>,\n  "longTermMonthly": <number>,\n  "estimatedMortgage": <number based on 7.5% 30yr fixed with 20% down>,\n  "strViability": "<High|Medium|Low>",\n  "neighborhood": "<1 sentence market context>",\n  "summary": "<2-3 sentence investment analysis with pros and cons>"\n}`;

      const res = await window.fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API ${res.status}: ${errText.slice(0, 300)}`);
      }

      const apiData = await res.json();
      if (!apiData.content) throw new Error("No content: " + JSON.stringify(apiData).slice(0, 200));
      const text = apiData.content.map(i => i.text || "").join("").replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(text);

      const { data: saved, error: dbErr } = await sb.from("properties").insert({
        list_id: activeListId, user_id: user.id,
        address: form.address, price: parseFloat(form.price),
        beds: parseFloat(form.beds), baths: parseFloat(form.baths), sqft: parseFloat(form.sqft),
        hoa: parseFloat(form.hoa || 0), taxes: parseFloat(form.taxes || 0), insurance: parseFloat(form.insurance || 0),
        notes: form.notes, analysis,
      }).select().single();

      if (dbErr) throw new Error(dbErr.message);
      setLists(l => l.map(x => x.id === activeListId ? { ...x, properties: [...x.properties, saved] } : x));
      setForm(blankForm);
      showToast("Property analyzed & saved ✓");
    } catch (e) {
      setError("Analysis failed: " + (e.message || String(e)));
    }
    setAnalyzing(false);
  };

  const removeProperty = async (propId) => {
    await sb.from("properties").delete().eq("id", propId);
    setLists(l => l.map(x => x.id === activeListId ? { ...x, properties: x.properties.filter(p => p.id !== propId) } : x));
    showToast("Property removed", C.danger);
  };

  const signOut = async () => { await sb.auth.signOut(); setUser(null); setLists([]); setActiveListId(null); };
  const inp = { onChange: (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value })) };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.muted, fontSize: 14 }}>Loading...</div>
    </div>
  );
  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Helvetica Neue', 'Segoe UI', sans-serif" }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${C.mutedLight}; }
        input:focus, textarea:focus { border-color: ${C.accent} !important; outline: none; box-shadow: 0 0 0 3px ${C.accentDim}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        button:hover { opacity: 0.88; }
        .list-row:hover { background: ${C.accentDim} !important; }
        .prop-card:hover { box-shadow: 0 4px 20px #1a161210 !important; }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: C.card, border: `1px solid ${toast.color}44`, borderLeft: `3px solid ${toast.color}`, borderRadius: 10, padding: "12px 20px", fontSize: 13, color: C.text, boxShadow: "0 8px 32px #1a161215", fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: 256, minWidth: 256, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.5, fontFamily: "'Georgia', serif" }}>PropAnalyzer</span>
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
        </div>

        {/* Lists */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 12px" }}>
          <div style={{ color: C.mutedLight, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, padding: "0 8px", marginBottom: 10, fontWeight: 600 }}>
            {dbLoading ? "Loading..." : "My Lists"}
          </div>

          {lists.map(list => (
            <div key={list.id} className="list-row" onClick={() => { setActiveListId(list.id); setView("analyze"); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: activeListId === list.id ? C.accentDim : "transparent", border: activeListId === list.id ? `1px solid ${C.accentBorder}` : "1px solid transparent", marginBottom: 2, transition: "all 0.12s" }}>
              {editingListId === list.id ? (
                <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)} onBlur={() => renameList(list.id)} onKeyDown={e => e.key === "Enter" && renameList(list.id)} onClick={e => e.stopPropagation()}
                  style={{ background: "transparent", border: "none", color: C.text, fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" }} />
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: activeListId === list.id ? 600 : 400, color: activeListId === list.id ? C.accentDark : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.name}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{list.properties.length} propert{list.properties.length === 1 ? "y" : "ies"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 1, flexShrink: 0, opacity: 0 }} className="list-actions" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditingListId(list.id); setEditingName(list.name); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, padding: "2px 5px", borderRadius: 4 }}>✏️</button>
                    <button onClick={() => deleteList(list.id)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, padding: "2px 5px", borderRadius: 4 }}>🗑</button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showNewList ? (
            <div style={{ marginTop: 10, padding: "12px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <input autoFocus value={newListName} onChange={e => setNewListName(e.target.value)} onKeyDown={e => e.key === "Enter" && createList()} placeholder="List name..."
                style={{ width: "100%", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "8px 11px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <Btn onClick={createList} small>Create</Btn>
                <Btn onClick={() => { setShowNewList(false); setNewListName(""); }} variant="ghost" small>Cancel</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewList(true)} style={{ width: "100%", marginTop: 8, background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, padding: "9px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New List
            </button>
          )}
        </div>

        {/* Nav */}
        {activeList && (
          <div style={{ padding: "12px", borderTop: `1px solid ${C.borderLight}` }}>
            <div style={{ color: C.mutedLight, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, paddingLeft: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{activeList.name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <button onClick={() => setView("analyze")} style={{ background: view === "analyze" ? C.accentDim : "transparent", border: `1px solid ${view === "analyze" ? C.accentBorder : "transparent"}`, borderRadius: 7, color: view === "analyze" ? C.accentDark : C.textMid, padding: "8px 12px", fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: view === "analyze" ? 600 : 400, transition: "all 0.12s", fontFamily: "inherit" }}>⚡ Analyze Property</button>
              <button onClick={() => { setView("report"); setReportTitle(activeList.name + " — Investment Report"); }} style={{ background: view === "report" ? C.goldDim : "transparent", border: `1px solid ${view === "report" ? C.gold + "44" : "transparent"}`, borderRadius: 7, color: view === "report" ? C.gold : C.textMid, padding: "8px 12px", fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: view === "report" ? 600 : 400, transition: "all 0.12s", fontFamily: "inherit" }}>📋 Investor Report</button>
            </div>
          </div>
        )}

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={signOut} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", height: "100vh" }}>
        {!activeList && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏡</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: -0.5, fontFamily: "'Georgia', serif", marginBottom: 8 }}>Welcome{user.email ? `, ${user.email.split("@")[0]}` : ""}.</div>
              <div style={{ color: C.muted, maxWidth: 360, lineHeight: 1.8, fontSize: 14 }}>Create a property list to begin analyzing investments. Organize by client, market, or strategy.</div>
            </div>
            <Btn onClick={() => setShowNewList(true)}>+ Create Your First List</Btn>
          </div>
        )}

        {activeList && view === "analyze" && (
          <div style={{ padding: "32px 40px", maxWidth: 900 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: C.gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontWeight: 600 }}>{activeList.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: -0.5, fontFamily: "'Georgia', serif" }}>Analyze a Property</div>
              <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Enter property details for AI-powered rental & investment analysis</div>
            </div>

            {/* Form */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginBottom: 32, boxShadow: "0 2px 12px #1a161206" }}>
              <div style={{ marginBottom: 16 }}>
                <Field label="Property Address" name="address" value={form.address} {...inp} placeholder="123 Ocean Drive, Miami Beach, FL 33139" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                <Field label="Purchase Price ($)" name="price" value={form.price} {...inp} placeholder="650,000" type="number" />
                <Field label="Beds" name="beds" value={form.beds} {...inp} placeholder="3" type="number" />
                <Field label="Baths" name="baths" value={form.baths} {...inp} placeholder="2" type="number" />
                <Field label="Sqft" name="sqft" value={form.sqft} {...inp} placeholder="1,800" type="number" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
                <Field label="Monthly HOA ($)" name="hoa" value={form.hoa} {...inp} placeholder="0" type="number" />
                <Field label="Annual Taxes ($)" name="taxes" value={form.taxes} {...inp} placeholder="8,500" type="number" />
                <Field label="Annual Insurance ($)" name="insurance" value={form.insurance} {...inp} placeholder="3,200" type="number" />
              </div>
              <div style={{ marginBottom: 22 }}>
                <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>Notes</div>
                <textarea name="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pool, waterfront, recently renovated, near attractions..."
                  style={{ width: "100%", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box", height: 72, resize: "vertical", fontFamily: "inherit", transition: "border-color 0.15s" }} />
              </div>
              {error && (
                <div style={{ color: C.danger, fontSize: 12, marginBottom: 16, padding: "10px 14px", background: C.dangerDim, borderRadius: 8, border: `1px solid ${C.danger}22` }}>
                  {error}
                </div>
              )}
              <Btn onClick={analyzeProperty} disabled={analyzing}>
                {analyzing ? "⏳ Analyzing with AI..." : "⚡ Analyze & Save to List"}
              </Btn>
            </div>

            {/* Properties */}
            {activeList.properties.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "52px 20px", border: `1px dashed ${C.border}`, borderRadius: 16, background: C.cream }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 15, color: C.textMid, marginBottom: 6 }}>No properties yet</div>
                <div style={{ fontSize: 13 }}>Analyze your first property above to get started</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{activeList.properties.length} Propert{activeList.properties.length === 1 ? "y" : "ies"}</div>
                {activeList.properties.map((prop, i) => {
                  const m = calcMetrics(prop); const a = prop.analysis;
                  return (
                    <div key={prop.id} className="prop-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: "0 2px 8px #1a161206", transition: "box-shadow 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                        <div>
                          <div style={{ color: C.gold, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, fontWeight: 700 }}>Property {i + 1}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>{prop.address}</div>
                          <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{prop.beds}bd · {prop.baths}ba · {Number(prop.sqft).toLocaleString()} sqft · <span style={{ color: C.textMid, fontWeight: 600 }}>{fmt$(prop.price)}</span></div>
                        </div>
                        <Btn onClick={() => removeProperty(prop.id)} variant="danger" small>Remove</Btn>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                        <Chip label="ST Monthly" value={fmt$(a.shortTermMonthly)} sub={`${a.shortTermOccupancy}% occ · ${a.strViability}`} color={C.accent} />
                        <Chip label="LT Monthly" value={fmt$(a.longTermMonthly)} sub="Market rent" color={C.accent} />
                        <Chip label="Cap Rate" value={fmtPct(m.capRate)} color={C.gold} />
                        <Chip label="GRM" value={m.grm.toFixed(1) + "x"} color={C.gold} />
                        <Chip label="ST Cash Flow" value={fmt$(m.stCF) + "/mo"} color={m.stCF >= 0 ? C.green : C.danger} />
                        <Chip label="LT Cash Flow" value={fmt$(m.ltCF) + "/mo"} color={m.ltCF >= 0 ? C.green : C.danger} />
                      </div>
                      <div style={{ background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
                        <span style={{ color: C.accentDark, fontWeight: 600 }}>Analysis: </span>{a.summary}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeList && view === "report" && (
          <div style={{ padding: "32px 40px", maxWidth: 900 }}>
            <div style={{ marginBottom: 28 }}>
              <div style={{ color: C.gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, fontWeight: 600 }}>{activeList.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: -0.5, fontFamily: "'Georgia', serif" }}>Investor Report</div>
              <div style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{activeList.properties.length} propert{activeList.properties.length === 1 ? "y" : "ies"} · Export as a professional PDF</div>
            </div>

            {activeList.properties.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, padding: "60px 20px", border: `1px dashed ${C.border}`, borderRadius: 16, background: C.cream }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ marginBottom: 16, fontSize: 14 }}>Add properties first to generate a report</div>
                <Btn onClick={() => setView("analyze")} variant="accent">← Analyze Properties</Btn>
              </div>
            ) : (
              <>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 22 }}>
                  <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Report Title</div>
                  <input value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                    style={{ width: "100%", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "11px 14px", fontSize: 15, outline: "none", boxSizing: "border-box", fontWeight: 600, fontFamily: "inherit" }} />
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                  <Chip label="Properties" value={activeList.properties.length} color={C.text} />
                  <Chip label="Portfolio Value" value={fmt$(activeList.properties.reduce((s, p) => s + parseFloat(p.price), 0))} color={C.gold} />
                  <Chip label="Avg ST Monthly" value={fmt$(Math.round(activeList.properties.reduce((s, p) => s + p.analysis.shortTermMonthly, 0) / activeList.properties.length))} color={C.accent} />
                  <Chip label="Avg LT Monthly" value={fmt$(Math.round(activeList.properties.reduce((s, p) => s + p.analysis.longTermMonthly, 0) / activeList.properties.length))} color={C.accent} />
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                  {activeList.properties.map((prop, i) => {
                    const m = calcMetrics(prop);
                    return (
                      <div key={prop.id} style={{ padding: "16px 22px", borderBottom: i < activeList.properties.length - 1 ? `1px solid ${C.borderLight}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{prop.address}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{prop.beds}bd · {prop.baths}ba · {fmt$(prop.price)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 18, fontSize: 12 }}>
                          <span style={{ color: C.muted }}>ST <span style={{ color: C.accent, fontWeight: 700 }}>{fmt$(prop.analysis.shortTermMonthly)}</span></span>
                          <span style={{ color: C.muted }}>LT <span style={{ color: C.accent, fontWeight: 700 }}>{fmt$(prop.analysis.longTermMonthly)}</span></span>
                          <span style={{ color: C.muted }}>Cap <span style={{ color: C.gold, fontWeight: 700 }}>{fmtPct(m.capRate)}</span></span>
                          <span style={{ color: C.muted }}>CF <span style={{ color: m.ltCF >= 0 ? C.green : C.danger, fontWeight: 700 }}>{fmt$(m.ltCF)}/mo</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Btn onClick={() => generatePDF(activeList, reportTitle)} variant="gold">📄 Export PDF Report</Btn>
                  <div style={{ color: C.muted, fontSize: 12 }}>Opens a print-ready report — save as PDF</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
