// src/components/ContenidoDinamico.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Spin, Empty, Alert, Typography, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import DOMPurify from 'dompurify';
import ContenidoService from "../../services/ContenidoService";
import Sub_MenuService from "../../services/Sub_MenuService";
// BlockRenderers and BloqueService removed - block system eliminated
import 'react-quill-new/dist/quill.snow.css';
import '../RichTextEditor.css';
import '../QuillFonts.css';


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

                // 1. Buscar el SubMenu por su ruta
                const allSubMenus = await Sub_MenuService.getAllSubMenu();

                const foundSubMenu = allSubMenus.find((sm) => sm.ruta === ruta);

                if (!foundSubMenu) {
                    setError(`No se encontró contenido para la ruta: ${ruta}`);
                    setLoading(false);
                    return;
                }

                // Verificar que el SubMenu esté activo
                if (!foundSubMenu.estado) {
                    setError('Este contenido no está disponible públicamente');
                    setLoading(false);
                    return;
                }

                // Verificar que el Menú padre esté activo
                const menu = foundSubMenu.menu_id || foundSubMenu.menu;
                if (menu && !menu.estado) {
                    setError('Este contenido no está disponible públicamente');
                    setLoading(false);
                    return;
                }

                setSubMenu(foundSubMenu);

                // 2. Obtener todos los Contenidos de este SubMenu
                const contenidosData = await ContenidoService.getContenidosBySubMenu(foundSubMenu.id);

                // 3. Para cada Contenido activo, cargar su contenidoHtml
                const contenidosConHtml = [];
                for (const contenido of contenidosData) {
                    if (contenido.estado) {
                        try {
                            // Obtener el contenido completo con contenidoHtml
                            const contenidoCompleto = await ContenidoService.getContenidoById(contenido.id);

                            // Agregar contenido si tiene contenidoHtml
                            if (contenidoCompleto.contenidoHtml) {
                                contenidosConHtml.push(contenidoCompleto);
                            }
                        } catch (err) {
                            console.error(`Error cargando contenido ${contenido.id}:`, err);
                        }
                    }
                }

                // Ordenar contenidos por orden
                contenidosConHtml.sort((a, b) => (a.orden || 0) - (b.orden || 0));
                setContenidos(contenidosConHtml);
            } catch (err) {
                console.error("Error al cargar contenido:", err);
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        loadContenido();
    }, [ruta]);

    // Block rendering removed - block system eliminated

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
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "40px 60px",
                minHeight: "60vh",
                background: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
        >
            {contenidos.map((contenido, idx) => (
                <div key={contenido.id}>
                    {/* Renderizar contenido HTML */}
                    {/* Renderizar contenido HTML con estilos del editor */}
                    <div className="rich-text-editor-wrapper">
                        <div
                            className="ql-editor rich-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contenido.contenidoHtml) }}
                            style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                lineHeight: 1.6,
                                color: '#333',
                                padding: 0,
                                height: 'auto',
                                minHeight: 'auto',
                                overflow: 'visible'
                            }}
                        />
                    </div>

                    {/* Separador entre contenidos (excepto el último) */}
                    {idx < contenidos.length - 1 && (
                        <Divider style={{ margin: '40px 0' }} />
                    )}
                </div>
            ))}

            {/* Estilos para contenido HTML */}
            <style>{`
                .rich-content h1,
                .rich-content h2,
                .rich-content h3,
                .rich-content h4,
                .rich-content h5,
                .rich-content h6 {
                    margin-top: 24px;
                    margin-bottom: 16px;
                    font-weight: 600;
                    line-height: 1.25;
                }
                .rich-content img {
                    max-width: 100%;
                    height: auto;
                }
                .rich-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 16px 0;
                }
                .rich-content table td,
                .rich-content table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                .rich-content blockquote {
                    border-left: 4px solid #ddd;
                    padding-left: 16px;
                    margin: 16px 0;
                    color: #666;
                }
                .rich-content pre {
                    background: #f5f5f5;
                    padding: 16px;
                    border-radius: 4px;
                    overflow-x: auto;
                }
                .rich-content ul,
                .rich-content ol {
                    padding-left: 24px;
                    margin: 12px 0;
                }
                
                /* Quill text formatting */
                .rich-content strong {
                    font-weight: bold;
                }
                .rich-content em {
                    font-style: italic;
                }
                .rich-content u {
                    text-decoration: underline;
                }
                .rich-content s {
                    text-decoration: line-through;
                }
                
                /* Quill alignment */
                .rich-content .ql-align-center {
                    text-align: center;
                }
                .rich-content .ql-align-right {
                    text-align: right;
                }
                .rich-content .ql-align-justify {
                    text-align: justify;
                }
                
                /* Quill indentation */
                .rich-content .ql-indent-1 {
                    padding-left: 3em;
                }
                .rich-content .ql-indent-2 {
                    padding-left: 6em;
                }
                .rich-content .ql-indent-3 {
                    padding-left: 9em;
                }
                .rich-content .ql-indent-4 {
                    padding-left: 12em;
                }
                .rich-content .ql-indent-5 {
                    padding-left: 15em;
                }
                .rich-content .ql-indent-6 {
                    padding-left: 18em;
                }
                .rich-content .ql-indent-7 {
                    padding-left: 21em;
                }
                .rich-content .ql-indent-8 {
                    padding-left: 24em;
                }
                
                /* Quill links */
                .rich-content a {
                    color: #06c;
                    text-decoration: underline;
                }
                
                /* Quill code blocks */
                .rich-content pre.ql-syntax {
                    background-color: #23241f;
                    color: #f8f8f2;
                    overflow: visible;
                }
            `}</style>
        </div>
    );
}
