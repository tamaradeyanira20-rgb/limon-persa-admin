import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ylwqubaxjsgfyrmkridc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsd3F1YmF4anNnZnlybWtyaWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDA2NzYsImV4cCI6MjA5MzUxNjY3Nn0.ENaQkWOjsuj9BDGEnn1MGOXheYddoiUM-3owF2dJ8qg";
const ADMIN_PASSWORD = "admin2024limon";

const sb = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: options.prefer || "return=representation", ...options.headers },
    ...options,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Error"); }
  return res.status === 204 ? [] : res.json();
};

const fmt = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#050a05;--bg2:#0a0f0a;--card:#0f1a0f;--card2:#141f14;--border:#1a2a1a;--lime:#bef264;--lime2:#a3e635;--lime3:#4d7c0f;--text:#e8f5e8;--muted:#5a7a5a;--danger:#f87171;--gold:#fbbf24;--blue:#60a5fa}
    body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
    h1,h2,h3,h4{font-family:'Syne',sans-serif}
    button{cursor:pointer;font-family:'Syne',sans-serif}
    input{font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:var(--lime3);border-radius:4px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
    .btn{border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;transition:all .2s;cursor:pointer}
    .btn-lime{background:var(--lime);color:#050a05}
    .btn-lime:hover{background:var(--lime2)}
    .btn-lime:disabled{opacity:.5;cursor:not-allowed}
    .btn-danger{background:rgba(248,113,113,.15);color:var(--danger);border:1px solid rgba(248,113,113,.3)}
    .btn-danger:hover{background:rgba(248,113,113,.25)}
    .btn-success{background:rgba(190,242,100,.15);color:var(--lime);border:1px solid rgba(190,242,100,.3)}
    .btn-success:hover{background:rgba(190,242,100,.25)}
    .btn-blue{background:rgba(96,165,250,.15);color:var(--blue);border:1px solid rgba(96,165,250,.3)}
    .btn-blue:hover{background:rgba(96,165,250,.25)}
    .input-field{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:14px;width:100%;outline:none;transition:border-color .2s}
    .input-field:focus{border-color:var(--lime3)}
    .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-pending{background:rgba(251,191,36,.15);color:var(--gold)}
    .badge-confirmed,.badge-paid{background:rgba(190,242,100,.15);color:var(--lime)}
    .badge-rejected{background:rgba(248,113,113,.15);color:var(--danger)}
    .tab-btn{padding:8px 16px;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif}
    .tab-active{background:var(--lime);color:#050a05}
    .tab-inactive{background:transparent;color:var(--muted)}
    .tab-inactive:hover{color:var(--text)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{color:var(--muted);font-weight:600;padding:8px 12px;text-align:left;border-bottom:1px solid var(--border);font-family:'Syne',sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
    td{padding:10px 12px;border-bottom:1px solid var(--border)}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:var(--card2)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp .3s ease both}
    .spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--lime);border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
    .stat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 20px}
  `}</style>
);

// ─── LOGIN ADMIN ─────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => { if (pw === ADMIN_PASSWORD) onLogin(); else setErr("Contraseña incorrecta"); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍋</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--lime)" }}>Panel Admin</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Limón Persa</p>
        </div>
        <div className="card">
          <div style={{ marginBottom: 12, fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: .8 }}>Contraseña</div>
          <input className="input-field" type="password" placeholder="Contraseña de admin" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ marginBottom: 12 }} />
          {err && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button className="btn btn-lime" onClick={submit} style={{ width: "100%", padding: "12px" }}>Entrar</button>
        </div>
      </div>
    </div>
  );
};

// ─── STATS ───────────────────────────────────────────────────
const Stats = () => {
  const [data, setData] = useState({ users: 0, deposits: 0, withdrawals: 0, purchases: 0 });
  useEffect(() => {
    Promise.all([
      sb("users?select=id", { headers: { Prefer: "count=exact" } }),
      sb("deposits?status=eq.pending&select=id"),
      sb("withdrawals?status=eq.pending&select=id"),
      sb("purchases?select=id"),
    ]).then(([u, d, w, p]) => setData({ users: u.length, deposits: d.length, withdrawals: w.length, purchases: p.length })).catch(() => {});
  }, []);
  const stats = [
    { label: "Usuarios", value: data.users, icon: "👥", color: "var(--blue)" },
    { label: "Depósitos pendientes", value: data.deposits, icon: "💳", color: "var(--gold)" },
    { label: "Retiros pendientes", value: data.withdrawals, icon: "💸", color: "var(--danger)" },
    { label: "Compras activas", value: data.purchases, icon: "📦", color: "var(--lime)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
      {stats.map(s => (
        <div key={s.label} className="stat-card">
          <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.value}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── USUARIOS ────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true);
  const [spinTarget, setSpinTarget] = useState(null); const [spinAmt, setSpinAmt] = useState(1);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => { const d = await sb("users?order=created_at.desc&select=*").catch(() => []); setUsers(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const giveSpins = async (user) => {
    try {
      await sb(`users?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ spins: (user.spins || 0) + spinAmt }), prefer: "return=minimal" });
      setSpinTarget(null); load();
    } catch (e) { alert("Error: " + e.message); }
  };

  const filtered = users.filter(u => u.phone?.includes(search));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Usuarios ({users.length})</h3>
        <input className="input-field" placeholder="Buscar teléfono..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180, padding: "8px 12px", fontSize: 13 }} />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Teléfono</th><th>Saldo</th><th>Giros</th><th>Código</th><th>Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.phone}</td>
                  <td style={{ color: "var(--lime)" }}>{fmt(u.balance)}</td>
                  <td><span style={{ background: "rgba(190,242,100,.1)", color: "var(--lime)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>🎰 {u.spins || 0}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.referral_code}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString("es-MX")}</td>
                  <td>
                    <button className="btn btn-blue" onClick={() => { setSpinTarget(u); setSpinAmt(1); }}>+ Giros</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {spinTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card" style={{ width: 320, padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Dar giros</h3>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>{spinTarget.phone} — tiene {spinTarget.spins || 0} giro(s)</p>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: .8 }}>Cantidad de giros a agregar</div>
            <input className="input-field" type="number" min={1} value={spinAmt} onChange={e => setSpinAmt(Number(e.target.value))} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-lime" onClick={() => giveSpins(spinTarget)} style={{ flex: 1 }}>Confirmar</button>
              <button className="btn" onClick={() => setSpinTarget(null)} style={{ flex: 1, background: "var(--card2)", color: "var(--muted)" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── DEPÓSITOS ────────────────────────────────────────────────
const Deposits = () => {
  const [deps, setDeps] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const d = await sb("deposits?order=created_at.desc&select=*,users(phone,balance)").catch(() => []); setDeps(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (dep, status) => {
    try {
      // Paso 1: Actualizar estado del depósito
      await sb(`deposits?id=eq.${dep.id}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      alert("Paso 1 OK - Depósito marcado como: " + status);

      if (status === "confirmed") {
        // Paso 2: Ver qué trae dep.users
        alert("Paso 2 - dep.users = " + JSON.stringify(dep.users));

        // Paso 3: Buscar usuario fresco
        const freshUsers = await sb(`users?phone=eq.${dep.users.phone}&select=id,balance,phone`);
        alert("Paso 3 - Usuario fresco: " + JSON.stringify(freshUsers));

        if (!freshUsers || freshUsers.length === 0) {
          alert("ERROR: No se encontró el usuario con teléfono: " + dep.users.phone);
          return;
        }

        const freshUser = freshUsers[0];
        const newBal = (freshUser.balance || 0) + dep.amount;
        alert(`Paso 4 - Balance actual: ${freshUser.balance}, Depósito: ${dep.amount}, Nuevo balance: ${newBal}`);

        // Paso 5: Actualizar balance
        const result = await sb(`users?id=eq.${freshUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({ balance: newBal }),
          prefer: "return=representation"
        });
        alert("Paso 5 OK - Respuesta de Supabase: " + JSON.stringify(result));
      }
      load();
    } catch (e) {
      alert("ERROR: " + e.message);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Depósitos</h3>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Usuario</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {deps.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.users?.phone}</td>
                  <td style={{ color: "var(--lime)", fontWeight: 700 }}>{fmt(d.amount)}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("es-MX")}</td>
                  <td><span className={`badge badge-${d.status}`}>{d.status === "pending" ? "Pendiente" : d.status === "confirmed" ? "Confirmado" : "Rechazado"}</span></td>
                  <td>
                    {d.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success" onClick={() => update(d, "confirmed")}>✓ Confirmar</button>
                        <button className="btn btn-danger" onClick={() => update(d, "rejected")}>✗ Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── RETIROS ─────────────────────────────────────────────────
const Withdrawals = () => {
  const [wds, setWds] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const d = await sb("withdrawals?order=created_at.desc&select=*,users(phone,balance)").catch(() => []); setWds(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (wd, status) => {
    try {
      await sb(`withdrawals?id=eq.${wd.id}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      if (status === "paid") {
        const newBal = Math.max(0, (wd.users?.balance || 0) - wd.amount);
        await sb(`users?phone=eq.${wd.users.phone}`, { method: "PATCH", body: JSON.stringify({ balance: newBal }), prefer: "return=minimal" });
      }
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Retiros</h3>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Usuario</th><th>Monto</th><th>Banco</th><th>CLABE</th><th>Titular</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {wds.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 600 }}>{w.users?.phone}</td>
                  <td style={{ color: "var(--danger)", fontWeight: 700 }}>{fmt(w.amount)}</td>
                  <td style={{ fontSize: 12 }}>{w.bank_name}</td>
                  <td style={{ fontSize: 12, fontFamily: "monospace", color: "var(--muted)" }}>{w.clabe}</td>
                  <td style={{ fontSize: 12 }}>{w.account_holder}</td>
                  <td><span className={`badge badge-${w.status}`}>{w.status === "pending" ? "Pendiente" : w.status === "paid" ? "Pagado" : "Rechazado"}</span></td>
                  <td>
                    {w.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-success" onClick={() => update(w, "paid")}>✓ Pagar</button>
                        <button className="btn btn-danger" onClick={() => update(w, "rejected")}>✗ Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── RULETA CONFIG ────────────────────────────────────────────
const WheelConfig = () => {
  const [prizes, setPrizes] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(null);
  const load = useCallback(async () => { const d = await sb("wheel_prizes?order=id").catch(() => []); setPrizes(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const updateProb = (id, val) => setPrizes(p => p.map(x => x.id === id ? { ...x, probability: val } : x));

  const save = async (prize) => {
    setSaving(prize.id);
    try { await sb(`wheel_prizes?id=eq.${prize.id}`, { method: "PATCH", body: JSON.stringify({ probability: Number(prize.probability) }), prefer: "return=minimal" }); }
    catch (e) { alert("Error: " + e.message); }
    setSaving(null);
  };

  const total = prizes.reduce((s, p) => s + Number(p.probability), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Configurar Ruleta</h3>
        <div style={{ fontSize: 13, color: total === 100 ? "var(--lime)" : "var(--danger)", fontWeight: 700 }}>Total: {total.toFixed(2)}% {total === 100 ? "✓" : "(debe ser 100%)"}</div>
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="gap" style={{ gap: 10 }}>
          {prizes.map(p => (
            <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderLeft: `3px solid ${p.color}` }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={0} max={100} step={0.01} value={p.probability} onChange={e => updateProb(p.id, e.target.value)}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 14, width: 80, outline: "none", textAlign: "center" }} />
                <span style={{ color: "var(--muted)", fontSize: 13 }}>%</span>
                <button className="btn btn-lime" onClick={() => save(p)} disabled={saving === p.id} style={{ padding: "6px 12px" }}>{saving === p.id ? "..." : "Guardar"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="card" style={{ marginTop: 16, padding: 12, background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.2)" }}>
        <p style={{ color: "var(--gold)", fontSize: 12 }}>⚠️ Asegúrate de que todas las probabilidades sumen exactamente 100% antes de guardar. Para que el iPhone nunca salga pon 0% en ese campo.</p>
      </div>
    </div>
  );
};

// ─── HISTORIAL RULETA ─────────────────────────────────────────
const SpinHistory = () => {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { sb("spin_history?order=spun_at.desc&limit=50&select=*,users(phone)").then(d => { setHistory(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial de Giros</h3>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Usuario</th><th>Premio</th><th>Monto</th><th>Fecha</th></tr></thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.users?.phone}</td>
                  <td><span style={{ fontWeight: 700, color: "var(--lime)" }}>{h.prize_label}</span></td>
                  <td style={{ color: "var(--gold)" }}>{h.prize_amount > 0 ? fmt(h.prize_amount) : "Premio físico"}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(h.spun_at).toLocaleString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── APP ADMIN ────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");

  if (!authed) return <><G /><AdminLogin onLogin={() => setAuthed(true)} /></>;

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "users", label: "👥 Usuarios" },
    { id: "deposits", label: "💳 Depósitos" },
    { id: "withdrawals", label: "💸 Retiros" },
    { id: "wheel", label: "🎰 Ruleta" },
    { id: "spins", label: "📋 Giros" },
  ];

  return (
    <>
      <G />
      <div style={{ minHeight: "100vh" }}>
        <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🍋</span>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--lime)" }}>Panel Admin</h1>
          </div>
          <button onClick={() => setAuthed(false)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>Salir</button>
        </div>

        <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", whiteSpace: "nowrap", borderRadius: 0, borderBottom: tab === t.id ? "2px solid var(--lime)" : "2px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }} className="fade-up">
          {tab === "dashboard"   && <><Stats /><p style={{ color: "var(--muted)", fontSize: 13 }}>Bienvenido al panel de administración de Limón Persa.</p></>}
          {tab === "users"       && <Users />}
          {tab === "deposits"    && <Deposits />}
          {tab === "withdrawals" && <Withdrawals />}
          {tab === "wheel"       && <WheelConfig />}
          {tab === "spins"       && <SpinHistory />}
        </div>
      </div>
    </>
  );
}
