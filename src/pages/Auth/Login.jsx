import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService.js";
import "./Login.css";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // 'success' | 'error' | null
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setAuthStatus(null);

    try {
      await AuthService.login(values.correo, values.password);
      
      // Mostrar mensaje de éxito
      setAuthStatus('success');
      message.success({
        content: '¡Autenticación correcta! Redirigiendo al dashboard...',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 2,
      });

      // Esperar 1.5 segundos antes de redirigir
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      // Mostrar mensaje de error
      setAuthStatus('error');
      const errorMessage = typeof error === 'string' ? error : 'Credenciales incorrectas. Por favor, verifique su correo y contraseña.';
      
      message.error({
        content: errorMessage,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 4,
      });
      
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <Title level={2}>Iniciar Sesión</Title>
          <p>Facultad de Humanidades - Ciencias de la Educación</p>
        </div>

        {authStatus === 'success' && (
          <Alert
            message="Autenticación Correcta"
            description="Bienvenido al panel de administración. Redirigiendo..."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 20 }}
          />
        )}

        {authStatus === 'error' && (
          <Alert
            message="Autenticación Incorrecta"
            description="Las credenciales proporcionadas no son válidas. Por favor, intente nuevamente."
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            style={{ marginBottom: 20 }}
            closable
            onClose={() => setAuthStatus(null)}
          />
        )}

        <Form
          name="login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="correo"
            label="Correo Electrónico"
            rules={[
              { required: true, message: "Por favor ingrese su correo" },
              { type: "email", message: "Ingrese un correo válido" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: "Por favor ingrese su contraseña" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Contraseña"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={loading}
              block
            >
              {loading ? 'Autenticando...' : 'Ingresar'}
            </Button>
          </Form.Item>

          <div className="login-footer">
            <Button type="link" onClick={() => navigate("/")} disabled={loading}>
              Volver al inicio
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
