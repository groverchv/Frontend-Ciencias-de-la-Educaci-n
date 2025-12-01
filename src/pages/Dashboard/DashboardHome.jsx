import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography, Spin, List, Progress, Radio, Empty } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  MenuOutlined,
  AppstoreOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AuthService from "../../services/AuthService.js";
import UsuarioService from "../../services/UsuarioService.js";
import MenuService from "../../services/MenuService.js";
import Sub_MenuService from "../../services/Sub_MenuService.js";
import ContenidoService from "../../services/ContenidoService.js";
import VisitaService from "../../services/VisitaService.js";

const { Title, Text } = Typography;

export default function DashboardHome() {
  const user = AuthService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("mes"); // dia, semana, mes, año
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalMenus: 0,
    menusActivos: 0,
    totalSubmenus: 0,
    submenusActivos: 0,
    totalContenidos: 0,
    contenidosPorSubmenu: [],
    totalVisitas: 0,
    visitTrends: [],
    topContent: [],
  });

  useEffect(() => {
    fetchStatistics();
  }, [period]); // Re-fetch when period changes

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch all data concurrently
      const [usuarios, menus, submenus, contenidos, visitStats] = await Promise.all([
        UsuarioService.getAllUsuarios(),
        MenuService.getAllMenus(),
        Sub_MenuService.getAllSub_Menus(),
        ContenidoService.getAllContenidos(),
        VisitaService.getVisitStats(period),
      ]);

      // Calculate statistics
      const usuariosActivos = Array.isArray(usuarios)
        ? usuarios.filter((u) => u.estado === true || u.estado === "true" || u.estado === 1).length
        : 0;

      const menusActivos = Array.isArray(menus)
        ? menus.filter((m) => m.estado === true || m.estado === "true" || m.estado === 1).length
        : 0;

      const submenusActivos = Array.isArray(submenus)
        ? submenus.filter((s) => s.estado === true || s.estado === "true" || s.estado === 1).length
        : 0;

      // Group content by submenu - Show ALL submenus
      const contenidosPorSubmenu = [];
      if (Array.isArray(submenus)) {
        submenus.forEach((submenu) => {
          const contenidosCount = Array.isArray(contenidos)
            ? contenidos.filter((c) => c.sub_menu?.id === submenu.id).length
            : 0;

          // Show ALL submenus, regardless of content or status
          contenidosPorSubmenu.push({
            submenuNombre: submenu.titulo,
            menuNombre: submenu.menu?.titulo || "Sin menú",
            contenidosCount,
            estado: submenu.estado,
          });
        });
      }

      // Sort by content count (descending)
      contenidosPorSubmenu.sort((a, b) => b.contenidosCount - a.contenidosCount);

      setStats({
        totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
        usuariosActivos,
        totalMenus: Array.isArray(menus) ? menus.length : 0,
        menusActivos,
        totalSubmenus: Array.isArray(submenus) ? submenus.length : 0,
        submenusActivos,
        totalContenidos: Array.isArray(contenidos) ? contenidos.length : 0,
        contenidosPorSubmenu,
        totalVisitas: visitStats?.totalVisitas || 0,
        visitTrends: visitStats?.tendencias || [],
        topContent: visitStats?.contenidoMasVisto || [],
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Cargando estadísticas..." />
      </div>
    );
  }

  const activeUsersPercentage = stats.totalUsuarios > 0
    ? Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100)
    : 0;

  const activeMenusPercentage = stats.totalMenus > 0
    ? Math.round((stats.menusActivos / stats.totalMenus) * 100)
    : 0;

  const activeSubmenusPercentage = stats.totalSubmenus > 0
    ? Math.round((stats.submenusActivos / stats.totalSubmenus) * 100)
    : 0;

  return (
    <div>
      <Title level={2}>
        Bienvenido, {user?.nombre} {user?.apellido}
      </Title>
      <Text type="secondary" style={{ fontSize: 16 }}>
        Panel de Administración - Ciencias de la Educación
      </Text>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Usuarios"
              value={stats.totalUsuarios}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: "#52c41a" }} /> Activos: {stats.usuariosActivos}
              </Text>
              <Progress
                percent={activeUsersPercentage}
                size="small"
                strokeColor="#52c41a"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Menús"
              value={stats.totalMenus}
              prefix={<MenuOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: "#1890ff" }} /> Activos: {stats.menusActivos}
              </Text>
              <Progress
                percent={activeMenusPercentage}
                size="small"
                strokeColor="#1890ff"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Submenús"
              value={stats.totalSubmenus}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CheckCircleOutlined style={{ color: "#722ed1" }} /> Activos: {stats.submenusActivos}
              </Text>
              <Progress
                percent={activeSubmenusPercentage}
                size="small"
                strokeColor="#722ed1"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Contenidos"
              value={stats.totalContenidos}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ color: "#fa8c16" }} /> Publicados
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visit Statistics with Period Filter */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <span>
                  <EyeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  Estadísticas de Visitas
                </span>
                <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)} buttonStyle="solid">
                  <Radio.Button value="dia">Día</Radio.Button>
                  <Radio.Button value="semana">Semana</Radio.Button>
                  <Radio.Button value="mes">Mes</Radio.Button>
                  <Radio.Button value="año">Año</Radio.Button>
                </Radio.Group>
              </div>
            }
            hoverable
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Statistic
                  title={`Total de Visitas (${period})`}
                  value={stats.totalVisitas}
                  suffix="visitas"
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: "#1890ff", fontSize: 28 }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Período seleccionado: <strong>{period.charAt(0).toUpperCase() + period.slice(1)}</strong>
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Visit Trends Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <span>
                📈 Tendencia de Visitas ({period})
              </span>
            }
            hoverable
          >
            {stats.visitTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.visitTrends}>
                  <defs>
                    <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" style={{ fontSize: 12 }} />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="visitas"
                    name="Visitas"
                    stroke="#1890ff"
                    fillOpacity={1}
                    fill="url(#colorVisitas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No hay datos de visitas para este período" />
            )}
          </Card>
        </Col>

        {/* Top Visited Content */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                🏆 Contenido Más Visitado ({period})
              </span>
            }
            hoverable
          >
            {stats.topContent.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topContent.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" style={{ fontSize: 12 }} />
                  <YAxis dataKey="titulo" type="category" width={120} style={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visitas" name="Visitas" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No hay datos de contenido visitado" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <FileTextOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                Resumen General
              </span>
            }
            hoverable
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Menús"
                  value={stats.menusActivos}
                  suffix={`/ ${stats.totalMenus}`}
                  valueStyle={{ fontSize: 20, color: "#1890ff" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Submenús"
                  value={stats.submenusActivos}
                  suffix={`/ ${stats.totalSubmenus}`}
                  valueStyle={{ fontSize: 20, color: "#722ed1" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Usuarios"
                  value={stats.usuariosActivos}
                  suffix={`/ ${stats.totalUsuarios}`}
                  valueStyle={{ fontSize: 20, color: "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                📊 Resumen de Visitas
              </span>
            }
            hoverable
          >
            <List
              size="small"
              dataSource={[
                { label: "Total de Visitas", value: stats.totalVisitas, color: "#1890ff" },
                { label: "Contenidos Publicados", value: stats.totalContenidos, color: "#fa8c16" },
                {
                  label: "Promedio por Contenido",
                  value: stats.totalContenidos > 0 ? Math.round(stats.totalVisitas / stats.totalContenidos) : 0,
                  color: "#52c41a",
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item.label}:</Text>
                  <Text strong style={{ color: item.color }}>
                    {item.value}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Content per Submenu - Dynamic Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <span>
                <AppstoreOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                Contenido por Submenú ({stats.contenidosPorSubmenu.length} submenús)
              </span>
            }
            hoverable
          >
            {stats.contenidosPorSubmenu.length === 0 ? (
              <Text type="secondary">No hay submenús con contenido.</Text>
            ) : (
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={stats.contenidosPorSubmenu}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      style={{
                        borderLeft: `4px solid ${item.estado ? "#52c41a" : "#d9d9d9"}`,
                      }}
                    >
                      <Statistic
                        title={
                          <div>
                            <Text strong style={{ fontSize: 13 }}>
                              {item.submenuNombre}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {item.menuNombre}
                            </Text>
                          </div>
                        }
                        value={item.contenidosCount}
                        suffix="contenidos"
                        valueStyle={{
                          fontSize: 24,
                          color: item.estado ? "#1890ff" : "#8c8c8c",
                        }}
                        prefix={<FileTextOutlined />}
                      />
                      <div style={{ marginTop: 8 }}>
                        {item.estado ? (
                          <Text style={{ fontSize: 11, color: "#52c41a" }}>
                            <CheckCircleOutlined /> Activo
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 11, color: "#8c8c8c" }}>
                            <ClockCircleOutlined /> Inactivo
                          </Text>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
