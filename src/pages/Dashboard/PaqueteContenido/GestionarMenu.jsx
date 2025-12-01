import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Tooltip
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

// Importación masiva de iconos
import * as AntdIcons from "@ant-design/icons";

import MenuService from "../../../services/MenuService.js";
import "../DashboardLayout.css"; // Usando el CSS global
import Filtador from "../Filtador";
import Paginacion from "../Paginacion";

const { Title } = Typography;
const { Option } = Select;

export default function GestionarMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [form] = Form.useForm();

  // Estados para Paginación y Filtrado
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtrar solo iconos "Outlined"
  const iconList = useMemo(() => {
    return Object.keys(AntdIcons).filter(
      (iconName) => iconName.endsWith("Outlined") && iconName !== "default"
    );
  }, []);

  useEffect(() => {
    fetchMenus();
  }, []);

  // Generador de rutas (Slugify)
  const generarRutaAmigable = (texto) => {
    if (!texto) return "";
    return "/" + texto
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleTitleChange = (e) => {
    const titulo = e.target.value;
    const rutaGenerada = generarRutaAmigable(titulo);
    form.setFieldsValue({ ruta: rutaGenerada });
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await MenuService.getAllMenus();
      const sortedData = data.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setMenus(sortedData);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtrado
  const filteredMenus = menus.filter((menu) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      menu.titulo?.toLowerCase().includes(searchLower) ||
      menu.ruta?.toLowerCase().includes(searchLower)
    );
  });

  // Lógica de Paginación
  const paginatedMenus = filteredMenus.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (menu = null) => {
    setEditingMenu(menu);
    if (menu) {
      form.setFieldsValue({
        titulo: menu.titulo,
        ruta: menu.ruta,
        icono: menu.icono,
        orden: menu.orden,
        estado: menu.estado,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true, orden: 1 });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingMenu(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingMenu) {
        await MenuService.updateMenu(editingMenu.id, values);
        message.success("Menú actualizado exitosamente");
      } else {
        // Al crear, el backend ahora creará automáticamente el submenú por defecto
        await MenuService.createMenu(values);
        message.success("Menú y Submenú por defecto creados exitosamente");
      }
      handleCloseModal();
      fetchMenus();
    } catch (error) {
      message.error(typeof error === 'string' ? error : "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await MenuService.deleteMenu(id);
      message.success("Menú eliminado correctamente");
      fetchMenus();
    } catch (error) {
      message.error("No se pudo eliminar el menú.");
    }
  };

  const renderIcon = (iconName) => {
    const IconComponent = AntdIcons[iconName];
    return IconComponent ? React.createElement(IconComponent) : <AppstoreOutlined />;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    { title: "Título", dataIndex: "titulo", key: "titulo", render: (text) => <strong>{text}</strong> },
    { title: "Ruta", dataIndex: "ruta", key: "ruta", render: (text) => <Tag color="blue">{text}</Tag> },
    {
      title: "Icono",
      dataIndex: "icono",
      key: "icono",
      align: "center",
      render: (iconName) => (
        <Tooltip title={iconName}>
          <span style={{ fontSize: '24px', color: '#1890ff', display: 'flex', justifyContent: 'center' }}>
            {renderIcon(iconName)}
          </span>
        </Tooltip>
      )
    },
    { title: "Orden", dataIndex: "orden", key: "orden", align: "center", sorter: (a, b) => a.orden - b.orden },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => <Tag color={estado ? "green" : "red"}>{estado ? "Activo" : "Inactivo"}</Tag>,
    },
    {
      title: "Usuario",
      key: "usuario",
      render: (_, record) => {
        const u = record.usuario_id;
        return u ? <small style={{ color: '#888' }}>ID: {u.id}</small> : "-";
      }
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)}>Editar</Button>
          <Popconfirm title="¿Eliminar menú?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
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
            <AppstoreOutlined className="admin-header-icon" />
            <Title level={2}>Gestión de Menús</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} size="large">Nuevo Menú</Button>
        </div>

        <Filtador
          placeholder="Buscar por título o ruta..."
          onSearch={setSearchText}
          value={searchText}
        />

        <Table columns={columns} dataSource={paginatedMenus} rowKey="id" loading={loading} pagination={false} scroll={{ x: 800 }} />

        <Paginacion
          current={currentPage}
          total={filteredMenus.length}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </Card>

      <Modal title={editingMenu ? "Editar Menú" : "Nuevo Menú"} open={modalVisible} onCancel={handleCloseModal} footer={null} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
            <Input prefix={<AppstoreOutlined />} placeholder="Ej: Nosotros" onChange={handleTitleChange} />
          </Form.Item>
          <Form.Item name="ruta" label="Ruta (Auto-generada)" rules={[{ required: true }]}>
            <Input prefix={<LinkOutlined />} placeholder="Ej: /nosotros" />
          </Form.Item>
          <Form.Item name="icono" label="Icono">
            <Select
              placeholder="Busca un icono..."
              showSearch allowClear virtual={true} optionFilterProp="label"
              style={{ width: '100%' }} dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
            >
              {iconList.map((iconName) => {
                const IconComp = AntdIcons[iconName];
                return (
                  <Option value={iconName} key={iconName} label={iconName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '20px' }}>{React.createElement(IconComp)}</span>
                      <span style={{ color: '#999', fontSize: '12px' }}>{iconName.replace("Outlined", "")}</span>
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="orden" label="Orden" style={{ flex: 1 }} rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: "100%" }} prefix={<OrderedListOutlined />} />
            </Form.Item>
            <Form.Item name="estado" label="Estado" style={{ flex: 1 }}>
              <Select>
                <Option value={true}>Activo</Option>
                <Option value={false}>Inactivo</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit">{editingMenu ? "Actualizar" : "Crear"}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}