// src/components/TableGridPicker.js
// Selector visual de tabla estilo Word

export const createTableGridPicker = (tableModule, buttonElement) => {
    // Eliminar selectores previos
    document.querySelectorAll('.table-grid-picker').forEach(el => el.remove());

    // Crear el contenedor del grid picker
    const gridPicker = document.createElement('div');
    gridPicker.className = 'table-grid-picker';
    gridPicker.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    // Crear la etiqueta
    const label = document.createElement('div');
    label.style.cssText = `
        text-align: center;
        font-size: 12px;
        color: #595959;
        min-height: 18px;
        font-weight: 500;
    `;
    label.textContent = 'Selecciona tamaño';

    // Crear la cuadrícula
    const grid = document.createElement('div');
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(10, 20px);
        grid-template-rows: repeat(10, 20px);
        gap: 2px;
    `;

    // Crear celdas
    const cells = [];
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `
            width: 20px;
            height: 20px;
            border: 1px solid #d9d9d9;
            background: white;
            cursor: pointer;
            transition: all 0.1s;
        `;
        cell.dataset.row = Math.floor(i / 10);
        cell.dataset.col = i % 10;

        cell.addEventListener('mouseenter', (e) => {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);

            cells.forEach((c, idx) => {
                const cRow = Math.floor(idx / 10);
                const cCol = idx % 10;
                if (cRow <= row && cCol <= col) {
                    c.style.background = '#e6f7ff';
                    c.style.borderColor = '#1890ff';
                } else {
                    c.style.background = 'white';
                    c.style.borderColor = '#d9d9d9';
                }
            });

            label.textContent = `${row + 1} × ${col + 1}`;
        });

        cell.addEventListener('click', (e) => {
            const row = parseInt(e.target.dataset.row) + 1;
            const col = parseInt(e.target.dataset.col) + 1;
            tableModule.insertTable(row, col);
            gridPicker.remove();
        });

        cells.push(cell);
        grid.appendChild(cell);
    }

    gridPicker.appendChild(label);
    gridPicker.appendChild(grid);

    // Posicionar el picker
    const rect = buttonElement.getBoundingClientRect();
    gridPicker.style.top = `${rect.bottom + 5}px`;
    gridPicker.style.left = `${rect.left}px`;

    document.body.appendChild(gridPicker);

    // Cerrar al hacer clic fuera
    const closeHandler = (e) => {
        if (!gridPicker.contains(e.target) && !buttonElement.contains(e.target)) {
            gridPicker.remove();
            document.removeEventListener('click', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 100);

    return gridPicker;
};
