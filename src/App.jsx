import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://ylwqubaxjsgfyrmkridc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsd3F1YmF4anNnZnlybWtyaWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDA2NzYsImV4cCI6MjA5MzUxNjY3Nn0.ENaQkWOjsuj9BDGEnn1MGOXheYddoiUM-3owF2dJ8qg";
const ADMIN_PASSWORD = "admin2024limon";
const CLOUDINARY_UPLOAD_PRESET = "limon_persa";
const CLOUDINARY_CLOUD = "dlimonpersa";

const sb = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: options.prefer || "return=representation", ...options.headers },
    ...options,
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Error"); }
  return res.status === 204 ? [] : res.json();
};

const uploadImage = async (file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  return data.secure_url;
};

const hashPassword = async (pw) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};
const fmt = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#050a05;--card:#0f1a0f;--card2:#141f14;--border:#1a2a1a;--lime:#bef264;--lime2:#a3e635;--lime3:#4d7c0f;--text:#e8f5e8;--muted:#5a7a5a;--danger:#f87171;--gold:#fbbf24;--blue:#60a5fa;--purple:#a78bfa}
    body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
    h1,h2,h3,h4{font-family:'Syne',sans-serif}
    button{cursor:pointer;font-family:'Syne',sans-serif}
    input,select,textarea{font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--lime3);border-radius:4px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px}
    .btn{border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;transition:all .2s;cursor:pointer}
    .btn-lime{background:var(--lime);color:#050a05}.btn-lime:hover{background:var(--lime2)}.btn-lime:disabled{opacity:.5;cursor:not-allowed}
    .btn-danger{background:rgba(248,113,113,.15);color:var(--danger);border:1px solid rgba(248,113,113,.3)}.btn-danger:hover{background:rgba(248,113,113,.25)}
    .btn-success{background:rgba(190,242,100,.15);color:var(--lime);border:1px solid rgba(190,242,100,.3)}.btn-success:hover{background:rgba(190,242,100,.25)}
    .btn-blue{background:rgba(96,165,250,.15);color:var(--blue);border:1px solid rgba(96,165,250,.3)}.btn-blue:hover{background:rgba(96,165,250,.25)}
    .btn-purple{background:rgba(167,139,250,.15);color:var(--purple);border:1px solid rgba(167,139,250,.3)}.btn-purple:hover{background:rgba(167,139,250,.25)}
    .btn-gold{background:rgba(251,191,36,.15);color:var(--gold);border:1px solid rgba(251,191,36,.3)}.btn-gold:hover{background:rgba(251,191,36,.25)}
    .input-field{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:14px;width:100%;outline:none;transition:border-color .2s}
    .input-field:focus{border-color:var(--lime3)}
    .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-pending{background:rgba(251,191,36,.15);color:var(--gold)}
    .badge-confirmed,.badge-paid,.badge-active{background:rgba(190,242,100,.15);color:var(--lime)}
    .badge-rejected,.badge-inactive{background:rgba(100,100,100,.15);color:var(--muted)}
    .tab-btn{padding:10px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;border-radius:0;border-bottom:2px solid transparent;background:transparent;font-family:'Syne',sans-serif}
    .tab-active{color:var(--lime);border-bottom-color:var(--lime)}
    .tab-inactive{color:var(--muted)}.tab-inactive:hover{color:var(--text)}
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
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;overflow-y:auto}
    .modal{background:var(--card2);border:1px solid var(--border);border-radius:16px;padding:24px;width:100%;max-height:90vh;overflow-y:auto}
    .label{font-size:11px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.8px;display:block}
    .gap{display:flex;flex-direction:column;gap:12px}
    .warn-box{background:rgba(251,191,36,.05);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:12px}
    .upload-area{border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:border-color .2s}
    .upload-area:hover{border-color:var(--lime3)}
  `}</style>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal fade-up" style={{ maxWidth: wide ? 700 : 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const AdminLogin = ({ onLogin }) => {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const submit = () => pw === ADMIN_PASSWORD ? onLogin() : setErr("Contraseña incorrecta");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 48 }}>🍋</div><h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--lime)" }}>Panel Admin</h1><p style={{ color: "var(--muted)", fontSize: 13 }}>Limón Persa</p></div>
        <div className="card">
          <label className="label">Contraseña</label>
          <input className="input-field" type="password" placeholder="Contraseña de admin" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ marginBottom: 12 }} />
          {err && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button className="btn btn-lime" onClick={submit} style={{ width: "100%", padding: 12 }}>Entrar</button>
        </div>
      </div>
    </div>
  );
};

const Stats = () => {
  const [data, setData] = useState({ users: 0, deposits: 0, withdrawals: 0, purchases: 0 });
  useEffect(() => {
    Promise.all([sb("users?select=id"), sb("deposits?status=eq.pending&select=id"), sb("withdrawals?status=eq.pending&select=id"), sb("purchases?select=id")])
      .then(([u, d, w, p]) => setData({ users: u.length, deposits: d.length, withdrawals: w.length, purchases: p.length })).catch(() => {});
  }, []);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[{ label: "Usuarios", value: data.users, icon: "👥", color: "var(--blue)" }, { label: "Depósitos pendientes", value: data.deposits, icon: "💳", color: "var(--gold)" }, { label: "Retiros pendientes", value: data.withdrawals, icon: "💸", color: "var(--danger)" }, { label: "Compras activas", value: data.purchases, icon: "📦", color: "var(--lime)" }].map(s => (
          <div key={s.label} className="stat-card"><div style={{ fontSize: 24 }}>{s.icon}</div><div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.value}</div><div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.label}</div></div>
        ))}
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>Bienvenido al panel de administración de Limón Persa. 🍋</p>
    </div>
  );
};


// ─── DETALLE DE MOVIMIENTOS POR USUARIO ──────────────────────
const EarningsDetail = ({ userId }) => {
  const [earnings, setEarnings] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) return;
    Promise.all([
      sb(`earnings_history?user_id=eq.${userId}&order=created_at.desc&limit=50`).catch(() => []),
      sb(`deposits?user_id=eq.${userId}&status=eq.confirmed&order=created_at.desc`).catch(() => []),
    ]).then(([e, d]) => {
      setEarnings(e || []);
      setDeposits(d || []);
      setLoading(false);
    });
  }, [userId, show]);

  const typeIcon = { yield: "📦", vip: "👑", referral: "👥", manual: "💰", wheel: "🎰" };
  const typeColor = { yield: "var(--lime)", vip: "var(--gold)", referral: "var(--blue)", manual: "var(--purple)", wheel: "#f472b6" };

  // Totales por tipo
  const totals = {};
  earnings.forEach(e => {
    if (!totals[e.type]) totals[e.type] = 0;
    totals[e.type] += Number(e.amount);
  });
  const totalDeposits = deposits.reduce((s, d) => s + Number(d.amount), 0);
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setShow(!show)} style={{ background: "rgba(96,165,250,.1)", border: "1px solid rgba(96,165,250,.3)", borderRadius: 10, padding: "10px 14px", color: "var(--blue)", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left" }}>
        {show ? "▼" : "▶"} 💼 Ver movimientos de saldo
      </button>

      {show && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? <div className="spinner" style={{ margin: "10px auto" }} /> : (
            <>
              {/* Resumen */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div className="card" style={{ padding: "10px 14px", borderTop: "2px solid var(--lime)" }}>
                  <p style={{ color: "var(--muted)", fontSize: 11 }}>Total ganancias</p>
                  <p style={{ color: "var(--lime)", fontWeight: 800, fontSize: 16 }}>{fmt(totalEarnings)}</p>
                </div>
                <div className="card" style={{ padding: "10px 14px", borderTop: "2px solid var(--blue)" }}>
                  <p style={{ color: "var(--muted)", fontSize: 11 }}>Total depósitos</p>
                  <p style={{ color: "var(--blue)", fontWeight: 800, fontSize: 16 }}>{fmt(totalDeposits)}</p>
                </div>
              </div>

              {/* Totales por tipo */}
              {Object.keys(totals).length > 0 && (
                <div className="card" style={{ padding: "12px 14px" }}>
                  <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Desglose de ganancias</p>
                  {Object.entries(totals).map(([type, amount]) => (
                    <div key={type} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>{typeIcon[type] || "💰"} {type === "yield" ? "Rendimientos" : type === "vip" ? "Bonos VIP" : type === "referral" ? "Comisiones referido" : type === "manual" ? "Ajuste manual" : "Ruleta"}</span>
                      <span style={{ color: typeColor[type] || "var(--lime)", fontWeight: 700 }}>{fmt(amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Depósitos confirmados */}
              {deposits.length > 0 && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--blue)" }}>💳 Depósitos confirmados</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {deposits.map(d => (
                      <div key={d.id} className="card" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>{fmt(d.amount)}</p>
                          {d.concept && <p style={{ color: "var(--muted)", fontSize: 11 }}>Concepto: {d.concept}</p>}
                        </div>
                        <p style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(d.created_at).toLocaleDateString("es-MX")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historial detallado */}
              {earnings.length > 0 && (
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "var(--lime)" }}>📋 Historial detallado</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                    {earnings.map(e => (
                      <div key={e.id} className="card" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${typeColor[e.type] || "var(--lime)"}` }}>
                        <div>
                          <p style={{ fontSize: 12 }}>{typeIcon[e.type] || "💰"} {e.description}</p>
                          <p style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(e.created_at).toLocaleString("es-MX")}</p>
                        </div>
                        <p style={{ color: typeColor[e.type] || "var(--lime)", fontWeight: 700, fontSize: 14 }}>+{fmt(e.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {earnings.length === 0 && deposits.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 12 }}>Sin movimientos registrados</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | with | without
  const [modal, setModal] = useState(null); const [inputVal, setInputVal] = useState(""); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");
  const [detailUser, setDetailUser] = useState(null); const [userProducts, setUserProducts] = useState([]); const [userRefs, setUserRefs] = useState([]); const [loadingDetail, setLoadingDetail] = useState(false);
  const [userPurchaseMap, setUserPurchaseMap] = useState({});

  const load = useCallback(async () => {
    const d = await sb("users?order=created_at.desc&select=*").catch(() => []);
    setUsers(d);
    // Cargar qué usuarios tienen compras activas
    const purchases = await sb("purchases?is_active=eq.true&select=user_id").catch(() => []);
    const map = {};
    (purchases || []).forEach(p => { map[p.user_id] = true; });
    setUserPurchaseMap(map);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDetail = async (user) => {
    setDetailUser(user); setLoadingDetail(true);
    const [prods, refs] = await Promise.all([
      sb(`purchases?user_id=eq.${user.id}&select=*,products(*)`).catch(() => []),
      sb(`users?referred_by=eq.${user.id}&select=id,phone,created_at`).catch(() => []),
    ]);
    const refsWithPurchases = await Promise.all(refs.map(async r => {
      const p = await sb(`purchases?user_id=eq.${r.id}&is_active=eq.true&select=*,products(name)`).catch(() => []);
      return { ...r, purchases: p };
    }));
    setUserProducts(prods); setUserRefs(refsWithPurchases); setLoadingDetail(false);
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      if (modal.type === "balance") {
        const amt = Number(inputVal);
        if (isNaN(amt)) throw new Error("Monto inválido");
        await sb(`users?id=eq.${modal.user.id}`, { method: "PATCH", body: JSON.stringify({ balance: Number(modal.user.balance) + amt }), prefer: "return=minimal" });
        if (amt > 0) {
          await sb("earnings_history", { method: "POST", body: JSON.stringify({ user_id: modal.user.id, amount: amt, type: "manual", description: "Ajuste manual por administrador" }) }).catch(() => {});
        }
        setMsg("✅ Saldo actualizado");
      } else if (modal.type === "password") {
        if (!inputVal || inputVal.length < 6) throw new Error("Mínimo 6 caracteres");
        const hash = await hashPassword(inputVal);
        await sb(`users?id=eq.${modal.user.id}`, { method: "PATCH", body: JSON.stringify({ password_hash: hash }), prefer: "return=minimal" });
        setMsg("✅ Contraseña cambiada");
      } else if (modal.type === "spins") {
        const amt = Number(inputVal);
        if (isNaN(amt) || amt < 1) throw new Error("Cantidad inválida");
        await sb(`users?id=eq.${modal.user.id}`, { method: "PATCH", body: JSON.stringify({ spins: (modal.user.spins || 0) + amt }), prefer: "return=minimal" });
        setMsg("✅ Giros agregados");
      }
      load();
    } catch (e) { setMsg("❌ " + e.message); }
    setSaving(false);
  };

  const filtered = users
    .filter(u => u.phone?.includes(search))
    .filter(u => filter === "all" ? true : filter === "with" ? userPurchaseMap[u.id] : !userPurchaseMap[u.id]);

  const withCount = users.filter(u => userPurchaseMap[u.id]).length;
  const withoutCount = users.filter(u => !userPurchaseMap[u.id]).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Usuarios ({users.length})</h3>
        <input className="input-field" placeholder="Buscar teléfono..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180, padding: "8px 12px", fontSize: 13 }} />
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "all",     label: `Todos (${users.length})`,          color: "var(--lime)" },
          { id: "with",    label: `Con productos (${withCount})`,      color: "var(--gold)" },
          { id: "without", label: `Sin productos (${withoutCount})`,   color: "var(--muted)" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "7px 14px", border: `1.5px solid ${filter === f.id ? f.color : "var(--border)"}`,
            borderRadius: 10, background: filter === f.id ? f.color + "22" : "var(--card)",
            color: filter === f.id ? f.color : "var(--muted)", fontWeight: 700, fontSize: 12,
            fontFamily: "Syne", cursor: "pointer", transition: "all .2s"
          }}>{f.label}</button>
        ))}
      </div>
      {loading ? <div className="spinner" /> : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Teléfono</th><th>Saldo</th><th>Giros</th><th>Código</th><th>Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.phone} {userPurchaseMap[u.id] ? <span style={{ background: "rgba(190,242,100,.15)", color: "var(--lime)", fontSize: 10, padding: "2px 6px", borderRadius: 6, marginLeft: 4 }}>✓ Activo</span> : <span style={{ background: "rgba(100,100,100,.15)", color: "var(--muted)", fontSize: 10, padding: "2px 6px", borderRadius: 6, marginLeft: 4 }}>Sin compra</span>}</td>
                  <td style={{ color: "var(--lime)" }}>{fmt(u.balance)}</td>
                  <td><span style={{ background: "rgba(190,242,100,.1)", color: "var(--lime)", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>🎰 {u.spins || 0}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{u.referral_code}</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString("es-MX")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <button className="btn btn-gold" style={{ fontSize: 11, padding: "5px 8px" }} onClick={() => openDetail(u)}>👁️ Ver</button>
                      <button className="btn btn-lime" style={{ fontSize: 11, padding: "5px 8px" }} onClick={() => { setModal({ type: "balance", user: u }); setInputVal(""); setMsg(""); }}>💰</button>
                      <button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 8px" }} onClick={() => { setModal({ type: "spins", user: u }); setInputVal(""); setMsg(""); }}>🎰</button>
                      <button className="btn btn-purple" style={{ fontSize: 11, padding: "5px 8px" }} onClick={() => { setModal({ type: "password", user: u }); setInputVal(""); setMsg(""); }}>🔑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.type === "balance" ? `💰 Saldo — ${modal.user.phone}` : modal.type === "password" ? `🔑 Contraseña — ${modal.user.phone}` : `🎰 Giros — ${modal.user.phone}`} onClose={() => setModal(null)}>
          <div className="gap">
            {modal.type === "balance" && <><p style={{ color: "var(--muted)", fontSize: 13 }}>Saldo actual: <b style={{ color: "var(--lime)" }}>{fmt(modal.user.balance)}</b></p><div><label className="label">Monto (negativo para restar)</label><input className="input-field" type="number" placeholder="Ej: 500 o -200" value={inputVal} onChange={e => setInputVal(e.target.value)} /></div></>}
            {modal.type === "password" && <div><label className="label">Nueva contraseña</label><input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={inputVal} onChange={e => setInputVal(e.target.value)} /></div>}
            {modal.type === "spins" && <><p style={{ color: "var(--muted)", fontSize: 13 }}>Giros actuales: <b style={{ color: "var(--lime)" }}>{modal.user.spins || 0}</b></p><div><label className="label">Giros a agregar</label><input className="input-field" type="number" min={1} placeholder="Ej: 1" value={inputVal} onChange={e => setInputVal(e.target.value)} /></div></>}
            {msg && <p style={{ color: msg.startsWith("✅") ? "var(--lime)" : "var(--danger)", fontSize: 13 }}>{msg}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-lime" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? "..." : "Guardar"}</button>
              <button className="btn" onClick={() => setModal(null)} style={{ flex: 1, background: "var(--card)", color: "var(--muted)" }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}

      {detailUser && (
        <Modal title={`👁️ ${detailUser.phone}`} onClose={() => setDetailUser(null)} wide>
          {loadingDetail ? <div className="spinner" style={{ margin: "20px auto" }} /> : (
            <div className="gap">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Saldo", fmt(detailUser.balance)], ["Giros", detailUser.spins || 0], ["Código", detailUser.referral_code], ["Registro", new Date(detailUser.created_at).toLocaleDateString("es-MX")]].map(([k, v]) => (
                  <div key={k} className="card" style={{ padding: "10px 14px" }}><p style={{ color: "var(--muted)", fontSize: 11 }}>{k}</p><p style={{ fontWeight: 700, color: "var(--lime)", fontSize: 15 }}>{v}</p></div>
                ))}
              </div>
              {/* Historial de movimientos */}
              <EarningsDetail userId={detailUser.id} />

              <div>
                <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>📦 Productos ({userProducts.length})</p>
                {userProducts.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No ha comprado ningún paquete</p> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {userProducts.map(p => (
                      <div key={p.id} className="card" style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{p.products?.name}</p>
                          <p style={{ color: "var(--muted)", fontSize: 11 }}>Comprado: {new Date(p.purchased_at).toLocaleDateString("es-MX")}</p>
                          {p.expires_at && <p style={{ color: "var(--gold)", fontSize: 11 }}>Vence: {new Date(p.expires_at).toLocaleDateString("es-MX")}</p>}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ color: "var(--lime)", fontWeight: 700 }}>{fmt(p.products?.price)}</p>
                          <span className={`badge badge-${p.is_active ? "active" : "inactive"}`}>{p.is_active ? "Activo" : "Inactivo"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>👥 Referidos ({userRefs.length})</p>
                {userRefs.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No ha referido a nadie</p> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {userRefs.map(r => (
                      <div key={r.id} className="card" style={{ padding: "12px 14px", borderLeft: `3px solid ${r.purchases.length > 0 ? "var(--lime)" : "var(--muted)"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div><p style={{ fontWeight: 600 }}>{r.phone}</p><p style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString("es-MX")}</p></div>
                          <span className={`badge badge-${r.purchases.length > 0 ? "active" : "inactive"}`}>{r.purchases.length > 0 ? "✓ Compró" : "Sin compras"}</span>
                        </div>
                        {r.purchases.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {r.purchases.map(p => <span key={p.id} style={{ background: "rgba(190,242,100,.1)", color: "var(--lime)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>📦 {p.products?.name}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const Deposits = () => {
  const [deps, setDeps] = useState([]); const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [filter, setFilter] = useState("pending"); // pending | all
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const query = filter === "pending"
      ? "deposits?status=eq.pending&order=created_at.desc&select=*,users(phone,balance)"
      : `deposits?order=created_at.desc&limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}&select=*,users(phone,balance)`;
    const d = await sb(query).catch(() => []);
    setDeps(d);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const update = async (dep, status) => {
    try {
      await sb(`deposits?id=eq.${dep.id}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      if (status === "confirmed") {
        await sb(`users?phone=eq.${dep.users.phone}`, { method: "PATCH", body: JSON.stringify({ balance: (dep.users?.balance || 0) + dep.amount }), prefer: "return=minimal" });
      }
      // Actualizar localmente sin recargar todo
      setDeps(prev => prev.map(d => d.id === dep.id ? { ...d, status } : d));
    } catch (e) { alert("Error: " + e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Depósitos</h3>
        <button className="btn btn-blue" onClick={load} style={{ fontSize: 12, padding: "6px 12px" }}>🔄 Actualizar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ id: "pending", label: "⏳ Pendientes" }, { id: "all", label: "📋 Todos" }].map(f => (
          <button key={f.id} onClick={() => { setFilter(f.id); setPage(0); }} style={{
            padding: "7px 14px", border: `1.5px solid ${filter === f.id ? "var(--lime)" : "var(--border)"}`,
            borderRadius: 10, background: filter === f.id ? "rgba(190,242,100,.15)" : "var(--card)",
            color: filter === f.id ? "var(--lime)" : "var(--muted)", fontWeight: 700, fontSize: 12,
            fontFamily: "Syne", cursor: "pointer"
          }}>{f.label}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div> : (
        <>
          {deps.length === 0 && <p style={{ color: "var(--muted)", textAlign: "center", padding: 32 }}>No hay depósitos {filter === "pending" ? "pendientes" : ""}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {deps.map(d => (
              <div key={d.id} className="card" style={{ borderLeft: `3px solid ${d.status === "pending" ? "var(--gold)" : d.status === "confirmed" ? "var(--lime)" : "var(--danger)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{d.users?.phone}</p>
                    <p style={{ color: "var(--lime)", fontWeight: 800, fontSize: 22 }}>{fmt(d.amount)}</p>
                    {d.concept && <p style={{ color: "var(--gold)", fontSize: 12 }}>Concepto: <b>{d.concept}</b></p>}
                    <p style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(d.created_at).toLocaleString("es-MX")}</p>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <span className={`badge badge-${d.status}`}>{d.status === "pending" ? "⏳ Pendiente" : d.status === "confirmed" ? "✅ Confirmado" : "❌ Rechazado"}</span>
                    {d.receipt_url && <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setReceipt(d.receipt_url)}>🧾 Comprobante</button>}
                  </div>
                </div>
                {d.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-success" onClick={() => update(d, "confirmed")} style={{ flex: 1, padding: "10px 0" }}>✓ Confirmar depósito</button>
                    <button className="btn btn-danger" onClick={() => update(d, "rejected")} style={{ flex: 1, padding: "10px 0" }}>✗ Rechazar</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación solo en modo "todos" */}
          {filter === "all" && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
              <button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ background: "var(--card)", color: "var(--muted)", padding: "8px 16px" }}>← Anterior</button>
              <span style={{ color: "var(--muted)", fontSize: 13, padding: "8px 12px" }}>Página {page + 1}</span>
              <button className="btn" onClick={() => setPage(p => p + 1)} disabled={deps.length < PAGE_SIZE} style={{ background: "var(--card)", color: "var(--muted)", padding: "8px 16px" }}>Siguiente →</button>
            </div>
          )}
        </>
      )}

      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div style={{ background: "var(--card2)", borderRadius: 16, padding: 16, maxWidth: 500, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontWeight: 700 }}>🧾 Comprobante</p>
              <button onClick={() => setReceipt(null)} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <img src={receipt} alt="comprobante" style={{ width: "100%", borderRadius: 10, maxHeight: 500, objectFit: "contain" }} />
          </div>
        </div>
      )}
    </div>
  );
};

const Withdrawals = () => {
  const [wds, setWds] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { const d = await sb("withdrawals?order=created_at.desc&select=*,users(phone,balance)").catch(() => []); setWds(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const update = async (wd, status) => {
    try {
      await sb(`withdrawals?id=eq.${wd.id}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      // Si se rechaza, devolver el saldo al usuario
      if (status === "rejected") {
        await sb(`users?phone=eq.${wd.users.phone}`, { method: "PATCH", body: JSON.stringify({ balance: (wd.users?.balance || 0) + wd.amount }), prefer: "return=minimal" });
      }
      // Si se paga, no se descuenta nada (ya fue descontado al solicitar)
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
                  <td>
                    <span className={`badge badge-${w.status}`}>{w.status === "pending" ? "Pendiente" : w.status === "paid" ? "Pagado" : "Rechazado"}</span>
                    <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{new Date(w.created_at).toLocaleString("es-MX", { timeZone: "America/Mexico_City", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </td>
                  <td>{w.status === "pending" && <div style={{ display: "flex", gap: 6 }}><button className="btn btn-success" onClick={() => update(w, "paid")}>✓ Pagar</button><button className="btn btn-danger" onClick={() => update(w, "rejected")}>✗ Rechazar</button></div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── IMAGEN UPLOAD ────────────────────────────────────────────
const ImageUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPreview(url);
      onChange(url);
    } catch (e) {
      // Si Cloudinary no está configurado, usar URL manual
      alert("Para subir imágenes necesitas configurar Cloudinary. Por ahora usa una URL directa.");
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="label">Imagen del producto</label>
      {preview && <img src={preview} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} onError={e => e.target.style.display = "none"} />}
      <div className="upload-area" onClick={() => document.getElementById("img-upload").click()}>
        <input id="img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        {uploading ? <><div className="spinner" style={{ margin: "0 auto 8px" }} /><p style={{ color: "var(--muted)", fontSize: 13 }}>Subiendo...</p></> : <><p style={{ fontSize: 24, marginBottom: 4 }}>📷</p><p style={{ color: "var(--muted)", fontSize: 13 }}>Clic para subir imagen desde tu dispositivo</p></>}
      </div>
      <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 6 }}>O pega un link directo:</p>
      <input className="input-field" placeholder="https://ejemplo.com/imagen.jpg" value={preview} onChange={e => { setPreview(e.target.value); onChange(e.target.value); }} style={{ marginTop: 6 }} />
    </div>
  );
};

// ─── PRODUCTOS ────────────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [f, setF] = useState({ name: "", price: "", daily_return: "", description: "", image_url: "", duration_days: "60" });
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");

  const load = useCallback(async () => { const d = await sb("products?order=id").catch(() => []); setProducts(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (p) => { setF({ name: p.name, price: p.price, daily_return: p.daily_return, description: p.description || "", image_url: p.image_url || "", duration_days: p.duration_days || 60, max_purchases: p.max_purchases !== undefined ? p.max_purchases : 1 }); setModal({ mode: "edit", product: p }); setMsg(""); };
  const openNew = () => { setF({ name: "", price: "", daily_return: "", description: "", image_url: "", duration_days: "60", max_purchases: "1" }); setModal({ mode: "new" }); setMsg(""); };

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      if (!f.name || !f.price || !f.daily_return) throw new Error("Completa nombre, precio y rendimiento");
      const body = { name: f.name, price: Number(f.price), daily_return: Number(f.daily_return), description: f.description, image_url: f.image_url, duration_days: Number(f.duration_days) || 60, max_purchases: Number(f.max_purchases) };
      if (modal.mode === "edit") {
        await sb(`products?id=eq.${modal.product.id}`, { method: "PATCH", body: JSON.stringify(body), prefer: "return=minimal" });
        setMsg("✅ Producto actualizado");
      } else {
        await sb("products", { method: "POST", body: JSON.stringify(body) });
        setMsg("✅ Producto creado — ya aparece en la app de usuarios");
      }
      load();
    } catch (e) { setMsg("❌ " + e.message); }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Productos</h3>
        <button className="btn btn-lime" onClick={openNew}>+ Nuevo producto</button>
      </div>
      {loading ? <div className="spinner" /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {products.map(p => (
            <div key={p.id} className="card">
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} onError={e => e.target.style.display = "none"} />
                : <div style={{ width: "100%", height: 70, background: "var(--bg)", borderRadius: 8, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 11 }}>Sin imagen</div>}
              <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</h4>
              <p style={{ color: "var(--lime)", fontWeight: 700, fontSize: 14 }}>{fmt(p.price)}</p>
              <p style={{ color: "var(--gold)", fontSize: 12 }}>+{fmt(p.daily_return)}/día</p>
              <p style={{ color: "var(--muted)", fontSize: 11 }}>⏱ {p.duration_days || 60} días</p>
              <p style={{ color: p.max_purchases === 0 ? "var(--danger)" : "var(--gold)", fontSize: 11 }}>
                {p.max_purchases === 0 ? "🚫 Bloqueado" : `📌 Máx. ${p.max_purchases ?? 1} compra${(p.max_purchases ?? 1) !== 1 ? "s" : ""}`}
              </p>
              <button className="btn btn-blue" style={{ marginTop: 10, width: "100%", fontSize: 12 }} onClick={() => openEdit(p)}>✏️ Editar</button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === "edit" ? `✏️ ${modal.product?.name}` : "➕ Nuevo producto"} onClose={() => setModal(null)}>
          <div className="gap">
            <div><label className="label">Nombre</label><input className="input-field" placeholder="Ej: Premium" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="label">Precio (MXN)</label><input className="input-field" type="number" placeholder="Ej: 2500" value={f.price} onChange={e => setF(p => ({ ...p, price: e.target.value }))} /></div>
            <div><label className="label">Rendimiento diario (MXN)</label><input className="input-field" type="number" placeholder="Ej: 120" value={f.daily_return} onChange={e => setF(p => ({ ...p, daily_return: e.target.value }))} /></div>
            <div><label className="label">Duración (días)</label><input className="input-field" type="number" placeholder="Ej: 60" value={f.duration_days} onChange={e => setF(p => ({ ...p, duration_days: e.target.value }))} /></div>
            <div>
              <label className="label">Límite de compras por usuario</label>
              <input className="input-field" type="number" min={0} placeholder="0=bloqueado, 1=una vez, 2=dos veces..." value={f.max_purchases} onChange={e => setF(p => ({ ...p, max_purchases: e.target.value }))} />
              <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>0 = nadie puede comprar · 1 = solo una vez · 2 o más = múltiples compras</p>
            </div>
            <div><label className="label">Descripción (opcional)</label><input className="input-field" placeholder="Descripción corta" value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} /></div>
            <ImageUpload value={f.image_url} onChange={url => setF(p => ({ ...p, image_url: url }))} />
            {msg && <p style={{ color: msg.startsWith("✅") ? "var(--lime)" : "var(--danger)", fontSize: 13 }}>{msg}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-lime" onClick={save} disabled={saving} style={{ flex: 1 }}>{saving ? "..." : "Guardar"}</button>
              <button className="btn" onClick={() => setModal(null)} style={{ flex: 1, background: "var(--card)", color: "var(--muted)" }}>Cancelar</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── CONFIGURACIÓN GENERAL (banco + WhatsApp) ─────────────────
const Settings = () => {
  const [bank, setBank] = useState({ banco: "", titular: "", clabe: "", cuenta: "" });
  const [waNumber, setWaNumber] = useState("");
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");

  useEffect(() => {
    sb("settings?select=key,value").then(rows => {
      const map = {};
      rows.forEach(r => { map[r.key] = r.value; });
      setBank({ banco: map.bank_banco || "", titular: map.bank_titular || "", clabe: map.bank_clabe || "", cuenta: map.bank_cuenta || "" });
      setWaNumber(map.whatsapp_number || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const upsert = async (key, value) => {
    const existing = await sb(`settings?key=eq.${key}&select=key`).catch(() => []);
    if (existing.length > 0) {
      await sb(`settings?key=eq.${key}`, { method: "PATCH", body: JSON.stringify({ value, updated_at: new Date().toISOString() }), prefer: "return=minimal" });
    } else {
      await sb("settings", { method: "POST", body: JSON.stringify({ key, value }) });
    }
  };

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      if (!bank.banco || !bank.titular || !bank.clabe || !bank.cuenta) throw new Error("Completa todos los datos bancarios");
      if (bank.clabe.length !== 18) throw new Error("CLABE debe tener 18 dígitos");
      if (!waNumber) throw new Error("Ingresa el número de WhatsApp");
      await Promise.all([
        upsert("bank_banco", bank.banco),
        upsert("bank_titular", bank.titular),
        upsert("bank_clabe", bank.clabe),
        upsert("bank_cuenta", bank.cuenta),
        upsert("whatsapp_number", waNumber),
      ]);
      setMsg("✅ Configuración guardada. Los usuarios la ven al instante.");
    } catch (e) { setMsg("❌ " + e.message); }
    setSaving(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>⚙️ Configuración general</h3>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Los cambios se reflejan al instante en la app de usuarios.</p>
      {loading ? <div className="spinner" /> : (
        <div className="gap">
          {/* Cuenta bancaria */}
          <div className="card">
            <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🏦 Cuenta bancaria de depósitos</p>
            <div className="gap">
              <div><label className="label">Banco</label><input className="input-field" placeholder="Ej: BBVA México" value={bank.banco} onChange={e => setBank(p => ({ ...p, banco: e.target.value }))} /></div>
              <div><label className="label">Titular</label><input className="input-field" placeholder="Nombre o razón social" value={bank.titular} onChange={e => setBank(p => ({ ...p, titular: e.target.value }))} /></div>
              <div><label className="label">CLABE (18 dígitos)</label><input className="input-field" placeholder="012345678901234567" value={bank.clabe} onChange={e => setBank(p => ({ ...p, clabe: e.target.value }))} maxLength={18} type="tel" /></div>
              <div><label className="label">Número de cuenta</label><input className="input-field" placeholder="Ej: 1234567890" value={bank.cuenta} onChange={e => setBank(p => ({ ...p, cuenta: e.target.value }))} /></div>
            </div>
            {bank.banco && (
              <div style={{ marginTop: 16, background: "var(--bg)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                <p style={{ color: "var(--lime)", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Vista previa</p>
                {[["Banco", bank.banco], ["Titular", bank.titular], ["CLABE", bank.clabe], ["Cuenta", bank.cuenta]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="card">
            <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>💬 Número de WhatsApp de soporte</p>
            <div><label className="label">Número con código de país (sin + ni espacios)</label><input className="input-field" placeholder="Ej: 525512345678" value={waNumber} onChange={e => setWaNumber(e.target.value)} type="tel" /></div>
            <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 8 }}>México: empieza con 521 + 10 dígitos. Ej: 5215512345678</p>
          </div>

          {msg && <p style={{ color: msg.startsWith("✅") ? "var(--lime)" : "var(--danger)", fontSize: 13 }}>{msg}</p>}
          <button className="btn btn-lime" onClick={save} disabled={saving} style={{ padding: 14 }}>{saving ? "Guardando..." : "💾 Guardar todo"}</button>
        </div>
      )}
    </div>
  );
};


// ─── VIP OVERVIEW ADMIN ───────────────────────────────────────
const VipOverview = () => {
  const [users, setUsers] = useState([]);
  const [vipLevels, setVipLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [userRefs, setUserRefs] = useState({});

  useEffect(() => {
    const load = async () => {
      const [u, v] = await Promise.all([
        sb("users?order=vip_level.desc,created_at.desc&select=*").catch(() => []),
        sb("vip_levels?order=level").catch(() => []),
      ]);
      setUsers(u || []);
      setVipLevels(v || []);
      setLoading(false);
    };
    load();
  }, []);

  const loadUserRefs = async (user) => {
    if (userRefs[user.id]) { setExpandedUser(expandedUser === user.id ? null : user.id); return; }
    const refs = await sb(`users?referred_by=eq.${user.id}&select=id,phone,created_at`).catch(() => []);
    // Check which refs have qualifying purchases
    const qualified = [];
    for (const r of (refs || [])) {
      const purchases = await sb(`purchases?user_id=eq.${r.id}&is_active=eq.true&select=products(price)`).catch(() => []);
      const ok = (purchases || []).some(p => p.products && Number(p.products.price) >= 200);
      qualified.push({ ...r, qualified: ok });
    }
    setUserRefs(prev => ({ ...prev, [user.id]: qualified }));
    setExpandedUser(user.id);
  };

  const getQualifiedCount = (user) => {
    const refs = userRefs[user.id] || [];
    const claimedLevel = user.vip_level || 0;
    if (claimedLevel < 5) {
      return refs.filter(r => r.qualified).length;
    } else {
      const vipReachedAt = user.vip_reached_at ? new Date(user.vip_reached_at) : null;
      if (!vipReachedAt) return 0;
      return refs.filter(r => r.qualified && new Date(r.created_at) > vipReachedAt).length;
    }
  };

  const getNextVip = (user) => {
    const claimedLevel = user.vip_level || 0;
    return vipLevels.find(v => v.level > claimedLevel);
  };

  const VIP_COLORS = ["#a3e635","#facc15","#34d399","#60a5fa","#f472b6","#fb923c","#a78bfa","#f87171","#2dd4bf","#fbbf24"];
  const VIP_ICONS = ["🌱","⭐","💎","🔥","👑","🚀","💫","🏆","🌟","👑"];

  const filtered = users.filter(u => u.phone?.includes(search));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>👑 Progreso VIP</h3>
        <input className="input-field" placeholder="Buscar teléfono..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180, padding: "8px 12px", fontSize: 13 }} />
      </div>

      {/* Resumen por nivel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
        {[0, ...vipLevels.map(v => v.level)].map(lvl => {
          const count = users.filter(u => (u.vip_level || 0) === lvl).length;
          const color = lvl === 0 ? "var(--muted)" : VIP_COLORS[(lvl - 1) % VIP_COLORS.length];
          return (
            <div key={lvl} className="card" style={{ padding: "10px 8px", textAlign: "center", borderTop: `2px solid ${color}` }}>
              <p style={{ fontSize: 16 }}>{lvl === 0 ? "👤" : VIP_ICONS[(lvl - 1) % VIP_ICONS.length]}</p>
              <p style={{ fontWeight: 800, fontSize: 18, color }}>{count}</p>
              <p style={{ color: "var(--muted)", fontSize: 10 }}>{lvl === 0 ? "Sin VIP" : `VIP ${lvl}`}</p>
            </div>
          );
        })}
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(u => {
            const claimedLevel = u.vip_level || 0;
            const nextVip = getNextVip(u);
            const color = claimedLevel === 0 ? "var(--muted)" : VIP_COLORS[(claimedLevel - 1) % VIP_COLORS.length];
            const icon = claimedLevel === 0 ? "👤" : VIP_ICONS[(claimedLevel - 1) % VIP_ICONS.length];
            const isExpanded = expandedUser === u.id;
            const refs = userRefs[u.id];
            const qualifiedCount = refs ? getQualifiedCount(u) : null;

            return (
              <div key={u.id} className="card" style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight: 700 }}>{u.phone}</p>
                      <p style={{ color, fontSize: 12, fontWeight: 700 }}>{claimedLevel === 0 ? "Sin VIP" : `VIP ${claimedLevel}`}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {nextVip && (
                      <p style={{ color: "var(--muted)", fontSize: 12 }}>
                        Siguiente: <b style={{ color: "var(--gold)" }}>VIP {nextVip.level}</b>
                      </p>
                    )}
                    <button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 10px", marginTop: 4 }} onClick={() => loadUserRefs(u)}>
                      {isExpanded ? "▲ Ocultar" : "▼ Ver referidos"}
                    </button>
                  </div>
                </div>

                {/* Barra de progreso al siguiente nivel */}
                {nextVip && refs && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {qualifiedCount} / {nextVip.required_refs} referidos calificados
                        {claimedLevel >= 5 && <span style={{ color: "var(--gold)", fontSize: 10, marginLeft: 6 }}>(nuevos desde VIP 5)</span>}
                      </span>
                      <span style={{ color: "var(--lime)", fontSize: 12, fontWeight: 700 }}>
                        Faltan {Math.max(0, nextVip.required_refs - qualifiedCount)}
                      </span>
                    </div>
                    <div style={{ background: "var(--bg)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${color}, #bef264)`, width: `${Math.min(100, (qualifiedCount / nextVip.required_refs) * 100)}%`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                )}

                {/* Lista de referidos */}
                {isExpanded && refs && (
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                      👥 Referidos de {u.phone} ({refs.length} total · {refs.filter(r => r.qualified).length} calificados)
                    </p>
                    {refs.length === 0
                      ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No ha referido a nadie</p>
                      : <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                          {refs.map(r => (
                            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "var(--bg)", borderRadius: 8, borderLeft: `3px solid ${r.qualified ? "var(--lime)" : "var(--muted)"}` }}>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>{r.phone}</p>
                                <p style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(r.created_at).toLocaleDateString("es-MX")}</p>
                              </div>
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: r.qualified ? "rgba(190,242,100,.15)" : "rgba(100,100,100,.15)", color: r.qualified ? "var(--lime)" : "var(--muted)" }}>
                                {r.qualified ? "✓ Calificado" : "Sin compra ≥$200"}
                              </span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const WheelConfig = () => {
  const [prizes, setPrizes] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(null);
  const load = useCallback(async () => { const d = await sb("wheel_prizes?order=id").catch(() => []); setPrizes(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const total = prizes.reduce((s, p) => s + Number(p.probability), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>🎰 Ruleta</h3>
        <div style={{ fontSize: 13, color: Math.abs(total - 100) < 0.1 ? "var(--lime)" : "var(--danger)", fontWeight: 700 }}>Total: {total.toFixed(2)}%</div>
      </div>
      {loading ? <div className="spinner" /> : prizes.map(p => (
        <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderLeft: `3px solid ${p.color}`, marginBottom: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <div style={{ flex: 1, fontWeight: 600 }}>{p.label}</div>
          <input type="number" min={0} max={100} step={0.01} value={p.probability} onChange={e => setPrizes(pr => pr.map(x => x.id === p.id ? { ...x, probability: e.target.value } : x))}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 14, width: 80, outline: "none", textAlign: "center" }} />
          <span style={{ color: "var(--muted)", fontSize: 13 }}>%</span>
          <button className="btn btn-lime" onClick={async () => { setSaving(p.id); try { await sb(`wheel_prizes?id=eq.${p.id}`, { method: "PATCH", body: JSON.stringify({ probability: Number(p.probability) }), prefer: "return=minimal" }); } catch(e) { alert(e.message); } setSaving(null); }} disabled={saving === p.id} style={{ padding: "6px 12px" }}>{saving === p.id ? "..." : "Guardar"}</button>
        </div>
      ))}
      <div className="warn-box" style={{ marginTop: 12 }}>
        <p style={{ color: "var(--gold)", fontSize: 12 }}>⚠️ Deben sumar exactamente 100%. iPhone en 0% = nunca sale.</p>
      </div>
    </div>
  );
};

const SpinHistory = () => {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { sb("spin_history?order=spun_at.desc&limit=100&select=*,users(phone)").then(d => { setHistory(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📋 Historial de Giros</h3>
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

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");
  if (!authed) return <><G /><AdminLogin onLogin={() => setAuthed(true)} /></>;
  const tabs = [
    { id: "dashboard",   label: "📊 Dashboard" },
    { id: "users",       label: "👥 Usuarios" },
    { id: "deposits",    label: "💳 Depósitos" },
    { id: "withdrawals", label: "💸 Retiros" },
    { id: "products",    label: "📦 Productos" },
    { id: "vip",         label: "👑 VIP" },
    { id: "settings",    label: "⚙️ Configuración" },
    { id: "wheel",       label: "🎰 Ruleta" },
    { id: "spins",       label: "📋 Giros" },
  ];
  return (
    <>
      <G />
      <div style={{ minHeight: "100vh" }}>
        <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22 }}>🍋</span><h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--lime)" }}>Panel Admin</h1></div>
          <button onClick={() => setAuthed(false)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", color: "var(--muted)", fontSize: 12 }}>Salir</button>
        </div>
        <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", display: "flex", overflowX: "auto" }}>
          {tabs.map(t => <button key={t.id} className={`tab-btn ${tab === t.id ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }} className="fade-up">
          {tab === "dashboard"   && <Stats />}
          {tab === "users"       && <Users />}
          {tab === "deposits"    && <Deposits />}
          {tab === "withdrawals" && <Withdrawals />}
          {tab === "products"    && <Products />}
          {tab === "settings"    && <Settings />}
          {tab === "vip"         && <VipOverview />}
          {tab === "wheel"       && <WheelConfig />}
          {tab === "spins"       && <SpinHistory />}
        </div>
      </div>
    </>
  );
}
