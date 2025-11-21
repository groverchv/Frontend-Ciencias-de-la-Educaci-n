// src/pages/Dashboard/Contenido/BlockEditors.jsx
import React from "react";
import { Input, Card, Row, Col } from "antd";
import {
    FileOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    FilePdfOutlined,
    FileImageOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

// --- Editor para Título ---
export const EditorTitulo = ({ block, onChange }) => (
    <Input
        size="large"
        placeholder="Escribe el Título..."
        style={{ fontSize: "1.75rem", fontWeight: "bold", border: 'none', paddingLeft: 0, color: '#1f1f1f' }}
        value={block.datosJson.texto || ""}
        onChange={(e) => onChange(block.id, { ...block.datosJson, texto: e.target.value })}
    />
);

// --- Editor para Subtítulo ---
export const EditorSubTitulo = ({ block, onChange }) => (
    <Input
        size="large"
        placeholder="Escribe el Subtítulo..."
        style={{ fontSize: "1.3rem", fontWeight: "600", border: 'none', paddingLeft: 0, color: '#3b3b3b' }}
        value={block.datosJson.texto || ""}
        onChange={(e) => onChange(block.id, { ...block.datosJson, texto: e.target.value })}
    />
);

// --- Editor para Texto ---
export const EditorTexto = ({ block, onChange }) => (
    <TextArea
        placeholder="Escribe el párrafo de texto..."
        autoSize
        style={{ fontSize: "1rem", border: 'none', paddingLeft: 0, lineHeight: 1.6 }}
        value={block.datosJson.descripcion || ""}
        onChange={(e) => onChange(block.id, { ...block.datosJson, descripcion: e.target.value })}
    />
);

// --- Editor para Archivo ---
export const EditorArchivo = ({ block, onChange }) => {
    const getFileType = (url) => {
        if (!url) return 'unknown';
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
        if (ext === 'pdf') return 'pdf';
        return 'file';
    };

    const renderPreview = () => {
        const url = block.datosJson.url;
        if (!url) return null;

        const fileType = getFileType(url);

        return (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 4, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Vista Previa:</div>
                {fileType === 'image' && (
                    <div style={{ textAlign: 'center' }}>
                        <PictureOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                        <img
                            src={url}
                            alt={block.datosJson.nombre || 'preview'}
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                        />
                    </div>
                )}
                {fileType === 'video' && (
                    <div style={{ textAlign: 'center' }}>
                        <VideoCameraOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                        <video
                            controls
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                        >
                            <source src={url} />
                        </video>
                    </div>
                )}
                {fileType === 'pdf' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Archivo PDF</div>
                    </div>
                )}
                {fileType === 'file' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <FileImageOutlined style={{ fontSize: 48, color: '#888' }} />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Archivo</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card size="small" style={{ background: '#fafafa' }}>
            <Row gutter={16} align="middle">
                <Col><FileOutlined style={{ fontSize: 24, color: '#888' }} /></Col>
                <Col flex={1}>
                    <Input
                        addonBefore="Nombre"
                        placeholder="documento.pdf"
                        value={block.datosJson.nombre || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, nombre: e.target.value })}
                        style={{ marginBottom: 8 }}
                    />
                    <Input
                        addonBefore="Descripción"
                        placeholder="Descripción del archivo"
                        value={block.datosJson.descripcion || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, descripcion: e.target.value })}
                        style={{ marginBottom: 8 }}
                    />
                    <Input
                        addonBefore="URL"
                        placeholder="/uploads/documento.pdf"
                        value={block.datosJson.url || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, url: e.target.value })}
                    />
                </Col>
            </Row>
            {renderPreview()}
        </Card>
    );
};
