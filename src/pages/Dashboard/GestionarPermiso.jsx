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

import PermisoService from "../../services/PermisoService.js";
import "./DashboardLayout.css";

const { Title } = Typography;

export default function GestionarPermiso() {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPermiso, setEditingPermiso] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPermisos();
  }, []);

  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const data = await PermisoService.getAllPermisos();
      setPermisos(data);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (permiso = null) => {
    setEditingPermiso(permiso);
    if (permiso) {
      form.setFieldsValue({
        nombre: permiso.nombre,
        estado: permiso.estado
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPermiso(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPermiso) {
        await PermisoService.updatePermiso(editingPermiso.id, values);
        message.success("Permiso actualizado correctamente");
      } else {
        await PermisoService.createPermiso(values);
        message.success("Permiso creado correctamente");
      }
      fetchPermisos();
      handleCloseModal();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const handleDelete = async (id) => {
    try {
      await PermisoService.deletePermiso(id);
      message.success("Permiso eliminado correctamente");
      fetchPermisos();
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="¿Está seguro de eliminar este permiso?"
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
          <Title level={3}>Gestionar Permisos</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Nuevo Permiso
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={permisos}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPermiso ? "Editar Permiso" : "Nuevo Permiso"}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText={editingPermiso ? "Actualizar" : "Crear"}
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
            rules={[{ required: true, message: "Por favor ingrese el nombre del permiso" }]}
          >
            <Input placeholder="Ej: CREAR_USUARIO, EDITAR_MENU, etc." />
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
