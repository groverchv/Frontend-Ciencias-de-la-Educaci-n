import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Select,
    message,
    Popconfirm,
    Tag,
    Card,
    Typography
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SafetyOutlined
} from "@ant-design/icons";

import RolUsuarioService from "../../../services/RolUsuarioService.js";
import UsuarioService from "../../../services/UsuarioService.js";
import RolService from "../../../services/RolService.js";
import "../DashboardLayout.css";

import Filtador from "../Filtador";
import Paginacion from "../Paginacion";

const { Title } = Typography;
const { Option } = Select;

export default function GestionarRolUsuario() {
    const [rolUsuarios, setRolUsuarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRolUsuario, setEditingRolUsuario] = useState(null);
    const [form] = Form.useForm();

    // Estados para Paginación y Filtrado
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Lógica de Filtrado
    const filteredRolUsuarios = rolUsuarios.filter((item) => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return (
            item.usuario?.nombre?.toLowerCase().includes(searchLower) ||
            item.usuario?.correo?.toLowerCase().includes(searchLower) ||
            item.rol?.nombre?.toLowerCase().includes(searchLower)
        );
    });

    // Lógica de Paginación
    const paginatedRolUsuarios = filteredRolUsuarios.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchRolUsuarios(),
            fetchUsuarios(),
            fetchRoles()
        ]);
    };

    const fetchRolUsuarios = async () => {
        setLoading(true);
        try {
            const data = await RolUsuarioService.getAllRolUsuarios();
            setRolUsuarios(data);
        } catch (error) {
            message.error(error.toString());
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuarios = async () => {
        try {
            const data = await UsuarioService.getAllUsuarios();
            setUsuarios(data);
        } catch (error) {
            message.error("Error al cargar usuarios: " + error.toString());
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await RolService.getAllRoles();
            setRoles(data);
        } catch (error) {
            message.error("Error al cargar roles: " + error.toString());
        }
    };

    const handleOpenModal = (rolUsuario = null) => {
        setEditingRolUsuario(rolUsuario);
        if (rolUsuario) {
            form.setFieldsValue({
                usuarioId: rolUsuario.usuario?.id,
                rolId: rolUsuario.rol?.id
            });
        } else {
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingRolUsuario(null);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                usuario: { id: values.usuarioId },
                rol: { id: values.rolId }
            };

            if (editingRolUsuario) {
                await RolUsuarioService.updateRolUsuario(editingRolUsuario.id, payload);
                message.success("Asignación de rol actualizada correctamente");
            } else {
                await RolUsuarioService.createRolUsuario(payload);
                message.success("Rol asignado correctamente al usuario");
            }
            fetchRolUsuarios();
            handleCloseModal();
        } catch (error) {
            message.error(error.toString());
        }
    };

    const handleDelete = async (id) => {
        try {
            await RolUsuarioService.deleteRolUsuario(id);
            message.success("Asignación de rol eliminada correctamente");
            fetchRolUsuarios();
        } catch (error) {
            message.error(error.toString());
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80
        },
        {
            title: "Usuario",
            dataIndex: ["usuario", "nombre"],
            key: "usuario",
            render: (_, record) => (
                <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <span>
                        {record.usuario?.nombre || "N/A"}
                        {record.usuario?.correo && (
                            <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                                ({record.usuario.correo})
                            </span>
                        )}
                    </span>
                </Space>
            )
        },
        {
            title: "Rol",
            dataIndex: ["rol", "nombre"],
            key: "rol",
            render: (_, record) => (
                <Space>
                    <SafetyOutlined style={{ color: "#52c41a" }} />
                    <Tag color="green">{record.rol?.nombre || "N/A"}</Tag>
                </Space>
            )
        },
        {
            title: "Estado del Rol",
            dataIndex: ["rol", "estado"],
            key: "rolEstado",
            render: (_, record) => (
                <Tag color={record.rol?.estado ? "success" : "default"}>
                    {record.rol?.estado ? "Activo" : "Inactivo"}
                </Tag>
            )
        },
        {
            title: "Estado del Usuario",
            dataIndex: ["usuario", "estado"],
            key: "usuarioEstado",
            render: (_, record) => (
                <Tag color={record.usuario?.estado ? "success" : "default"}>
                    {record.usuario?.estado ? "Activo" : "Inactivo"}
                </Tag>
            )
        },
        {
            title: "Acciones",
            key: "acciones",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Popconfirm
                        title="¿Está seguro de eliminar esta asignación de rol?"
                        description="Esta acción quitará el rol asignado del usuario."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="dashboard-content">
            <Card>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Title level={3}>Gestionar Asignación de Roles</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                    >
                        Asignar Rol a Usuario
                    </Button>
                </div>

                <Filtador
                    placeholder="Buscar por usuario, correo o rol..."
                    onSearch={setSearchText}
                    value={searchText}
                />

                <Table
                    columns={columns}
                    dataSource={paginatedRolUsuarios}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />

                <Paginacion
                    current={currentPage}
                    total={filteredRolUsuarios.length}
                    pageSize={pageSize}
                    onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    }}
                />
            </Card>

            <Modal
                title={editingRolUsuario ? "Editar Asignación de Rol" : "Asignar Rol a Usuario"}
                open={modalVisible}
                onCancel={handleCloseModal}
                onOk={() => form.submit()}
                okText={editingRolUsuario ? "Actualizar" : "Asignar"}
                cancelText="Cancelar"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        label="Usuario"
                        name="usuarioId"
                        rules={[{ required: true, message: "Por favor seleccione un usuario" }]}
                    >
                        <Select
                            placeholder="Seleccione un usuario"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {usuarios.map((usuario) => (
                                <Option key={usuario.id} value={usuario.id}>
                                    {usuario.nombre} ({usuario.correo})
                                    {!usuario.estado && " - Inactivo"}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Rol"
                        name="rolId"
                        rules={[{ required: true, message: "Por favor seleccione un rol" }]}
                    >
                        <Select
                            placeholder="Seleccione un rol"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {roles.map((rol) => (
                                <Option key={rol.id} value={rol.id}>
                                    {rol.nombre}
                                    {!rol.estado && " - Inactivo"}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
