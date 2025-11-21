// src/pages/Dashboard/Contenido/PresentationMode.jsx
import React, { useState, useEffect } from "react";
import { Button } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { RendererTitulo, RendererSubTitulo, RendererTexto, RendererArchivo } from "./BlockRenderers";

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
        switch (currentBlock.tipoBloque) {
            case 'titulo':
                return <div style={{ fontSize: '3rem' }}><RendererTitulo block={currentBlock} /></div>;
            case 'subtitulo':
                return <div style={{ fontSize: '2rem' }}><RendererSubTitulo block={currentBlock} /></div>;
            case 'texto':
                return <div style={{ fontSize: '1.3rem' }}><RendererTexto block={currentBlock} /></div>;
            case 'archivo':
                return <RendererArchivo block={currentBlock} />;
            default:
                return null;
        }
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
