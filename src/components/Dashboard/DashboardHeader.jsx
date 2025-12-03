// src/components/DashboardHeader.jsx
import React from "react";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Space,
  Typography,
  message,
  Grid,
} from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService.js";

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function DashboardHeader({ onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < md => móvil / tablet chico

  const handleLogout = () => {
    AuthService.logout();
    message.success("Sesión cerrada correctamente");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  const items = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: handleLogout,
    },
  ];

  const css = `
    .dashboard-header {
      background: #2600af;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .dashboard-header-left {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }

    .dashboard-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .dashboard-header-user {
      cursor: pointer;
    }

    /* ====== RESPONSIVE ====== */
    @media (max-width: 768px) {
      .dashboard-header {
        padding: 8px 12px;
      }

      .dashboard-header-left {
        font-size: 16px;
      }

      .dashboard-header-right {
        gap: 8px;
      }

      .dashboard-header-right .ant-btn {
        padding-inline: 8px;
        font-size: 13px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-header {
        gap: 8px;
      }
      
      .dashboard-header-left span {
        font-size: 14px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <Header className="dashboard-header">
        {/* Botón Toggle Sidebar + Título */}
        <div className="dashboard-header-left">
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
            style={{
              fontSize: '18px',
              width: 40,
              height: 40,
              color: '#fff',
              marginRight: 16
            }}
          />
          <span>{isMobile ? "Panel" : "Panel de Administración"}</span>
        </div>

        {/* Botón Inicio + Usuario */}
        <div className="dashboard-header-right">
          <Button
            type="default"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            style={{
              background: "#fff",
              borderColor: "#fff",
              color: "#2600af",
            }}
          >
            {isMobile ? "Inicio" : "Página Principal"}
          </Button>

          <Dropdown menu={{ items }} trigger={["click"]}>
            <Space className="dashboard-header-user">
              <Avatar
                icon={<UserOutlined />}
                style={{ background: "#fff", color: "#2600af" }}
              />
              {!isMobile && (
                <>
                  <Text style={{ color: "#fff" }}>
                    {user?.nombre} {user?.apellido}
                  </Text>
                  <DownOutlined style={{ color: "#fff" }} />
                </>
              )}
            </Space>
          </Dropdown>
        </div>
      </Header>
    </>
  );
}
