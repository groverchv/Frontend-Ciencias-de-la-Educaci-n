// src/pages/Dashboard/PaqueteContenido/Contenido/ImageContextMenu.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Menu } from 'antd';
import {
    CopyOutlined,
    ScissorOutlined,
    SnippetsOutlined,
    DeleteOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    RotateRightOutlined,
    ScissorOutlined as CropOutlined,
    SettingOutlined
} from '@ant-design/icons';
import './ImageContextMenu.css';

export default function ImageContextMenu({
    visible,
    x,
    y,
    imageRect,
    onConfigure,
    onDelete,
    onCopy,
    onCut,
    onPaste,
    onCrop,
    onRotate,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    hasClipboard
}) {
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ x, y });

    useEffect(() => {
        if (visible && menuRef.current && imageRect) {
            const menu = menuRef.current;
            const menuRect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            // Calculate available space on each side of the image
            const spaceRight = viewportWidth - imageRect.right;
            const spaceLeft = imageRect.left;
            const spaceBottom = viewportHeight - imageRect.bottom;
            const spaceTop = imageRect.top;

            const gap = 10; // Gap between image and menu

            // Try to position menu to the RIGHT of image
            if (spaceRight >= menuRect.width + gap) {
                adjustedX = imageRect.right + gap;
                adjustedY = imageRect.top;
            }
            // Try LEFT of image
            else if (spaceLeft >= menuRect.width + gap) {
                adjustedX = imageRect.left - menuRect.width - gap;
                adjustedY = imageRect.top;
            }
            // Try BELOW image
            else if (spaceBottom >= menuRect.height + gap) {
                adjustedX = imageRect.left;
                adjustedY = imageRect.bottom + gap;
            }
            // Try ABOVE image
            else if (spaceTop >= menuRect.height + gap) {
                adjustedX = imageRect.left;
                adjustedY = imageRect.top - menuRect.height - gap;
            }
            // Fallback: near click position
            else {
                adjustedX = x + 10;
                adjustedY = y + 10;
            }

            // Keep within viewport bounds
            if (adjustedX + menuRect.width > viewportWidth - gap) {
                adjustedX = viewportWidth - menuRect.width - gap;
            }
            if (adjustedY + menuRect.height > viewportHeight - gap) {
                adjustedY = viewportHeight - menuRect.height - gap;
            }
            if (adjustedX < gap) adjustedX = gap;
            if (adjustedY < gap) adjustedY = gap;

            setPosition({ x: adjustedX, y: adjustedY });
        }
    }, [visible, x, y, imageRect]);

    if (!visible) return null;

    const menuItems = [
        {
            key: 'copy',
            icon: <CopyOutlined />,
            label: 'Copiar',
            onClick: onCopy
        },
        {
            key: 'cut',
            icon: <ScissorOutlined />,
            label: 'Cortar',
            onClick: onCut
        },
        {
            key: 'paste',
            icon: <SnippetsOutlined />,
            label: 'Pegar',
            onClick: onPaste,
            disabled: !hasClipboard
        },
        {
            type: 'divider'
        },
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
            key: 'rotate',
            icon: <RotateRightOutlined />,
            label: 'Rotar 90°',
            onClick: onRotate
        },
        {
            key: 'crop',
            icon: <CropOutlined />,
            label: 'Recortar',
            onClick: onCrop
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
            ref={menuRef}
            className="image-context-menu"
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
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
