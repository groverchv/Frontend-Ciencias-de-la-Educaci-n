// src/pages/Dashboard/PaqueteContenido/Contenido/ImageContextMenu.jsx
import React from 'react';
import { Menu } from 'antd';
import {
    SettingOutlined,
    DeleteOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined
} from '@ant-design/icons';
import './ImageContextMenu.css';

export default function ImageContextMenu({
    visible,
    x,
    y,
    onConfigure,
    onDelete,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onClose
}) {
    if (!visible) return null;

    const menuItems = [
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Borrar',
            danger: true,
            onClick: onDelete
        },
        {
            type: 'divider'
        },
        {
            key: 'align',
            icon: <AlignCenterOutlined />,
            label: 'Alinear',
            children: [
                {
                    key: 'align-left',
                    icon: <AlignLeftOutlined />,
                    label: 'Izquierda',
                    onClick: onAlignLeft
                },
                {
                    key: 'align-center',
                    icon: <AlignCenterOutlined />,
                    label: 'Centro',
                    onClick: onAlignCenter
                },
                {
                    key: 'align-right',
                    icon: <AlignRightOutlined />,
                    label: 'Derecha',
                    onClick: onAlignRight
                }
            ]
        },
        {
            type: 'divider'
        },
        {
            key: 'configure',
            icon: <SettingOutlined />,
            label: 'Configuración',
            onClick: onConfigure
        }
    ];

    return (
        <div
            className="image-context-menu"
            style={{
                position: 'fixed',
                left: x,
                top: y,
                zIndex: 10000
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Menu
                items={menuItems}
                style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: '4px'
                }}
            />
        </div>
    );
}
