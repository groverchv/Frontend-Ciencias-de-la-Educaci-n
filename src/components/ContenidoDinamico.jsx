// src/components/ContenidoDinamico.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Spin, Empty, Alert, Typography, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import ContenidoService from "../services/ContenidoService";
import BloqueService from "../services/BloqueService";
import Sub_MenuService from "../services/Sub_MenuService";

const { Title, Paragraph } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

export default function ContenidoDinamico() {
    const location = useLocation();
    const ruta = location.pathname; // Captura la ruta completa, ej: "/centro/general"

    const [contenidos, setContenidos] = useState([]);
    const [subMenu, setSubMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadContenido = async () => {
            if (!ruta || ruta === '/') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log("Buscando contenido para ruta:", ruta);

                // 1. Buscar el SubMenu por su ruta
                const allSubMenus = await Sub_MenuService.getAllSubMenu();
                console.log("Todos los SubMenus:", allSubMenus);

                const foundSubMenu = allSubMenus.find((sm) => sm.ruta === ruta);
                console.log("SubMenu encontrado:", foundSubMenu);

                if (!foundSubMenu) {
                    setError(`No se encontró contenido para la ruta: ${ruta}`);
                    setLoading(false);
                    return;
                }

                setSubMenu(foundSubMenu);

                // 2. Obtener todos los Contenidos de este SubMenu
                const contenidosData = await ContenidoService.getContenidosBySubMenu(foundSubMenu.id);
                console.log("Contenidos encontrados:", contenidosData);

                // 3. Para cada Contenido activo, cargar sus bloques
                const contenidosConBloques = [];
                for (const contenido of contenidosData) {
                    if (contenido.estado) {
                        try {
                            const bloques = await BloqueService.getBlocksByContenido(contenido.id);
                            const bloquesActivos = bloques
                                .filter((b) => b.estado === true)
                                .sort((a, b) => (a.orden || 0) - (b.orden || 0));

                            if (bloquesActivos.length > 0) {
                                contenidosConBloques.push({
                                    ...contenido,
                                    bloques: bloquesActivos
                                });
                            }
                        } catch (err) {
                            console.error(`Error cargando bloques del contenido ${contenido.id}:`, err);
                        }
                    }
                }

                // Ordenar contenidos por orden
                contenidosConBloques.sort((a, b) => (a.orden || 0) - (b.orden || 0));
                setContenidos(contenidosConBloques);

            } catch (err) {
                console.error("Error al cargar contenido:", err);
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        loadContenido();
    }, [ruta]);

    // Renderizar cada tipo de bloque
    const renderBloque = (bloque) => {
        const { tipoBloque, datosJson } = bloque;

        switch (tipoBloque) {
            case "titulo":
                return (
                    <Title level={1} style={{ marginTop: 32, marginBottom: 16 }}>
                        {datosJson.texto || ""}
                    </Title>
                );

            case "subtitulo":
                return (
                    <Title level={2} style={{ marginTop: 24, marginBottom: 12 }}>
                        {datosJson.texto || ""}
                    </Title>
                );

            case "texto":
                return (
                    <Paragraph style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: 24 }}>
                        {datosJson.descripcion || ""}
                    </Paragraph>
                );

            case "archivo":
                const { url, nombre, descripcion } = datosJson;
                if (!url) return null;

                // Detectar tipo de archivo
                const ext = url.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
                const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
                const isPDF = ext === 'pdf';

                return (
                    <div style={{ marginBottom: 24 }}>
                        {nombre && (
                            <Title level={4} style={{ marginBottom: 8 }}>
                                {nombre}
                            </Title>
                        )}
                        {descripcion && (
                            <Paragraph style={{ color: '#666', marginBottom: 12 }}>
                                {descripcion}
                            </Paragraph>
                        )}
                        {isImage && (
                            <img
                                src={url}
                                alt={nombre || 'Imagen'}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        )}
                        {isVideo && (
                            <video
                                src={url}
                                controls
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                        )}
                        {(isPDF || (!isImage && !isVideo)) && (
                            <div
                                style={{
                                    padding: 16,
                                    background: "#f9fafb",
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        color: "#2563eb",
                                        textDecoration: "none",
                                        fontSize: "16px",
                                    }}
                                >
                                    <span>📎</span>
                                    <strong>{nombre || "Descargar archivo"}</strong>
                                </a>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <Spin indicator={antIcon} />
                <p style={{ marginTop: 16, color: "#6b7280" }}>Cargando contenido...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
                <Alert
                    message="Error al cargar contenido"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    if (!subMenu) {
        return (
            <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
                <Empty
                    description={`No se encontró contenido para la ruta: ${ruta}`}
                    style={{ padding: 60 }}
                />
            </div>
        );
    }

    if (contenidos.length === 0) {
        return (
            <div style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
                <Empty
                    description={`La página "${subMenu.titulo}" aún no tiene contenido publicado`}
                    style={{ padding: 60 }}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "0 auto",
                padding: "40px 20px",
                minHeight: "60vh",
            }}
        >
            {contenidos.map((contenido, idx) => (
                <div key={contenido.id}>
                    {/* Mostrar bloques del contenido */}
                    {contenido.bloques.map((bloque) => (
                        <div key={bloque.id}>{renderBloque(bloque)}</div>
                    ))}

                    {/* Separador entre contenidos (excepto el último) */}
                    {idx < contenidos.length - 1 && (
                        <Divider style={{ margin: '40px 0' }} />
                    )}
                </div>
            ))}
        </div>
    );
}
