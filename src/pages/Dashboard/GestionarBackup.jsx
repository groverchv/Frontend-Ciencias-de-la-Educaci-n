import { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Table,
    Upload,
    Space,
    message,
    Popconfirm,
    Tag,
    Statistic,
    Row,
    Col,
    Modal,
    Tooltip,
    Alert,
    Spin
} from 'antd';
import {
    DownloadOutlined,
    UploadOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CloudDownloadOutlined,
    DatabaseOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    SafetyOutlined
} from '@ant-design/icons';
import BackupService from '../../services/BackupService';

const GestionarBackup = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [backupStatus, setBackupStatus] = useState(null);
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const initializeData = async () => {
            await loadBackups();
            await loadBackupStatus();
        };
        initializeData();
    }, []);

    const loadBackups = async () => {
        setLoading(true);
        try {
            console.log('Cargando lista de backups...');
            const data = await BackupService.listBackups();
            console.log('Backups recibidos:', data);
            
            // Asegurar que data es un array
            if (Array.isArray(data)) {
                setBackups(data);
            } else {
                console.error('Los datos recibidos no son un array:', data);
                setBackups([]);
                message.warning('No se pudieron cargar los backups correctamente');
            }
        } catch (error) {
            console.error('Error al cargar backups:', error);
            message.error(error.message || 'Error al cargar la lista de backups');
            setBackups([]); // Establecer array vacío en caso de error
        } finally {
            setLoading(false);
        }
    };

    const loadBackupStatus = async () => {
        try {
            const status = await BackupService.getBackupStatus();
            setBackupStatus(status);
        } catch (error) {
            console.error('Error al cargar estado del backup:', error);
        }
    };

    const handleCreateBackup = async () => {
        setLoading(true);
        try {
            const result = await BackupService.downloadBackup();
            message.success(`Backup creado y descargado: ${result.fileName}`);
            await loadBackups();
            await loadBackupStatus();
        } catch (error) {
            message.error(error.message || 'Error al crear backup');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadBackup = async (fileName) => {
        try {
            message.loading({ content: 'Descargando backup...', key: 'download' });
            await BackupService.downloadSpecificBackup(fileName);
            message.success({ content: 'Backup descargado exitosamente', key: 'download' });
        } catch (error) {
            message.error({ 
                content: error.message || 'Error al descargar backup', 
                key: 'download' 
            });
        }
    };

    const handleDeleteBackup = async (fileName) => {
        try {
            await BackupService.deleteBackup(fileName);
            message.success('Backup eliminado exitosamente');
            await loadBackups();
        } catch (error) {
            message.error(error.message || 'Error al eliminar backup');
        }
    };

    const handleRestoreBackup = async () => {
        if (!selectedFile) {
            message.warning('Por favor seleccione un archivo de backup');
            return;
        }

        setUploading(true);
        try {
            const result = await BackupService.restoreBackup(selectedFile);
            message.success(result.message || 'Base de datos restaurada exitosamente');
            setRestoreModalVisible(false);
            setSelectedFile(null);
            await loadBackupStatus();
        } catch (error) {
            message.error(error.message || 'Error al restaurar backup');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'hace unos segundos';
        if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
        if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 604800)} semanas`;
        return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    };

    const columns = [
        {
            title: 'Nombre del Archivo',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text) => text ? (
                <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontFamily: 'monospace' }}>{text}</span>
                </Space>
            ) : '-',
        },
        {
            title: 'Tamaño',
            dataIndex: 'size',
            key: 'size',
            render: (size) => size != null ? formatFileSize(size) : '-',
            sorter: (a, b) => (a.size || 0) - (b.size || 0),
        },
        {
            title: 'Fecha de Creación',
            dataIndex: 'createdDate',
            key: 'createdDate',
            render: (date) => date ? (
                <Space direction="vertical" size={0}>
                    <span>{formatDate(date)}</span>
                    <Tag color="blue" icon={<ClockCircleOutlined />}>
                        {getRelativeTime(date)}
                    </Tag>
                </Space>
            ) : '-',
            sorter: (a, b) => {
                const dateA = a.createdDate ? new Date(a.createdDate) : new Date(0);
                const dateB = b.createdDate ? new Date(b.createdDate) : new Date(0);
                return dateA - dateB;
            },
            defaultSortOrder: 'descend',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Descargar backup">
                        <Button
                            type="primary"
                            icon={<CloudDownloadOutlined />}
                            onClick={() => handleDownloadBackup(record.fileName)}
                            size="small"
                        >
                            Descargar
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="¿Eliminar backup?"
                        description="Esta acción no se puede deshacer"
                        onConfirm={() => handleDeleteBackup(record.fileName)}
                        okText="Sí, eliminar"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Eliminar backup">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            >
                                Eliminar
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const uploadProps = {
        beforeUpload: (file) => {
            // Validar extensión
            if (!file.name.toLowerCase().endsWith('.sql')) {
                message.error('El archivo debe tener extensión .sql');
                return Upload.LIST_IGNORE;
            }

            // Validar tamaño (máximo 500MB)
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                message.error('El archivo es demasiado grande. Tamaño máximo: 500MB');
                return Upload.LIST_IGNORE;
            }

            setSelectedFile(file);
            return false; // No subir automáticamente
        },
        onRemove: () => {
            setSelectedFile(null);
        },
        maxCount: 1,
        accept: '.sql',
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Encabezado */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <DatabaseOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                            Gestión de Backups de Base de Datos
                        </h2>
                        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                            Administra los respaldos de tu base de datos: crea, descarga, restaura y elimina backups
                        </p>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={loadBackups}
                                loading={loading}
                            >
                                Actualizar
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleCreateBackup}
                                loading={loading}
                                size="large"
                            >
                                Crear Nuevo Backup
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Estado del Servicio */}
            {backupStatus && (
                <Card 
                    title={
                        <Space>
                            <SafetyOutlined style={{ color: '#52c41a' }} />
                            Estado del Servicio de Backup
                        </Space>
                    }
                    style={{ marginBottom: '24px' }}
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic
                                title="Estado del Servicio"
                                value={backupStatus.status || 'Activo'}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Directorio de Backups"
                                value={backupStatus.backupDirectory || './backups'}
                                prefix={<DatabaseOutlined />}
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Retención de Backups"
                                value="30 días"
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Backup Automático"
                                value="Diario (00:00)"
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                valueStyle={{ fontSize: '16px' }}
                            />
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Advertencia de Restauración */}
            <Alert
                message="Importante: Restauración de Base de Datos"
                description="La restauración de un backup sobrescribirá completamente la base de datos actual. Se recomienda crear un backup antes de realizar una restauración. Esta operación no se puede deshacer."
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                style={{ marginBottom: '24px' }}
                action={
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setRestoreModalVisible(true)}
                    >
                        Restaurar Backup
                    </Button>
                }
            />

            {/* Tabla de Backups */}
            <Card
                title={
                    <Space>
                        <FileTextOutlined />
                        Backups Disponibles ({Array.isArray(backups) ? backups.length : 0})
                    </Space>
                }
            >
                <Table
                    dataSource={Array.isArray(backups) ? backups : []}
                    columns={columns}
                    loading={loading}
                    rowKey="fileName"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total: ${total} backups`,
                    }}
                    locale={{
                        emptyText: 'No hay backups disponibles',
                    }}
                />
            </Card>

            {/* Modal de Restauración */}
            <Modal
                title={
                    <Space>
                        <UploadOutlined />
                        Restaurar Base de Datos desde Backup
                    </Space>
                }
                open={restoreModalVisible}
                onOk={handleRestoreBackup}
                onCancel={() => {
                    setRestoreModalVisible(false);
                    setSelectedFile(null);
                }}
                okText="Restaurar Ahora"
                cancelText="Cancelar"
                okButtonProps={{ 
                    danger: true, 
                    loading: uploading,
                    disabled: !selectedFile
                }}
                width={600}
            >
                <Alert
                    message="¡ADVERTENCIA! Esta acción sobrescribirá toda la base de datos"
                    description="Asegúrese de haber creado un backup reciente antes de continuar. Todos los datos actuales serán reemplazados por los del backup seleccionado."
                    type="error"
                    icon={<WarningOutlined />}
                    showIcon
                    style={{ marginBottom: '24px' }}
                />

                <Upload {...uploadProps} listType="text">
                    <Button icon={<UploadOutlined />} block size="large">
                        Seleccionar Archivo de Backup (.sql)
                    </Button>
                </Upload>

                {selectedFile && (
                    <Card style={{ marginTop: '16px' }} size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div><strong>Archivo:</strong> {selectedFile.name}</div>
                            <div><strong>Tamaño:</strong> {formatFileSize(selectedFile.size)}</div>
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                                Archivo validado correctamente
                            </Tag>
                        </Space>
                    </Card>
                )}

                {uploading && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: '16px' }}>
                            Restaurando base de datos... Esta operación puede tardar varios minutos.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GestionarBackup;
