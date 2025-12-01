import React, { useState, useEffect } from "react";
import { Select, InputNumber, Space, Typography, Pagination } from "antd";

const { Text } = Typography;
const { Option } = Select;

/**
 * Componente reutilizable para paginación avanzada
 * @param {number} current - Página actual
 * @param {number} total - Total de items
 * @param {number} pageSize - Items por página actual
 * @param {function} onChange - Función (page, pageSize) => void
 */
export default function Paginacion({ current, total, pageSize, onChange }) {
    const [customSize, setCustomSize] = useState(pageSize);

    // Opciones predefinidas
    const pageSizeOptions = [5, 10, 15, 20];

    useEffect(() => {
        setCustomSize(pageSize);
    }, [pageSize]);

    const handlePageSizeChange = (value) => {
        // Si value es "all", ponemos un número muy grande o el total
        if (value === "all") {
            onChange(1, total > 0 ? total : 10000); // Muestra todos
        } else {
            onChange(1, Number(value));
        }
    };

    const handleCustomSizeChange = (value) => {
        if (value && value > 0) {
            onChange(1, Number(value));
        }
    };

    // Determinar si el pageSize actual es uno de los predefinidos o "custom"
    const isAll = pageSize >= total && total > 0 && !pageSizeOptions.includes(pageSize);
    const isCustom = !pageSizeOptions.includes(pageSize) && !isAll;

    // Valor para el Select
    let selectValue = pageSize;
    if (isAll) selectValue = "all";
    else if (isCustom) selectValue = "custom";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
                flexWrap: "wrap",
                gap: 10,
            }}
        >
            <Space wrap>
                <Text>Mostrar:</Text>
                <Select
                    value={selectValue}
                    style={{ width: 120 }}
                    onChange={handlePageSizeChange}
                >
                    {pageSizeOptions.map((size) => (
                        <Option key={size} value={size}>
                            {size} / pág
                        </Option>
                    ))}
                    <Option value="all">Todos</Option>
                    <Option value="custom">Personalizado</Option>
                </Select>

                {selectValue === "custom" && (
                    <InputNumber
                        min={1}
                        max={1000}
                        value={customSize}
                        onChange={handleCustomSizeChange}
                        placeholder="#"
                        style={{ width: 70 }}
                    />
                )}
            </Space>

            <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                showSizeChanger={false} // Controlamos el size con nuestro Select custom
                showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} items`}
            />
        </div>
    );
}
