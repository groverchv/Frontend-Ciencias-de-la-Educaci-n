# Funcionalidades del Editor

Esta carpeta contiene todas las funcionalidades del editor de texto enriquecido organizadas como **custom hooks reutilizables**.

## 📁 Estructura

```
Funcionalidades/
├── ImportarWord.jsx          - Importar documentos de Word (.docx)
├── ExportarWord.jsx          - Exportar contenido a Word (.docx)
├── CambiarMayusculas.jsx     - Transformar texto (mayúsculas/minúsculas/título)
├── TamanoFuente.jsx          - Control de tamaño de fuente
├── InsertarImagen.jsx        - Insertar imágenes desde URL
└── index.js                  - Exportaciones centrales y hook combinado
```

## 🔧 Uso Individual

Cada funcionalidad se puede usar de forma independiente:

```javascript
import { useImportarWord } from './Funcionalidades/ImportarWord';
import { useExportarWord } from './Funcionalidades/ExportarWord';

function MiComponente({ quillRef, onChange }) {
    const { importarWord } = useImportarWord(quillRef, onChange);
    const { exportarWord } = useExportarWord(quillRef);
    
    return (
        <>
            <button onClick={importarWord}>Importar Word</button>
            <button onClick={exportarWord}>Exportar Word</button>
        </>
    );
}
```

## 🎯 Uso Combinado

También puedes usar el hook combinado que incluye todas las funcionalidades:

```javascript
import { useFuncionalidadesEditor } from './Funcionalidades';

function EditorCompleto({ quillRef, onChange }) {
    const {
        importarWord,
        exportarWord,
        cambiarMayusculas,
        disminuirTamano,
        aumentarTamano,
        insertarImagen
    } = useFuncionalidadesEditor(quillRef, onChange);
    
    return (
        <div className="toolbar">
            <button onClick={importarWord}>📥 Importar</button>
            <button onClick={exportarWord}>📤 Exportar</button>
            <button onClick={cambiarMayusculas}>Aa</button>
            <button onClick={disminuirTamano}>−</button>
            <button onClick={aumentarTamano}>+</button>
            <button onClick={insertarImagen}>🖼️</button>
        </div>
    );
}
```

## 📋 Funcionalidades Disponibles

### 1. ImportarWord
**Hook**: `useImportarWord(quillRef, onChange)`

**Retorna**: `{ importarWord }`

**Uso**: Importa documentos .docx y los convierte a contenido de Quill

### 2. ExportarWord
**Hook**: `useExportarWord(quillRef)`

**Retorna**: `{ exportarWord }`

**Uso**: Exporta el contenido actual a un archivo .docx

### 3. CambiarMayusculas
**Hook**: `useCambiarMayusculas(quillRef)`

**Retorna**: `{ cambiarMayusculas, obtenerProximoModo }`

**Uso**: Transforma el texto seleccionado entre MAYÚSCULAS, minúsculas y Tipo Título

### 4. TamanoFuente
**Hook**: `useTamanoFuente(quillRef)`

**Retorna**: `{ disminuirTamano, aumentarTamano, actualizarVisualizacion }`

**Uso**: Controla el tamaño de fuente del texto seleccionado

###  InsertarImagen
**Hook**: `useInsertarImagen(quillRef)`

**Retorna**: `{ insertarImagen }`

**Uso**: Inserta imágenes desde URL (incluye soporte para Google Drive)

## 🛠️ Dependencias

Estas funcionalidades requieren:
- `mammoth` - Para importar Word
- `docx` - Para exportar Word
- `file-saver` - Para descargar archivos
- `react-quill-new` - Editor Quill

## ✨ Ventajas de esta Estructura

1. **Modularidad**: Cada funcionalidad está en su propio archivo
2. **Reutilizabilidad**: Se pueden usar en diferentes componentes
3. **Mantenibilidad**: Fácil de encontrar y actualizar código
4. **Testing**: Cada hook se puede testear independientemente
5. **Nombres en español**: Código más accesible para el equipo
