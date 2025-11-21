// src/pages/Dashboard/Contenido/ContentEditorModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Space, Row, Col, Empty, Typography, message, Popconfirm } from "antd";
import {
    SaveOutlined,
    FullscreenOutlined,
    CloseOutlined,
    FontSizeOutlined,
    ReadOutlined,
    DownSquareOutlined,
    FileOutlined,
    DeleteOutlined,
    DragOutlined
} from "@ant-design/icons";
import { EditorTitulo, EditorSubTitulo, EditorTexto, EditorArchivo } from "./BlockEditors";
import { RendererTitulo, RendererSubTitulo, RendererTexto, RendererArchivo } from "./BlockRenderers";
import { layoutTemplates, LayoutTemplate } from "./LayoutTemplates";
import { PresentationMode } from "./PresentationMode";
import BloqueService from "../../../services/BloqueService";

const { Title, Text } = Typography;

export const ContentEditorModal = ({
    visible,
    contenido,
    initialBlocks = [],
    onClose,
    onSave,
    initialLayout = 'default'
}) => {
    // Estado local del modal
    const [localBlocks, setLocalBlocks] = useState([]);
    const [localLayout, setLocalLayout] = useState(initialLayout);
    const [saving, setSaving] = useState(false);
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [editingBlockId, setEditingBlockId] = useState(null);

    // Cargar bloques al abrir modal
    useEffect(() => {
        if (visible && initialBlocks) {
            setLocalBlocks(initialBlocks);
            setLocalLayout(initialLayout);
        }
    }, [visible, initialBlocks, initialLayout]);

    // Función para agregar bloque
    const handleLocalAddBlock = (tipo) => {
        const newBlock = {
            id: `temp-${Date.now()}`,
            tipoBloque: tipo,
            orden: localBlocks.length,
            estado: true,
            datosJson: {}
        };
        setLocalBlocks([...localBlocks, newBlock]);
        // Abrir modal de edición para el nuevo bloque
        setEditingBlockId(newBlock.id);
    };

    // Función para cambiar datos de un bloque
    const handleLocalBlockChange = (blockId, newData) => {
        setLocalBlocks(localBlocks.map(b =>
            b.id === blockId ? { ...b, datosJson: newData } : b
        ));
    };

    // Función para eliminar bloque
    const handleLocalDeleteBlock = (blockId) => {
        setLocalBlocks(localBlocks.filter(b => b.id !== blockId));
    };

    // Guardar y cerrar
    const handleSaveAndClose = async () => {
        if (!contenido) return;

        setSaving(true);
        try {
            // Preparar bloques para guardar
            const blocksToSave = localBlocks.map((block, index) => ({
                ...block,
                orden: index
            }));

            // Llamar al servicio para guardar
            await BloqueService.saveBlocksForContenido(contenido.id, blocksToSave);
            message.success("¡Contenido guardado exitosamente!");

            // Cerrar y notificar
            if (onSave) {
                onSave(contenido.id, localLayout);
            }
            onClose();
        } catch (error) {
            message.error("Error al guardar contenido");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Obtener el bloque que se está editando
    const getEditingBlock = () => localBlocks.find(b => b.id === editingBlockId);

    if (!contenido) return null;

    return (
        <>
            <Modal
                open={visible}
                onCancel={onClose}
                width="95vw"
                style={{ top: 20, maxWidth: 1800 }}
                footer={null}
                closeIcon={<CloseOutlined />}
                destroyOnClose
            >
                <div style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 0',
                        borderBottom: '1px solid #f0f0f0',
                        marginBottom: 16
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {contenido.titulo || 'Sin título'}
                                </Title>
                                <Text type="secondary">ID: {contenido.id}</Text>
                            </div>
                            <Space>
                                <Button
                                    icon={<FullscreenOutlined />}
                                    onClick={() => setIsPresentationMode(true)}
                                    disabled={localBlocks.length === 0}
                                >
                                    Vista Previa
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveAndClose}
                                    loading={saving}
                                >
                                    Guardar
                                </Button>
                                <Button icon={<CloseOutlined />} onClick={onClose}>
                                    Cerrar
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* Content - 3 Paneles */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Row style={{ height: '100%' }}>
                            {/* LEFT PANEL - Add Elements */}
                            <Col span={5} style={{
                                height: '100%',
                                overflowY: 'auto',
                                borderRight: '1px solid #f0f0f0',
                                padding: '16px'
                            }}>
                                <Title level={5}>Agregar Elementos</Title>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <Button
                                        icon={<FontSizeOutlined />}
                                        onClick={() => handleLocalAddBlock('titulo')}
                                        block
                                    >
                                        Título
                                    </Button>
                                    <Button
                                        icon={<DownSquareOutlined />}
                                        onClick={() => handleLocalAddBlock('subtitulo')}
                                        block
                                    >
                                        Subtítulo
                                    </Button>
                                    <Button
                                        icon={<ReadOutlined />}
                                        onClick={() => handleLocalAddBlock('texto')}
                                        block
                                    >
                                        Párrafo
                                    </Button>
                                    <Button
                                        icon={<FileOutlined />}
                                        onClick={() => handleLocalAddBlock('archivo')}
                                        block
                                    >
                                        Archivo
                                    </Button>
                                </div>
                            </Col>

                            {/* CENTER PANEL - Canvas */}
                            <Col span={12} style={{ height: '100%', overflowY: 'auto', padding: '24px', background: '#f0f2f5' }}>
                                <div className={`slide-canvas layout-${localLayout}`}>
                                    {localBlocks.length === 0 ? (
                                        <Empty description="Lienzo vacío. Agrega elementos." style={{ padding: '60px 0' }} />
                                    ) : (
                                        localBlocks.map((block) => (
                                            <div key={block.id} className={`block-wrapper block-${block.tipoBloque}`}>
                                                <div className="block-drag-handle"><DragOutlined /></div>
                                                <div className="block-content" onClick={() => setEditingBlockId(block.id)} style={{ cursor: 'pointer' }}>
                                                    {/* Vista previa visual como se verá en público */}
                                                    {block.tipoBloque === 'titulo' && <RendererTitulo block={block} />}
                                                    {block.tipoBloque === 'subtitulo' && <RendererSubTitulo block={block} />}
                                                    {block.tipoBloque === 'texto' && <RendererTexto block={block} />}
                                                    {block.tipoBloque === 'archivo' && <RendererArchivo block={block} />}
                                                </div>
                                                <div className="block-controls">
                                                    <Space>
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            onClick={() => setEditingBlockId(block.id)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Popconfirm title="¿Eliminar?" onConfirm={() => handleLocalDeleteBlock(block.id)}>
                                                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Col>

                            {/* RIGHT PANEL - Layout Templates */}
                            <Col span={7} style={{ height: '100%', overflowY: 'auto', borderLeft: '1px solid #f0f0f0', padding: '16px' }}>
                                <Title level={5}>Plantillas de Diseño</Title>
                                <Text style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: 16 }}>
                                    Selecciona un estilo visual
                                </Text>
                                <div>
                                    {layoutTemplates.map(template => (
                                        <LayoutTemplate
                                            key={template.id}
                                            template={template}
                                            isSelected={localLayout === template.id}
                                            onClick={() => setLocalLayout(template.id)}
                                        />
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* CSS Styles */}
                <style>{`
                    .slide-canvas {
                        background: white;
                        min-height: 600px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        padding: 40px;
                        border-radius: 4px;
                    }
                    .block-wrapper {
                        position: relative;
                        margin-bottom: 16px;
                        padding: 8px;
                        border: 1px dashed transparent;
                        transition: all 0.2s;
                    }
                    .block-wrapper:hover {
                        border-color: #1890ff;
                        background: rgba(24, 144, 255, 0.02);
                    }
                    .block-drag-handle {
                        position: absolute;
                        left: -20px;
                        top: 10px;
                        cursor: grab;
                        opacity: 0;
                        color: #bbb;
                    }
                    .block-controls {
                        position: absolute;
                        right: -30px;
                        top: 0;
                        opacity: 0;
                    }
                    .block-wrapper:hover .block-drag-handle,
                    .block-wrapper:hover .block-controls {
                        opacity: 1;
                    }
                `}</style>
            </Modal>

            {/* Edit Block Modal */}
            {editingBlockId && getEditingBlock() && (
                <Modal
                    open={true}
                    onCancel={() => setEditingBlockId(null)}
                    onOk={() => setEditingBlockId(null)}
                    title={`Editar ${getEditingBlock().tipoBloque}`}
                    width={700}
                    okText="Listo"
                    cancelText="Cancelar"
                >
                    <div style={{ padding: '20px 0' }}>
                        {getEditingBlock().tipoBloque === 'titulo' && (
                            <EditorTitulo block={getEditingBlock()} onChange={handleLocalBlockChange} />
                        )}
                        {getEditingBlock().tipoBloque === 'subtitulo' && (
                            <EditorSubTitulo block={getEditingBlock()} onChange={handleLocalBlockChange} />
                        )}
                        {getEditingBlock().tipoBloque === 'texto' && (
                            <EditorTexto block={getEditingBlock()} onChange={handleLocalBlockChange} />
                        )}
                        {getEditingBlock().tipoBloque === 'archivo' && (
                            <EditorArchivo block={getEditingBlock()} onChange={handleLocalBlockChange} />
                        )}
                    </div>
                </Modal>
            )}

            {/* Presentation Mode */}
            {isPresentationMode && (
                <PresentationMode
                    blocks={localBlocks}
                    layout={localLayout}
                    onClose={() => setIsPresentationMode(false)}
                />
            )}
        </>
    );
};
