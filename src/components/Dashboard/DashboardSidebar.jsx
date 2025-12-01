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
    TeamOutlined,
    AppstoreOutlined
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
            key: "paquete-usuario",
            icon: <TeamOutlined />,
            label: "Paquete Usuario",
            children: [
                {
                    key: "/dashboard/usuarios",
                    icon: <UserOutlined />,
                    label: "Gestionar Usuario",
                },
                {
                    key: "/dashboard/roles",
                    icon: <SafetyOutlined />,
                    label: "Gestionar Rol",
                },
                {
                    key: "/dashboard/rol-usuario",
                    icon: <TeamOutlined />,
                    label: "Asignar Rol",
                },
            ]
        },
        {
            key: "paquete-contenido",
            icon: <FileTextOutlined />,
            label: "Paquete Contenido",
            children: [
                {
                    key: "/dashboard/menus",
                    icon: <MenuOutlined />,
                    label: "Gestionar Menu",
                },
                {
                    key: "/dashboard/sub_menus",
                    icon: <AppstoreOutlined />,
                    label: "Gestionar Submenu",
                },
                {
                    key: "/dashboard/contenido",
                    icon: <FileTextOutlined />,
                    label: "Gestionar Contenido",
                },
            ]
        },
        {
            key: "/dashboard/presentacion",
            icon: <SettingOutlined />,
            label: "Gestionar Presentacion",
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    return (
        <Sider
            width={250}
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
