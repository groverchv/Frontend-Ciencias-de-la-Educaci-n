// src/pages/Dashboard/Contenido/EditorFuncionalidades.jsx
import React from 'react';
import { useFuncionalidadesEditor } from './Funcionalidades';

/**
 * Componente que provee todas las funcionalidades del editor
 * Este es el componente unificador que usa todos los hooks de funcionalidades
 * 
 * @param {object} quillRef - Referencia al editor Quill
 * @param {function} onChange - Callback cuando el contenido cambia
 * @param {function} children - Función render prop que recibe todas las funcionalidades
 */
export const EditorFuncionalidades = ({ quillRef, onChange, children }) => {
    const funcionalidades = useFuncionalidadesEditor(quillRef, onChange);

    // Usar render props para pasar las funcionalidades a los componentes hijos
    if (typeof children === 'function') {
        return children(funcionalidades);
    }

    // Si no se usa render props, simplemente no renderizar nada
    return null;
};

/**
 * Ejemplo de uso:
 * 
 * <EditorFuncionalidades quillRef={quillRef} onChange={onChange}>
 *     {({ importarWord, exportarWord, cambiarMayusculas, ... }) => (
 *         <div className="toolbar">
 *             <button onClick={importarWord}>Importar Word</button>
 *             <button onClick={exportarWord}>Exportar Word</button>
 *             <button onClick={cambiarMayusculas}>Cambiar Mayúsculas</button>
 *         </div>
 *     )}
 * </EditorFuncionalidades>
 */

export default EditorFuncionalidades;
