import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  message,
  // Popconfirm, // Eliminado
  Tag,
  Card,
  Typography,
  // Tooltip, // Eliminado
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Badge
} from "antd";
import {
  DeleteOutlined, // Se mantiene para las Tags y Estadísticas
  HistoryOutlined,
  SearchOutlined,
  UserOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  FilterOutlined,
  ClearOutlined,
  DownloadOutlined,
  EyeOutlined, // <-- Nuevo icono para "Visitar"
} from "@ant-design/icons";
import BitacoraService from "../../services/BitacoraService";

const { Title, Text } = Typography; // 'Text' se usará en la descripción
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AdministrarBitacora() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filtroAccion, setFiltroAccion] = useState(null);
  const [filtroTabla, setFiltroTabla] = useState(null);
  const [filtroFechas, setFiltroFechas] = useState(null);

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

  // --- FUNCIÓN 'handleDelete' ELIMINADA ---
  /*
  const handleDelete = async (id) => {
    ...
  };
  */

  // Filtrar los datos (sin cambios)
  const filteredBitacoras = useMemo(() => {
    let result = bitacoras;
    // ... (lógica de filtro sin cambios)
    return result;
  }, [searchText, bitacoras, filtroAccion, filtroTabla, filtroFechas]);

  // Obtener acciones únicas (sin cambios)
  const accionesUnicas = useMemo(() => {
    return [...new Set(bitacoras.map(b => b.accion).filter(Boolean))];
  }, [bitacoras]);

  // Obtener tablas únicas (sin cambios)
  const tablasUnicas = useMemo(() => {
    return [...new Set(bitacoras.map(b => b.tabla_afecta).filter(Boolean))];
  }, [bitacoras]);

  // Limpiar filtros (sin cambios)
  const limpiarFiltros = () => {
    setSearchText("");
    setFiltroAccion(null);
    setFiltroTabla(null);
    setFiltroFechas(null);
  };

  // Exportar a CSV (sin cambios)
  const exportarCSV = () => {
    // ... (lógica de exportar sin cambios)
  };

  // Estadísticas (sin cambios)
  const estadisticas = useMemo(() => {
    // ... (lógica de estadísticas sin cambios)
  }, [filteredBitacoras]);

  
  // --- FUNCIÓN 'getAccionTag' ACTUALIZADA ---
  // (Añadida acción "VISITAR")
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
    } else if (accion.includes("VISITAR")) { // <-- Nuevo
      color = "purple";
      icon = <EyeOutlined />;
    } else if (accion.includes("FALLIDO")) {
      color = "orange";
      icon = <WarningOutlined />;
    }
    return <Tag color={color} icon={icon}>{accion}</Tag>;
  };

  // --- NUEVA FUNCIÓN ---
  // Formatea la descripción para ser más legible
  const formatarDescripcion = (log) => {
    const { accion, descripcion } = log;

    // 1. Intentar parsear la descripción como JSON
    let cambiosJson = null;
    if (descripcion && descripcion.startsWith("{") && descripcion.endsWith("}")) {
      try {
        cambiosJson = JSON.parse(descripcion);
      } catch (e) {
        // No era un JSON válido, se tratará como texto normal
        cambiosJson = null;
      }
    }

    // 2. Renderizar basado en la acción y el contenido
    if (accion.includes("ACTUALIZAR") && cambiosJson) {
      // --- Caso: "qué dato por qué dato se modificó" ---
      const listaDeCambios = Object.entries(cambiosJson).map(([campo, cambio]) => (
        <li key={campo} style={{ paddingBottom: '4px' }}>
          <Text strong>{campo}:</Text>
          <Tag color="red" style={{ margin: '0 4px' }}>{String(cambio.old)}</Tag>
          <Text>→</Text>
          <Tag color="green" style={{ margin: '0 4px' }}>{String(cambio.new)}</Tag>
        </li>
      ));
      return <ul style={{ margin: 0, paddingLeft: 16 }}>{listaDeCambios}</ul>;
    }
    
    if (accion.includes("CREAR")) {
      return <Text>Se registró un nuevo elemento. {descripcion}</Text>;
    }
    
    if (accion.includes("ELIMINAR")) {
      return <Text type="danger">Se eliminó un elemento. {descripcion}</Text>;
    }
    
    if (accion.includes("LOGIN")) {
      return <Text type="secondary">Inicio de sesión. {descripcion}</Text>;
    }

    if (accion.includes("VISITAR")) {
      return <Text type="secondary">Visitó la página: {descripcion}</Text>;
    }

    // Fallback para cualquier otro caso
    return <Text>{descripcion}</Text>;
  };


  const columns = [
    {
      title: "Fecha y Hora",
      dataIndex: "fecha",
      key: "fecha",
      width: 180,
      sorter: (a, b) => new Date(b.fecha) - new Date(a.fecha),
      render: (text) => new Date(text).toLocaleString("es-ES"),
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
      // --- COLUMNA "Descripción" ACTUALIZADA ---
      title: "Descripción",
      key: "descripcion",
      // Ya no usamos dataIndex, usamos render para formatear
      render: (record) => formatarDescripcion(record),
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
    // --- COLUMNA "Acciones" ELIMINADA ---
    /*
    {
      title: "Acciones",
      key: "acciones",
      ...
    },
    */
  ];

  return (
    <div className="admin-container">
      <Card>
        <div className="admin-header">
          <div className="admin-title-wrapper">
            <HistoryOutlined className="admin-header-icon" />
            <Title level={2}>Bitácora del Sistema</Title>
          </div>
          <Space>
            <Button 
              icon={<ClearOutlined />} 
              onClick={limpiarFiltros}
            >
              Limpiar Filtros
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={exportarCSV}
            >
              Exportar CSV
            </Button>
          </Space>
        </div>

        {/* Estadísticas (sin cambios) */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* ... (Col, Card, Statistic sin cambios) ... */}
        </Row>

        {/* Filtros (sin cambios) */}
        <Card 
          title={<><FilterOutlined /> Filtros</>} 
          style={{ marginBottom: 16 }}
          size="small"
        >
          {/* ... (Row, Col, Search, Select, RangePicker sin cambios) ... */}
        </Card>

        {/* Tabla (sin cambios, la columna de acciones simplemente no se renderizará) */}
        <Badge count={filteredBitacoras.length} showZero color="#1890ff">
          <Table
            columns={columns}
            dataSource={filteredBitacoras}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 15, 
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} registros`
            }}
            scroll={{ x: 1200 }}
          />
        </Badge>
      </Card>
    </div>
  );
}