import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SettingOutlined,
  MenuOutlined,
  SafetyOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Inicio",
    },
    {
      key: "/dashboard/usuarios",
      icon: <UserOutlined />,
      label: "Gestionar Usuarios",
    },
    {
      key: "/dashboard/roles",
      icon: <SafetyOutlined />,
      label: "Gestionar Roles",
    },
    {
      key: "/dashboard/permisos",
      icon: <KeyOutlined />,
      label: "Gestionar Permisos",
    },
    {
      key: "/dashboard/menus",
      icon: <MenuOutlined />,
      label: "Gestionar Menús",
    },
    {
      key: "/dashboard/sub_menus",
      icon: <CalendarOutlined />,
      label: "Gestionar Sub Menús",
    },
    {
      key: "/dashboard/bitacora",
      icon: <FileTextOutlined />,
      label: "Administrar Bitacora",
    },
    {
      key: "/dashboard/contenido",
      icon: <CalendarOutlined />,
      label: "Gestionar Contenido",
    },
      {
      key: "/dashboard/presentacion",
      icon: <SettingOutlined />,
      label: "Gestionar Presentación",
    },
    {
      key: "/dashboard/configuracion",
      icon: <SettingOutlined />,
      label: "Configuración",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{
        background: "#fff",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: "100%", borderRight: 0 }}
      />
    </Sider>
  );
}
