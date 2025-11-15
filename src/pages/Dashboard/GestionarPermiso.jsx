import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Typography,
  Alert,
  Space,
  Input
} from "antd";
import {
  LockOutlined,
  SearchOutlined
} from "@ant-design/icons";

import PermisoService from "../../services/PermisoService.js";
import "./DashboardLayout.css";

const { Title, Text } = Typography;

export default function GestionarPermiso() {
  const [permisos, setPermisos] = useState([]);
  const [permisosFiltered, setPermisosFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchPermisos();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = permisos.filter(p => 
        p.nombre.toLowerCase().includes(searchText.toLowerCase())
      );
      setPermisosFiltered(filtered);
    } else {
      setPermisosFiltered(permisos);
    }
  }, [searchText, permisos]);

  const fetchPermisos = async () => {
    setLoading(true);
    try {
      const data = await PermisoService.getAllPermisos();
      setPermisos(data);
      setPermisosFiltered(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar permisos por módulo
  const agruparPermisosPorModulo = () => {
    const grupos = {};
    permisosFiltered.forEach(permiso => {
      const modulo = permiso.nombre.split('_')[0];
      if (!grupos[modulo]) {
        grupos[modulo] = [];
      }
      grupos[modulo].push(permiso);
    });
    return grupos;
  };

  const gruposPermisos = agruparPermisosPorModulo();

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80
    },
    {
      title: "Permiso",
      dataIndex: "nombre",
      key: "nombre",
      render: (nombre) => (
        <Space>
          <LockOutlined style={{ color: '#1890ff' }} />
          <Text strong>{nombre}</Text>
        </Space>
      )
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado) => (
        <Tag color={estado ? "green" : "red"}>
          {estado ? "Activo" : "Inactivo"}
        </Tag>
      )
    }
  ];

  return (
    <div className="dashboard-content">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3}>
            <LockOutlined /> Permisos del Sistema
          </Title>
          
          <Alert
            message="Permisos Estáticos"
            description="Los permisos son predefinidos por el sistema y no pueden ser modificados. Para asignar permisos a los roles, ve a la sección de 'Gestionar Roles'."
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          <Input
            placeholder="Buscar permiso..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 400 }}
          />
        </div>

        {/* Mostrar permisos agrupados por módulo */}
        {Object.keys(gruposPermisos).length > 0 ? (
          Object.keys(gruposPermisos).sort().map(modulo => (
            <div key={modulo} style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: 12 }}>
                📦 Módulo: {modulo}
              </Title>
              <Table
                columns={columns}
                dataSource={gruposPermisos[modulo]}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
              />
            </div>
          ))
        ) : (
          <Table
            columns={columns}
            dataSource={permisosFiltered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 15 }}
          />
        )}

        <div style={{ marginTop: 16, textAlign: 'center', color: '#999' }}>
          <Text type="secondary">
            Total de permisos: {permisos.length}
          </Text>
        </div>
      </Card>
    </div>
  );
}
