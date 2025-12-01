import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
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
  PictureOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { ImagenesAPI } from "../../services/PresentacionService.js";
import AuthService from "../../services/AuthService.js";
import Filtador from "./Filtador";
import Paginacion from "./Paginacion";

const { Title } = Typography;

/* ========= Helper URLs Google Drive ========= */
function getOptimizedUrl(originalUrl) {
  if (!originalUrl) return "";
  const driveMatch = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)|\?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && (originalUrl.includes("drive.google.com") || originalUrl.includes("docs.google.com"))) {
    const fileId = driveMatch[1] || driveMatch[2];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return originalUrl;
}

/* ========= Helper Usuario Actual ========= */
function getUsuarioActual() {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    if (user.id) return { id: user.id };
    if (user.usuario && user.usuario.id) return { id: user.usuario.id };
    if (user.user && user.user.id) return { id: user.user.id };
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* ========= Helper Estado ========= */
function isActive(val) {
  return val === true || val === 1 || val === "true";
}

export default function GestionarPresentacion() {
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPresentacion, setEditingPresentacion] = useState(null);
  const [form] = Form.useForm();

  // Estados para Paginación y Filtrado
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchPresentaciones();
  }, []);

  const fetchPresentaciones = async () => {
    setLoading(true);
    try {
      const data = await ImagenesAPI.list();
      setPresentaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      message.error("Error al cargar presentaciones: " + error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtrado
  const filteredPresentaciones = presentaciones.filter((item) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.url?.toLowerCase().includes(searchLower) ||
      item.id?.toString().includes(searchLower)
    );
  });

  // Lógica de Paginación
  const paginatedPresentaciones = filteredPresentaciones.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenModal = (presentacion = null) => {
    setEditingPresentacion(presentacion);
    if (presentacion) {
      form.setFieldsValue({
        url: presentacion.url || "",
        estado: isActive(presentacion.estado),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPresentacion(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const payload = {
      url: values.url,
      estado: values.estado,
      usuario_id: getUsuarioActual(),
    };

    try {
      if (editingPresentacion) {
        await ImagenesAPI.update(editingPresentacion.id, payload);
        message.success("Presentación actualizada exitosamente");
      } else {
        await ImagenesAPI.create(payload);
        message.success("Presentación creada exitosamente");
      }
      handleCloseModal();
      fetchPresentaciones();
    } catch (error) {
      console.error(error);
      message.error("Error al guardar: " + error.toString());
    }
  };

  const handleDelete = async (id) => {
    try {
      await ImagenesAPI.remove(id);
      message.success("Presentación eliminada exitosamente");
      fetchPresentaciones();
    } catch (error) {
      console.error(error);
      message.error("Error al eliminar: " + error.toString());
    }
  };

  const handleToggleEstado = async (record) => {
    const nuevoEstado = !isActive(record.estado);
    try {
      await ImagenesAPI.update(record.id, {
        url: record.url,
        estado: nuevoEstado,
        usuario_id: getUsuarioActual(),
      });
      message.success("Estado actualizado");
      fetchPresentaciones();
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar estado: " + error.toString());
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Vista",
      dataIndex: "url",
      key: "vista",
      width: 120,
      render: (url) => {
        const src = getOptimizedUrl(url);
        if (!src) return <Tag color="default">Sin imagen</Tag>;
        return (
          <img
            src={src}
            alt="preview"
            style={{
              width: 100,
              height: 70,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #eee",
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
        );
      },
    },
    {
      title: "URL de la Imagen",
      dataIndex: "url",
      key: "url",
      render: (url) => {
        if (!url) return <span style={{ opacity: 0.6 }}>Sin URL</span>;
        const display =
          url.length > 70 ? url.substring(0, 70).concat("...") : url;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            <LinkOutlined /> {display}
          </a>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado, record) => (
        <Tag
          color={isActive(estado) ? "green" : "red"}
          style={{ cursor: "pointer" }}
          onClick={() => handleToggleEstado(record)}
        >
          {isActive(estado) ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar esta presentación?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card>
        <div className="admin-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}>
          <div className="admin-title-wrapper" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PictureOutlined className="admin-header-icon" style={{ fontSize: 28 }} />
            <Title level={2} style={{ margin: 0 }}>
              Gestión de Presentaciones
            </Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => handleOpenModal()}
          >
            Nueva imagen
          </Button>
        </div>

        <Filtador
          placeholder="Buscar por URL o ID..."
          onSearch={setSearchText}
          value={searchText}
        />

        <Table
          columns={columns}
          dataSource={paginatedPresentaciones}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
        />

        <Paginacion
          current={currentPage}
          total={filteredPresentaciones.length}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </Card>

      <Modal
        title={editingPresentacion ? "Editar Presentación" : "Nueva Presentación"}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="url"
            label="URL de la imagen (Google Drive u otra)"
            rules={[{ required: true, message: "Por favor ingrese la URL" }]}
          >
            <Input placeholder="https://drive.google.com/..." />
          </Form.Item>

          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: "Seleccione el estado" }]}
          >
            <select
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 4,
                border: "1px solid #d9d9d9",
              }}
              onChange={(e) => {
                const v = e.target.value === "true";
                form.setFieldsValue({ estado: v });
              }}
              value={String(form.getFieldValue("estado"))}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                {editingPresentacion ? "Actualizar" : "Crear"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
