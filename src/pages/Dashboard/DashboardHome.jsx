import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Typography, Spin, List, Progress, Radio, Empty, Badge, Timeline, Space } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  MenuOutlined,
  AppstoreOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  SafetyOutlined,
  TrophyOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AuthService from "../../services/AuthService.js";
import UsuarioService from "../../services/UsuarioService.js";
import MenuService from "../../services/MenuService.js";
import Sub_MenuService from "../../services/Sub_MenuService.js";
import ContenidoService from "../../services/ContenidoService.js";
import WebSocketService from "../../services/WebSocketService.js";
import NotificationService from "../../services/NotificationService.js";
import { useBackupNotifications } from "../../hooks/useBackupNotifications.js";

const { Title, Text } = Typography;

export default function DashboardHome() {
  // Obtener usuario autenticado desde AuthService
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState({ 
    total: 0, 
    dashboard: 0, 
    otherPages: 0 
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [wsEnabled, setWsEnabled] = useState(() => {
    // Leer estado guardado en localStorage, por defecto false
    const saved = localStorage.getItem('wsEnabled');
    return saved === 'true';
  });
  
  // Usar el hook de notificaciones de backup
  useBackupNotifications();
  
  // Obtener usuario al cargar el componente
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    
    // Cargar estadísticas inmediatamente
    fetchStatistics();
  }, []);
  
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    totalMenus: 0,
    menusActivos: 0,
    totalSubmenus: 0,
    submenusActivos: 0,
    totalContenidos: 0,
    contenidosPorSubmenu: [],
  });

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch all data concurrently
      const [usuarios, menus, submenus, contenidos] = await Promise.all([
        UsuarioService.getAllUsuarios(),
        MenuService.getAllMenus(),
        Sub_MenuService.getAllSubMenu(),
        ContenidoService.getAllContenidos(),
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
            ? contenidos.filter((c) => {
                // El backend puede devolver subMenu o sub_menu dependiendo de la serialización
                const subMenuId = c.subMenu?.id || c.sub_menu?.id;
                return subMenuId === submenu.id;
              }).length
            : 0;

          // Show ALL submenus, regardless of content or status
          contenidosPorSubmenu.push({
            submenuId: submenu.id,
            submenuNombre: submenu.titulo,
            menuNombre: submenu.menu_id?.titulo || submenu.menu?.titulo || "Sin menú",
            menuId: submenu.menu_id?.id || submenu.menu?.id || null,
            contenidosCount,
            estado: submenu.estado,
            ruta: submenu.ruta,
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
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo conectar WebSocket si está habilitado
    if (!wsEnabled) {
      setWsConnected(false);
      return;
    }
    
    // Conectar WebSocket (con o sin autenticación)
    const username = user?.username || 'anonymous';
    const location = 'dashboard';
    
    WebSocketService.connect(
      username,
      location,
      () => {
        setWsConnected(true);
        
        // Suscribirse a actualizaciones de usuarios conectados
        WebSocketService.subscribe('/topic/users-count', (data) => {
          if (typeof data === 'object' && data.total !== undefined) {
            setConnectedUsers({
              total: data.total || 0,
              dashboard: data.dashboard || 0,
              otherPages: data.otherPages || 0
            });
          }
        });
        
        // Suscribirse a notificaciones de nuevo contenido publicado
        WebSocketService.subscribe('/topic/contenido-publicado', (data) => {
          mostrarNotificacionContenido(data);
        });
      },
      (error) => {
        console.error('Error en WebSocket:', error);
        setWsConnected(false);
      }
    );

    return () => {
      if (wsEnabled) {
        WebSocketService.disconnect();
      }
    };
  }, [user, wsEnabled]); // Ejecutar cuando cambie user o wsEnabled
  
  // Función para mostrar notificación de nuevo contenido
  const mostrarNotificacionContenido = async (data) => {
    try {
      // Usar el servicio de notificaciones
      await NotificationService.showContentNotification(data);
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
    }
  };
  
  // Función para alternar WebSocket
  const toggleWebSocket = (enabled) => {
    setWsEnabled(enabled);
    localStorage.setItem('wsEnabled', enabled.toString());
    
    if (!enabled && wsConnected) {
      WebSocketService.disconnect();
      setWsConnected(false);
    }
  };
  
  // Inicializar Service Worker y solicitar permisos de notificación al montar
  useEffect(() => {
    NotificationService.init();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" spinning={true}>
          <div style={{ padding: '50px' }}>
            <Text>Cargando estadísticas...</Text>
          </div>
        </Spin>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Bienvenido, {user?.nombre} {user?.apellido}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Panel de Administración - Ciencias de la Educación
          </Text>
        </div>
        
        {/* Control de WebSocket */}
        <Card size="small" style={{ minWidth: 280 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text strong>🔔 Notificaciones en Tiempo Real</Text>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
              {wsEnabled 
                ? '📢 Recibirás notificaciones con sonido cuando se publique contenido nuevo' 
                : '🔕 Notificaciones desactivadas - No recibirás alertas'}
            </Text>
            <Radio.Group 
              value={wsEnabled} 
              onChange={(e) => toggleWebSocket(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={false}>
                <Space>
                  <span>❌</span>
                  <span>Desactivado</span>
                </Space>
              </Radio.Button>
              <Radio.Button value={true}>
                <Space>
                  <WifiOutlined spin={wsConnected} />
                  <span>Activado</span>
                </Space>
              </Radio.Button>
            </Radio.Group>
            {wsEnabled && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {wsConnected ? '🟢 Conectado - Escuchando notificaciones' : '🔴 Conectando...'}
              </Text>
            )}
          </Space>
        </Card>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={
                <span>
                  Visitantes en Panel {" "}
                  <Badge status={wsConnected ? "processing" : "default"} />
                </span>
              }
              value={connectedUsers.dashboard}
              prefix={<WifiOutlined />}
              valueStyle={{ color: wsConnected ? "#1890ff" : "#d9d9d9" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Visitantes en Sitio Público"
              value={connectedUsers.otherPages}
              prefix={<EyeOutlined />}
              valueStyle={{ color: wsConnected ? "#52c41a" : "#d9d9d9" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Usuarios"
              value={stats.totalUsuarios}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
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
          </Card>
        </Col>
      </Row>

      {/* Gráficas Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Gráfica de distribución por menú */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <AppstoreOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                Distribución de Contenidos por Menú
              </span>
            }
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            {stats.totalContenidos > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={(() => {
                    const menuData = {};
                    stats.contenidosPorSubmenu.forEach(item => {
                      if (!menuData[item.menuNombre]) {
                        menuData[item.menuNombre] = {
                          menu: item.menuNombre,
                          contenidos: 0,
                        };
                      }
                      menuData[item.menuNombre].contenidos += item.contenidosCount;
                    });
                    return Object.values(menuData).sort((a, b) => b.contenidos - a.contenidos);
                  })()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="menu" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    style={{ fontSize: 12 }}
                  />
                  <YAxis style={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="contenidos" 
                    name="Contenidos" 
                    fill="#1890ff"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No hay contenidos para mostrar" />
            )}
          </Card>
        </Col>

        {/* Top 5 Submenús */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />
                Top 5 Submenús con Más Contenido
              </span>
            }
            hoverable
            bodyStyle={{ padding: '24px' }}
          >
            <List
              size="large"
              dataSource={stats.contenidosPorSubmenu.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: index === 0 ? '#faad14' : index === 1 ? '#d9d9d9' : index === 2 ? '#cd7f32' : '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: index < 3 ? 'white' : '#8c8c8c',
                      fontSize: 16,
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', fontSize: 14 }}>{item.submenuNombre}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        📁 {item.menuNombre}
                      </Text>
                    </div>
                    <Badge 
                      count={item.contenidosCount} 
                      showZero 
                      style={{ 
                        backgroundColor: item.contenidosCount > 0 ? '#1890ff' : '#d9d9d9',
                        fontSize: 14,
                        padding: '0 12px',
                        height: 28,
                        lineHeight: '28px',
                      }} 
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Nuevas Estadísticas Adicionales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Actividad del Sistema */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DashboardOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                Estado del Sistema
              </span>
            }
            hoverable
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Usuarios Activos</Text>
                  <Text strong>{stats.usuariosActivos}/{stats.totalUsuarios}</Text>
                </div>
                <Progress
                  percent={stats.totalUsuarios > 0 ? Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100) : 0}
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Menús Activos</Text>
                  <Text strong>{stats.menusActivos}/{stats.totalMenus}</Text>
                </div>
                <Progress
                  percent={stats.totalMenus > 0 ? Math.round((stats.menusActivos / stats.totalMenus) * 100) : 0}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Submenús Activos</Text>
                  <Text strong>{stats.submenusActivos}/{stats.totalSubmenus}</Text>
                </div>
                <Progress
                  percent={stats.totalSubmenus > 0 ? Math.round((stats.submenusActivos / stats.totalSubmenus) * 100) : 0}
                  strokeColor="#722ed1"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Métricas Clave */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />
                Métricas Clave
              </span>
            }
            hoverable
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Contenidos por Submenú</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <Text strong style={{ fontSize: 28, color: '#1890ff' }}>
                    {stats.totalSubmenus > 0 ? Math.round(stats.totalContenidos / stats.totalSubmenus) : 0}
                  </Text>
                  <Text type="secondary">promedio</Text>
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Categorías con Contenido</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <Text strong style={{ fontSize: 28, color: '#52c41a' }}>
                    {stats.contenidosPorSubmenu.filter(s => s.contenidosCount > 0).length}
                  </Text>
                  <Text type="secondary">de {stats.contenidosPorSubmenu.length}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
