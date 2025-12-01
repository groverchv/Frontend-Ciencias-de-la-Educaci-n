import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

/**
 * Componente reutilizable para filtrado/búsqueda
 * @param {string} placeholder - Texto placeholder para el input
 * @param {function} onSearch - Función que se ejecuta al cambiar el texto (recibe el valor)
 * @param {string} value - Valor actual del input (opcional si se maneja externamente, pero recomendado)
 */
export default function Filtador({ placeholder = "Buscar...", onSearch, value }) {
    return (
        <div style={{ marginBottom: 16, maxWidth: 400 }}>
            <Input
                placeholder={placeholder}
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                onChange={(e) => onSearch(e.target.value)}
                value={value}
                allowClear
                size="middle"
                style={{ borderRadius: "6px" }}
            />
        </div>
    );
}
