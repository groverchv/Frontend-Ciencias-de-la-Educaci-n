import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined // Icono añadido para el título
} from "@ant-design/icons";
import UsuarioService from "../../services/UsuarioService.js";
// NO importamos CSS específico

const { Title } = Typography;
const { Option } = Select;

export default function GestionarUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await UsuarioService.getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario = null) => {
    setEditingUsuario(usuario);
    if (usuario) {
      form.setFieldsValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        roles: usuario.roles,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingUsuario(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUsuario) {
        await UsuarioService.updateUsuario(editingUsuario.id, values);
        message.success("Usuario actualizado exitosamente");
      } else {
        await UsuarioService.createUsuario(values);
        message.success("Usuario creado exitosamente");
      }
      handleCloseModal();
      fetchUsuarios();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const handleDelete = async (id) => {
    try {
      await UsuarioService.deleteUsuario(id);
      message.success("Usuario eliminado exitosamente");
      fetchUsuarios();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const handleToggleEstado = async (id) => {
    try {
      await UsuarioService.toggleEstado(id);
      message.success("Estado actualizado exitosamente");
      fetchUsuarios();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Apellido", dataIndex: "apellido", key: "apellido" },
    { title: "Correo", dataIndex: "correo", key: "correo" },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => (
        <>
          {roles?.map((rol) => (
            <Tag color="blue" key={rol}>{rol}</Tag>
          ))}
        </>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado, record) => (
        <Tag
          color={estado ? "green" : "red"}
          style={{ cursor: "pointer" }}
          onClick={() => handleToggleEstado(record.id)}
        >
          {estado ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)}>Editar</Button>
          <Popconfirm title="¿Está seguro de eliminar este usuario?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card>
        <div className="admin-header">
          <div className="admin-title-wrapper">
             <TeamOutlined className="admin-header-icon" />
             <Title level={2}>Gestión de Usuarios</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} size="large">
            Nuevo Usuario
          </Button>
        </div>

        <Table columns={columns} dataSource={usuarios} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
      </Card>

      <Modal title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"} open={modalVisible} onCancel={handleCloseModal} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Por favor ingrese el nombre" }]}>
            <Input prefix={<UserOutlined />} placeholder="Nombre" />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: true, message: "Por favor ingrese el apellido" }]}>
            <Input prefix={<UserOutlined />} placeholder="Apellido" />
          </Form.Item>
          <Form.Item name="correo" label="Correo Electrónico" rules={[{ required: true }, { type: "email", message: "Correo inválido" }]}>
            <Input prefix={<MailOutlined />} placeholder="correo@ejemplo.com" />
          </Form.Item>
          {!editingUsuario && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true }, { min: 6 }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
            </Form.Item>
          )}
          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Seleccione roles">
              <Option value="ADMIN">Administrador</Option>
              <Option value="USER">Usuario</Option>
              <Option value="MODERADOR">Moderador</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit">{editingUsuario ? "Actualizar" : "Crear"}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}