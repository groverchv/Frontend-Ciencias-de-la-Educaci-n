import React from "react";
import { Typography, Card, Row, Col } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  ExperimentOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;



export default function Home() {
  return (
    <div>

      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={1} style={{ textAlign: "center", marginBottom: "40px" }}>
          Bienvenidos a la Facultad de Humanidades
        </Title>
        <Paragraph style={{ fontSize: "18px", textAlign: "center", marginBottom: "40px" }}>
          Carrera de Ciencias de la Educación - UAGRM
        </Paragraph>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={
                <div style={{ padding: "40px", fontSize: "64px", color: "#2600af" }}>
                  <BookOutlined />
                </div>
              }
            >
              <Card.Meta
                title="Formación Académica"
                description="Programas de estudio y modalidades de graduación de excelencia"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={
                <div style={{ padding: "40px", fontSize: "64px", color: "#2600af" }}>
                  <TeamOutlined />
                </div>
              }
            >
              <Card.Meta
                title="Comunidad Educativa"
                description="Docentes calificados y estudiantes comprometidos con la educación"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={
                <div style={{ padding: "40px", fontSize: "64px", color: "#2600af" }}>
                  <ExperimentOutlined />
                </div>
              }
            >
              <Card.Meta
                title="Investigación"
                description="Centro de investigación CISAD y proyectos académicos"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              style={{ textAlign: "center", height: "100%" }}
              cover={
                <div style={{ padding: "40px", fontSize: "64px", color: "#2600af" }}>
                  <GlobalOutlined />
                </div>
              }
            >
              <Card.Meta
                title="Convenios"
                description="Alianzas interfacultativas e interinstitucionales"
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: "40px" }}>
          <Title level={3}>Sobre Nosotros</Title>
          <Paragraph style={{ fontSize: "16px" }}>
            La carrera de Ciencias de la Educación de la Universidad Autónoma Gabriel René Moreno
            forma profesionales comprometidos con la educación y el desarrollo social de nuestra región.
          </Paragraph>
          <Paragraph style={{ fontSize: "16px" }}>
            Contamos con un cuerpo docente altamente calificado, infraestructura moderna y programas
            académicos actualizados que garantizan una formación integral de nuestros estudiantes.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
}
