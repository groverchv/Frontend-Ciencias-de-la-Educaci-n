// src/components/dinamic.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ImagenesAPI } from "../services/PresentacionService.js";
import AuthService from "../services/AuthService.js"; 

/* ========= Helper URLs Google Drive ========= */
function getOptimizedUrl(originalUrl) {
  if (!originalUrl) return "";
  const driveMatch = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)|\?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && (originalUrl.includes("drive.google.com") || originalUrl.includes("docs.google.com"))) {
    const fileId = driveMatch[1] || driveMatch[2];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return originalUrl;
}

/* ========= Helper Usuario Actual ========= */
function getUsuarioActual() {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    if (user.id) return { id: user.id };
    if (user.usuario && user.usuario.id) return { id: user.usuario.id };
    if (user.user && user.user.id) return { id: user.user.id };
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* ========= Modal CRUD ========= */
function CrudModal({ open, onClose, presentaciones, onRefresh, onCreate, onUpdate, onDelete }) {
  const [q, setQ] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [formNew, setFormNew] = useState({ url: "", estado: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setFormNew({ url: "", estado: true }); setEditRow(null); }
  }, [open]);

  const filtered = useMemo(() => {
    return presentaciones.filter((item) => {
      const term = q.toLowerCase();
      return (item.url && item.url.toLowerCase().includes(term));
    });
  }, [presentaciones, q]);

  if (!open) return null;
  const isActive = (val) => val === true || val === 1 || val === "true";

  const css = `
    .crud-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: grid; place-items: center; z-index: 9999; }
    .crud-card { width: min(950px, 96vw); max-height: 90vh; overflow: hidden; background: #0f172a; color: #e5e7eb; border-radius: 16px; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 16px 60px rgba(0,0,0,.45); display: grid; grid-template-rows: auto auto 1fr auto; }
    .crud-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.08); background: linear-gradient(180deg, rgba(255,255,255,.06), transparent); }
    .crud-title { font-weight: 800; letter-spacing: .3px; }
    .crud-actions { display: flex; gap: 8px; align-items: center; }
    .btn { border: 1px solid rgba(255,255,255,.14); background: #111827; color:#e5e7eb; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
    .btn.small { padding: 5px 8px; font-size: .9rem; }
    .btn.danger { background: #7f1d1d; border-color: #991b1b; }
    .btn.save { background: #065f46; border-color: #047857; }
    .crud-toolbar { padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-bottom: 1px dashed rgba(255,255,255,.08); background: rgba(255,255,255,.02); }
    .crud-toolbar input { background: #0b1224; color: #e5e7eb; border: 1px solid rgba(255,255,255,.12); padding: 8px 10px; border-radius: 10px; outline: none; width: 300px; }
    .crud-body { overflow: auto; }
    .crud-grid { width: 100%; border-collapse: collapse; }
    .crud-grid th, .crud-grid td { border-bottom: 1px solid rgba(255,255,255,.08); padding: 10px; vertical-align: middle; text-align: left; }
    .crud-grid th { position: sticky; top: 0; background: #111827; z-index: 1; }
    .thumb { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; background: #0b1224; border: 1px solid rgba(255,255,255,0.1); }
    .row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .crud-new { padding: 12px 16px; border-top: 1px dashed rgba(255,255,255,.1); display: grid; gap: 8px; grid-template-columns: 1fr auto auto; align-items: center; }
    .crud-new input, .crud-new select { background: #0b1224; color: #e5e7eb; border: 1px solid rgba(255,255,255,.12); padding: 8px 10px; border-radius: 10px; outline: none; width: 100%; }
    .crud-foot { padding: 10px 16px; display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,.08); background: linear-gradient(0deg, rgba(255,255,255,.04), transparent); }
    .url-input { width: 100%; font-family: monospace; font-size: 0.9em; }
  `;

  return (
    <div className="crud-backdrop">
      <style>{css}</style>
      <div className="crud-card">
        <div className="crud-head">
          <div className="crud-title">Gestión de Presentaciones</div>
          <div className="crud-actions">
            <button className="btn small" onClick={onRefresh}>Refrescar</button>
            <button className="btn small" onClick={onClose}>Cerrar</button>
          </div>
        </div>
        <div className="crud-toolbar">
          <input placeholder="Buscar por URL..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="crud-body">
          <table className="crud-grid">
            <thead>
              <tr><th style={{ width: 100 }}>Vista</th><th>URL de la Imagen</th><th style={{ width: 100 }}>Estado</th><th style={{ width: 180 }}>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const isEditing = editRow === it.id;
                const displayUrl = getOptimizedUrl(it.url);
                return (
                  <tr key={it.id}>
                    <td><img className="thumb" src={displayUrl} alt="Vista" onError={(e) => { e.target.style.border = '2px solid #ef4444'; e.target.src = ""; }} /></td>
                    <td>{isEditing ? <input className="url-input" defaultValue={it.url || ""} onChange={(e) => (it._url = e.target.value)} /> : <div style={{ wordBreak: 'break-all' }}><a href={it.url} target="_blank" rel="noreferrer" style={{ fontSize: ".85rem", color: "#93c5fd" }}>{it.url ? (it.url.length > 60 ? it.url.substring(0,60)+'...' : it.url) : "Sin URL"}</a></div>}</td>
                    <td>{isEditing ? <select defaultValue={isActive(it.estado) ? "1" : "0"} onChange={(e) => (it._estado = e.target.value === "1")}><option value="1">Activo</option><option value="0">Inactivo</option></select> : <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: "0.8rem", background: isActive(it.estado) ? "#065f46" : "#7f1d1d", border: "1px solid rgba(255,255,255,.14)" }}>{isActive(it.estado) ? "Activo" : "Inactivo"}</span>}</td>
                    <td>
                      <div className="row-actions">
                        {isEditing ? (
                          <><button className="btn save" disabled={saving} onClick={async () => { setSaving(true); try { const payload = { url: it._url ?? it.url, estado: typeof it._estado === "boolean" ? it._estado : isActive(it.estado), usuario_id: getUsuarioActual() }; await onUpdate(it.id, payload); setEditRow(null); } finally { setSaving(false); } }}>Guardar</button><button className="btn" onClick={() => setEditRow(null)}>Cancelar</button></>
                        ) : (
                          <><button className="btn" onClick={() => setEditRow(it.id)}>Editar</button><button className="btn danger" onClick={async () => { if (window.confirm(`¿Eliminar?`)) await onDelete(it.id); }}>Eliminar</button></>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (<tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>Sin resultados.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="crud-new">
          <input placeholder="Pegar enlace de Google Drive..." value={formNew.url} onChange={(e) => setFormNew((s) => ({ ...s, url: e.target.value }))} />
          <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}><input type="checkbox" style={{ width: "auto" }} checked={!!formNew.estado} onChange={(e) => setFormNew((s) => ({ ...s, estado: e.target.checked }))} /> Activo</label>
          <button className="btn save" disabled={saving} onClick={async () => { if (!formNew.url) { alert("URL requerida."); return; } setSaving(true); try { await onCreate({ url: formNew.url, estado: formNew.estado, usuario_id: getUsuarioActual() }); setFormNew({ url: "", estado: true }); } finally { setSaving(false); } }}>Agregar</button>
        </div>
        <div className="crud-foot"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}

/* ========= Componente Principal ========= */
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

export default function DynamicSlider({ fullBleed = false, titleText = "Ciencias de la Educación" }) {
  const [presentaciones, setPresentaciones] = useState([]);
  const [showCrud, setShowCrud] = useState(false);

  const fetchPresentaciones = async () => {
    try {
      const data = await ImagenesAPI.list();
      setPresentaciones(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); setPresentaciones([]); }
  };

  useEffect(() => { fetchPresentaciones(); }, []);
  function isActive(val) { return val === true || val === "true" || val === 1; }

  const sources = useMemo(() => uniq(presentaciones.filter((it) => isActive(it.estado)).map((img) => getOptimizedUrl(img.url || ""))), [presentaciones]);

  const css = `
    .fs-wrap { width: 100%; position: relative; background: #0b1020; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.2); padding: 12px 0; overflow: hidden; }
    .fs-wrap.full-bleed { width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; border-radius: 0; }
    .hero-center { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; pointer-events: none; padding: 0 2rem; }
    .hero-title { color: #ffffff; font-weight: 1000; text-transform: uppercase; letter-spacing: 2px; text-align: center; line-height: 1.05; font-size: clamp(1.8rem, 7vw, 4.2rem); text-shadow: 0 6px 28px rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.35); -webkit-text-stroke: 0.6px rgba(0,0,0,.35); }
    .edit-btn { position: absolute; right: 12px; top: 10px; z-index: 10; background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.28); padding: 6px 10px; border-radius: 10px; cursor: pointer; font-weight: 800; backdrop-filter: blur(2px); transition: background 0.2s; }
    .edit-btn:hover { background: rgba(255,255,255,.2); }
  `;

  return (
    <>
      <style>{css}</style>
      <section className={`fs-wrap ${fullBleed ? "full-bleed" : ""}`}>
        <div className="hero-center"><h1 className="hero-title">{titleText}</h1></div>
        {AuthService.isAuthenticated() && (<button className="edit-btn" onClick={() => setShowCrud(true)}>Editar</button>)}
        {sources.length > 0 ? <FilmstripOneRow sources={sources} /> : <div style={{ color: "#e5e7eb", opacity: 0.85, padding: 16, minHeight: 200, display:'grid', placeItems:'center' }}><p>No hay imágenes.</p></div>}
      </section>
      <CrudModal open={showCrud} onClose={() => setShowCrud(false)} presentaciones={presentaciones} onRefresh={fetchPresentaciones} onCreate={async (p) => { await ImagenesAPI.create(p); await fetchPresentaciones(); }} onUpdate={async (id, p) => { await ImagenesAPI.update(id, p); await fetchPresentaciones(); }} onDelete={async (id) => { await ImagenesAPI.remove(id); await fetchPresentaciones(); }} />
    </>
  );
}

/* ========= Película Infinita (Recursive Loop) ========= */
function FilmstripOneRow({ sources }) {
  // Solo necesitamos DUPLICAR la lista UNA VEZ para el efecto recursivo.
  // [A, B, C] => [A, B, C, A, B, C]
  // Cuando el segundo 'A' llegue a la posición inicial, reseteamos la animación.
  const displayItems = [...sources, ...sources];
  
  // Duración basada en la cantidad real de imágenes para mantener velocidad constante
  const animationDuration = sources.length * 8; 

  const cssAnim = `
    @keyframes marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); } /* Se mueve solo el 50% (la longitud de la lista original) */
    }
    .filmstrip-container {
      display: flex; overflow: hidden; user-select: none; width: 100%;
      mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
    }
    .marquee-track {
      display: flex; gap: 16px; width: max-content;
      animation: marquee-scroll ${animationDuration}s linear infinite;
      will-change: transform;
    }
    .film-img {
      height: 240px; width: auto; border-radius: 12px; object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5); opacity: 0.7; transition: opacity 0.3s, transform 0.3s;
    }
    .film-img:hover { opacity: 1; transform: scale(1.05); z-index: 2; }
  `;

  return (
    <div className="filmstrip-container">
      <style>{cssAnim}</style>
      <div className="marquee-track">
        {displayItems.map((src, i) => (
          // Usamos 'i' como key aunque no sea lo ideal, porque las URLs se repiten
          <img key={i} src={src} className="film-img" alt={`slide-${i}`} onError={(e) => e.target.style.display = 'none'} />
        ))}
      </div>
    </div>
  );
}