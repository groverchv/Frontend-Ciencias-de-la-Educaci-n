// src/pages/Dashboard/Contenido/BlockRenderers.jsx
import React from 'react';
import { Typography } from 'antd';
import DOMPurify from 'dompurify';

const { Title, Paragraph } = Typography;

// Helper: Sanitize and render HTML content
const renderHTML = (htmlContent) => {
    if (!htmlContent) return null;
    // Remove HTML tags to check if empty
    const textOnly = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (!textOnly) return null;

    const sanitized = DOMPurify.sanitize(htmlContent);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// Helper: Convertir URLs de Google Drive a formato directo e iframe
export const convertGoogleDriveUrl = (url) => {
    if (!url) return { directUrl: url, previewUrl: url, isGoogleDrive: false };

    const drivePatterns = [
        /drive\.google\.com\/file\/d\/([^\/]+)/,
        /drive\.google\.com\/open\?id=([^&]+)/,
        /drive\.google\.com\/uc\?id=([^&]+)/
    ];

    for (const pattern of drivePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            const fileId = match[1];
            return {
                directUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
                previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
                isGoogleDrive: true
            };
        }
    }

    return { directUrl: url, previewUrl: url, isGoogleDrive: false };
};

// Renderizador visual de Título
export const RendererTitulo = ({ block }) => {
    const htmlContent = block.datosJson.texto;

    if (!htmlContent || htmlContent.trim() === '') {
        return <Title level={1} style={{ marginTop: 32, marginBottom: 16 }}>Sin título</Title>;
    }

    return (
        <div style={{ marginTop: 32, marginBottom: 16 }} className="rendered-title">
            {renderHTML(htmlContent)}
        </div>
    );
};

// Renderizador visual de Subtítulo
export const RendererSubTitulo = ({ block }) => {
    const htmlContent = block.datosJson.texto;

    if (!htmlContent || htmlContent.trim() === '') {
        return <Title level={2} style={{ marginTop: 24, marginBottom: 12 }}>Sin subtítulo</Title>;
    }

    return (
        <div style={{ marginTop: 24, marginBottom: 12 }} className="rendered-subtitle">
            {renderHTML(htmlContent)}
        </div>
    );
};

// Renderizador visual de Texto
export const RendererTexto = ({ block }) => {
    const htmlContent = block.datosJson.descripcion;

    if (!htmlContent || htmlContent.trim() === '') {
        return <Paragraph style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: 24 }}>Sin contenido</Paragraph>;
    }

    return (
        <div style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: 24 }} className="rendered-text">
            {renderHTML(htmlContent)}
        </div>
    );
};

// Renderizador visual de Tabla
export const RendererTabla = ({ block }) => {
    const { rows = 3, cols = 3, data = [], headerBg = '#1890ff', headerColor = '#ffffff', borderColor = '#d9d9d9' } = block.datosJson;

    if (!data.length) {
        return <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>Tabla vacía</div>;
    }

    return (
        <div style={{ marginBottom: 32, overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: `1px solid ${borderColor}`
            }}>
                <thead>
                    <tr>
                        {data[0] && data[0].map((cell, colIdx) => (
                            <th key={colIdx} style={{
                                background: headerBg,
                                color: headerColor,
                                border: `1px solid ${borderColor}`,
                                padding: '12px',
                                fontWeight: 'bold',
                                textAlign: 'left'
                            }}>
                                {cell || `Columna ${colIdx + 1}`}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                            {row.map((cell, colIdx) => (
                                <td key={colIdx} style={{
                                    border: `1px solid ${borderColor}`,
                                    padding: '12px'
                                }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Renderizador visual de Archivo
export const RendererArchivo = ({ block }) => {
    const { url, nombre, descripcion } = block.datosJson;
    if (!url) return <div style={{ padding: 20, background: '#f5f5f5', borderRadius: 4, textAlign: 'center' }}>No hay archivo</div>;

    const { directUrl, previewUrl, isGoogleDrive } = convertGoogleDriveUrl(url);

    // Detectar tipo de archivo
    let ext = '';
    if (directUrl.includes('.')) {
        ext = directUrl.split('.').pop().toLowerCase().split('?')[0];
    }

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
    const isPDF = ext === 'pdf';

    return (
        <div style={{ marginBottom: 32 }}>
            {/* PRIMERO: Mostrar el archivo visual */}
            {isGoogleDrive ? (
                // Google Drive: usar iframe para preview
                <div style={{ marginBottom: 16 }}>
                    <iframe
                        src={previewUrl}
                        style={{
                            width: '100%',
                            height: '400px',
                            border: 'none',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        allow="autoplay"
                        title={nombre || 'Archivo de Google Drive'}
                    />
                    <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: '#888' }}>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2563eb" }}
                        >
                            📂 Abrir en Google Drive
                        </a>
                    </div>
                </div>
            ) : (
                // Archivos normales
                <>
                    {isImage && (
                        <img
                            src={directUrl}
                            alt={nombre || 'Imagen'}
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: 16
                            }}
                            onError={(e) => {
                                console.error('Error cargando imagen:', directUrl);
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    {isVideo && (
                        <video
                            src={directUrl}
                            controls
                            style={{
                                maxWidth: '100%',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                marginBottom: 16
                            }}
                        />
                    )}
                    {isPDF && (
                        <div style={{ marginBottom: 16 }}>
                            <embed
                                src={directUrl}
                                type="application/pdf"
                                style={{
                                    width: '100%',
                                    height: '500px',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb'
                                }}
                            />
                            <div style={{ marginTop: 8, textAlign: 'center' }}>
                                <a
                                    href={directUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#2563eb",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                    }}
                                >
                                    📄 Abrir PDF en nueva pestaña
                                </a>
                            </div>
                        </div>
                    )}
                    {!isImage && !isVideo && !isPDF && (
                        <div
                            style={{
                                padding: 20,
                                background: "#f9fafb",
                                borderRadius: 8,
                                border: "1px solid #e5e7eb",
                                marginBottom: 16,
                                textAlign: 'center'
                            }}
                        >
                            <span style={{ fontSize: 48 }}>📎</span>
                            <div style={{ marginTop: 12 }}>
                                <a
                                    href={directUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#2563eb",
                                        textDecoration: "none",
                                        fontSize: "16px",
                                        fontWeight: 600
                                    }}
                                >
                                    Descargar archivo
                                </a>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SEGUNDO: Mostrar el título */}
            {nombre && (
                <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>
                    {nombre}
                </Title>
            )}

            {/* TERCERO: Mostrar la descripción */}
            {descripcion && (
                <Paragraph style={{ fontSize: '16px', color: '#555', lineHeight: 1.8 }}>
                    {descripcion}
                </Paragraph>
            )}
        </div>
    );
};
