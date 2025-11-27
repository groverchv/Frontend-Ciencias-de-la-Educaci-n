// src/pages/Dashboard/Contenido/Funcionalidades/CambiarMayusculas.jsx
import React from 'react';
import { Quill } from 'react-quill-new';

/**
 * Funcionalidad para cambiar entre mayúsculas/minúsculas/título
 * Cicla entre tres modos de transformación de texto
 */
export const useCambiarMayusculas = (quillRef) => {
    let modoActual = 0; // 0: MAYÚSCULAS, 1: minúsculas, 2: Tipo Título

    const modos = [
        { name: 'MAYÚSCULAS', transform: text => text.toUpperCase() },
        { name: 'minúsculas', transform: text => text.toLowerCase() },
        { name: 'Tipo Título', transform: text => text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase()) }
    ];

    const cambiarMayusculas = (setTooltip) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection();
        if (range && range.length > 0) {
            const contents = quill.getContents(range.index, range.length);
            const newOps = contents.ops.map(op => {
                if (typeof op.insert === 'string') {
                    return { ...op, insert: modos[modoActual].transform(op.insert) };
                }
                return op;
            });

            const Delta = Quill.import('delta');
            const update = new Delta().retain(range.index).delete(range.length);
            newOps.forEach(op => update.push(op));
            quill.updateContents(update, 'user');
            quill.setSelection(range.index, range.length);

            // Ciclar al siguiente modo
            modoActual = (modoActual + 1) % modos.length;

            // Actualizar tooltip si se proporciona la función
            if (setTooltip) {
                setTooltip(`Cambiar a: ${modos[modoActual].name}`);
            }
        }
    };

    const obtenerProximoModo = () => {
        return modos[modoActual].name;
    };

    return { cambiarMayusculas, obtenerProximoModo };
};

export default useCambiarMayusculas;
