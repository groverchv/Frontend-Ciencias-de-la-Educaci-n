// src/pages/Dashboard/Contenido/Funcionalidades/ExportarWord.jsx
import React from 'react';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Funcionalidad para exportar el contenido del editor a Word (.docx)
 * Convierte el contenido de Quill Delta a formato Word
 */
export const useExportarWord = (quillRef) => {
    const exportarWord = async () => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        try {
            // Obtener el contenido del editor como Delta (formato de Quill)
            const delta = quill.getContents();
            const paragraphs = [];

            let currentParagraph = [];
            let paragraphAlignment = AlignmentType.LEFT;

            // Procesar cada operación del Delta
            delta.ops.forEach((op, index) => {
                if (typeof op.insert === 'string') {
                    const text = op.insert;
                    const attributes = op.attributes || {};

                    // Detectar saltos de línea
                    const lines = text.split('\n');

                    lines.forEach((line, lineIndex) => {
                        if (line.length > 0) {
                            // Crear TextRun con formato
                            const textRun = new TextRun({
                                text: line,
                                bold: attributes.bold || false,
                                italics: attributes.italic || false,
                                underline: attributes.underline ? {} : undefined,
                                strike: attributes.strike || false,
                                color: attributes.color ? attributes.color.replace('#', '') : undefined,
                                size: attributes.size ? parseInt(attributes.size) * 2 : undefined, // Convertir px a half-points
                                font: attributes.font || 'Arial'
                            });
                            currentParagraph.push(textRun);
                        }

                        // Si hay salto de línea (excepto la última línea vacía)
                        if (lineIndex < lines.length - 1) {
                            // Obtener alineación del párrafo
                            if (attributes.align === 'center') paragraphAlignment = AlignmentType.CENTER;
                            else if (attributes.align === 'right') paragraphAlignment = AlignmentType.RIGHT;
                            else if (attributes.align === 'justify') paragraphAlignment = AlignmentType.JUSTIFIED;
                            else paragraphAlignment = AlignmentType.LEFT;

                            // Crear párrafo y resetear
                            paragraphs.push(new Paragraph({
                                children: currentParagraph.length > 0 ? currentParagraph : [new TextRun('')],
                                alignment: paragraphAlignment
                            }));
                            currentParagraph = [];
                            paragraphAlignment = AlignmentType.LEFT;
                        }
                    });
                } else if (op.insert && typeof op.insert === 'object') {
                    // Manejar imágenes u otros embeds
                    // Por ahora, agregar un párrafo vacío para mantener el flujo
                    if (currentParagraph.length > 0) {
                        paragraphs.push(new Paragraph({
                            children: currentParagraph,
                            alignment: paragraphAlignment
                        }));
                        currentParagraph = [];
                    }
                }
            });

            // Agregar último párrafo si existe
            if (currentParagraph.length > 0) {
                paragraphs.push(new Paragraph({
                    children: currentParagraph,
                    alignment: paragraphAlignment
                }));
            }

            // Si no hay contenido, agregar un párrafo vacío
            if (paragraphs.length === 0) {
                paragraphs.push(new Paragraph({ children: [new TextRun('')] }));
            }

            // Crear documento Word
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: paragraphs
                }]
            });

            // Generar y descargar
            const blob = await Packer.toBlob(doc);
            saveAs(blob, 'documento.docx');
            console.log('✅ Documento exportado correctamente');
        } catch (error) {
            console.error('❌ Error al exportar a Word:', error);
            alert('Error al exportar el documento. Por favor, intenta de nuevo.');
        }
    };

    return { exportar: exportarWord };
};

export default useExportarWord;
