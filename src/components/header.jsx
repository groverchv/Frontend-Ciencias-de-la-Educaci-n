// src/components/header.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Layout, Grid, Button, Space } from "antd";
import { MenuOutlined, DashboardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService.js";
import Sidebar from "./sidebar";

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

export default function Header() {
  const screens = useBreakpoint();
  // Usamos "sm" como corte para móvil (< 576px aprox.)
  const isMobile = !screens.sm;
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleDrawer = useCallback(() => setOpenDrawer((v) => !v), []);

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  const brandText = isMobile
    ? "HUMANIDADES"
    : "FACULTAD DE HUMANIDADES";

  const css = `
    .app-header {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 56px;
      padding: 0 32px;
      background: #2600af;
      position: sticky;
      top: 0;
      z-index: 1100;
    }

    .app-header__brand {
      color: #fff;
      font-weight: 800;
      letter-spacing: .6px;
      font-size: 17px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-header__right {
      margin-left: auto;
      display: flex;
      align-items: center;
    }

    .app-header__link {
      color: #fff;
      font-weight: 700;
      font-size: 15px;
    }

    /* ====== RESPONSIVE ====== */
    @media (max-width: 768px) {
      .app-header {
        padding: 0 16px;
      }
      .app-header__brand {
        font-size: 15px;
        max-width: 60vw;
      }
      .app-header__link {
        font-size: 13px;
      }
    }

    @media (max-width: 576px) {
      .app-header {
        padding: 0 12px;
        height: auto;
        min-height: 52px;
      }
      .app-header__brand {
        font-size: 14px;
        max-width: 55vw;
      }
      .app-header__right .ant-btn {
        padding-inline: 6px;
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        flex-wrap: wrap;
        row-gap: 4px;
      }
      .app-header__right {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>

      <AntHeader role="banner" className="app-header">
        <Button
          aria-label="Abrir/Cerrar menú"
          aria-expanded={openDrawer}
          type="text"
          icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
          onClick={toggleDrawer}
          style={{ color: "#fff" }}
        />

        <div className="app-header__brand">{brandText}</div>

        <Space className="app-header__right">
          {isAuthenticated && (
            <Button
              type="text"
              className="app-header__link"
              icon={<DashboardOutlined />}
              onClick={() => navigate("/dashboard")}
              style={{ color: "#fff" }}
            >
              {!isMobile && "DASHBOARD"}
            </Button>
          )}

          {!isAuthenticated && (
            <Button
              type="text"
              className="app-header__link"
              onClick={() => navigate("/login")}
              style={{ color: "#fff" }}
            >
              ACCEDER
            </Button>
          )}
        </Space>
      </AntHeader>

      {/* Sidebar controlado por el header */}
      <Sidebar open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </>
  );
}
