// src/pages/Dashboard/Contenido/LayoutTemplates.jsx
import React from "react";
import {
    AppstoreOutlined,
    LayoutOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    PictureOutlined
} from "@ant-design/icons";

// --- Data de Plantillas ---
export const layoutTemplates = [
    { id: 'default', name: 'Por Defecto', description: 'Diseño simple', icon: <LayoutOutlined /> },
    { id: 'centered', name: 'Centrado', description: 'Todo centrado', icon: <AppstoreOutlined /> },
    { id: 'wide', name: 'An cho', description: 'Espaciado amplio', icon: <DatabaseOutlined /> },
    { id: 'modern', name: 'Moderno', description: 'Fuentes grandes', icon: <FileTextOutlined /> },
    { id: 'compact', name: 'Compacto', description: 'Líneas ajustadas', icon: <PictureOutlined /> },
];

// --- Componente  de Plantilla ---
export const LayoutTemplate = ({ template, isSelected, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: 12,
            marginBottom: 8,
            border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
            borderRadius: 4,
            cursor: 'pointer',
            background: isSelected ? '#e6f7ff' : '#fff',
            transition: 'all 0.2s'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18, color: isSelected ? '#1890ff' : '#888' }}>
                {template.icon}
            </span>
            <span style={{ fontWeight: isSelected ? 600 : 400, fontSize: '14px' }}>
                {template.name}
            </span>
        </div>
        <div style={{ fontSize: 12, color: '#888', paddingLeft: 26 }}>
            {template.description}
        </div>
    </div>
);
