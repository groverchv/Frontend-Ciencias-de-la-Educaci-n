// src/pages/Dashboard/Contenido/Funcionalidades/index.js
/**
 * Exportaciones centrales de todas las funcionalidades del editor
 * Este archivo agrupa todas las funcionalidades en un solo punto de importación
 */

export { useImportarWord } from './ImportarWord';
export { useExportarWord } from './ExportarWord';
export { useCambiarMayusculas } from './CambiarMayusculas';
export { useTamanoFuente } from './TamanoFuente';
export { useInsertarImagen } from './InsertarImagen';

// Hook combinado que exporta todas las funcionalidades
export const useFuncionalidadesEditor = (quillRef, onChange) => {
    const { importarWord } = useImportarWord(quillRef, onChange);
    const { exportarWord } = useExportarWord(quillRef);
    const { cambiarMayusculas, obtenerProximoModo } = useCambiarMayusculas(quillRef);
    const { disminuirTamano, aumentarTamano, actualizarVisualizacion } = useTamanoFuente(quillRef);
    const { insertarImagen } = useInsertarImagen(quillRef);

    return {
        // Funcionalidades de Word
        importarWord,
        exportarWord,

        // Transformación de texto
        cambiarMayusculas,
        obtenerProximoModo,

        // Tamaño de fuente
        disminuirTamano,
        aumentarTamano,
        actualizarVisualizacion,

        // Insertar contenido
        insertarImagen
    };
};
