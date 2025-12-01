// src/pages/Dashboard/PaqueteContenido/Contenido/ImageConfigModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal, Tabs, InputNumber, Select, ColorPicker, Slider,
    Input, Switch, Button, Space, Row, Col, Card
} from 'antd';
import {
    AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
    BorderOutlined, BgColorsOutlined, RotateRightOutlined,
    LinkOutlined, ScissorOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

export default function ImageConfigModal({ visible, onCancel, onApply, imageElement }) {
    // Estados para todas las configuraciones
    const [config, setConfig] = useState({
        // Dimensiones
        width: { value: 'auto', unit: 'px' },
        height: { value: 'auto', unit: 'px' },
        maintainRatio: true,

        // Posición
        alignment: 'left',
        display: 'inline-block',
        float: 'none',
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,

        // Bordes
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#000000',
        borderRadius: 0,

        // Sombras
        shadowX: 0,
        shadowY: 0,
        shadowBlur: 0,
        shadowSpread: 0,
        shadowColor: '#000000',

        // Efectos
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturate: 100,
        grayscale: 0,
        blur: 0,

        // SEO & Links
        alt: '',
        title: '',
        linkUrl: '',
        linkTarget: '_self',

        // Recorte
        objectFit: 'fill',
        objectPosition: 'center'
    });

    // Cargar configuración actual de la imagen
    useEffect(() => {
        if (imageElement && visible) {
            const style = window.getComputedStyle(imageElement);
            const newConfig = { ...config };

            // Extraer dimensiones
            const width = imageElement.style.width || imageElement.width;
            const height = imageElement.style.height || imageElement.height;

            if (width) {
                const widthMatch = width.toString().match(/^(\d+(?:\.\d+)?)(px|%)?$/);
                if (widthMatch) {
                    newConfig.width = {
                        value: parseFloat(widthMatch[1]),
                        unit: widthMatch[2] || 'px'
                    };
                }
            }

            if (height) {
                const heightMatch = height.toString().match(/^(\d+(?:\.\d+)?)(px|%)?$/);
                if (heightMatch) {
                    newConfig.height = {
                        value: parseFloat(heightMatch[1]),
                        unit: heightMatch[2] || 'px'
                    };
                }
            }

            // Extraer alineación del estilo
            const textAlign = imageElement.parentElement?.style.textAlign;
            if (textAlign) newConfig.alignment = textAlign;

            const float = style.float;
            if (float && float !== 'none') newConfig.float = float;

            // Extraer márgenes
            newConfig.marginLeft = parseInt(style.marginLeft) || 0;
            newConfig.marginRight = parseInt(style.marginRight) || 0;
            newConfig.marginTop = parseInt(style.marginTop) || 0;
            newConfig.marginBottom = parseInt(style.marginBottom) || 0;

            // Extraer bordes
            newConfig.borderWidth = parseInt(style.borderWidth) || 0;
            newConfig.borderStyle = style.borderStyle !== 'none' ? style.borderStyle : 'solid';
            newConfig.borderColor = style.borderColor || '#000000';
            newConfig.borderRadius = parseInt(style.borderRadius) || 0;

            // SEO
            newConfig.alt = imageElement.getAttribute('alt') || '';
            newConfig.title = imageElement.getAttribute('title') || '';

            // Link
            const parentLink = imageElement.closest('a');
            if (parentLink) {
                newConfig.linkUrl = parentLink.getAttribute('href') || '';
                newConfig.linkTarget = parentLink.getAttribute('target') || '_self';
            }

            setConfig(newConfig);
        }
    }, [imageElement, visible]);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleNestedChange = (key, subKey, value) => {
        setConfig(prev => ({
            ...prev,
            [key]: { ...prev[key], [subKey]: value }
        }));
    };

    const applyPreset = (preset) => {
        const presets = {
            thumbnail: { value: 150, unit: 'px' },
            small: { value: 300, unit: 'px' },
            medium: { value: 600, unit: 'px' },
            large: { value: 900, unit: 'px' },
            full: { value: 100, unit: '%' }
        };

        if (presets[preset]) {
            setConfig(prev => ({
                ...prev,
                width: presets[preset],
                height: { value: 'auto', unit: 'px' }
            }));
        }
    };

    const buildStyles = () => {
        const styles = {};

        // Dimensiones
        if (config.width.value !== 'auto') {
            styles.width = `${config.width.value}${config.width.unit}`;
        }
        if (config.height.value !== 'auto') {
            styles.height = `${config.height.value}${config.height.unit}`;
        }

        // Posición
        if (config.float !== 'none') {
            styles.float = config.float;
        }
        styles.display = config.display;

        // Márgenes
        if (config.marginLeft) styles.marginLeft = `${config.marginLeft}px`;
        if (config.marginRight) styles.marginRight = `${config.marginRight}px`;
        if (config.marginTop) styles.marginTop = `${config.marginTop}px`;
        if (config.marginBottom) styles.marginBottom = `${config.marginBottom}px`;

        // Bordes
        if (config.borderWidth > 0) {
            styles.border = `${config.borderWidth}px ${config.borderStyle} ${config.borderColor}`;
        }
        if (config.borderRadius > 0) {
            styles.borderRadius = `${config.borderRadius}px`;
        }

        // Sombras
        if (config.shadowBlur > 0 || config.shadowX !== 0 || config.shadowY !== 0) {
            styles.boxShadow = `${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${config.shadowSpread}px ${config.shadowColor}`;
        }

        // Transform (rotación)
        const transforms = [];
        if (config.rotation !== 0) {
            transforms.push(`rotate(${config.rotation}deg)`);
        }
        if (transforms.length > 0) {
            styles.transform = transforms.join(' ');
        }

        // Filtros
        const filters = [];
        if (config.brightness !== 100) filters.push(`brightness(${config.brightness}%)`);
        if (config.contrast !== 100) filters.push(`contrast(${config.contrast}%)`);
        if (config.saturate !== 100) filters.push(`saturate(${config.saturate}%)`);
        if (config.grayscale > 0) filters.push(`grayscale(${config.grayscale}%)`);
        if (config.blur > 0) filters.push(`blur(${config.blur}px)`);
        if (filters.length > 0) {
            styles.filter = filters.join(' ');
        }

        // Recorte
        if (config.objectFit !== 'fill') {
            styles.objectFit = config.objectFit;
        }
        if (config.objectPosition !== 'center') {
            styles.objectPosition = config.objectPosition;
        }

        return styles;
    };

    const handleApply = () => {
        const styles = buildStyles();

        onApply({
            styles,
            alt: config.alt,
            title: config.title,
            linkUrl: config.linkUrl,
            linkTarget: config.linkTarget,
            alignment: config.alignment
        });
    };

    const previewStyles = buildStyles();

    return (
        <Modal
            title="⚙️ Configuración de Imagen"
            open={visible}
            onCancel={onCancel}
            onOk={handleApply}
            width={900}
            okText="Aplicar"
            cancelText="Cancelar"
        >
            <Row gutter={16}>
                <Col span={14}>
                    <Tabs defaultActiveKey="1">
                        {/* Tab 1: Dimensiones */}
                        <TabPane tab="📐 Dimensiones" key="1">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Ancho:</label>
                                        <Input.Group compact>
                                            <InputNumber
                                                style={{ width: '60%' }}
                                                value={config.width.value === 'auto' ? '' : config.width.value}
                                                onChange={(val) => handleNestedChange('width', 'value', val || 'auto')}
                                                placeholder="auto"
                                                min={1}
                                            />
                                            <Select
                                                style={{ width: '40%' }}
                                                value={config.width.unit}
                                                onChange={(val) => handleNestedChange('width', 'unit', val)}
                                            >
                                                <Option value="px">px</Option>
                                                <Option value="%">%</Option>
                                            </Select>
                                        </Input.Group>
                                    </Col>
                                    <Col span={12}>
                                        <label>Alto:</label>
                                        <Input.Group compact>
                                            <InputNumber
                                                style={{ width: '60%' }}
                                                value={config.height.value === 'auto' ? '' : config.height.value}
                                                onChange={(val) => handleNestedChange('height', 'value', val || 'auto')}
                                                placeholder="auto"
                                                min={1}
                                                disabled={config.maintainRatio}
                                            />
                                            <Select
                                                style={{ width: '40%' }}
                                                value={config.height.unit}
                                                onChange={(val) => handleNestedChange('height', 'unit', val)}
                                                disabled={config.maintainRatio}
                                            >
                                                <Option value="px">px</Option>
                                                <Option value="%">%</Option>
                                            </Select>
                                        </Input.Group>
                                    </Col>
                                </Row>

                                <div>
                                    <Switch
                                        checked={config.maintainRatio}
                                        onChange={(val) => handleConfigChange('maintainRatio', val)}
                                    /> Mantener proporción
                                </div>

                                <div>
                                    <label>Presets:</label>
                                    <Space wrap>
                                        <Button size="small" onClick={() => applyPreset('thumbnail')}>Miniatura (150px)</Button>
                                        <Button size="small" onClick={() => applyPreset('small')}>Pequeño (300px)</Button>
                                        <Button size="small" onClick={() => applyPreset('medium')}>Mediano (600px)</Button>
                                        <Button size="small" onClick={() => applyPreset('large')}>Grande (900px)</Button>
                                        <Button size="small" onClick={() => applyPreset('full')}>Completo (100%)</Button>
                                    </Space>
                                </div>
                            </Space>
                        </TabPane>

                        {/* Tab 2: Posición */}
                        <TabPane tab="📍 Posición" key="2">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <label>Alineación:</label>
                                    <div>
                                        <Button.Group>
                                            <Button
                                                icon={<AlignLeftOutlined />}
                                                type={config.alignment === 'left' ? 'primary' : 'default'}
                                                onClick={() => handleConfigChange('alignment', 'left')}
                                            >
                                                Izquierda
                                            </Button>
                                            <Button
                                                icon={<AlignCenterOutlined />}
                                                type={config.alignment === 'center' ? 'primary' : 'default'}
                                                onClick={() => handleConfigChange('alignment', 'center')}
                                            >
                                                Centro
                                            </Button>
                                            <Button
                                                icon={<AlignRightOutlined />}
                                                type={config.alignment === 'right' ? 'primary' : 'default'}
                                                onClick={() => handleConfigChange('alignment', 'right')}
                                            >
                                                Derecha
                                            </Button>
                                        </Button.Group>
                                    </div>
                                </div>

                                <div>
                                    <label>Flotante:</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={config.float}
                                        onChange={(val) => handleConfigChange('float', val)}
                                    >
                                        <Option value="none">Ninguno</Option>
                                        <Option value="left">Izquierda</Option>
                                        <Option value="right">Derecha</Option>
                                    </Select>
                                </div>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Margen Izquierdo:</label>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={config.marginLeft}
                                            onChange={(val) => handleConfigChange('marginLeft', val)}
                                            addonAfter="px"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label>Margen Derecho:</label>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={config.marginRight}
                                            onChange={(val) => handleConfigChange('marginRight', val)}
                                            addonAfter="px"
                                        />
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Margen Superior:</label>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={config.marginTop}
                                            onChange={(val) => handleConfigChange('marginTop', val)}
                                            addonAfter="px"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label>Margen Inferior:</label>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={config.marginBottom}
                                            onChange={(val) => handleConfigChange('marginBottom', val)}
                                            addonAfter="px"
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </TabPane>

                        {/* Tab 3: Bordes & Sombras */}
                        <TabPane tab="🎨 Bordes & Sombras" key="3">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <h4><BorderOutlined /> Bordes</h4>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <label>Grosor:</label>
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={config.borderWidth}
                                            onChange={(val) => handleConfigChange('borderWidth', val)}
                                            min={0}
                                            addonAfter="px"
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <label>Estilo:</label>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={config.borderStyle}
                                            onChange={(val) => handleConfigChange('borderStyle', val)}
                                        >
                                            <Option value="solid">Sólido</Option>
                                            <Option value="dashed">Guiones</Option>
                                            <Option value="dotted">Puntos</Option>
                                            <Option value="double">Doble</Option>
                                        </Select>
                                    </Col>
                                    <Col span={8}>
                                        <label>Color:</label>
                                        <Input
                                            type="color"
                                            value={config.borderColor}
                                            onChange={(e) => handleConfigChange('borderColor', e.target.value)}
                                        />
                                    </Col>
                                </Row>

                                <div>
                                    <label>Radio de Esquinas: {config.borderRadius}px</label>
                                    <Slider
                                        min={0}
                                        max={100}
                                        value={config.borderRadius}
                                        onChange={(val) => handleConfigChange('borderRadius', val)}
                                    />
                                </div>

                                <h4><BgColorsOutlined /> Sombra</h4>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Desplazamiento X: {config.shadowX}px</label>
                                        <Slider
                                            min={-50}
                                            max={50}
                                            value={config.shadowX}
                                            onChange={(val) => handleConfigChange('shadowX', val)}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label>Desplazamiento Y: {config.shadowY}px</label>
                                        <Slider
                                            min={-50}
                                            max={50}
                                            value={config.shadowY}
                                            onChange={(val) => handleConfigChange('shadowY', val)}
                                        />
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <label>Difuminado: {config.shadowBlur}px</label>
                                        <Slider
                                            min={0}
                                            max={50}
                                            value={config.shadowBlur}
                                            onChange={(val) => handleConfigChange('shadowBlur', val)}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <label>Color:</label>
                                        <Input
                                            type="color"
                                            value={config.shadowColor}
                                            onChange={(e) => handleConfigChange('shadowColor', e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Space>
                        </TabPane>

                        {/* Tab 4: Efectos */}
                        <TabPane tab="✨ Efectos" key="4">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <label><RotateRightOutlined /> Rotación: {config.rotation}°</label>
                                    <Slider
                                        min={0}
                                        max={360}
                                        value={config.rotation}
                                        onChange={(val) => handleConfigChange('rotation', val)}
                                    />
                                </div>

                                <div>
                                    <label>Brillo: {config.brightness}%</label>
                                    <Slider
                                        min={0}
                                        max={200}
                                        value={config.brightness}
                                        onChange={(val) => handleConfigChange('brightness', val)}
                                    />
                                </div>

                                <div>
                                    <label>Contraste: {config.contrast}%</label>
                                    <Slider
                                        min={0}
                                        max={200}
                                        value={config.contrast}
                                        onChange={(val) => handleConfigChange('contrast', val)}
                                    />
                                </div>

                                <div>
                                    <label>Saturación: {config.saturate}%</label>
                                    <Slider
                                        min={0}
                                        max={200}
                                        value={config.saturate}
                                        onChange={(val) => handleConfigChange('saturate', val)}
                                    />
                                </div>

                                <div>
                                    <label>Escala de Grises: {config.grayscale}%</label>
                                    <Slider
                                        min={0}
                                        max={100}
                                        value={config.grayscale}
                                        onChange={(val) => handleConfigChange('grayscale', val)}
                                    />
                                </div>

                                <div>
                                    <label>Desenfoque: {config.blur}px</label>
                                    <Slider
                                        min={0}
                                        max={10}
                                        value={config.blur}
                                        onChange={(val) => handleConfigChange('blur', val)}
                                    />
                                </div>
                            </Space>
                        </TabPane>

                        {/* Tab 5: SEO & Links */}
                        <TabPane tab="🔗 SEO & Links" key="5">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <label>Texto Alternativo (Alt):</label>
                                    <Input
                                        value={config.alt}
                                        onChange={(e) => handleConfigChange('alt', e.target.value)}
                                        placeholder="Descripción de la imagen"
                                    />
                                </div>

                                <div>
                                    <label>Título:</label>
                                    <Input
                                        value={config.title}
                                        onChange={(e) => handleConfigChange('title', e.target.value)}
                                        placeholder="Título que aparece al pasar el mouse"
                                    />
                                </div>

                                <div>
                                    <label><LinkOutlined /> URL del Enlace:</label>
                                    <Input
                                        value={config.linkUrl}
                                        onChange={(e) => handleConfigChange('linkUrl', e.target.value)}
                                        placeholder="https://ejemplo.com"
                                    />
                                </div>

                                {config.linkUrl && (
                                    <div>
                                        <label>Destino del Enlace:</label>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={config.linkTarget}
                                            onChange={(val) => handleConfigChange('linkTarget', val)}
                                        >
                                            <Option value="_self">Misma pestaña</Option>
                                            <Option value="_blank">Nueva pestaña</Option>
                                        </Select>
                                    </div>
                                )}
                            </Space>
                        </TabPane>

                        {/* Tab 6: Recorte */}
                        <TabPane tab="✂️ Recorte" key="6">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <label><ScissorOutlined /> Ajuste de Objeto:</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={config.objectFit}
                                        onChange={(val) => handleConfigChange('objectFit', val)}
                                    >
                                        <Option value="fill">Rellenar (Fill)</Option>
                                        <Option value="contain">Contener (Contain)</Option>
                                        <Option value="cover">Cubrir (Cover)</Option>
                                        <Option value="none">Ninguno</Option>
                                        <Option value="scale-down">Escalar hacia abajo</Option>
                                    </Select>
                                </div>

                                <div>
                                    <label>Posición del Objeto:</label>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={config.objectPosition}
                                        onChange={(val) => handleConfigChange('objectPosition', val)}
                                    >
                                        <Option value="center">Centro</Option>
                                        <Option value="top">Superior</Option>
                                        <Option value="bottom">Inferior</Option>
                                        <Option value="left">Izquierda</Option>
                                        <Option value="right">Derecha</Option>
                                        <Option value="top left">Superior Izquierda</Option>
                                        <Option value="top right">Superior Derecha</Option>
                                        <Option value="bottom left">Inferior Izquierda</Option>
                                        <Option value="bottom right">Inferior Derecha</Option>
                                    </Select>
                                </div>
                            </Space>
                        </TabPane>
                    </Tabs>
                </Col>

                {/* Vista Previa */}
                <Col span={10}>
                    <Card title="👁️ Vista Previa" size="small">
                        <div style={{
                            textAlign: config.alignment,
                            padding: '20px',
                            background: '#f5f5f5',
                            minHeight: '300px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {imageElement && (
                                <img
                                    src={imageElement.src}
                                    alt={config.alt || "preview"}
                                    style={{
                                        ...previewStyles,
                                        maxWidth: '100%',
                                        maxHeight: '250px'
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
}
