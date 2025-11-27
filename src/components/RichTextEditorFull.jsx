// src/components/RichTextEditorFull.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import ImageResize from 'quill-image-resize-module-react';
import QuillBetterTable from 'quill-better-table';
import 'react-quill-new/dist/quill.snow.css';
import 'quill-better-table/dist/quill-better-table.css';
import './RichTextEditor.css';
import './QuillFonts.css';

// Registrar módulo de redimensionamiento de imágenes
Quill.register('modules/imageResize', ImageResize);

// Registrar módulo de tabla mejorado
Quill.register({
    'modules/better-table': QuillBetterTable
}, true);

// Configurar fuentes personalizadas - SOLO modificar whitelist, NO re-registrar
const FontAttributor = Quill.import('attributors/style/font');
FontAttributor.whitelist = [
    'arial', 'times-new-roman', 'courier-new', 'georgia', 'verdana',
    'helvetica', 'trebuchet', 'roboto', 'open-sans', 'lato',
    'montserrat', 'poppins', 'inter', 'raleway', 'ubuntu',
    'nunito', 'playfair-display', 'merriweather'
];
Quill.register(FontAttributor, true);

// Configurar tamaños personalizados
const SizeAttributor = Quill.import('attributors/style/size');
const sizeArr = [];
for (let i = 6; i <= 200; i++) {
    sizeArr.push(i + 'px');
}
SizeAttributor.whitelist = sizeArr;
Quill.register(SizeAttributor, true);

export default function RichTextEditorFull({
    value,
    onChange,
    placeholder = "Escribe aquí...",
    readOnly = false,
    toolbar = 'full',
    externalRef // Nueva prop para recibir ref externo
}) {
    // Usar el ref externo si se proporciona, sino crear uno interno
    const internalRef = useRef(null);
    const quillRef = externalRef || internalRef;

    const decreaseFontSize = () => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const format = quill.getFormat();
            let sizeNum = parseInt(format.size || '14px');
            if (isNaN(sizeNum)) sizeNum = 14;
            sizeNum = Math.max(6, sizeNum - 1);
            quill.format('size', sizeNum + 'px');
            updateFontSizeDisplay(sizeNum);
        }
    };

    const increaseFontSize = () => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const format = quill.getFormat();
            let sizeNum = parseInt(format.size || '14px');
            if (isNaN(sizeNum)) sizeNum = 14;
            sizeNum = sizeNum + 1;
            quill.format('size', sizeNum + 'px');
            updateFontSizeDisplay(sizeNum);
        }
    };

    const updateFontSizeDisplay = (size) => {
        const input = document.querySelector('.font-size-input');
        if (input) input.value = size;
    };

    const imageHandler = () => {
        const url = prompt('Ingresa la URL de la imagen:');
        if (url) {
            let finalUrl = url;
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

    const toolbarConfig = useMemo(() => {
        if (toolbar === 'minimal') {
            return [['bold', 'italic', 'underline', { 'color': [] }, { 'align': [] }]];
        }
        if (toolbar === 'basic') {
            return [[
                'bold', 'italic', 'underline',
                { 'color': [] }, { 'background': [] }, { 'align': [] },
                { 'list': 'ordered' }, { 'list': 'bullet' }, 'link', 'image'
            ]];
        }
        // Eliminados header, font y size por defecto
        return [[
            'bold', 'italic', 'underline', { 'color': [] }, { 'background': [] },
            'link', 'image', { 'align': [] }, { 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }, 'clean'
        ]];
    }, [toolbar]);

    const modules = useMemo(() => ({
        toolbar: { container: toolbarConfig, handlers: { image: imageHandler } },
        'better-table': {
            operationMenu: {
                items: {
                    unmergeCells: {
                        text: 'Desunir celdas'
                    },
                    insertColumnLeft: {
                        text: 'Insertar columna a la izquierda'
                    },
                    insertColumnRight: {
                        text: 'Insertar columna a la derecha'
                    },
                    insertRowAbove: {
                        text: 'Insertar fila arriba'
                    },
                    insertRowBelow: {
                        text: 'Insertar fila abajo'
                    },
                    mergeCells: {
                        text: 'Unir celdas'
                    },
                    deleteColumn: {
                        text: 'Eliminar columna'
                    },
                    deleteRow: {
                        text: 'Eliminar fila'
                    },
                    deleteTable: {
                        text: 'Eliminar tabla'
                    }
                },
                color: {
                    colors: ['#ffffff', '#ffc0cb', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#f44336', '#ff9800'],
                    text: 'Color de fondo'
                }
            }
        },
        keyboard: {
            bindings: QuillBetterTable.keyboardBindings
        },
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize'],
            handleStyles: { backgroundColor: '#1890ff', border: '1px solid white', borderRadius: '50%', width: '8px', height: '8px' }
        },
        clipboard: { matchVisual: false },
        history: { delay: 1000, maxStack: 100, userOnly: true }
    }), [toolbarConfig]);

    const formats = [
        'header', 'font', 'size', 'bold', 'italic', 'underline', 'color', 'background',
        'list', 'bullet', 'indent', 'align', 'link', 'image',
        'table', 'table-cell', 'table-row', 'table-header', 'table-body'
    ];

    useEffect(() => {
        if (!quillRef.current) return;
        console.log('Quill Version:', Quill.version);
        const editor = quillRef.current.getEditor();
        console.log('Better Table Module:', editor.getModule('better-table'));
        const toolbar = editor.getModule('toolbar').container;

        // Función helper para crear botones con tooltip
        const createBtn = (className, title, innerHTML, handler) => {
            const btn = document.createElement('button');
            btn.className = className;
            btn.title = title;
            btn.innerHTML = innerHTML;
            btn.type = 'button';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                handler();
            });
            return btn;
        };

        // Handlers para botones personalizados
        const undo = () => editor.history.undo();
        const redo = () => editor.history.redo();

        // Contenedor de Búsqueda
        const searchContainer = document.createElement('span');
        searchContainer.className = 'ql-formats custom-search-container';
        searchContainer.style.cssText = 'position: relative; display: inline-flex; align-items: center; margin-right: 5px; border: 1px solid #ccc; border-radius: 4px; padding: 2px; background: white;';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar...';
        searchInput.style.cssText = 'border: none; outline: none; font-size: 13px; width: 120px; padding: 0 4px; color: #444;';

        const searchCount = document.createElement('span');
        searchCount.style.cssText = 'font-size: 11px; color: #888; margin: 0 4px; min-width: 30px; text-align: center;';

        const searchBtn = document.createElement('button');
        searchBtn.className = 'custom-toolbar-btn';
        searchBtn.innerHTML = '<svg viewBox="0 0 18 18"><circle class="ql-stroke" cx="7" cy="7" r="5"></circle><line class="ql-stroke" x1="11" y1="11" x2="15" y2="15"></line></svg>';
        searchBtn.title = 'Buscar siguiente';
        searchBtn.style.cssText = 'border: none; background: none; cursor: pointer; padding: 2px; display: flex; align-items: center; justify-content: center;';

        let searchMatches = [];
        let currentMatchIndex = -1;
        let lastTerm = '';

        const clearHighlights = () => {
            searchMatches.forEach(match => {
                editor.formatText(match.index, match.length, 'background', false);
            });
        };

        const performSearch = (next = true) => {
            const term = searchInput.value;

            if (term !== lastTerm || !term) {
                clearHighlights();
                searchMatches = [];
                currentMatchIndex = -1;
                lastTerm = term;
                searchCount.textContent = '';

                if (!term) return;
            }

            if (searchMatches.length === 0) {
                const text = editor.getText();
                let index = text.toLowerCase().indexOf(term.toLowerCase());
                while (index !== -1) {
                    searchMatches.push({ index, length: term.length });
                    index = text.toLowerCase().indexOf(term.toLowerCase(), index + 1);
                }

                if (searchMatches.length > 0) {
                    searchMatches.forEach(match => {
                        editor.formatText(match.index, match.length, 'background', '#ffeb3b');
                    });
                    currentMatchIndex = 0;
                } else {
                    searchCount.textContent = '0/0';
                    return;
                }
            } else if (next) {
                currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
            }

            searchCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length}`;

            const current = searchMatches[currentMatchIndex];

            searchMatches.forEach(match => {
                editor.formatText(match.index, match.length, 'background', '#ffeb3b');
            });
            editor.formatText(current.index, current.length, 'background', '#ff9800');

            editor.setSelection(current.index, current.length);
            editor.scrollIntoView();
        };

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(true);
            }
        });

        searchInput.addEventListener('input', (e) => {
            if (e.target.value === '') {
                clearHighlights();
                searchMatches = [];
                currentMatchIndex = -1;
                lastTerm = '';
                searchCount.textContent = '';
            }
        });

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(true);
        });

        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchCount);
        searchContainer.appendChild(searchBtn);

        // Botón de Mayúsculas/Minúsculas (cicla entre opciones)
        let caseMode = 0; // 0: MAYÚSCULAS, 1: minúsculas, 2: Tipo Título
        const caseModes = [
            { name: 'MAYÚSCULAS', transform: text => text.toUpperCase() },
            { name: 'minúsculas', transform: text => text.toLowerCase() },
            { name: 'Tipo Título', transform: text => text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase()) }
        ];

        const caseBtn = document.createElement('button');
        caseBtn.className = 'custom-toolbar-btn';
        caseBtn.innerHTML = '<svg viewBox="0 0 18 18"><text x="2" y="13" font-family="serif" font-size="13" font-weight="bold">Aa</text></svg>';
        caseBtn.title = 'Cambiar mayúsculas/minúsculas (Aa)';
        caseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const range = editor.getSelection();
            if (range && range.length > 0) {
                const contents = editor.getContents(range.index, range.length);
                const newOps = contents.ops.map(op => {
                    if (typeof op.insert === 'string') {
                        return { ...op, insert: caseModes[caseMode].transform(op.insert) };
                    }
                    return op;
                });

                const Delta = Quill.import('delta');
                const update = new Delta().retain(range.index).delete(range.length);
                newOps.forEach(op => update.push(op));
                editor.updateContents(update, 'user');
                editor.setSelection(range.index, range.length);

                // Ciclar al siguiente modo
                caseMode = (caseMode + 1) % caseModes.length;
                caseBtn.title = `Cambiar a: ${caseModes[caseMode].name}`;
            }
        });

        const print = () => window.print();

        // === ORGANIZAR TOOLBAR EN ORDEN ÓPTIMO ===
        // GRUPO 1: Historial (Deshacer/Rehacer)
        const historyGroup = document.createElement('span');
        historyGroup.className = 'ql-formats';
        historyGroup.appendChild(createBtn('ql-undo custom-toolbar-btn', 'Deshacer (Ctrl+Z)', '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path></svg>', undo));
        historyGroup.appendChild(createBtn('ql-redo custom-toolbar-btn', 'Rehacer (Ctrl+Y)', '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>', redo));

        // GRUPO 2: Sistema de búsqueda y utilidades
        const utilityGroup = document.createElement('span');
        utilityGroup.className = 'ql-formats';
        utilityGroup.appendChild(searchContainer);
        utilityGroup.appendChild(caseBtn);
        utilityGroup.appendChild(createBtn('ql-print custom-toolbar-btn', 'Imprimir (Ctrl+P)', '<svg viewBox="0 0 18 18"><path class="ql-fill" d="M14,4H4A2,2,0,0,0,2,6V10a2,2,0,0,0,2,2H4v2a2,2,0,0,0,2,2H12a2,2,0,0,0,2-2V12h0a2,2,0,0,0,2-2V6A2,2,0,0,0,14,4ZM12,14H6V10h6v4Z"></path><rect class="ql-fill" x="4" y="1" width="10" height="3"></rect></svg>', print));

        // Controles de tamaño de fuente
        const sizeControls = document.createElement('span');
        sizeControls.className = 'ql-formats custom-size-controls';

        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.className = 'font-size-input';
        sizeInput.value = '14';
        sizeInput.min = '6';
        sizeInput.max = '200';
        sizeInput.style.cssText = 'width: 45px; padding: 2px 4px; font-size: 13px; color: #444; border: 1px solid #d9d9d9; border-radius: 2px; text-align: center; outline: none;';

        const updateSizeInput = () => {
            const range = editor.getSelection();
            if (range) {
                const format = editor.getFormat(range);
                if (format.size) {
                    sizeInput.value = parseInt(format.size);
                }
            }
        };
        editor.on('selection-change', updateSizeInput);

        sizeInput.addEventListener('change', () => {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                let newSize = parseInt(sizeInput.value);
                if (isNaN(newSize) || newSize < 6) newSize = 6;
                if (newSize > 200) newSize = 200;
                sizeInput.value = newSize;
                quill.format('size', newSize + 'px');
            }
        });
        sizeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); sizeInput.blur(); }
        });

        // Agregar tooltip al input
        sizeInput.title = 'Tamaño de fuente (6-200 px)';

        sizeControls.appendChild(createBtn('ql-size-decrease custom-toolbar-btn', 'Reducir tamaño de fuente (−)', '<span style="font-size: 16px; font-weight: bold;">−</span>', decreaseFontSize));
        sizeControls.appendChild(sizeInput);
        sizeControls.appendChild(createBtn('ql-size-increase custom-toolbar-btn', 'Aumentar tamaño de fuente (+)', '<span style="font-size: 16px; font-weight: bold;">+</span>', increaseFontSize));

        // Botón de Tabla con Grid Selector
        // Botón de Tabla
        const tableContainer = document.createElement('span');
        tableContainer.className = 'ql-formats custom-table-container';
        tableContainer.style.cssText = 'position: relative; display: inline-block; margin-right: 5px;';

        const tableBtn = document.createElement('button');
        tableBtn.className = 'custom-toolbar-btn';
        tableBtn.innerHTML = '<svg viewBox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect><line class="ql-stroke" x1="9" x2="9" y1="3" y2="15"></line><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line></svg>';
        tableBtn.title = 'Insertar tabla (movible y editable)';

        const tableMenu = document.createElement('div');
        tableMenu.className = 'custom-table-menu';
        tableMenu.style.cssText = 'display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; padding: 10px; min-width: 200px;';

        // Función para insertar tabla
        const insertTable = (r, c) => {
            const quill = quillRef.current?.getEditor();
            if (quill) {
                const tableModule = quill.getModule('better-table');
                if (tableModule) {
                    tableModule.insertTable(r, c);
                } else {
                    console.warn('Módulo de tabla mejorado no encontrado');
                }
            }
            tableMenu.style.display = 'none';
        };

        // Inputs Manuales
        const manualInputContainer = document.createElement('div');
        manualInputContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        const inputsRow = document.createElement('div');
        inputsRow.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px;';

        const rowsInput = document.createElement('input');
        rowsInput.type = 'number';
        rowsInput.min = '1';
        rowsInput.max = '50';
        rowsInput.placeholder = 'Filas';
        rowsInput.title = 'Filas';
        rowsInput.style.cssText = 'width: 60px; padding: 4px 8px; font-size: 13px; border: 1px solid #d9d9d9; border-radius: 4px; outline: none; text-align: center;';

        const colsInput = document.createElement('input');
        colsInput.type = 'number';
        colsInput.min = '1';
        colsInput.max = '20';
        colsInput.placeholder = 'Cols';
        colsInput.title = 'Columnas';
        colsInput.style.cssText = 'width: 60px; padding: 4px 8px; font-size: 13px; border: 1px solid #d9d9d9; border-radius: 4px; outline: none; text-align: center;';

        const manualBtn = document.createElement('button');
        manualBtn.textContent = 'Insertar Tabla';
        manualBtn.style.cssText = 'width: 100%; padding: 6px 12px; font-size: 13px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background 0.2s; font-weight: 500;';
        manualBtn.addEventListener('mouseenter', () => manualBtn.style.background = '#40a9ff');
        manualBtn.addEventListener('mouseleave', () => manualBtn.style.background = '#1890ff');

        manualBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const r = parseInt(rowsInput.value);
            const c = parseInt(colsInput.value);
            if (r > 0 && c > 0) {
                insertTable(r, c);
            } else {
                alert('Por favor ingrese valores válidos (mínimo 1)');
            }
        });

        // Permitir Enter en los inputs
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                manualBtn.click();
            }
        };
        rowsInput.addEventListener('keypress', handleEnter);
        colsInput.addEventListener('keypress', handleEnter);

        inputsRow.appendChild(rowsInput);
        inputsRow.appendChild(document.createTextNode(' x '));
        inputsRow.appendChild(colsInput);

        manualInputContainer.appendChild(inputsRow);
        manualInputContainer.appendChild(manualBtn);

        tableMenu.appendChild(manualInputContainer);

        tableContainer.addEventListener('mouseenter', () => tableMenu.style.display = 'block');
        tableContainer.addEventListener('mouseleave', () => tableMenu.style.display = 'none');

        tableContainer.appendChild(tableBtn);
        tableContainer.appendChild(tableMenu);



        // Botón personalizado de fuentes con búsqueda
        const customFontPicker = document.createElement('span');
        customFontPicker.className = 'ql-formats custom-font-picker';
        customFontPicker.style.cssText = 'position: relative; display: inline-block; margin-right: 5px;';

        const fontInput = document.createElement('input');
        fontInput.className = 'custom-font-input';
        fontInput.type = 'text';
        fontInput.placeholder = 'Fuente...';
        fontInput.value = 'Sans Serif'; // Valor inicial
        fontInput.title = 'Seleccionar tipo de fuente';
        fontInput.style.cssText = 'width: 120px; padding: 2px 4px; font-size: 13px; color: #444; border: 1px solid #d9d9d9; border-radius: 2px; outline: none; cursor: text;';

        const fontMenu = document.createElement('div');
        fontMenu.className = 'custom-font-menu';
        fontMenu.style.cssText = 'display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 180px; max-height: 300px; overflow-y: auto;';

        const fonts = [
            { value: 'arial', label: 'Arial' },
            { value: 'times-new-roman', label: 'Times New Roman' },
            { value: 'courier-new', label: 'Courier New' },
            { value: 'georgia', label: 'Georgia' },
            { value: 'verdana', label: 'Verdana' },
            { value: 'helvetica', label: 'Helvetica' },
            { value: 'trebuchet', label: 'Trebuchet' },
            { value: 'roboto', label: 'Roboto' },
            { value: 'open-sans', label: 'Open Sans' },
            { value: 'lato', label: 'Lato' },
            { value: 'montserrat', label: 'Montserrat' },
            { value: 'poppins', label: 'Poppins' },
            { value: 'inter', label: 'Inter' },
            { value: 'raleway', label: 'Raleway' },
            { value: 'ubuntu', label: 'Ubuntu' },
            { value: 'nunito', label: 'Nunito' },
            { value: 'playfair-display', label: 'Playfair Display' },
            { value: 'merriweather', label: 'Merriweather' }
        ];

        const renderFonts = (filterText = '') => {
            fontMenu.innerHTML = '';
            const filtered = fonts.filter(f => f.label.toLowerCase().includes(filterText.toLowerCase()));

            if (filtered.length === 0) {
                const noResult = document.createElement('div');
                noResult.textContent = 'No encontrado';
                noResult.style.cssText = 'padding: 8px 12px; color: #999; font-size: 13px;';
                fontMenu.appendChild(noResult);
                return;
            }

            filtered.forEach(font => {
                const item = document.createElement('div');
                item.className = 'font-menu-item';
                item.textContent = font.label;
                item.style.cssText = `padding: 8px 12px; cursor: pointer; font-family: ${font.label}; font-size: 14px;`;
                item.addEventListener('mouseenter', () => item.style.background = '#f0f0f0');
                item.addEventListener('mouseleave', () => item.style.background = 'white');
                item.addEventListener('mousedown', (e) => { // Usar mousedown para evitar blur antes del click
                    e.preventDefault();
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        quill.format('font', font.value);
                        fontInput.value = font.label;
                    }
                    fontMenu.style.display = 'none';
                });
                fontMenu.appendChild(item);
            });
        };

        renderFonts();

        // Event listeners para el input
        fontInput.addEventListener('focus', () => {
            fontMenu.style.display = 'block';
            fontInput.select();
            renderFonts(); // Mostrar todas al enfocar
        });

        fontInput.addEventListener('input', (e) => {
            renderFonts(e.target.value);
            fontMenu.style.display = 'block';
        });

        fontInput.addEventListener('blur', () => {
            // Pequeño delay para permitir click en el menú
            setTimeout(() => {
                fontMenu.style.display = 'none';
                // Restaurar nombre de fuente actual si no se seleccionó nada
                updateFontDisplay();
            }, 200);
        });

        // Actualizar input cuando cambia la selección
        const updateFontDisplay = () => {
            const quill = quillRef.current?.getEditor();
            if (!quill) return;

            const range = quill.getSelection();
            if (range) {
                const format = quill.getFormat(range);
                const currentFontValue = format.font;
                const fontObj = fonts.find(f => f.value === currentFontValue);
                // Si no hay fuente específica, asumir Sans Serif (default de Quill) o la que sea default
                fontInput.value = fontObj ? fontObj.label : 'Sans Serif';
            }
        };

        editor.on('selection-change', updateFontDisplay);

        customFontPicker.appendChild(fontInput);
        customFontPicker.appendChild(fontMenu);

        // === INSERTAR CONTROLES EN ORDEN ÓPTIMO ===
        // Orden: Historial -> Tabla -> Fuente/Tamaño -> (Quill defaults) -> Utilidades

        // Primero insertar al inicio
        if (toolbar.firstChild) {
            // Insertar en orden inverso porque insertBefore agrega antes del firstChild
            toolbar.insertBefore(sizeControls, toolbar.firstChild);
            toolbar.insertBefore(customFontPicker, toolbar.firstChild);
            toolbar.insertBefore(tableContainer, toolbar.firstChild);
            toolbar.insertBefore(historyGroup, toolbar.firstChild);
        } else {
            toolbar.appendChild(historyGroup);
            toolbar.appendChild(tableContainer);
            toolbar.appendChild(customFontPicker);
            toolbar.appendChild(sizeControls);
        }

        // Agregar utilidades al final
        toolbar.appendChild(utilityGroup);

        // --- MENÚ CONTEXTUAL DE TABLA ---
        const tableToolbar = document.createElement('div');
        tableToolbar.className = 'ql-tooltip ql-editing custom-table-toolbar';
        tableToolbar.style.cssText = 'display: none; position: absolute; z-index: 1000; background: white; border: 1px solid #ccc; box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 5px; border-radius: 4px; white-space: nowrap;';

        // Botones de acción para la tabla
        const createTableBtn = (icon, title, action) => {
            const btn = document.createElement('button');
            btn.innerHTML = icon;
            btn.title = title;
            btn.className = 'custom-toolbar-btn';
            btn.style.cssText = 'margin: 0 2px; padding: 2px 4px; cursor: pointer; background: none; border: none;';
            btn.addEventListener('mouseenter', () => btn.style.background = '#f0f0f0');
            btn.addEventListener('mouseleave', () => btn.style.background = 'none');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                action();
            });
            return btn;
        };

        const tableActions = [
            { icon: '⬆️', title: 'Insertar fila arriba', action: 'insertRowAbove' },
            { icon: '⬇️', title: 'Insertar fila abajo', action: 'insertRowBelow' },
            { icon: '⬅️', title: 'Insertar columna izquierda', action: 'insertColumnLeft' },
            { icon: '➡️', title: 'Insertar columna derecha', action: 'insertColumnRight' },
            { icon: '❌F', title: 'Eliminar fila', action: 'deleteRow' },
            { icon: '❌C', title: 'Eliminar columna', action: 'deleteColumn' },
            { icon: '🗑️', title: 'Eliminar tabla', action: 'deleteTable' }
        ];

        tableActions.forEach(item => {
            tableToolbar.appendChild(createTableBtn(item.icon, item.title, () => {
                const tableModule = editor.getModule('better-table');
                if (tableModule && tableModule[item.action]) {
                    tableModule[item.action]();
                }
            }));
        });

        // Separador
        const sep = document.createElement('span');
        sep.style.cssText = 'display: inline-block; width: 1px; height: 16px; background: #ccc; margin: 0 5px; vertical-align: middle;';
        tableToolbar.appendChild(sep);

        // Color de fondo de celda
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.title = 'Color de fondo de celda';
        colorInput.style.cssText = 'width: 24px; height: 24px; padding: 0; border: none; background: none; cursor: pointer; vertical-align: middle;';
        colorInput.addEventListener('change', (e) => {
            const color = e.target.value;
            const range = editor.getSelection();
            if (range) {
                // Enfoque directo: encontrar la celda activa y aplicar estilo
                const [leaf] = editor.getLeaf(range.index);
                if (leaf && leaf.parent) {
                    // Buscar el nodo TD o TH ascendiendo en el DOM
                    let domNode = leaf.domNode;
                    while (domNode && domNode !== editor.root) {
                        if (domNode.tagName === 'TD' || domNode.tagName === 'TH') {
                            domNode.style.backgroundColor = color;
                            // Forzar actualización si es necesario, aunque el estilo directo debería ser visible
                            break;
                        }
                        domNode = domNode.parentNode;
                    }
                }
            }
        });
        tableToolbar.appendChild(colorInput);

        editor.container.appendChild(tableToolbar);

        // Lógica de posicionamiento
        editor.on('selection-change', (range) => {
            if (range) {
                const bounds = editor.getBounds(range.index);
                const [leaf] = editor.getLeaf(range.index);
                if (leaf && leaf.parent && leaf.parent.domNode && (leaf.parent.domNode.tagName === 'TD' || leaf.parent.domNode.tagName === 'TH' || leaf.parent.domNode.closest('td, th'))) {
                    // Estamos en una tabla
                    const cell = leaf.parent.domNode.closest('td, th');
                    if (cell) {
                        const cellRect = cell.getBoundingClientRect();
                        const editorRect = editor.container.getBoundingClientRect();

                        tableToolbar.style.display = 'block';
                        tableToolbar.style.top = (cellRect.top - editorRect.top - 40) + 'px';
                        tableToolbar.style.left = (cellRect.left - editorRect.left) + 'px';
                        return;
                    }
                }
            }
            tableToolbar.style.display = 'none';
        });

    }, []);

    // Efecto para limpiar el editor cuando el valor es vacío (para el botón Limpiar Todo)
    useEffect(() => {
        if (quillRef.current && (value === '' || value === '<p><br></p>')) {
            const editor = quillRef.current.getEditor();
            // Solo limpiar si hay contenido real (evitar bucles)
            if (editor.getLength() > 1) {
                editor.setContents([]);
            }
        }
    }, [value]);

    return (
        <div className="rich-text-editor-wrapper">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={readOnly}
            />
        </div>
    );
}
