// src/components/header.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Layout, Grid, Drawer, Menu, Button, Spin, Space } from "antd";
import { MenuOutlined, LoadingOutlined, DashboardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MenuService from "../services/MenuService.js";
import AuthService from "../services/AuthService.js";
import * as Icons from "@ant-design/icons";

const { Header: AntHeader } = Layout;
const { useBreakpoint } = Grid;

export default function Header() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const toggleDrawer = useCallback(() => setOpenDrawer((v) => !v), []);

  useEffect(() => {
    fetchMenus();
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsAuthenticated(AuthService.isAuthenticated());
  };

  const fetchMenus = async () => {
    try {
      const menus = await MenuService.getMenusActivos();
      if (Array.isArray(menus)) {
        setMenuItems(menus);
      } else {
        console.error("La respuesta de la API no es un arreglo:", menus);
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error al cargar menús:", error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

  const convertToAntdMenu = (menus) => {
    return menus.map((menu) => {
      const item = {
        key: menu.ruta || menu.id.toString(),
        label: menu.nombre,
        icon: getIcon(menu.icono),
      };

      if (menu.subMenus && menu.subMenus.length > 0) {
        item.children = convertToAntdMenu(menu.subMenus);
      }

      return item;
    });
  };

  const handleMenuClick = ({ key }) => {
    if (typeof key === "string" && key.startsWith("/")) {
      navigate(key);
      setOpenDrawer(false);
    }
  };

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
          onClick={toggleDrawer}
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

      <Drawer
        className="app-drawer"
        title="Menú"
        placement="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        width={300}
        styles={{ body: { padding: 0 } }}
        zIndex={1050}
        maskClosable
        keyboard
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : menuItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
            <p>No hay menús disponibles</p>
            <p style={{ fontSize: "12px" }}>
              Los administradores pueden crear menús desde el Dashboard
            </p>
          </div>
        ) : (
          <Menu
            mode="inline"
            style={{ borderRight: 0 }}
            items={convertToAntdMenu(menuItems)}
            selectable={false}
            onClick={handleMenuClick}
          />
        )}
      </Drawer>
    </>
  );
}
