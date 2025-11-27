// src/pages/Dashboard/Contenido/Funcionalidades/TamanoFuente.jsx
import React from 'react';

/**
 * Funcionalidad para controlar el tamaño de fuente
 * Permite aumentar, disminuir y actualizar el tamaño de fuente
 */
export const useTamanoFuente = (quillRef) => {
    const disminuirTamano = () => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const format = quill.getFormat();
            let sizeNum = parseInt(format.size || '14px');
            if (isNaN(sizeNum)) sizeNum = 14;
            sizeNum = Math.max(6, sizeNum - 1);
            quill.format('size', sizeNum + 'px');
            actualizarVisualizacion(sizeNum);
        }
    };

    const aumentarTamano = () => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const format = quill.getFormat();
            let sizeNum = parseInt(format.size || '14px');
            if (isNaN(sizeNum)) sizeNum = 14;
            sizeNum = sizeNum + 1;
            quill.format('size', sizeNum + 'px');
            actualizarVisualizacion(sizeNum);
        }
    };

    const actualizarVisualizacion = (size) => {
        const input = document.querySelector('.font-size-input');
        if (input) input.value = size;
    };

    return { disminuirTamano, aumentarTamano, actualizarVisualizacion };
};

export default useTamanoFuente;
