// src/components/GestionarContenido.jsx
// --- CORREGIDO: Error 'Select is not defined' ---

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Input,
  InputNumber,
  Switch,
  Select, // <-- AQUÍ ESTÁ LA CORRECCIÓN
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";

import ContenidoService from "../../services/ContenidoService.js";
import Sub_MenuService from "../../services/Sub_MenuService.js";
import TituloService from "../../services/TituloService.js";
import ArchivoService from "../../services/ArchivoService.js";
import Sub_TituloService from "../../services/Sub_TituloService.js";
import TextoService from "../../services/TextoService.js";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select; // <-- Esta línea ahora funciona

export default function GestionarContenido() {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContenido, setEditingContenido] = useState(null);
  const [form] = Form.useForm();

  const [subMenus, setSubMenus] = useState([]);

  useEffect(() => {
    fetchContenidos();
    fetchSubMenus();
  }, []);

  const fetchContenidos = async () => {
    setLoading(true);
    try {
      const data = await ContenidoService.getAllContenidos();
      setContenidos(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error.toString());
      setContenidos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubMenus = async () => {
    try {
      const subMenusData = await Sub_MenuService.getAllSubMenu();
      setSubMenus(Array.isArray(subMenusData) ? subMenusData : []);
    } catch (error) {
      message.error("Error al cargar SubMenús: " + error.toString());
    }
  };

  const handleOpenModal = (contenido = null) => {
    setEditingContenido(contenido);
    if (contenido) {
      form.setFieldsValue({
        sub_menu_id: contenido.sub_menu_id?.id,
        orden: contenido.orden,
        estado: contenido.estado,
        titulo_nombre: contenido.titulo_id?.nombre,
        sub_titulo_nombre: contenido.sub_titulo_id?.nombre,
        texto_descripcion: contenido.texto_id?.descripcion,
        archivo_nombre: contenido.archivo_id?.nombre,
        archivo_descripcion: contenido.archivo_id?.Descripcion,
        archivo_url: contenido.archivo_id?.url,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingContenido(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingContenido) {
        // --- MODO ACTUALIZACIÓN ---
        await Promise.all([
          TituloService.updateTitulo(editingContenido.titulo_id.id, { 
            nombre: values.titulo_nombre, 
            estado: values.estado 
          }),
          Sub_TituloService.updateSubTitulo(editingContenido.sub_titulo_id.id, { 
            nombre: values.sub_titulo_nombre, 
            estado: values.estado 
          }),
          TextoService.updateTexto(editingContenido.texto_id.id, { 
            descripcion: values.texto_descripcion, 
            estado: values.estado 
          }),
          ArchivoService.updateArchivo(editingContenido.archivo_id.id, {
            nombre: values.archivo_nombre,
            Descripcion: values.archivo_descripcion,
            url: values.archivo_url,
            estado: values.estado
          }),
        ]);

        await ContenidoService.updateContenido(editingContenido.id, {
          orden: values.orden,
          estado: values.estado,
          sub_menu_id: { id: values.sub_menu_id },
          titulo_id: { id: editingContenido.titulo_id.id },
          sub_titulo_id: { id: editingContenido.sub_titulo_id.id },
          texto_id: { id: editingContenido.texto_id.id },
          archivo_id: { id: editingContenido.archivo_id.id },
        });
        
        message.success("Contenido actualizado exitosamente");

      } else {
        // --- MODO CREACIÓN ---
        const [
          tituloRes, 
          subTituloRes, 
          textoRes, 
          archivoRes
        ] = await Promise.all([
          TituloService.createTitulo({ 
            nombre: values.titulo_nombre, 
            estado: values.estado 
          }),
          Sub_TituloService.createSubTitulo({ 
            nombre: values.sub_titulo_nombre, 
            estado: values.estado 
          }),
          TextoService.createTexto({ 
            descripcion: values.texto_descripcion, 
            estado: values.estado 
          }),
          ArchivoService.createArchivo({
            nombre: values.archivo_nombre,
            Descripcion: values.archivo_descripcion,
            url: values.archivo_url,
            estado: values.estado
          }),
        ]);

        const nuevoTituloId = tituloRes.id;
        const nuevoSubTituloId = subTituloRes.id;
        const nuevoTextoId = textoRes.id;
        const nuevoArchivoId = archivoRes.id;

        const payload = {
          orden: values.orden,
          estado: values.estado,
          sub_menu_id: { id: values.sub_menu_id },
          titulo_id: { id: nuevoTituloId },
          sub_titulo_id: { id: nuevoSubTituloId },
          texto_id: { id: nuevoTextoId },
          archivo_id: { id: nuevoArchivoId },
        };
        
        await ContenidoService.createContenido(payload);
        message.success("Contenido creado exitosamente");
      }
      
      handleCloseModal();
      fetchContenidos();
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      message.error(error.toString());
    }
  };

  const handleDelete = async (id) => {
    try {
      await ContenidoService.deleteContenido(id);
      message.success("Contenido eliminado exitosamente");
      fetchContenidos();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const handleToggleEstado = async (record) => {
    try {
      const payload = {
        ...record,
        estado: !record.estado, 
      };
      await ContenidoService.updateContenido(record.id, payload);
      message.success("Estado actualizado exitosamente");
      fetchContenidos();
    } catch (error) {
      message.error(error.toString());
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Orden", dataIndex: "orden", key: "orden", width: 80 },
    {
      title: "SubMenú",
      dataIndex: ["sub_menu_id", "titulo"], 
      key: "submenu",
      render: (titulo) => titulo || <Tag>N/A</Tag>, 
    },
    {
      title: "Título",
      dataIndex: ["titulo_id", "nombre"],
      key: "titulo",
      render: (nombre) => nombre || <Tag>N/A</Tag>,
    },
    {
      title: "Archivo",
      dataIndex: ["archivo_id", "nombre"],
      key: "archivo",
      render: (nombre) => nombre || <Tag>N/A</Tag>,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado, record) => (
        <Tag color={estado ? "green" : "red"} style={{ cursor: "pointer" }} onClick={() => handleToggleEstado(record)}>
          {estado ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleOpenModal(record)}>Editar</Button>
          <Popconfirm title="¿Está seguro de eliminar?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
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
            <FileTextOutlined className="admin-header-icon" />
            <Title level={2}>Gestión de Contenido</Title>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} size="large">
            Nuevo Contenido
          </Button>
        </div>

        <Table columns={columns} dataSource={contenidos} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
      </Card>

      <Modal 
        title={editingContenido ? "Editar Contenido" : "Nuevo Contenido"} 
        open={modalVisible} 
        onCancel={handleCloseModal} 
        footer={null} 
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          
          <Form.Item name="sub_menu_id" label="Página (SubMenú) a la que pertenece" rules={[{ required: true, message: "Requerido" }]}>
            <Select placeholder="Seleccione un SubMenú" allowClear>
              {subMenus.map(sm => <Option key={sm.id} value={sm.id}>{sm.titulo}</Option>)}
            </Select>
          </Form.Item>

          <Card title="Atributos del Título" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="titulo_nombre" label="Texto del Título" rules={[{ required: true, message: "Requerido" }]}>
              <Input placeholder="Ej: Quiénes Somos" />
            </Form.Item>
          </Card>
          
          <Card title="Atributos del SubTítulo" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="sub_titulo_nombre" label="Texto del SubTítulo" rules={[{ required: true, message: "Requerido" }]}>
              <Input placeholder="Ej: Nuestra Misión" />
            </Form.Item>
          </Card>

          <Card title="Atributos del Texto" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="texto_descripcion" label="Contenido del Párrafo" rules={[{ required: true, message: "Requerido" }]}>
              <TextArea rows={4} placeholder="Escriba el párrafo aquí..." />
            </Form.Item>
          </Card>

          <Card title="Atributos del Archivo" size="small" style={{ marginBottom: 16 }}>
            <Form.Item name="archivo_nombre" label="Nombre del Archivo" rules={[{ required: true, message: "Requerido" }]}>
              <Input placeholder="Ej: reporte_2025.pdf" />
            </Form.Item>
            <Form.Item name="archivo_url" label="URL del Archivo" rules={[{ required: true, message: "Requerido" }]}>
              <Input placeholder="Ej: /uploads/reporte_2025.pdf" />
            </Form.Item>
            <Form.Item name="archivo_descripcion" label="Descripción (opcional)">
              <Input placeholder="Descripción corta del archivo" />
            </Form.Item>
          </Card>

          <Card title="Configuración de Contenido" size="small">
             <Form.Item name="orden" label="Orden" rules={[{ required: true, message: "Requerido" }]}>
              <InputNumber prefix={<OrderedListOutlined />} style={{ width: "100%" }} placeholder="1" />
            </Form.Item>
            <Form.Item name="estado" label="Estado" valuePropName="checked">
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
            </Form.Item>
          </Card>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit">{editingContenido ? "Actualizar" : "Crear"}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}