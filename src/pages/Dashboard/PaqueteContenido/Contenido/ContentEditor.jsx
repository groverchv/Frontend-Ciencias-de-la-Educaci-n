// src/pages/Dashboard/Contenido/ContentEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button, Space, Typography, message, Modal } from "antd";
import {
    SaveOutlined,
    FullscreenOutlined,
    ArrowLeftOutlined,
    UploadOutlined,
    DownloadOutlined,
    ClearOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
// PresentationMode removed - was part of block system

import ContenidoService from "../../../../services/ContenidoService";
import RichTextEditor from "../../../../components/RichTextEditorFull";
import { useImportarWord, useExportarWord } from "./Funcionalidades";
import "./ContentEditor.css";

const { Title, Text } = Typography;

export default function ContentEditor() {
    const { contenidoId } = useParams();
    const navigate = useNavigate();
    const quillRef = useRef(null);
    const [modal, contextHolder] = Modal.useModal();

    // Estado del contenido
    const [contenido, setContenido] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado del contenido HTML
    const [contenidoHtml, setContenidoHtml] = useState('');
    const [saving, setSaving] = useState(false);
    // Presentation mode removed - was part of block system

    // Hooks de funcionalidades Word
    const { importar: importFromWord } = useImportarWord(quillRef, setContenidoHtml);
    const { exportar: exportToWord } = useExportarWord(quillRef);

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

    // Limpiar todo el contenido con confirmación
    const handleClearAll = () => {
        console.log('🗑️ Botón Limpiar Todo clickeado');

        modal.confirm({
            title: '¿Estás seguro de que quieres limpiar todo el contenido?',
            icon: <ExclamationCircleOutlined />,
            content: 'Esta acción no se puede deshacer. Todo el contenido del editor será eliminado.',
            okText: 'Sí, limpiar todo',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk() {
                console.log('✅ Usuario confirmó limpieza');
                try {
                    // 1. Limpiar directamente el editor Quill para feedback inmediato
                    if (quillRef.current) {
                        const editor = quillRef.current.getEditor();
                        editor.setContents([]);
                        console.log('✅ Editor Quill limpiado directamente');
                    }

                    // 2. Actualizar el estado
                    setContenidoHtml('');
                    message.success('Contenido limpiado correctamente');
                } catch (error) {
                    console.error('❌ Error al limpiar:', error);
                    message.error('Error al limpiar el contenido');
                }
            },
            onCancel() {
                console.log('❌ Limpieza cancelada por el usuario');
            },
        });
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
            {contextHolder}
            <div className="content-editor-wrapper">
                {/* Header */}
                <div className="editor-header">
                    <div className="editor-header-content">
                        <div className="editor-title-section">
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
                        <Space className="editor-actions">
                            <Button
                                icon={<UploadOutlined />}
                                onClick={importFromWord}
                                title="Importar desde Word (.docx)"
                            >
                                Importar Word
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={exportToWord}
                                disabled={!contenidoHtml || contenidoHtml.trim() === ''}
                                title="Exportar a Word (.docx)"
                            >
                                Exportar Word
                            </Button>
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleClearAll}
                                disabled={!contenidoHtml || contenidoHtml.trim() === ''}
                                danger
                                title="Limpiar todo el contenido"
                            >
                                Limpiar Todo
                            </Button>
                            {/* Vista Previa removed - was part of block system */}
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
                <div className="editor-main-area">
                    <div className="rich-text-wrapper">
                        <RichTextEditor
                            externalRef={quillRef}
                            value={contenidoHtml}
                            onChange={setContenidoHtml}
                            placeholder="Comienza a escribir tu contenido aquí... Puedes usar todas las herramientas de formato como en Microsoft Word."
                            height="calc(100vh - 300px)"
                            toolbar="full"
                        />
                    </div>
                </div>
            </div>

            {/* Presentation Mode removed - was part of block system */}
        </>
    );
}
