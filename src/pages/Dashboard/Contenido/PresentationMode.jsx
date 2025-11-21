// src/pages/Dashboard/Contenido/PresentationMode.jsx
import React, { useState, useEffect } from "react";
import { Button } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    CloseOutlined,
    FilePdfOutlined,
    FileOutlined
} from "@ant-design/icons";

export const PresentationMode = ({ blocks, layout, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                setCurrentSlide(prev => Math.min(prev + 1, blocks.length - 1));
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                setCurrentSlide(prev => Math.max(prev - 1, 0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [blocks.length, onClose]);

    if (blocks.length === 0) return null;

    const currentBlock = blocks[currentSlide];

    const renderBlock = () => {
        const { tipoBloque, datosJson } = currentBlock;

        if (tipoBloque === 'titulo') {
            return <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: 24 }}>{datosJson.texto || ''}</h1>;
        }
        if (tipoBloque === 'subtitulo') {
            return <h2 style={{ fontSize: '2rem', fontWeight: '600', color: '#444', marginBottom: 20 }}>{datosJson.texto || ''}</h2>;
        }
        if (tipoBloque === 'texto') {
            return <p style={{ fontSize: '1.3rem', lineHeight: 1.8, color: '#333' }}>{datosJson.descripcion || ''}</p>;
        }
        if (tipoBloque === 'archivo') {
            const { nombre, descripcion, url } = datosJson;
            if (!url) return <p>Sin archivo</p>;

            const getFileType = (url) => {
                if (!url) return 'unknown';
                const ext = url.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
                if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
                if (ext === 'pdf') return 'pdf';
                return 'file';
            };

            const fileType = getFileType(url);

            return (
                <div style={{ margin: '24px 0' }}>
                    {nombre && <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{nombre}</h3>}
                    {descripcion && <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: 16 }}>{descripcion}</p>}
                    {fileType === 'image' && url && (
                        <img src={url} alt={nombre || 'Imagen'} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
                    )}
                    {fileType === 'video' && url && (
                        <video src={url} controls style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                    )}
                    {fileType === 'pdf' && url && (
                        <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                            <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 16 }} />
                            <div><a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem' }}>Abrir PDF</a></div>
                        </div>
                    )}
                    {fileType === 'file' && url && (
                        <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                            <FileOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                            <div><a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.2rem' }}>Descargar</a></div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#fff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 32px',
                borderBottom: '1px solid #e8e8e8',
                background: '#fafafa'
            }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                    Diapositiva {currentSlide + 1} de {blocks.length}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                        disabled={currentSlide === 0}
                        size="large"
                    >
                        Anterior
                    </Button>
                    <Button
                        icon={<RightOutlined />}
                        onClick={() => setCurrentSlide(prev => Math.min(prev + 1, blocks.length - 1))}
                        disabled={currentSlide === blocks.length - 1}
                        size="large"
                        type="primary"
                    >
                        Siguiente
                    </Button>
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        size="large"
                        danger
                    >
                        Salir
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px',
                overflow: 'auto'
            }}>
                <div className={`slide-content layout-${layout}`} style={{
                    maxWidth: '1200px',
                    width: '100%',
                    animation: 'slideIn 0.3s ease'
                }}>
                    {renderBlock()}
                </div>
            </div>

            {/* CSS */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};
