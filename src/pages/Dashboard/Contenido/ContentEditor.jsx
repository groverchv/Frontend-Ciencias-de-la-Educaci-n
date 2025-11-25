// src/pages/Dashboard/Contenido/ContentEditor.jsx
import React, { useState, useEffect } from "react";
import { Button, Space, Typography, message } from "antd";
import {
    SaveOutlined,
    FullscreenOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { PresentationMode } from "./PresentationMode";
import ContenidoService from "../../../services/ContenidoService";
import RichTextEditor from "../../../components/RichTextEditor";

const { Title, Text } = Typography;

export default function ContentEditor() {
    const { contenidoId } = useParams();
    const navigate = useNavigate();

    // Estado del contenido
    const [contenido, setContenido] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado del contenido HTML
    const [contenidoHtml, setContenidoHtml] = useState('');
    const [saving, setSaving] = useState(false);
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    // Cargar contenido al montar
    useEffect(() => {
        const loadContenido = async () => {
            if (!contenidoId) return;

            setLoading(true);
            try {
                // Cargar información del contenido
                const contenidoData = await ContenidoService.getContenidoById(contenidoId);
                setContenido(contenidoData);

                // Cargar el contenido HTML si existe
                setContenidoHtml(contenidoData.contenidoHtml || '');
            } catch (error) {
                message.error("Error al cargar contenido");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadContenido();
    }, [contenidoId]);

    // Guardar y cerrar
    const handleSaveAndClose = async () => {
        if (!contenido) return;

        setSaving(true);
        try {
            // Guardar el contenido HTML
            await ContenidoService.updateContenido(contenido.id, {
                contenidoHtml: contenidoHtml
            });
            message.success("¡Contenido guardado exitosamente!");

            // Volver a la lista de contenidos
            navigate('/dashboard/contenido');
        } catch (error) {
            message.error("Error al guardar contenido");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Solo guardar sin cerrar
    const handleSave = async () => {
        if (!contenido) return;

        setSaving(true);
        try {
            await ContenidoService.updateContenido(contenido.id, {
                contenidoHtml: contenidoHtml
            });
            message.success("¡Contenido guardado!");
        } catch (error) {
            message.error("Error al guardar contenido");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Volver sin guardar
    const handleGoBack = () => {
        navigate('/dashboard/contenido');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Title level={3}>Cargando editor...</Title>
            </div>
        );
    }

    if (!contenido) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Title level={3}>Contenido no encontrado</Title>
                <Button onClick={handleGoBack}>Volver</Button>
            </div>
        );
    }

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    background: 'white',
                    borderBottom: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={handleGoBack}
                            >
                                Volver
                            </Button>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {contenido.titulo || 'Sin título'}
                                </Title>
                                <Text type="secondary">ID: {contenido.id}</Text>
                            </div>
                        </div>
                        <Space>
                            <Button
                                icon={<FullscreenOutlined />}
                                onClick={() => setIsPresentationMode(true)}
                                disabled={!contenidoHtml || contenidoHtml.trim() === ''}
                            >
                                Vista Previa
                            </Button>
                            <Button
                                onClick={handleSave}
                                loading={saving}
                            >
                                Guardar
                            </Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={handleSaveAndClose}
                                loading={saving}
                            >
                                Guardar y Cerrar
                            </Button>
                        </Space>
                    </div>
                </div>

                {/* Editor de Texto Libre - Ocupa todo el espacio */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'white',
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'white',
                        minHeight: 'calc(100vh - 80px)',
                        padding: '60px',
                    }}>
                        <RichTextEditor
                            value={contenidoHtml}
                            onChange={setContenidoHtml}
                            placeholder="Comienza a escribir tu contenido aquí... Puedes usar todas las herramientas de formato como en Microsoft Word."
                            height="calc(100vh - 300px)"
                            toolbar="full"
                        />
                    </div>
                </div>
            </div>

            {/* Presentation Mode */}
            {isPresentationMode && (
                <PresentationMode
                    contenidoHtml={contenidoHtml}
                    onClose={() => setIsPresentationMode(false)}
                />
            )}
        </>
    );
}
