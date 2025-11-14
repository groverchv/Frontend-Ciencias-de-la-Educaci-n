import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import DashboardSidebar from "../../components/DashboardSidebar";

// Importamos el CSS unificado
import "./DashboardLayout.css";

const { Content } = Layout;

export default function Dashboard() {
  return (
    <Layout className="dashboard-layout">
      <DashboardHeader />
      <Layout>
        <DashboardSidebar />
        <Content className="dashboard-content">
          {/* Aquí se renderizan GestionarMenu, GestionarUsuario, etc. */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}