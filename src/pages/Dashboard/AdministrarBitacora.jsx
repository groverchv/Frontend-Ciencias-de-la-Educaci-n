import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  HistoryOutlined,
  SearchOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import BitacoraService from "../../services/BitacoraService";


const { Title } = Typography;
const { Search } = Input;

export default function AdministrarBitacora() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchBitacoras();
  }, []);

  const fetchBitacoras = async () => {
    setLoading(true);
    try {
      const data = await BitacoraService.getAllBitacoras();
      // Ordenar por fecha descendente (lo más nuevo primero)
      const sortedData = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setBitacoras(sortedData);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await BitacoraService.deleteBitacora(id);
      message.success("Registro eliminado correctamente");
      fetchBitacoras(); // Recargar la lista
    } catch (error) {
      message.error("No se pudo eliminar el registro.");
    }
  };

  // Filtrar los datos basados en el texto de búsqueda
  const filteredBitacoras = useMemo(() => {
    if (!searchText) {
      return bitacoras;
    }
    const lowerSearch = searchText.toLowerCase();
    return bitacoras.filter(
      (log) =>
        log.accion.toLowerCase().includes(lowerSearch) ||
        log.tabla_afecta.toLowerCase().includes(lowerSearch) ||
        log.descripcion.toLowerCase().includes(lowerSearch) ||
        log.ip_origen.toLowerCase().includes(lowerSearch) ||
        (log.usuario_id?.correo || "").toLowerCase().includes(lowerSearch)
    );
  }, [searchText, bitacoras]);

  // Colores para las acciones
  const getAccionTag = (accion) => {
    let color = "default";
    let icon = null;
    if (!accion) accion = "INDEFINIDO";
    
    if (accion.includes("CREAR")) {
      color = "green";
      icon = <CheckCircleOutlined />;
    } else if (accion.includes("ACTUALIZAR")) {
      color = "blue";
      icon = <HistoryOutlined />;
    } else if (accion.includes("ELIMINAR")) {
      color = "red";
      icon = <DeleteOutlined />;
    } else if (accion.includes("LOGIN")) {
      color = "cyan";
      icon = <UserOutlined />;
    } else if (accion.includes("FALLIDO")) {
      color = "orange";
      icon = <WarningOutlined />;
    }
    return <Tag color={color} icon={icon}>{accion}</Tag>;
  };

  const columns = [
    {
      title: "Fecha y Hora",
      dataIndex: "fecha",
      key: "fecha",
      width: 180,
      sorter: (a, b) => new Date(b.fecha) - new Date(a.fecha),
      render: (text) => new Date(text).toLocaleString("es-ES"), // Formato legible
    },
    {
      title: "Usuario",
      dataIndex: "usuario_id",
      key: "usuario",
      width: 180,
      render: (usuario) => (
        <span>
          <UserOutlined style={{ marginRight: 6, color: "#555" }} />
          {usuario ? usuario.correo : <Tag color="grey">Sistema</Tag>}
        </span>
      ),
    },
    {
      title: "Acción",
      dataIndex: "accion",
      key: "accion",
      width: 140,
      render: (text) => getAccionTag(text),
    },
    {
      title: "Tabla Afectada",
      dataIndex: "tabla_afecta",
      key: "tabla_afecta",
      width: 150,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "IP Origen",
      dataIndex: "ip_origen",
      key: "ip_origen",
      width: 130,
      render: (text) => (
        <span>
          <ApiOutlined style={{ marginRight: 6, color: "#555" }} />
          {text}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Eliminar este registro">
            <Popconfirm
              title="¿Eliminar registro?"
              description="Esta acción es permanente."
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card>
        <div className="admin-header">
          <div className="admin-title-wrapper">
            <HistoryOutlined className="admin-header-icon" />
            <Title level={2}>Bitácora del Sistema</Title>
          </div>
          <Search
            placeholder="Buscar en la bitácora..."
            prefix={<SearchOutlined />}
            allowClear
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredBitacoras} // Usar los datos filtrados
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 1200 }} // Scroll horizontal en pantallas pequeñas
        />
      </Card>

      {/* No hay modal, ya que la bitácora no se edita ni se crea manualmente */}
    </div>
  );
}