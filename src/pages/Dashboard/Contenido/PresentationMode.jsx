// src/pages/Dashboard/Contenido/PresentationMode.jsx
import React from "react";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import DOMPurify from 'dompurify';

export const PresentationMode = ({ contenidoHtml, onClose }) => {
    // Sanitizar HTML para prevenir XSS
    const sanitizedHtml = DOMPurify.sanitize(contenidoHtml || '');

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
                <div style={{ fontSize: '16px', fontWeight: 600 }}>
                    Vista Previa
                </div>
                <Button
                    icon={<CloseOutlined />}
                    onClick={onClose}
                    size="large"
                    danger
                >
                    Salir
                </Button>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '48px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div
                    className="rich-content-preview"
                    style={{
                        maxWidth: '1200px',
                        width: '100%'
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            </div>

            {/* CSS para estilos del contenido */}
            <style>{`
                .rich-content-preview {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .rich-content-preview h1,
                .rich-content-preview h2,
                .rich-content-preview h3,
                .rich-content-preview h4,
                .rich-content-preview h5,
                .rich-content-preview h6 {
                    margin-top: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.25;
                }
                .rich-content-preview img {
                    max-width: 100%;
                    height: auto;
                }
                .rich-content-preview table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 16px 0;
                }
                .rich-content-preview table td,
                .rich-content-preview table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .rich-content-preview blockquote {
                    border-left: 4px solid #ddd;
                    padding-left: 16px;
                    margin: 16px 0;
                    color: #666;
                }
                .rich-content-preview pre {
                    background: #f5f5f5;
                    padding: 16px;
                    border-radius: 4px;
                    overflow-x: auto;
                }
            `}</style>
        </div>
    );
};
