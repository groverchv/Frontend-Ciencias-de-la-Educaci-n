import React, { useState } from "react";
import { Layout, Menu, Modal, Upload, message } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    SettingOutlined,
    MenuOutlined,
    SafetyOutlined,
    TeamOutlined,
    AppstoreOutlined,
    DatabaseOutlined,
    DownloadOutlined,
    UploadOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import BackupService from "../../services/BackupService.js";

const { Sider } = Layout;
const { confirm } = Modal;

export default function DashboardSidebar({ collapsed }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isRestoreModalVisible, setIsRestoreModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    /**
     * Manejar descarga de backup
     */
    const handleDownloadBackup = async () => {
        const hide = message.loading('Generando backup...', 0);
        
        try {
            const result = await BackupService.downloadBackup();
            hide();
            
            if (result.success) {
                message.success({
                    content: `Backup descargado exitosamente: ${result.fileName}`,
                    duration: 3,
                });
            }
        } catch (error) {
            hide();
            message.error({
                content: error.message || 'Error al descargar el backup',
                duration: 5,
            });
        }
    };

    /**
     * Mostrar modal de restauración
     */
    const showRestoreModal = () => {
        setIsRestoreModalVisible(true);
    };

    /**
     * Manejar restauración de backup
     */
    const handleRestoreBackup = () => {
        if (fileList.length === 0) {
            message.warning('Por favor seleccione un archivo de backup');
            return;
        }

        confirm({
            title: '¿Está seguro de restaurar el backup?',
            icon: <ExclamationCircleOutlined />,
            content: 'Esta acción sobrescribirá todos los datos actuales de la base de datos. Esta operación no se puede deshacer.',
            okText: 'Sí, restaurar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                setUploading(true);
                const hide = message.loading('Restaurando base de datos...', 0);
                
                try {
                    const file = fileList[0];
                    const result = await BackupService.restoreBackup(file);
                    hide();
                    setUploading(false);
                    
                    message.success({
                        content: result.message || 'Backup restaurado exitosamente',
                        duration: 5,
                    });
                    
                    setIsRestoreModalVisible(false);
                    setFileList([]);
                    
                    // Recargar la página después de 2 segundos
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    hide();
                    setUploading(false);
                    
                    message.error({
                        content: error.message || 'Error al restaurar el backup',
                        duration: 5,
                    });
                }
            }
        });
    };

    /**
     * Propiedades del componente Upload
     */
    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // Validar extensión
            if (!file.name.toLowerCase().endsWith('.sql')) {
                message.error('Solo se permiten archivos .sql');
                return false;
            }

            // Validar tamaño (máximo 500MB)
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                message.error('El archivo es demasiado grande. Tamaño máximo: 500MB');
                return false;
            }

            setFileList([file]);
            return false; // No subir automáticamente
        },
        fileList,
        accept: '.sql',
        maxCount: 1,
    };

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
        {
            key: "/dashboard/backup",
            icon: <DatabaseOutlined />,
            label: "Gestionar Backup",
        },
        {
            key: "base-datos-acciones",
            icon: <DatabaseOutlined />,
            label: "Backup Rápido",
            children: [
                {
                    key: "download-backup",
                    icon: <DownloadOutlined />,
                    label: "Descargar Backup",
                },
                {
                    key: "restore-backup",
                    icon: <UploadOutlined />,
                    label: "Restaurar Backup",
                },
            ]
        },
    ];

    const handleMenuClick = ({ key }) => {
        // Manejar operaciones de backup
        if (key === "download-backup") {
            handleDownloadBackup();
            return;
        }
        
        if (key === "restore-backup") {
            showRestoreModal();
            return;
        }

        // Navegación normal
        navigate(key);
    };

    return (
        <>
            <Sider
                width={250}
                collapsible
                collapsed={collapsed}
                trigger={null}
                breakpoint="lg"
                collapsedWidth={0}
                style={{
                    background: "#fff",
                    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
                    overflow: 'auto',
                    height: 'calc(100vh - 64px)',
                    position: 'sticky',
                    top: 64,
                    left: 0,
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

            {/* Modal para restaurar backup */}
            <Modal
                title="Restaurar Base de Datos"
                open={isRestoreModalVisible}
                onOk={handleRestoreBackup}
                onCancel={() => {
                    setIsRestoreModalVisible(false);
                    setFileList([]);
                }}
                okText="Restaurar"
                cancelText="Cancelar"
                okButtonProps={{ 
                    danger: true,
                    disabled: fileList.length === 0,
                    loading: uploading
                }}
                cancelButtonProps={{ disabled: uploading }}
            >
                <p style={{ marginBottom: 16 }}>
                    <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    Seleccione un archivo de backup (.sql) para restaurar la base de datos.
                </p>
                <Upload {...uploadProps}>
                    <button 
                        type="button"
                        style={{
                            width: '100%',
                            padding: '8px 16px',
                            border: '1px dashed #d9d9d9',
                            borderRadius: '4px',
                            background: '#fafafa',
                            cursor: 'pointer'
                        }}
                        disabled={uploading}
                    >
                        <UploadOutlined /> Seleccionar archivo
                    </button>
                </Upload>
                <p style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
                    ⚠️ Esta operación sobrescribirá todos los datos actuales y no se puede deshacer.
                </p>
            </Modal>
        </>
    );
}
