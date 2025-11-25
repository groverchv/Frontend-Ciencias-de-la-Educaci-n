// src/components/RichTextEditor.jsx
import React, { useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import ImageResize from 'quill-image-resize-module-react';
import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.css';

// Registrar el módulo de redimensionamiento de imágenes
Quill.register('modules/imageResize', ImageResize);

/**
 * RichTextEditor - Componente de editor de texto enriquecido con todas las funcionalidades
 * Similar a Microsoft Word
 * 
 * INCLUYE:
 * ✓ Negrilla (Bold)
 * ✓ Cursiva (Italic)
 * ✓ Subrayado (Underline)
 * ✓ Tipos de letra
 * ✓ Tamaños de letra
 * ✓ Agrandar/Reducir texto
 * ✓ Color de letra
 * ✓ 4 tipos de alineación
 * ✓ Viñetas y listas
 * ✓ Inserción de imágenes por URL (con soporte para Google Drive)
 * ✓ Inserción de tablas (como bloque separado)
 */
export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Escribe aquí...",
    height = 300,
    toolbar = 'full' // 'full' | 'basic' | 'minimal'
}) {
    const quillRef = useRef(null);

    // Custom handler para insertar imágenes por URL
    const imageHandler = () => {
        const url = prompt('Ingresa la URL de la imagen (Google Drive, Imgur, URL directa, etc.):');

        if (url) {
            let finalUrl = url;

            // Detectar y convertir URLs de Google Drive
            if (url.includes('drive.google.com')) {
                // Extraer el ID del archivo de diferentes formatos de URL de Google Drive
                let fileId = null;

                // Formato: https://drive.google.com/file/d/FILE_ID/view
                const match1 = url.match(/\/file\/d\/([^\/\?]+)/);
                if (match1) {
                    fileId = match1[1];
                }

                // Formato: https://drive.google.com/open?id=FILE_ID
                const match2 = url.match(/[?&]id=([^&]+)/);
                if (!fileId && match2) {
                    fileId = match2[1];
                }

                // Convertir a URL directa de imagen usando el endpoint de  thumbnail (más confiable)
                if (fileId) {
                    // Usar el formato que funciona mejor para imágenes
                    finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                    console.log('📸 URL de Google Drive convertida:', finalUrl);
                    console.log('💡 Asegúrate de que el archivo esté configurado como "Cualquiera con el enlace puede ver"');
                }
            }

            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', finalUrl);
                quill.setSelection(range.index + 1);
            }
        }
    };

    // Configuración del toolbar según el tipo
    const toolbarConfig = useMemo(() => {
        if (toolbar === 'minimal') {
            return [
                ['bold', 'italic', 'underline'],
                [{ 'color': [] }],
                [{ 'align': [] }]
            ];
        }

        if (toolbar === 'basic') {
            return [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image']
            ];
        }

        // Full toolbar con TODAS las funcionalidades
        return [
            // Encabezados
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            // Tipo de letra
            [{ 'font': [] }],

            // Tamaño de letra
            [{ 'size': ['small', false, 'large', 'huge'] }],

            // Formato de texto: Negrilla, Cursiva, Subrayado, Tachado
            ['bold', 'italic', 'underline', 'strike'],

            // Colores: Color de letra y fondo
            [{ 'color': [] }, { 'background': [] }],

            // Alineación: Las 4 tipos
            [{ 'align': [] }], // left, center, right, justify

            // Listas: Viñetas y numeradas
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],

            // Sangría: Aumentar/Reducir
            [{ 'indent': '-1' }, { 'indent': '+1' }],

            // Script: Superíndice y subíndice
            [{ 'script': 'sub' }, { 'script': 'super' }],

            // Dirección de texto
            [{ 'direction': 'rtl' }],

            // Insertar elementos: Links, Imágenes, Videos
            ['link', 'image', 'video'],

            // Bloques especiales
            ['blockquote', 'code-block'],

            // Formato y limpieza
            ['clean']
        ];
    }, [toolbar]);

    // Módulos de Quill con custom handler para imágenes y redimensionamiento
    const modules = useMemo(() => ({
        toolbar: {
            container: toolbarConfig,
            handlers: {
                image: imageHandler
            }
        },
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
            handleStyles: {
                backgroundColor: '#1890ff',
                border: '1px solid white',
                borderRadius: '50%',
                width: '8px',
                height: '8px'
            },
            displayStyles: {
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                color: '#333',
                fontSize: '12px',
                padding: '4px 8px'
            },
            toolbarStyles: {
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            },
            toolbarButtonStyles: {
                padding: '4px',
                cursor: 'pointer',
                borderRadius: '2px',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            toolbarButtonSvgStyles: {
                fill: '#333',
                width: '16px',
                height: '16px'
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), [toolbarConfig]);

    // Formatos permitidos
    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background',
        'align',
        'script',
        'direction',
        'code-block'
    ];

    return (
        <div className="rich-text-editor-wrapper" style={{ minHeight: height }}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
