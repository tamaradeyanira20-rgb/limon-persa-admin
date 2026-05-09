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

const hashPassword = async (pw) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const fmt = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--bg:#050a05;--bg2:#0a0f0a;--card:#0f1a0f;--card2:#141f14;--border:#1a2a1a;--lime:#bef264;--lime2:#a3e635;--lime3:#4d7c0f;--text:#e8f5e8;--muted:#5a7a5a;--danger:#f87171;--gold:#fbbf24;--blue:#60a5fa;--purple:#a78bfa}
    body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
    h1,h2,h3,h4{font-family:'Syne',sans-serif}
    button{cursor:pointer;font-family:'Syne',sans-serif}
    input,select{font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:var(--lime3);border-radius:4px}
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
    .badge-confirmed,.badge-paid{background:rgba(190,242,100,.15);color:var(--lime)}
    .badge-rejected{background:rgba(248,113,113,.15);color:var(--danger)}
    .tab-btn{padding:8px 14px;border:none;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Syne',sans-serif;white-space:nowrap;border-radius:0;border-bottom:2px solid transparent}
    .tab-active{background:transparent;color:var(--lime);border-bottom-color:var(--lime)}
    .tab-inactive{background:transparent;color:var(--muted)}.tab-inactive:hover{color:var(--text)}
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
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
    .modal{background:var(--card2);border:1px solid var(--border);border-radius:16px;padding:24px;width:100%;max-width:400px}
    .label{font-size:11px;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.8px;display:block}
    .gap{display:flex;flex-direction:column;gap:12px}
  `}</style>
);

// ─── MODAL REUTILIZABLE ───────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────
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
          <label className="label">Contraseña</label>
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
      sb("users?select=id"), sb("deposits?status=eq.pending&select=id"),
      sb("withdrawals?status=eq.pending&select=id"), sb("purchases?select=id"),
    ]).then(([u, d, w, p]) => setData({ users: u.length, deposits: d.length, withdrawals: w.length, purchases: p.length })).catch(() => {});
  }, []);
  const stats = [
    { label: "Usuarios", value: data.users, icon: "👥", color: "var(--blue)" },
    { label: "Depósitos pendientes", value: data.deposits, icon: "💳", color: "var(--gold)" },
    { label: "Retiros pendientes", value: data.withdrawals, icon: "💸", color: "var(--danger)" },
    { label: "Compras activas", value: data.purchases, icon: "📦", color: "var(--lime)" },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Syne" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>Bienvenido al panel de administración de Limón Persa.</p>
    </div>
  );
};

// ─── USUARIOS ────────────────────────────────────────────────
const Users = () => {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { type: 'balance'|'password'|'spins', user }
  const [inputVal, setInputVal] = useState(""); const [inputVal2, setInputVal2] = useState(""); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");

  const load = useCallback(async () => { const d = await sb("users?order=created_at.desc&select=*").catch(() => []); setUsers(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const openModal = (type, user) => { setModal({ type, user }); setInputVal(""); setInputVal2(""); setMsg(""); };
  const closeModal = () => { setModal(null); setMsg(""); };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      if (modal.type === "balance") {
        const amt = Number(inputVal);
        if (isNaN(amt)) throw new Error("Monto inválido");
        await sb(`users?id=eq.${modal.user.id}`, { method: "PATCH", body: JSON.stringify({ balance: Number(modal.user.balance) + amt }), prefer: "return=minimal" });
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
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="btn btn-lime" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => openModal("balance", u)}>💰 Saldo</button>
                      <button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => openModal("spins", u)}>🎰 Giros</button>
                      <button className="btn btn-purple" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => openModal("password", u)}>🔑 Clave</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.type === "balance" ? `💰 Ajustar saldo — ${modal.user.phone}` : modal.type === "password" ? `🔑 Cambiar contraseña — ${modal.user.phone}` : `🎰 Dar giros — ${modal.user.phone}`} onClose={closeModal}>
          <div className="gap">
            {modal.type === "balance" && (
              <>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>Saldo actual: <b style={{ color: "var(--lime)" }}>{fmt(modal.user.balance)}</b></p>
                <div>
                  <label className="label">Monto a agregar (puede ser negativo para restar)</label>
                  <input className="input-field" type="number" placeholder="Ej: 500 o -200" value={inputVal} onChange={e => setInputVal(e.target.value)} />
                </div>
              </>
            )}
            {modal.type === "password" && (
              <div>
                <label className="label">Nueva contraseña</label>
                <input className="input-field" type="password" placeholder="Mínimo 6 caracteres" value={inputVal} onChange={e => setInputVal(e.target.value)} />
              </div>
            )}
            {modal.type === "spins" && (
              <>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>Giros actuales: <b style={{ color: "var(--lime)" }}>{modal.user.spins || 0}</b></p>
                <div>
                  <label className="label">Cantidad de giros a agregar</label>
                  <input className="input-field" type="number" min={1} placeholder="Ej: 1" value={inputVal} onChange={e => setInputVal(e.target.value)} />
                </div>
              </>
            )}
            {msg && <p style={{ color: msg.startsWith("✅") ? "var(--lime)" : "var(--danger)", fontSize: 13 }}>{msg}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-lime" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? "..." : "Guardar"}</button>
              <button className="btn" onClick={closeModal} style={{ flex: 1, background: "var(--card)", color: "var(--muted)" }}>Cancelar</button>
            </div>
          </div>
        </Modal>
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
      await sb(`deposits?id=eq.${dep.id}`, { method: "PATCH", body: JSON.stringify({ status }), prefer: "return=minimal" });
      if (status === "confirmed") {
        const newBal = (dep.users?.balance || 0) + dep.amount;
        await sb(`users?phone=eq.${dep.users.phone}`, { method: "PATCH", body: JSON.stringify({ balance: newBal }), prefer: "return=minimal" });
      }
      load();
    } catch (e) { alert("Error: " + e.message); }
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
                  <td>{d.status === "pending" && <div style={{ display: "flex", gap: 6 }}><button className="btn btn-success" onClick={() => update(d, "confirmed")}>✓ Confirmar</button><button className="btn btn-danger" onClick={() => update(d, "rejected")}>✗ Rechazar</button></div>}</td>
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

// ─── PRODUCTOS ────────────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'edit'|'new', product? }
  const [f, setF] = useState({ name: "", price: "", daily_return: "", description: "" });
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");

  const load = useCallback(async () => { const d = await sb("products?order=id").catch(() => []); setProducts(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (p) => { setF({ name: p.name, price: p.price, daily_return: p.daily_return, description: p.description || "" }); setModal({ mode: "edit", product: p }); setMsg(""); };
  const openNew = () => { setF({ name: "", price: "", daily_return: "", description: "" }); setModal({ mode: "new" }); setMsg(""); };

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      if (!f.name || !f.price || !f.daily_return) throw new Error("Completa nombre, precio y rendimiento");
      const body = { name: f.name, price: Number(f.price), daily_return: Number(f.daily_return), description: f.description };
      if (modal.mode === "edit") {
        await sb(`products?id=eq.${modal.product.id}`, { method: "PATCH", body: JSON.stringify(body), prefer: "return=minimal" });
        setMsg("✅ Producto actualizado");
      } else {
        await sb("products", { method: "POST", body: JSON.stringify(body) });
        setMsg("✅ Producto creado");
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
        <div className="card" style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nombre</th><th>Precio</th><th>Rendimiento diario</th><th>Descripción</th><th>Acciones</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: "var(--lime)" }}>{fmt(p.price)}</td>
                  <td style={{ color: "var(--gold)" }}>+{fmt(p.daily_return)}/día</td>
                  <td style={{ color: "var(--muted)", fontSize: 12 }}>{p.description || "—"}</td>
                  <td><button className="btn btn-blue" style={{ fontSize: 11 }} onClick={() => openEdit(p)}>✏️ Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === "edit" ? `✏️ Editar — ${modal.product?.name}` : "➕ Nuevo producto"} onClose={() => setModal(null)}>
          <div className="gap">
            <div><label className="label">Nombre del paquete</label><input className="input-field" placeholder="Ej: Premium" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="label">Precio de inversión (MXN)</label><input className="input-field" type="number" placeholder="Ej: 2500" value={f.price} onChange={e => setF(p => ({ ...p, price: e.target.value }))} /></div>
            <div><label className="label">Rendimiento diario (MXN)</label><input className="input-field" type="number" placeholder="Ej: 120" value={f.daily_return} onChange={e => setF(p => ({ ...p, daily_return: e.target.value }))} /></div>
            <div><label className="label">Descripción (opcional)</label><input className="input-field" placeholder="Descripción corta" value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} /></div>
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

// ─── CUENTA BANCARIA ──────────────────────────────────────────
const BankSettings = () => {
  const SETTINGS_KEY = "lp_admin_bank";
  const [bank, setBank] = useState({ banco: "", titular: "", clabe: "", cuenta: "" });
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) setBank(JSON.parse(saved));
    } catch {}
  }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      if (!bank.banco || !bank.titular || !bank.clabe || !bank.cuenta) throw new Error("Completa todos los campos");
      if (bank.clabe.length !== 18) throw new Error("CLABE debe tener 18 dígitos");
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(bank));
      setMsg("✅ Guardado. Copia estos datos y actualiza el BANK_INFO en el App.jsx de usuarios.");
    } catch (e) { setMsg("❌ " + e.message); }
    setSaving(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Cuenta bancaria de depósitos</h3>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Esta es la cuenta que ven los usuarios cuando van a depositar.</p>
      <div className="card">
        <div className="gap">
          <div><label className="label">Banco</label><input className="input-field" placeholder="Ej: BBVA México" value={bank.banco} onChange={e => setBank(p => ({ ...p, banco: e.target.value }))} /></div>
          <div><label className="label">Titular</label><input className="input-field" placeholder="Nombre completo o razón social" value={bank.titular} onChange={e => setBank(p => ({ ...p, titular: e.target.value }))} /></div>
          <div><label className="label">CLABE (18 dígitos)</label><input className="input-field" placeholder="012345678901234567" value={bank.clabe} onChange={e => setBank(p => ({ ...p, clabe: e.target.value }))} maxLength={18} type="tel" /></div>
          <div><label className="label">Número de cuenta</label><input className="input-field" placeholder="Ej: 1234567890" value={bank.cuenta} onChange={e => setBank(p => ({ ...p, cuenta: e.target.value }))} /></div>
          {msg && <p style={{ color: msg.startsWith("✅") ? "var(--lime)" : "var(--danger)", fontSize: 13 }}>{msg}</p>}
          <button className="btn btn-lime" onClick={save} disabled={saving}>{saving ? "Guardando..." : "Guardar cuenta"}</button>
        </div>

        {/* Vista previa */}
        {bank.banco && (
          <div style={{ marginTop: 20, background: "var(--bg)", borderRadius: 10, padding: 16, border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--lime)", fontSize: 11, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Vista previa (como la ven los usuarios)</p>
            {[["Banco", bank.banco], ["Titular", bank.titular], ["CLABE", bank.clabe], ["Cuenta", bank.cuenta]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16, background: "rgba(251,191,36,.05)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 10, padding: 12 }}>
          <p style={{ color: "var(--gold)", fontSize: 12 }}>⚠️ Después de guardar aquí, debes actualizar el objeto <b>BANK_INFO</b> en el archivo <b>App.jsx</b> de la página de usuarios y subir el cambio a GitHub para que los usuarios vean la nueva cuenta.</p>
        </div>
      </div>
    </div>
  );
};

// ─── RULETA CONFIG ────────────────────────────────────────────
const WheelConfig = () => {
  const [prizes, setPrizes] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(null);
  const load = useCallback(async () => { const d = await sb("wheel_prizes?order=id").catch(() => []); setPrizes(d); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const updateProb = (id, val) => setPrizes(p => p.map(x => x.id === id ? { ...x, probability: val } : x));
  const savePrize = async (prize) => {
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
        <div style={{ fontSize: 13, color: Math.abs(total - 100) < 0.1 ? "var(--lime)" : "var(--danger)", fontWeight: 700 }}>Total: {total.toFixed(2)}% {Math.abs(total - 100) < 0.1 ? "✓" : "(debe ser 100%)"}</div>
      </div>
      {loading ? <div className="spinner" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prizes.map(p => (
            <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderLeft: `3px solid ${p.color}` }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min={0} max={100} step={0.01} value={p.probability} onChange={e => updateProb(p.id, e.target.value)}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: "var(--text)", fontSize: 14, width: 80, outline: "none", textAlign: "center" }} />
                <span style={{ color: "var(--muted)", fontSize: 13 }}>%</span>
                <button className="btn btn-lime" onClick={() => savePrize(p)} disabled={saving === p.id} style={{ padding: "6px 12px" }}>{saving === p.id ? "..." : "Guardar"}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="card" style={{ marginTop: 16, background: "rgba(251,191,36,.05)", borderColor: "rgba(251,191,36,.2)" }}>
        <p style={{ color: "var(--gold)", fontSize: 12 }}>⚠️ Las probabilidades deben sumar exactamente 100%. Para que el iPhone nunca salga, pon 0% en ese campo.</p>
      </div>
    </div>
  );
};

// ─── HISTORIAL GIROS ──────────────────────────────────────────
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
    { id: "dashboard",  label: "📊 Dashboard" },
    { id: "users",      label: "👥 Usuarios" },
    { id: "deposits",   label: "💳 Depósitos" },
    { id: "withdrawals",label: "💸 Retiros" },
    { id: "products",   label: "📦 Productos" },
    { id: "bank",       label: "🏦 Cuenta banco" },
    { id: "wheel",      label: "🎰 Ruleta" },
    { id: "spins",      label: "📋 Giros" },
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
        <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", display: "flex", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? "tab-active" : "tab-inactive"}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }} className="fade-up">
          {tab === "dashboard"   && <><Stats /></>}
          {tab === "users"       && <Users />}
          {tab === "deposits"    && <Deposits />}
          {tab === "withdrawals" && <Withdrawals />}
          {tab === "products"    && <Products />}
          {tab === "bank"        && <BankSettings />}
          {tab === "wheel"       && <WheelConfig />}
          {tab === "spins"       && <SpinHistory />}
        </div>
      </div>
    </>
  );
}
