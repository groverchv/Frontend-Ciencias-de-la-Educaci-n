import React, { useState } from "react";
import { Layout, Menu, Modal, Upload, message, Button, Space } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    CalendarOutlined,
    SettingOutlined,
    MenuOutlined,
    SafetyOutlined,
    TeamOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    DownloadOutlined,
    UploadOutlined,
    DatabaseOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import BackupService from "../services/BackupService";

const { Sider } = Layout;
const { confirm } = Modal;

export default function DashboardSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);

    const handleDownloadBackup = async () => {
        confirm({
            title: '¿Descargar Backup de la Base de Datos?',
            icon: <ExclamationCircleOutlined />,
            content: 'Se creará un backup completo de la base de datos y se descargará en tu computadora.',
            okText: 'Descargar',
            cancelText: 'Cancelar',
            async onOk() {
                try {
                    message.loading({ content: 'Creando backup...', key: 'backup' });
                    
                    await BackupService.downloadBackup();
                    
                    message.success({ content: 'Backup descargado exitosamente', key: 'backup', duration: 3 });
                } catch (error) {
                    console.error('Error al descargar backup:', error);
                    message.error({ 
                        content: 'Error al crear el backup: ' + (error.response?.data?.message || error.message),
                        key: 'backup',
                        duration: 5 
                    });
                }
            }
        });
    };

    const handleRestoreBackup = () => {
        setRestoreModalVisible(true);
    };

    const handleRestoreConfirm = async () => {
        if (fileList.length === 0) {
            message.warning('Por favor selecciona un archivo de backup');
            return;
        }

        confirm({
            title: '¿Restaurar Base de Datos?',
            icon: <ExclamationCircleOutlined />,
            content: '¡ADVERTENCIA! Esta acción reemplazará TODOS los datos actuales con los del backup. Esta acción NO se puede deshacer.',
            okText: 'Sí, Restaurar',
            okType: 'danger',
            cancelText: 'Cancelar',
            async onOk() {
                try {
                    message.loading({ content: 'Restaurando base de datos...', key: 'restore' });
                    
                    await BackupService.restoreBackup(fileList[0].originFileObj);
                    
                    message.success({ 
                        content: 'Base de datos restaurada exitosamente. Por favor, recarga la página.',
                        key: 'restore',
                        duration: 5 
                    });
                    
                    setRestoreModalVisible(false);
                    setFileList([]);
                    
                    // Recargar la página después de 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    console.error('Error al restaurar backup:', error);
                    message.error({ 
                        content: 'Error al restaurar: ' + (error.response?.data?.error || error.message),
                        key: 'restore',
                        duration: 5 
                    });
                }
            }
        });
    };

    const uploadProps = {
        beforeUpload: (file) => {
            // Validar que sea un archivo .sql
            const isSql = file.name.endsWith('.sql');
            if (!isSql) {
                message.error('Solo se permiten archivos .sql');
                return Upload.LIST_IGNORE;
            }
            
            setFileList([file]);
            return false; // Prevenir subida automática
        },
        fileList,
        onRemove: () => {
            setFileList([]);
        },
        maxCount: 1,
    };

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
        {
            key: "backup",
            icon: <DatabaseOutlined />,
            label: "Base de Datos",
            children: [
                {
                    key: "backup-download",
                    icon: <DownloadOutlined />,
                    label: "Descargar Backup",
                },
                {
                    key: "backup-restore",
                    icon: <UploadOutlined />,
                    label: "Restaurar Backup",
                },
            ]
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key === "backup-download") {
            handleDownloadBackup();
        } else if (key === "backup-restore") {
            handleRestoreBackup();
        } else {
            navigate(key);
        }
    };

    return (
        <>
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
                    defaultOpenKeys={['usuarios', 'contenido', 'backup']}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ height: "100%", borderRight: 0 }}
                />
            </Sider>

            {/* Modal para Restaurar Backup */}
            <Modal
                title={
                    <Space>
                        <UploadOutlined />
                        Restaurar Base de Datos desde Backup
                    </Space>
                }
                open={restoreModalVisible}
                onOk={handleRestoreConfirm}
                onCancel={() => {
                    setRestoreModalVisible(false);
                    setFileList([]);
                }}
                okText="Restaurar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true, disabled: fileList.length === 0 }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                        ⚠️ ADVERTENCIA: Esta acción reemplazará todos los datos actuales.
                    </p>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>
                            Seleccionar archivo de backup (.sql)
                        </Button>
                    </Upload>
                    {fileList.length > 0 && (
                        <p style={{ color: '#52c41a', marginTop: 8 }}>
                            ✓ Archivo seleccionado: {fileList[0].name}
                        </p>
                    )}
                </Space>
            </Modal>
        </>
    );
}
