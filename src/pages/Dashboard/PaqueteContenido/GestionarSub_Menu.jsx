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
  NodeIndexOutlined,
  OrderedListOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

import * as AntdIcons from "@ant-design/icons";

import SubMenuService from "../../../services/Sub_MenuService.js";
import MenuService from "../../../services/MenuService.js";
import "../DashboardLayout.css";
import Filtador from "../Filtador";
import Paginacion from "../Paginacion";

const { Title } = Typography;
const { Option } = Select;

export default function GestionarSub_Menu() {
  const [subMenus, setSubMenus] = useState([]);
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // Estados para Paginación y Filtrado
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Estado para guardar la ruta del padre seleccionado actualmente
  const [parentRoute, setParentRoute] = useState("");

  const iconList = useMemo(() => {
    return Object.keys(AntdIcons).filter(
      (iconName) => iconName.endsWith("Outlined") && iconName !== "default"
    );
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subData, menuData] = await Promise.all([
        SubMenuService.getAllSubMenu(),
        MenuService.getAllMenus()
      ]);

      setSubMenus(subData.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
      setPadres(menuData.filter(m => m.estado === true));

    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Generador de slug (ej: "Mi Perfil" -> "/mi-perfil")
  const generarSlug = (texto) => {
    if (!texto) return "";
    return "/" + texto.toString().toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
  };

  // --- LÓGICA NUEVA: CAMBIO DE TÍTULO ---
  const handleTitleChange = (e) => {
    const titulo = e.target.value;
    const slugHijo = generarSlug(titulo);
    // Concatenamos Ruta Padre + Slug Hijo
    // Si parentRoute es "/config" y slugHijo es "/users" -> "/config/users"
    form.setFieldsValue({ ruta: `${parentRoute}${slugHijo}` });
  };

  // --- LÓGICA NUEVA: CAMBIO DE PADRE ---
  const handleParentChange = (value) => {
    // Buscamos el objeto del padre seleccionado para obtener su ruta
    const padreSeleccionado = padres.find(p => p.id === value);
    const rutaPadre = padreSeleccionado ? padreSeleccionado.ruta : "";

    setParentRoute(rutaPadre);

    // Actualizamos la ruta inmediatamente usando el título actual
    const tituloActual = form.getFieldValue("titulo");
    const slugHijo = generarSlug(tituloActual);
    form.setFieldsValue({ ruta: `${rutaPadre}${slugHijo}` });
  };

  // Lógica de Filtrado
  const filteredSubMenus = subMenus.filter((item) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.titulo?.toLowerCase().includes(searchLower) ||
      item.ruta?.toLowerCase().includes(searchLower) ||
      item.menu_id?.titulo?.toLowerCase().includes(searchLower)
    );
  });

  // Lógica de Paginación
  const paginatedSubMenus = filteredSubMenus.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      // Al editar, seteamos la ruta del padre actual en el estado
      // para que si editamos el título, se mantenga el prefijo del padre.
      const rutaPadreActual = item.menu_id?.ruta || "";
      setParentRoute(rutaPadreActual);

      form.setFieldsValue({
        titulo: item.titulo,
        ruta: item.ruta,
        icono: item.icono,
        orden: item.orden,
        estado: item.estado,
        menu_id: item.menu_id?.id
      });
    } else {
      setParentRoute(""); // Reiniciar ruta padre
      form.resetFields();
      form.setFieldsValue({ estado: true, orden: 1 });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
    setParentRoute("");
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        menu_id: values.menu_id ? { id: values.menu_id } : null
      };

      if (editingItem) {
        await SubMenuService.updateSubMenu(editingItem.id, payload);
        message.success("Actualizado correctamente");
      } else {
        await SubMenuService.createSubMenu(payload);
        message.success("Creado correctamente");
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      message.error(typeof error === 'string' ? error : "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await SubMenuService.deleteSubMenu(id);
      message.success("Eliminado correctamente");
      fetchData();
    } catch (error) {
      message.error("Error al eliminar.");
    }
  };

  const renderIcon = (iconName) => {
    const IconComponent = AntdIcons[iconName];
    return IconComponent ? React.createElement(IconComponent) : <NodeIndexOutlined />;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    {
      title: "Menú Padre",
      key: "padre",
      render: (_, record) => {
        const padre = record.menu_id;
        return padre ? <Tag color="purple">{padre.titulo}</Tag> : <span style={{ color: '#ccc' }}>Sin Padre</span>;
      }
    },
    { title: "Título", dataIndex: "titulo", key: "titulo", render: (text) => <strong>{text}</strong> },
    { title: "Ruta", dataIndex: "ruta", key: "ruta", render: (text) => <Tag color="blue">{text}</Tag> },
    {
      title: "Icono",
      dataIndex: "icono",
      key: "icono",
      align: "center",
      render: (iconName) => (
        <Tooltip title={iconName}>
          <span style={{ fontSize: '20px', color: '#1890ff', display: 'flex', justifyContent: 'center' }}>
            {renderIcon(iconName)}
          </span>
        </Tooltip>
      )
    },
    { title: "Orden", dataIndex: "orden", key: "orden", align: "center", sorter: (a, b) => a.orden - b.orden },
    {
      title: "Visibilidad",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {estado ? (
            <>
              <EyeOutlined style={{ fontSize: 18, color: '#52c41a' }} />
              <span style={{ color: '#52c41a', fontWeight: 500 }}>Visible</span>
            </>
          ) : (
            <>
              <EyeInvisibleOutlined style={{ fontSize: 18, color: '#d9d9d9' }} />
              <span style={{ color: '#8c8c8c' }}>Oculto</span>
            </>
          )}
        </div>
      ),
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
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
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
            <NodeIndexOutlined className="admin-header-icon" />
            <Title level={2}>Gestión de Sub Menús</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} size="large">
            Nuevo Sub Menú
          </Button>
        </div>

        <Filtador
          placeholder="Buscar por título, ruta o menú padre..."
          onSearch={setSearchText}
          value={searchText}
        />

        <Table columns={columns} dataSource={paginatedSubMenus} rowKey="id" loading={loading} pagination={false} scroll={{ x: 1000 }} />

        <Paginacion
          current={currentPage}
          total={filteredSubMenus.length}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </Card>

      <Modal title={editingItem ? "Editar Sub Menú" : "Nuevo Sub Menú"} open={modalVisible} onCancel={handleCloseModal} footer={null} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>

          {/* SELECTOR DE MENÚ PADRE */}
          <Form.Item
            name="menu_id"
            label="Menú Padre (Categoría)"
            rules={[{ required: true, message: "Debe seleccionar un menú padre" }]}
          >
            <Select
              placeholder="Seleccione el menú principal"
              onChange={handleParentChange} // <--- ACTIVAR CAMBIO DE RUTA
            >
              {padres.map(p => (
                <Option key={p.id} value={p.id}>
                  {p.titulo} (Ruta: {p.ruta})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="titulo" label="Título" rules={[{ required: true }]}>
            <Input
              prefix={<NodeIndexOutlined />}
              placeholder="Ej: Historia"
              onChange={handleTitleChange} // <--- ACTIVAR CAMBIO DE RUTA
            />
          </Form.Item>

          <Form.Item name="ruta" label="Ruta Completa (Auto-generada)" rules={[{ required: true }]}>
            <Input prefix={<LinkOutlined />} placeholder="Ej: /nosotros/historia" />
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
              <Button type="primary" htmlType="submit">{editingItem ? "Actualizar" : "Crear"}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}