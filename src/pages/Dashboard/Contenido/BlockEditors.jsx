// src/pages/Dashboard/Contenido/BlockEditors.jsx
import React, { useState } from "react";
import { Input, Card, Row, Col, Button, InputNumber, Select, Space } from "antd";
import {
    FileOutlined,
    PictureOutlined,
    VideoCameraOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    PlusOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import RichTextEditor from "../../../components/RichTextEditor";

const { Option } = Select;

// --- Editor para Título ---
export const EditorTitulo = ({ block, onChange }) => (
    <div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            Título (con formato básico)
        </div>
        <RichTextEditor
            value={block.datosJson.texto || ""}
            onChange={(value) => onChange(block.id, { ...block.datosJson, texto: value })}
            placeholder="Escribe el Título..."
            height={120}
            toolbar="basic"
        />
    </div>
);

// --- Editor para Subtítulo ---
export const EditorSubTitulo = ({ block, onChange }) => (
    <div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            Subtítulo (con formato básico)
        </div>
        <RichTextEditor
            value={block.datosJson.texto || ""}
            onChange={(value) => onChange(block.id, { ...block.datosJson, texto: value })}
            placeholder="Escribe el Subtítulo..."
            height={120}
            toolbar="basic"
        />
    </div>
);

// --- Editor para Texto ---
export const EditorTexto = ({ block, onChange }) => (
    <div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            Párrafo (con formato completo estilo Word)
        </div>
        <RichTextEditor
            value={block.datosJson.descripcion || ""}
            onChange={(value) => onChange(block.id, { ...block.datosJson, descripcion: value })}
            placeholder="Escribe el párrafo de texto..."
            height={400}
            toolbar="full"
        />
    </div>
);

// --- Editor para Tabla ---
export const EditorTabla = ({ block, onChange }) => {
    const [rows, setRows] = useState(block.datosJson.rows || 3);
    const [cols, setCols] = useState(block.datosJson.cols || 3);
    const [tableData, setTableData] = useState(block.datosJson.data || []);
    const [headerBg, setHeaderBg] = useState(block.datosJson.headerBg || '#1890ff');
    const [headerColor, setHeaderColor] = useState(block.datosJson.headerColor || '#ffffff');
    const [borderColor, setBorderColor] = useState(block.datosJson.borderColor || '#d9d9d9');

    // Inicializar tabla si no existe
    React.useEffect(() => {
        if (!tableData.length) {
            const newData = Array(rows).fill(null).map(() => Array(cols).fill(''));
            setTableData(newData);
            updateBlockData(newData);
        }
    }, []);

    const updateBlockData = (data = tableData) => {
        onChange(block.id, {
            ...block.datosJson,
            rows,
            cols,
            data,
            headerBg,
            headerColor,
            borderColor
        });
    };

    const handleCellChange = (rowIdx, colIdx, value) => {
        const newData = [...tableData];
        if (!newData[rowIdx]) newData[rowIdx] = [];
        newData[rowIdx][colIdx] = value;
        setTableData(newData);
        updateBlockData(newData);
    };

    const handleRowsChange = (newRows) => {
        setRows(newRows);
        const newData = [...tableData];
        while (newData.length < newRows) {
            newData.push(Array(cols).fill(''));
        }
        if (newData.length > newRows) {
            newData.splice(newRows);
        }
        setTableData(newData);
        updateBlockData(newData);
    };

    const handleColsChange = (newCols) => {
        setCols(newCols);
        const newData = tableData.map(row => {
            const newRow = [...row];
            while (newRow.length < newCols) {
                newRow.push('');
            }
            if (newRow.length > newCols) {
                newRow.splice(newCols);
            }
            return newRow;
        });
        setTableData(newData);
        updateBlockData(newData);
    };

    return (
        <div>
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                        <strong>Configuración de Tabla</strong>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: 4, fontSize: 12 }}>Filas:</div>
                            <InputNumber
                                min={1}
                                max={20}
                                value={rows}
                                onChange={handleRowsChange}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: 4, fontSize: 12 }}>Columnas:</div>
                            <InputNumber
                                min={1}
                                max={10}
                                value={cols}
                                onChange={handleColsChange}
                                style={{ width: '100%' }}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <div style={{ marginBottom: 4, fontSize: 12 }}>Color Encabezado:</div>
                            <Input
                                type="color"
                                value={headerBg}
                                onChange={(e) => {
                                    setHeaderBg(e.target.value);
                                    updateBlockData();
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: 4, fontSize: 12 }}>Texto Encabezado:</div>
                            <Input
                                type="color"
                                value={headerColor}
                                onChange={(e) => {
                                    setHeaderColor(e.target.value);
                                    updateBlockData();
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <div style={{ marginBottom: 4, fontSize: 12 }}>Color Bordes:</div>
                            <Input
                                type="color"
                                value={borderColor}
                                onChange={(e) => {
                                    setBorderColor(e.target.value);
                                    updateBlockData();
                                }}
                            />
                        </Col>
                    </Row>
                </Space>
            </Card>

            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: `1px solid ${borderColor}`
                }}>
                    <thead>
                        <tr>
                            {Array(cols).fill(null).map((_, colIdx) => (
                                <th key={colIdx} style={{
                                    background: headerBg,
                                    color: headerColor,
                                    border: `1px solid ${borderColor}`,
                                    padding: '8px',
                                    fontWeight: 'bold'
                                }}>
                                    <Input
                                        placeholder={`Columna ${colIdx + 1}`}
                                        value={tableData[0]?.[colIdx] || ''}
                                        onChange={(e) => handleCellChange(0, colIdx, e.target.value)}
                                        bordered={false}
                                        style={{
                                            background: 'transparent',
                                            color: headerColor,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array(rows - 1).fill(null).map((_, rowIdx) => {
                            const actualRowIdx = rowIdx + 1;
                            return (
                                <tr key={actualRowIdx}>
                                    {Array(cols).fill(null).map((_, colIdx) => (
                                        <td key={colIdx} style={{
                                            border: `1px solid ${borderColor}`,
                                            padding: '8px'
                                        }}>
                                            <Input
                                                placeholder={`Fila ${actualRowIdx + 1}, Col ${colIdx + 1}`}
                                                value={tableData[actualRowIdx]?.[colIdx] || ''}
                                                onChange={(e) => handleCellChange(actualRowIdx, colIdx, e.target.value)}
                                                bordered={false}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Editor para Archivo ---
export const EditorArchivo = ({ block, onChange }) => {
    const getFileType = (url) => {
        if (!url) return 'unknown';
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
        if (ext === 'pdf') return 'pdf';
        return 'file';
    };

    const renderPreview = () => {
        const url = block.datosJson.url;
        if (!url) return null;

        const fileType = getFileType(url);

        return (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 4, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Vista Previa:</div>
                {fileType === 'image' && (
                    <div style={{ textAlign: 'center' }}>
                        <PictureOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                        <img
                            src={url}
                            alt={block.datosJson.nombre || 'preview'}
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                        />
                    </div>
                )}
                {fileType === 'video' && (
                    <div style={{ textAlign: 'center' }}>
                        <VideoCameraOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                        <video
                            controls
                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                        >
                            <source src={url} />
                        </video>
                    </div>
                )}
                {fileType === 'pdf' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Archivo PDF</div>
                    </div>
                )}
                {fileType === 'file' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <FileImageOutlined style={{ fontSize: 48, color: '#888' }} />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Archivo</div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card size="small" style={{ background: '#fafafa' }}>
            <Row gutter={16} align="middle">
                <Col><FileOutlined style={{ fontSize: 24, color: '#888' }} /></Col>
                <Col flex={1}>
                    <Input
                        addonBefore="Nombre"
                        placeholder="documento.pdf"
                        value={block.datosJson.nombre || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, nombre: e.target.value })}
                        style={{ marginBottom: 8 }}
                    />
                    <Input
                        addonBefore="Descripción"
                        placeholder="Descripción del archivo"
                        value={block.datosJson.descripcion || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, descripcion: e.target.value })}
                        style={{ marginBottom: 8 }}
                    />
                    <Input
                        addonBefore="URL"
                        placeholder="/uploads/documento.pdf"
                        value={block.datosJson.url || ""}
                        onChange={(e) => onChange(block.id, { ...block.datosJson, url: e.target.value })}
                    />
                </Col>
            </Row>
            {renderPreview()}
        </Card>
    );
};
