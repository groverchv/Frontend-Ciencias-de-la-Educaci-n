// src/pages/Dashboard/Contenido/Funcionalidades/ImportarWord.jsx
import React from 'react';
import mammoth from 'mammoth';

/**
 * Funcionalidad para importar documentos de Word (.docx)
 * Convierte el contenido del archivo a HTML y lo inserta en Quill
 */
export const useImportarWord = (quillRef, onChange) => {
    const importarWord = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.docx';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();

                // Configurar opciones avanzadas de mammoth para preservar TODO el formato
                const options = {
                    // Mapeo completo de estilos de Word a HTML
                    styleMap: [
                        // Encabezados con tamaños específicos
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Heading 4'] => h4:fresh",
                        "p[style-name='Heading 5'] => h5:fresh",
                        "p[style-name='Heading 6'] => h6:fresh",

                        // Estilos de párrafo con alineación
                        "p[style-name='Title'] => h1.title:fresh",
                        "p[style-name='Subtitle'] => h2.subtitle:fresh",
                        "p[style-name='Quote'] => blockquote:fresh",
                        "p[style-name='Intense Quote'] => blockquote.intense:fresh",

                        // Preservar estilos inline
                        "r[style-name='Strong'] => strong",
                        "r[style-name='Emphasis'] => em",
                        "r[style-name='Intense Emphasis'] => strong > em",

                        // Listas con indentación
                        "p[style-name='List Paragraph'] => p.list-paragraph:fresh",
                    ],

                    // Convertir imágenes preservando dimensiones y atributos
                    convertImage: mammoth.images.imgElement(function (image) {
                        return image.read("base64").then(function (imageBuffer) {
                            const img = {
                                src: "data:" + image.contentType + ";base64," + imageBuffer
                            };

                            // Preservar dimensiones originales si están disponibles
                            if (image.width) {
                                img.width = image.width;
                            }
                            if (image.height) {
                                img.height = image.height;
                            }

                            // Preservar atributos de estilo
                            const styles = [];
                            if (image.width) styles.push(`width: ${image.width}px`);
                            if (image.height) styles.push(`height: ${image.height}px`);

                            if (styles.length > 0) {
                                img.style = styles.join('; ');
                            }

                            return img;
                        });
                    }),

                    // Preservar saltos de párrafo y estructura
                    includeDefaultStyleMap: true,
                    includeEmbeddedStyleMap: true,

                    // Transformar documentos para preservar formato adicional
                    transformDocument: mammoth.transforms.paragraph(function (element) {
                        // Preservar alineación de párrafos
                        if (element.alignment) {
                            const alignmentMap = {
                                'left': 'left',
                                'center': 'center',
                                'right': 'right',
                                'justify': 'justify'
                            };

                            if (alignmentMap[element.alignment]) {
                                element.styleNames = element.styleNames || [];
                                element.styleNames.push('align-' + alignmentMap[element.alignment]);
                            }
                        }

                        // Preservar indentación
                        if (element.indent && element.indent.left) {
                            element.styleNames = element.styleNames || [];
                            element.styleNames.push('indent-' + element.indent.left);
                        }

                        return element;
                    }),
                };

                const result = await mammoth.convertToHtml({ arrayBuffer }, options);
                const html = result.value;

                console.log('📄 HTML convertido:', html.substring(0, 500));
                console.log('📏 Longitud HTML:', html.length);

                if (result.messages && result.messages.length > 0) {
                    console.log('ℹ️ Mensajes de conversión:', result.messages);
                }

                const quill = quillRef.current?.getEditor();
                if (quill) {
                    console.log('🔧 Editor Quill obtenido');

                    // Método 1: Usar dangerouslyPasteHTML (mejor para preservar estructura)
                    try {
                        quill.clipboard.dangerouslyPasteHTML(html, 'user');
                        console.log('✅ Método 1: dangerouslyPasteHTML ejecutado');
                    } catch (e) {
                        console.warn('⚠️ Método 1 falló, probando método 2:', e);

                        // Método 2: Convertir a Delta y aplicar
                        const delta = quill.clipboard.convert(html);
                        console.log('📋 Delta generado:', delta);
                        console.log('📋 Ops count:', delta.ops?.length);
                        quill.setContents(delta, 'user');
                        console.log('✅ Método 2: setContents ejecutado');
                    }

                    // Forzar actualización visual
                    quill.update('user');
                    quill.focus();

                    // Verificar contenido actual
                    const currentContent = quill.root.innerHTML;
                    console.log('📝 Contenido actual del editor:', currentContent.substring(0, 200));
                    console.log('📏 Longitud contenido:', currentContent.length);

                    // Disparar onChange manualmente si existe
                    if (onChange && typeof onChange === 'function') {
                        onChange(currentContent);
                        console.log('🔄 onChange disparado con contenido de longitud:', currentContent.length);
                    }

                    console.log('✅ Documento importado correctamente');
                }
            } catch (error) {
                console.error('❌ Error al importar Word:', error);
                alert('Error al importar el documento. Asegúrate de que sea un archivo .docx válido.');
            }
        };

        input.click();
    };

    return { importar: importarWord };
};

export default useImportarWord;
