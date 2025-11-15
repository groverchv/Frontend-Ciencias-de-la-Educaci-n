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
  Typography,
  Transfer,
  Spin,
  Divider
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined
} from "@ant-design/icons";

import RolService from "../../services/RolService.js";
import PermisoService from "../../services/PermisoService.js";
import RolPermisoService from "../../services/RolPermisoService.js";
import "./DashboardLayout.css";

const { Title, Text } = Typography;

export default function GestionarRol() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permisosModalVisible, setPermisosModalVisible] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [selectedRol, setSelectedRol] = useState(null);
  const [form] = Form.useForm();

  // Para el Transfer de permisos
  const [todosPermisos, setTodosPermisos] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);

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

  // Funciones para gestión de permisos
  const handleOpenPermisosModal = async (rol) => {
    setSelectedRol(rol);
    setLoadingPermisos(true);
    setPermisosModalVisible(true);
    
    try {
      // Cargar todos los permisos
      const allPermisos = await PermisoService.getAllPermisos();
      setTodosPermisos(allPermisos);

      // Cargar permisos asignados al rol
      const permisosRol = await RolPermisoService.getPermisosByRol(rol.id);
      
      // Establecer las keys de los permisos asignados
      const keys = permisosRol.map(p => p.id);
      setTargetKeys(keys);
    } catch (error) {
      message.error("Error al cargar permisos: " + error.toString());
    } finally {
      setLoadingPermisos(false);
    }
  };

  const handleClosePermisosModal = () => {
    setPermisosModalVisible(false);
    setSelectedRol(null);
    setTodosPermisos([]);
    setTargetKeys([]);
  };

  const handleAsignarPermisos = async () => {
    if (!selectedRol) return;
    
    setLoadingPermisos(true);
    try {
      await RolPermisoService.asignarPermisosARol(selectedRol.id, targetKeys);
      message.success("Permisos asignados correctamente");
      handleClosePermisosModal();
    } catch (error) {
      message.error("Error al asignar permisos: " + error.toString());
    } finally {
      setLoadingPermisos(false);
    }
  };

  const handleTransferChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  // Filtrar permisos para el Transfer (por categoría)
  const filterOption = (inputValue, option) => {
    return option.nombre.toLowerCase().includes(inputValue.toLowerCase());
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
            type="default"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleOpenPermisosModal(record)}
          >
            Permisos
          </Button>
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
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={3}>Gestionar Roles</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Nuevo Rol
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
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

      {/* Modal para asignar permisos */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Asignar Permisos al Rol: {selectedRol?.nombre}</span>
          </Space>
        }
        open={permisosModalVisible}
        onCancel={handleClosePermisosModal}
        onOk={handleAsignarPermisos}
        okText="Guardar Permisos"
        cancelText="Cancelar"
        width={800}
        confirmLoading={loadingPermisos}
      >
        {loadingPermisos ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Cargando permisos...</Text>
            </div>
          </div>
        ) : (
          <>
            <Divider orientation="left">
              Seleccione los permisos para este rol
            </Divider>
            <Transfer
              dataSource={todosPermisos.map(p => ({
                key: p.id,
                nombre: p.nombre,
                disabled: !p.estado
              }))}
              titles={['Permisos Disponibles', 'Permisos Asignados']}
              targetKeys={targetKeys}
              onChange={handleTransferChange}
              render={item => (
                <Space>
                  <Tag color={item.disabled ? 'default' : 'blue'}>
                    {item.nombre}
                  </Tag>
                </Space>
              )}
              listStyle={{
                width: 350,
                height: 400,
              }}
              showSearch
              filterOption={filterOption}
              locale={{
                itemUnit: 'permiso',
                itemsUnit: 'permisos',
                searchPlaceholder: 'Buscar permiso...',
                notFoundContent: 'No se encontraron permisos'
              }}
            />
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Permisos seleccionados: {targetKeys.length} de {todosPermisos.length}
              </Text>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
