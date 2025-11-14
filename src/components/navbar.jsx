// src/components/navbar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Layout, Grid, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import * as Icons from "@ant-design/icons";

const { Content } = Layout;
const { useBreakpoint } = Grid;

export default function Navbar() {
  // Hooks SIEMPRE arriba y en el mismo orden
  const _screens = useBreakpoint();
  const { pathname } = useLocation();
  const [hoverKey, setHoverKey] = useState(null);

  // Datos estáticos para los menús
  const menuItems = useMemo(
    () => [
      {
        id: 1,
        nombre: "Inicio",
        ruta: "/",
        icono: "HomeOutlined",
        subMenus: [],
      },
      {
        id: 2,
        nombre: "Acerca de",
        ruta: "/about",
        icono: "InfoCircleOutlined",
        subMenus: [],
      },
      {
        id: 3,
        nombre: "Servicios",
        ruta: "/services",
        icono: "AppstoreOutlined",
        subMenus: [
          {
            id: 31,
            nombre: "Consultoría",
            ruta: "/services/consulting",
            icono: "SolutionOutlined",
          },
          {
            id: 32,
            nombre: "Desarrollo",
            ruta: "/services/development",
            icono: "CodeOutlined",
          },
        ],
      },
      {
        id: 4,
        nombre: "Contacto",
        ruta: "/contact",
        icono: "PhoneOutlined",
        subMenus: [],
      },
    ],
    []
  );

  const getIcon = (iconName) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

  // Convertir menús estáticos al formato del navbar
  const items = useMemo(() => {
    return menuItems.map((menu) => {
      const item = {
        key: menu.id.toString(),
        label: menu.nombre,
        href: menu.ruta,
        icon: getIcon(menu.icono),
      };

      if (menu.subMenus && menu.subMenus.length > 0) {
        item.submenu = menu.subMenus.map((sub) => ({
          key: sub.id.toString(),
          label: sub.nombre,
          href: sub.ruta,
          icon: getIcon(sub.icono),
        }));
      }

      return item;
    });
  }, [menuItems]);

  // Índice de rutas para construir breadcrumbs
  const routeIndex = useMemo(() => {
    const map = {};
    const index = (arr, parentHref = null) => {
      arr.forEach((it) => {
        if (it.href) map[it.href] = { href: it.href, label: it.label, parentHref };
        if (it.submenu) index(it.submenu, it.href || parentHref);
      });
    };
    index(items);
    return map;
  }, [items]);

  // Encuentra la ruta más específica que coincide con la URL actual
  const crumbs = useMemo(() => {
    let best = null;
    for (const href in routeIndex) {
      if (pathname === href || pathname.startsWith(href + "/")) {
        if (!best || href.length > best.href.length) best = routeIndex[href];
      }
    }
    const chain = [];
    let cur = best;
    while (cur) {
      chain.unshift(cur);
      cur = cur.parentHref ? routeIndex[cur.parentHref] : null;
    }
    return chain;
  }, [pathname, routeIndex]);

  return (
    <Content style={{ padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;800;900&display=swap');

        :root{
          --font-display:"Playfair Display","Times New Roman",serif;
          --font-sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
          --bg-1:#e60202ff; --bg-2:#e60202ff; --hover-bg:rgba(255,255,255,.14); --white:#fff; --ink:#0b0a34;
        }

        /* ====== DESKTOP NAVBAR ====== */
        .navbar-desktop { display:block; }
        @media (max-width: 991px) { .navbar-desktop { display:none !important; } }

        .nav-bg{ width:100%; color:var(--white); background:linear-gradient(90deg,var(--bg-1) 0%,var(--bg-2) 100%); }
        .nav-container{ max-width:1280px; margin:0 auto; padding:12px 20px 18px; }
        .brand{ text-align:center; margin-bottom:6px; }
        .brand-title{ font-family:var(--font-display)!important; color:var(--white)!important; margin:0; line-height:1.1; font-weight:900; letter-spacing:.2px; font-size:clamp(18px,2.6vw,28px); text-shadow:0 2px 8px rgba(0,0,0,.25); }
        .nav-grid{ display:flex; flex-wrap:wrap; gap:10px 20px; justify-content:center; align-items:center; }
        .nav-item-wrap{ position:relative; display:inline-block; }
        .nav-item{ padding:6px 10px; border-radius:10px; display:inline-flex; flex-direction:column; align-items:center; gap:4px; transition:background 180ms ease, transform 180ms ease; will-change:transform; }
        .nav-item.hovered{ background:var(--hover-bg); transform:translateY(-1px); }
        .nav-btn{ display:inline-flex; align-items:center; gap:8px; color:var(--white); text-decoration:none; white-space:nowrap; font-family:var(--font-sans); font-weight:600; letter-spacing:.2px; }
        .nav-icon{ width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; }
        .nav-icon svg{ font-size:22px; line-height:1; vertical-align:middle; opacity:.95; }
        .nav-label{ font-size:clamp(12px,1.6vw,14px); line-height:1; }
        .nav-underline{ height:2px; background:var(--white); border-radius:4px; transition:width 180ms ease; width:0; }
        .submenu{ position:absolute; left:0; top:100%; background:#fff; color:var(--ink); border-radius:10px; box-shadow:0 16px 40px rgba(0,0,0,.25); min-width:240px; z-index:50; padding:6px; border:1px solid rgba(0,0,0,.06); }
        .submenu-link{ display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:8px; color:var(--ink); text-decoration:none; font-size:14px; font-family:var(--font-sans); font-weight:600; transition:background 160ms ease, transform 120ms ease; white-space:normal; }
        .submenu-link:hover{ background:rgba(11,10,52,.06); transform:translateX(1px); }
        .submenu-icon{ width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; }
        .submenu-item.has-children{ position:relative; }
        .submenu-parent{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 12px; border-radius:8px; cursor:default; font-family:var(--font-sans); font-weight:700; color:var(--ink); font-size:14px; }
        .submenu-parent-left{ display:inline-flex; align-items:center; gap:8px; }
        .submenu-parent:hover{ background:rgba(11,10,52,.06); }
        .submenu-caret{ opacity:.55; }
        .submenu-nested{ display:none; position:absolute; top:0; left:100%; margin-left:8px; background:#fff; color:var(--ink); border-radius:10px; box-shadow:0 16px 40px rgba(0,0,0,.25); padding:6px; min-width:240px; max-height:70vh; overflow:auto; grid-template-columns:1fr; gap:6px; border:1px solid rgba(0,0,0,.06); }
        .submenu-item.has-children:hover > .submenu-nested{ display:grid; }
        @media (min-width:768px){ .submenu-nested{ min-width:440px; grid-template-columns:repeat(2,minmax(200px,1fr)); } }

    /* ====== MOBILE: breadcrumb de texto (centrado y grande) ====== */
.mobile-crumbs-wrap { display: none; }
@media (max-width: 991px) { 
  .mobile-crumbs-wrap { 
    display: block;
    background: #f6f7fb;
    border-bottom: 1px solid rgba(0,0,0,.06);
  } 
}

.mobile-crumbs {
  /* contenedor */
  max-width: 1280px; 
  margin: 0 auto;
  padding: 14px 16px;

  /* tipografía grande y centrada */
  font-family: var(--font-sans);
  font-size: clamp(18px, 5vw, 28px);   /* ← ajusta aquí el tamaño */
  font-weight: 800;
  color: #111827;
  text-align: center;

  /* centrado con flex y permite varias líneas si es largo */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mobile-crumbs a { 
  color: #111827; 
  text-decoration: none; 
  font-weight: 900; 
}
.mobile-crumbs a:hover { text-decoration: underline; }

.crumb-sep { 
  margin: 0 6px; 
  opacity: .5; 
  /* opcional: que el separador crezca acorde al texto */
  font-size: 1em; 
}

      `}</style>

      {/* ====== MOBILE: Breadcrumbs en texto ====== */}
      <div className="mobile-crumbs-wrap">
        <div className="mobile-crumbs">
          {crumbs.length === 0 ? (
            <span>Inicio</span>
          ) : (
            crumbs.map((c, i) => (
              <span key={c.href}>
                <a href={c.href}>{c.label}</a>
                {i < crumbs.length - 1 && <span className="crumb-sep">/</span>}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ====== DESKTOP NAVBAR ====== */}
      <div className="navbar-desktop nav-bg">
        <div className="nav-container">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#fff", opacity: 0.7 }}>
              No hay menús disponibles
            </div>
          ) : (
            <div className="nav-grid">
              {items.map((it) => (
                <div
                  key={it.key}
                  onMouseEnter={() => setHoverKey(it.key)}
                  onMouseLeave={() => setHoverKey(null)}
                  className="nav-item-wrap"
                >
                  <div className={`nav-item ${hoverKey === it.key ? "hovered" : ""}`}>
                    <a className="nav-btn" href={it.href ?? "#"} aria-label={it.label}>
                      <span className="nav-icon">{it.icon}</span>
                      <span className="nav-label">{it.label}</span>
                    </a>
                    <div className="nav-underline" style={{ width: hoverKey === it.key ? 70 : 0 }} />
                  </div>

                  {it.submenu && hoverKey === it.key && (
                    <div className="submenu" role="menu">
                      {it.submenu.map((sm) => {
                        if (sm.children?.length) {
                          return (
                            <div key={sm.key} className="submenu-item has-children">
                              <div className="submenu-parent">
                                <span className="submenu-parent-left">
                                  {sm.icon ? <span className="submenu-icon">{sm.icon}</span> : null}
                                  <span>{sm.label}</span>
                                </span>
                                <span className="submenu-caret">›</span>
                              </div>
                              <div className="submenu submenu-nested">
                                {sm.children.map((c) => (
                                  <a key={c.key} className="submenu-link" href={c.href}>
                                    {c.icon ? <span className="submenu-icon">{c.icon}</span> : null}
                                    <span>{c.label}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <a key={sm.key} className="submenu-link" href={sm.href}>
                            {sm.icon ? <span className="submenu-icon">{sm.icon}</span> : null}
                            <span>{sm.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Content>
  );
}
