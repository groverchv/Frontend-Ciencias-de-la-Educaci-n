import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import AuthService from "../../services/AuthService.js";

const { Title } = Typography;

export default function DashboardHome() {
  const user = AuthService.getCurrentUser();

  return (
    <div>
      <Title level={2}>
        Bienvenido, {user?.nombre} {user?.apellido}
      </Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Usuarios"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Noticias Publicadas"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Eventos Activos"
              value={0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Visitas del Mes"
              value={0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Panel de Administración</Title>
        <p>
          Desde este panel puedes gestionar todos los aspectos del sitio web de la
          Facultad de Humanidades - Ciencias de la Educación.
        </p>
        <p>Utiliza el menú lateral para acceder a las diferentes secciones.</p>
      </Card>
    </div>
  );
}
