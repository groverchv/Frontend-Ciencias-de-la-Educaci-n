// src/components/navbar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Layout, Grid, Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";
import * as Icons from "@ant-design/icons";

import MenuService from "../../services/MenuService";
import Sub_MenuService from "../../services/Sub_MenuService";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "#2563eb" }} spin />
);

export default function Navbar() {
  const _screens = useBreakpoint();
  const { pathname } = useLocation();
  const [hoverKey, setHoverKey] = useState(null);

  const [menus, setMenus] = useState([]);
  const [subMenus, setSubMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga de menús y submenús
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menusResponse, subMenusResponse] = await Promise.all([
          MenuService.getAllMenus(),
          Sub_MenuService.getAllSubMenu(),
        ]);

        setMenus(menusResponse.filter((m) => m.estado === true));
        setSubMenus(subMenusResponse.filter((s) => s.estado === true));
      } catch (err) {
        console.error("Error al cargar menús:", err);
        setError(err.message || "No se pudieron cargar los datos del menú.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = useMemo(() => {
    const sortedMenus = [...menus].sort(
      (a, b) => (a.orden || 0) - (b.orden || 0)
    );

    const subMenuMap = subMenus.reduce((acc, sub) => {
      const menuId = sub.menu_id?.id;
      if (!menuId) return acc;

      if (!acc[menuId]) {
        acc[menuId] = [];
      }
      acc[menuId].push(sub);
      return acc;
    }, {});

    return sortedMenus.map((menu) => {
      const relatedSubMenus = subMenuMap[menu.id] || [];
      const sortedSubMenus = relatedSubMenus.sort(
        (a, b) => (a.orden || 0) - (b.orden || 0)
      );

      return {
        id: menu.id,
        nombre: menu.titulo,
        ruta: menu.ruta,
        icono: menu.icono,
        subMenus: sortedSubMenus.map((sub) => ({
          id: sub.id,
          nombre: sub.titulo,
          ruta: sub.ruta,
          icono: sub.icono,
        })),
      };
    });
  }, [menus, subMenus]);

  const getIcon = (iconName) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

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

  const routeIndex = useMemo(() => {
    const map = {};
    const index = (arr, parentHref = null) => {
      arr.forEach((it) => {
        if (it.href)
          map[it.href] = { href: it.href, label: it.label, parentHref };
        if (it.submenu) index(it.submenu, it.href || parentHref);
      });
    };
    index(items);
    return map;
  }, [items]);

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

  const renderNavbarContent = () => {
    if (loading) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            minHeight: "121px",
          }}
        >
          <Spin indicator={antIcon} />
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Alert
            message={`Error al cargar menú: ${error}`}
            type="error"
            showIcon
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              color: "rgba(0,0,0,0.8)",
            }}
          />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#6b7280",
            opacity: 0.9,
          }}
        >
          No hay menús disponibles
        </div>
      );
    }

    return (
      <div className="nav-grid">
        {items.map((it) => (
          <div
            key={it.key}
            onMouseEnter={() => setHoverKey(it.key)}
            onMouseLeave={() => setHoverKey(null)}
            className="nav-item-wrap"
          >
            <div
              className={`nav-item ${hoverKey === it.key ? "hovered" : ""
                }`}
            >
              {it.submenu && it.submenu.length > 0 ? (
                <div className="nav-btn" aria-label={it.label} style={{ cursor: "default" }}>
                  <span className="nav-icon">{it.icon}</span>
                  <span className="nav-label">{it.label}</span>
                </div>
              ) : (
                <Link
                  className="nav-btn"
                  to={it.href ?? "#"}
                  aria-label={it.label}
                >
                  <span className="nav-icon">{it.icon}</span>
                  <span className="nav-label">{it.label}</span>
                </Link>
              )}
              <div
                className="nav-underline"
                style={{ width: hoverKey === it.key ? 70 : 0 }}
              />
            </div>

            {it.submenu && hoverKey === it.key && (
              <div className="submenu" role="menu">
                {it.submenu.map((sm) => {
                  if (sm.children?.length) {
                    return (
                      <div key={sm.key} className="submenu-item has-children">
                        <div className="submenu-parent">
                          <span className="submenu-parent-left">
                            {sm.icon ? (
                              <span className="submenu-icon">
                                {sm.icon}
                              </span>
                            ) : null}
                            <span>{sm.label}</span>
                          </span>
                          <span className="submenu-caret">›</span>
                        </div>
                        <div className="submenu submenu-nested">
                          {sm.children.map((c) => (
                            <Link
                              key={c.key}
                              className="submenu-link"
                              to={c.href}
                            >
                              {c.icon ? (
                                <span className="submenu-icon">
                                  {c.icon}
                                </span>
                              ) : null}
                              <span>{c.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={sm.key}
                      className="submenu-link"
                      to={sm.href}
                    >
                      {sm.icon ? (
                        <span className="submenu-icon">
                          {sm.icon}
                        </span>
                      ) : null}
                      <span>{sm.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;800;900&display=swap');

        :root {
          --font-display: "Playfair Display","Times New Roman",serif;
          --font-sans: "Inter",system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;

          --nav-bg-1: #ffffff;
          --nav-bg-2: #f3f4ff;
          --nav-hover-bg: rgba(37, 99, 235, 0.08);
          --nav-text: #111827;
          --nav-muted: #6b7280;
          --nav-border: #e5e7eb;
          --nav-accent: #2563eb;
          --nav-sub-bg: #ffffff;
          --nav-sub-border: rgba(148, 163, 184, 0.35);
          --nav-sub-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
        }

        /* ====== NAVBAR DESKTOP ====== */
        .navbar-desktop { 
          display:block; 
          position: relative;
          z-index: 5;
        }
        @media (max-width: 991px) { 
          .navbar-desktop { 
            display:none !important; 
          } 
        }

        .nav-bg {
          width: 100%;
          color: var(--nav-text);
          background: linear-gradient(
            90deg,
            var(--nav-bg-1) 0%,
            var(--nav-bg-2) 100%
          );
          border-bottom: 1px solid var(--nav-border);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
          position: sticky;
          top: 56px; /* Altura del Header */
          z-index: 1000;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 10px 20px 14px;
        }

        .nav-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          justify-content: center;
          align-items: center;
        }

        .nav-item-wrap {
          position: relative;
          display: inline-block;
        }

        .nav-item {
          padding: 6px 10px;
          border-radius: 999px; /* pill del botón, esto sí lo dejamos */
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: background 160ms ease, transform 160ms ease;
          will-change: transform;
        }

        .nav-item.hovered {
          background: var(--nav-hover-bg);
          transform: translateY(-1px);
        }

        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--nav-text);
          text-decoration: none;
          white-space: nowrap;
          font-family: var(--font-sans);
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        .nav-icon {
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--nav-muted);
        }

        .nav-icon svg {
          font-size: 20px;
          line-height: 1;
          vertical-align: middle;
        }

        .nav-label {
          font-size: clamp(12px, 1.6vw, 14px);
          line-height: 1;
        }

        .nav-underline {
          height: 2px;
          background: var(--nav-accent);
          border-radius: 999px;
          transition: width 180ms ease;
          width: 0;
        }

        .submenu {
          position: absolute;
          left: 0;
          top: 100%;
          background: var(--nav-sub-bg);
          color: var(--nav-text);
          border-radius: 12px;
          box-shadow: var(--nav-sub-shadow);
          min-width: 240px;
          z-index: 50;
          padding: 6px;
          border: 1px solid var(--nav-sub-border);
        }

        .submenu-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--nav-text);
          text-decoration: none;
          font-size: 14px;
          font-family: var(--font-sans);
          font-weight: 500;
          transition: background 140ms ease, transform 120ms ease;
          white-space: normal;
        }

        .submenu-link:hover {
          background: rgba(37, 99, 235, 0.06);
          transform: translateX(1px);
        }

        .submenu-icon {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--nav-muted);
        }

        .submenu-item.has-children {
          position: relative;
        }

        .submenu-parent {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: default;
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--nav-text);
          font-size: 14px;
        }

        .submenu-parent-left {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .submenu-parent:hover {
          background: rgba(37, 99, 235, 0.06);
        }

        .submenu-caret {
          opacity: 0.55;
        }

        .submenu-nested {
          display: none;
          position: absolute;
          top: 0;
          left: 100%;
          margin-left: 8px;
          background: var(--nav-sub-bg);
          color: var(--nav-text);
          border-radius: 12px;
          box-shadow: var(--nav-sub-shadow);
          padding: 6px;
          min-width: 240px;
          max-height: 70vh;
          overflow: auto;
          grid-template-columns: 1fr;
          gap: 6px;
          border: 1px solid var(--nav-sub-border);
        }

        .submenu-item.has-children:hover > .submenu-nested {
          display: grid;
        }

        @media (min-width: 768px) {
          .submenu-nested {
            min-width: 440px;
            grid-template-columns: repeat(2, minmax(200px, 1fr));
          }
        }

        /* ====== MOBILE: breadcrumbs SIN ESQUINAS REDONDAS ====== */
        .mobile-crumbs-wrap {
          display: none;
        }

        @media (max-width: 991px) {
          .mobile-crumbs-wrap {
            display: block;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;

            position: relative;
            z-index: 6;
            margin-top: -18px;
            box-shadow: 0 -14px 32px rgba(15, 23, 42, 0.45);
            border-radius: 0; /* <-- sin esquinas redondas */
          }
        }

        .mobile-crumbs {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 16px;
          font-family: var(--font-sans);
          font-size: clamp(18px, 5vw, 24px);
          font-weight: 700;
          color: #111827;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .mobile-crumbs a {
          color: #111827;
          text-decoration: none;
          font-weight: 800;
        }

        .mobile-crumbs a:hover {
          text-decoration: underline;
        }

        .crumb-sep {
          margin: 0 6px;
          opacity: 0.5;
        }
      `}</style>

      {/* MOBILE: breadcrumbs */}
      <div className="mobile-crumbs-wrap">
        <div className="mobile-crumbs">
          {crumbs.length === 0 ? (
            <span>Inicio</span>
          ) : (
            crumbs.map((c, i) => (
              <span key={c.href}>
                <Link to={c.href}>{c.label}</Link>
                {i < crumbs.length - 1 && (
                  <span className="crumb-sep">/</span>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* DESKTOP NAVBAR */}
      <div className="navbar-desktop nav-bg">
        <div className="nav-container">{renderNavbarContent()}</div>
      </div>
    </>
  );
}
