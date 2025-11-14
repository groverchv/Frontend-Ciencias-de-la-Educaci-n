import React from "react";
import { Layout, Button, Dropdown, Avatar, Space, Typography, message } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService.js";

const { Header } = Layout;
const { Text } = Typography;

export default function DashboardHeader() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    message.success('Sesión cerrada correctamente');
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

  return (
    <Header
      style={{
        background: "#2600af",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
        Panel de Administración
      </div>

      <Space size="middle">
        <Button
          type="default"
          icon={<HomeOutlined />}
          onClick={() => navigate("/")}
          style={{
            background: "#fff",
            borderColor: "#fff",
            color: "#2600af"
          }}
        >
          Página Principal
        </Button>

        <Dropdown menu={{ items }} trigger={["click"]}>
          <Space style={{ cursor: "pointer" }}>
            <Avatar icon={<UserOutlined />} style={{ background: "#fff", color: "#2600af" }} />
            <Text style={{ color: "#fff" }}>
              {user?.nombre} {user?.apellido}
            </Text>
            <DownOutlined style={{ color: "#fff" }} />
          </Space>
        </Dropdown>

        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ 
            background: "#ff4d4f",
            borderColor: "#ff4d4f"
          }}
        >
          Cerrar Sesión
        </Button>
      </Space>
    </Header>
  );
}
