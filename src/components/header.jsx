// src/components/header.jsx
import React, { useState, useCallback, useEffect } from "react";
// 1. Imports de Menú, Spin, Alert, Servicios de Menú, etc., ELIMINADOS
import { Layout, Grid, Button, Space } from "antd"; 
import { MenuOutlined, DashboardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService.js";
// 2. IMPORTAR TU NUEVO COMPONENTE SIDEBAR
// (Ajusta la ruta si 'sidebar.jsx' no está en la misma carpeta)
import Sidebar from "./sidebar"; 

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

export default function Header() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  // 3. El Header SÓLO maneja el estado de 'abierto/cerrado'
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const toggleDrawer = useCallback(() => setOpenDrawer((v) => !v), []);

  // 4. El useEffect ahora SÓLO comprueba la autenticación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsAuthenticated(AuthService.isAuthenticated());
  };

  // 5. TODAS las funciones de menú (fetch, getIcon, convert, handleMenuClick)
  // han sido ELIMINADAS de este archivo.

  return (
    <>
      <style>{`
        .app-header__brand { color:#fff;font-weight:800;letter-spacing:.6px;font-size:${isMobile ? "15px" : "17px"};white-space:nowrap; }
        .app-header__link { color:#fff;font-weight:700;font-size:${isMobile ? "13px" : "15px"}; }
      `}</style>

      <AntHeader
        role="banner"
        style={{
          display: "flex",
          alignItems: "center",
          height: 56,
          gap: 12,
          padding: isMobile ? "0 12px" : "0 32px",
          background: "#2600afff",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Button
          aria-label="Abrir/Cerrar menú"
          aria-expanded={openDrawer}
          type="text"
          icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
          onClick={toggleDrawer} // <-- Esto abre el Drawer
          style={{ color: "#fff" }}
        />
        <div className="app-header__brand">FACULTAD DE HUMANIDADES</div>
        <Space style={{ marginLeft: "auto" }}>
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

      {/* 6. EL <Drawer> YA NO ESTÁ AQUÍ */}

      {/* 7. En su lugar, renderizamos el componente Sidebar
           y le pasamos el estado y la función para cerrarlo */}
      <Sidebar 
        open={openDrawer} 
        onClose={() => setOpenDrawer(false)} 
      />
    </>
  );
}