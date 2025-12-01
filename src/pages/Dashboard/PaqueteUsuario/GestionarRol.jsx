import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import RolService from "../../../services/RolService.js";
import "../DashboardLayout.css";
import Filtador from "../Filtador";
import Paginacion from "../Paginacion";

const { Title, Text } = Typography;

export default function GestionarRol() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [form] = Form.useForm();

  // Estados para Paginación y Filtrado
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await RolService.getAllRoles();
      setRoles(data);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtrado
  const filteredRoles = roles.filter((rol) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      rol.nombre?.toLowerCase().includes(searchLower) ||
      rol.id?.toString().includes(searchLower)
    );
  });

  // Lógica de Paginación
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (rol = null) => {
    setEditingRol(rol);
    if (rol) {
      form.setFieldsValue({
        nombre: rol.nombre,
        estado: rol.estado
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingRol(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRol) {
        await RolService.updateRol(editingRol.id, values);
        message.success("Rol actualizado correctamente");
      } else {
        await RolService.createRol(values);
        message.success("Rol creado correctamente");
      }
      fetchRoles();
      handleCloseModal();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const handleDelete = async (id) => {
    try {
      await RolService.deleteRol(id);
      message.success("Rol eliminado correctamente");
      fetchRoles();
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
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre"
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag color={estado ? "green" : "red"}>
          {estado ? "Activo" : "Inactivo"}
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
            title="¿Está seguro de eliminar este rol?"
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
        <div className="admin-header">
          <div className="admin-title-wrapper">
            <Title level={3}>Gestionar Roles</Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Nuevo Rol
          </Button>
        </div>

        <Filtador
          placeholder="Buscar por nombre o ID..."
          onSearch={setSearchText}
          value={searchText}
        />

        <Table
          columns={columns}
          dataSource={paginatedRoles}
          rowKey="id"
          loading={loading}
          pagination={false}
        />

        <Paginacion
          current={currentPage}
          total={filteredRoles.length}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </Card>

      <Modal
        title={editingRol ? "Editar Rol" : "Nuevo Rol"}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText={editingRol ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Por favor ingrese el nombre del rol" }]}
          >
            <Input placeholder="Ej: Administrador, Usuario, etc." />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            valuePropName="checked"
          >
            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
