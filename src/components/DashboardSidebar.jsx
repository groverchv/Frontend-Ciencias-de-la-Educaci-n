import React from "react";
import { Layout, Menu } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    CalendarOutlined,
    SettingOutlined,
    MenuOutlined,
    SafetyOutlined,
    TeamOutlined,
    AppstoreOutlined,
    FileTextOutlined
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
            key: "usuarios",
            icon: <TeamOutlined />,
            label: "Gestión de Usuarios",
            children: [
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
                    key: "/dashboard/rol-usuario",
                    icon: <TeamOutlined />,
                    label: "Asignar Roles",
                },
            ]
        },
        {
            key: "contenido",
            icon: <FileTextOutlined />,
            label: "Gestión de Contenido",
            children: [
                {
                    key: "/dashboard/menus",
                    icon: <MenuOutlined />,
                    label: "Gestionar Menús",
                },
                {
                    key: "/dashboard/sub_menus",
                    icon: <AppstoreOutlined />,
                    label: "Gestionar Sub Menús",
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
            label: "Gestionar Presentación",
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
                defaultOpenKeys={['usuarios', 'contenido']}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ height: "100%", borderRight: 0 }}
            />
        </Sider>
    );
}
