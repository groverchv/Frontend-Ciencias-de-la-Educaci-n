// src/pages/Dashboard/Contenido/PresentationMode.jsx
import React from "react";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';
import '../../../components/RichTextEditor.css';
import '../../../components/QuillFonts.css';

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
                .rich-content-preview ul,
                .rich-content-preview ol {
                    padding-left: 24px;
                    margin: 12px 0;
                }
                
                /* Quill text formatting */
                .rich-content-preview strong {
                    font-weight: bold;
                }
                .rich-content-preview em {
                    font-style: italic;
                }
                .rich-content-preview u {
                    text-decoration: underline;
                }
                .rich-content-preview s {
                    text-decoration: line-through;
                }
                
                /* Quill alignment */
                .rich-content-preview .ql-align-center {
                    text-align: center;
                }
                .rich-content-preview .ql-align-right {
                    text-align: right;
                }
                .rich-content-preview .ql-align-justify {
                    text-align: justify;
                }
                
                /* Quill indentation */
                .rich-content-preview .ql-indent-1 {
                    padding-left: 3em;
                }
                .rich-content-preview .ql-indent-2 {
                    padding-left: 6em;
                }
                .rich-content-preview .ql-indent-3 {
                    padding-left: 9em;
                }
                .rich-content-preview .ql-indent-4 {
                    padding-left: 12em;
                }
                .rich-content-preview .ql-indent-5 {
                    padding-left: 15em;
                }
                .rich-content-preview .ql-indent-6 {
                    padding-left: 18em;
                }
                .rich-content-preview .ql-indent-7 {
                    padding-left: 21em;
                }
                .rich-content-preview .ql-indent-8 {
                    padding-left: 24em;
                }
                
                /* Quill links */
                .rich-content-preview a {
                    color: #06c;
                    text-decoration: underline;
                }
                
                /* Quill code blocks */
                .rich-content-preview pre.ql-syntax {
                    background-color: #23241f;
                    color: #f8f8f2;
                    overflow: visible;
                }
            `}</style>
        </div>
    );
};
