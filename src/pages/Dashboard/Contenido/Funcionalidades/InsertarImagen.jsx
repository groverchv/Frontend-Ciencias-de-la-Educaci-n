// src/pages/Dashboard/Contenido/Funcionalidades/InsertarImagen.jsx
import React from 'react';

/**
 * Funcionalidad para insertar imágenes desde URL
 * Soporta URLs normales y URLs de Google Drive
 */
export const useInsertarImagen = (quillRef) => {
    const insertarImagen = () => {
        const url = prompt('Ingresa la URL de la imagen:');
        if (url) {
            let finalUrl = url;

            // Convertir URLs de Google Drive a formato directo
            if (url.includes('drive.google.com')) {
                let fileId = null;
                const match1 = url.match(/\/file\/d\/([^\/\?]+)/);
                if (match1) fileId = match1[1];
                const match2 = url.match(/[?\&]id=([^\&]+)/);
                if (!fileId && match2) fileId = match2[1];
                if (fileId) finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            }

            const quill = quillRef.current?.getEditor();
            if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', finalUrl);
                quill.setSelection(range.index + 1);
            }
        }
    };

    return { insertarImagen };
};

export default useInsertarImagen;
