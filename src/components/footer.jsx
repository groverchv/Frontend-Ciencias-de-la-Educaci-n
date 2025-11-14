// src/components/footer.jsx
import React from "react";
import logo from "../assets/logo/sociologia.png";
import { Layout, Row, Col, Typography } from "antd";

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Title level={4} style={{ color: "#ffffff", margin: 0, fontWeight: 700 }}>
        {children}
      </Title>
      <div
        style={{
          height: 3,
          width: 120,
          marginTop: 8,
          background:
            "linear-gradient(90deg, #2bd8ff 0%, #2bb4ff 60%, rgba(43,180,255,0) 100%)",
          borderRadius: 2,
        }}
      />
    </div>
  );
}

export default function Footer() {
  return (
    <AntFooter
      style={{
        padding: 0,
        background: "#070a65ff", // azul muy oscuro
        color: "rgba(255,255,255,0.85)",
      }}
    >
      {/* Contenido principal */}
      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px 40px" }}
      >
        <Row gutter={[32, 24]} align="top">
          {/* Logo */}
          <Col xs={24} md={6} style={{ textAlign: "center" }}>
            {/* Cambia la ruta a tu escudo */}
            <img
              src={logo}
              alt="Escudo FH UAGRM"
              style={{ width: 160, height: 160, objectFit: "contain" }}
            />
          </Col>

          <Col xs={24} md={6}>
            <SectionTitle>FH</SectionTitle>
            <div style={{ lineHeight: 1.9 }}>
              <Text strong style={{ color: "#fff" }}>
                Ubicación:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>
                Av. Busch, Ciudad Universitaria, Módulo 222
              </Text>
              <br />
              <Text strong style={{ color: "#fff" }}>
                Teléfono:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>59133553636</Text>
              <br />
              <Text strong style={{ color: "#fff" }}>
                Correo:{" "}
              </Text>
              <Text style={{ color: "#fff" }}>fh@uagrm.edu.bo</Text>
            </div>
          </Col>

          {/* Carreras */}
          <Col xs={24} md={6}>
            <SectionTitle>Carreras</SectionTitle>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 2,
              }}
            >
              <li>Actividad Física</li>
              <li>Ciencias de la Comunicación</li>
              <li>Ciencias de la Educación</li>
              <li>Gestión del Turismo</li>
              <li>Lenguas Modernas y Filología Hispánica</li>
              <li>Psicología</li>
              <li>Sociología</li>
            </ul>
          </Col>

          {/* Unidades facultativas */}
          <Col xs={24} md={6}>
            <SectionTitle>Unidades facultativas</SectionTitle>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                lineHeight: 2,
              }}
            >
              <li>Departamento de Investigación</li>
              <li>CPD-FACULTATIVO</li>
              <li>Extensión</li>
              <li>Admisión Estudiantil</li>
              <li>Postgrado</li>
            </ul>
          </Col>
        </Row>
      </div>

      {/* Línea separadora y copyright */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 28px" }}>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.25)",
            margin: "0 0 18px",
          }}
        />
        <div style={{ textAlign: "center", paddingBottom: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)" }}>
            © FACULTAD DE HUMANIDADES Inc. {new Date().getFullYear()}. Todos los
            derechos reservados.
          </Text>
        </div>
      </div>
    </AntFooter>
  );
}
