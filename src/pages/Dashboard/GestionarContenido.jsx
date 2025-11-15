// src/components/GestionarContenido.jsx
// --- REEMPLAZA TU ARCHIVO ANTERIOR CON ESTE ---

import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  message,
  Card,
  Typography,
  Spin,
  Input,
  Row,
  Col,
  Empty,
  Popconfirm
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  FontSizeOutlined,
  FileTextOutlined,
  FileOutlined,
  DeleteOutlined,
  ReadOutlined,
  DownSquareOutlined,
  DragOutlined // Para futuro drag-and-drop
} from "@ant-design/icons";

// --- ¡NUESTROS ÚNICOS SERVICIOS! ---
import Sub_MenuService from "../../services/Sub_MenuService.js";
import BloqueService from "../../services/BloqueService.js";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// --- Componentes de Edición para cada Bloque ---
// Estos componentes son "crear y editar directamente"

const EditorTitulo = ({ block, onChange }) => (
  <Input
    size="large"
    placeholder="Escribe el Título..."
    style={{ fontSize: "1.75rem", fontWeight: "bold", border: 'none', paddingLeft: 0, color: '#1f1f1f' }}
    value={block.datosJson.texto || ""}
    onChange={(e) => onChange(block.id, { ...block.datosJson, texto: e.target.value })}
  />
);

const EditorSubTitulo = ({ block, onChange }) => (
  <Input
    size="large"
    placeholder="Escribe el Subtítulo..."
    style={{ fontSize: "1.3rem", fontWeight: "600", border: 'none', paddingLeft: 0, color: '#3b3b3b' }}
    value={block.datosJson.texto || ""}
    onChange={(e) => onChange(block.id, { ...block.datosJson, texto: e.target.value })}
  />
);

const EditorTexto = ({ block, onChange }) => (
  <TextArea
    placeholder="Escribe el párrafo de texto..."
    autoSize
    style={{ fontSize: "1rem", border: 'none', paddingLeft: 0, lineHeight: 1.6 }}
    value={block.datosJson.descripcion || ""}
    onChange={(e) => onChange(block.id, { ...block.datosJson, descripcion: e.target.value })}
  />
);

const EditorArchivo = ({ block, onChange }) => {
  // Un editor de "Archivo" más completo
  return (
    <Card size="small" style={{ background: '#fafafa' }}>
      <Row gutter={16} align="middle">
        <Col><FileOutlined style={{ fontSize: 24, color: '#888' }} /></Col>
        <Col flex={1}>
          <Input
            addonBefore="Nombre"
            placeholder="reporte.pdf"
            value={block.datosJson.nombre || ""}
            onChange={(e) => onChange(block.id, { ...block.datosJson, nombre: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <Input
            addonBefore="URL"
            placeholder="/uploads/reporte.pdf"
            value={block.datosJson.url || ""}
            onChange={(e) => onChange(block.id, { ...block.datosJson, url: e.target.value })}
          />
        </Col>
      </Row>
    </Card>
  );
};
// --- FIN de Componentes de Edición ---


export default function GestionarContenido() {
  const [subMenus, setSubMenus] = useState([]);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  
  // --- ¡El estado clave! Un solo array para todos los bloques ---
  const [blocks, setBlocks] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Cargar solo los SubMenus para el selector
    const loadSubMenus = async () => {
      try {
        const data = await Sub_MenuService.getAllSubMenu();
        setSubMenus(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error("Error al cargar SubMenús");
      }
    };
    loadSubMenus();
  }, []);

  // Cargar bloques cuando el usuario selecciona un SubMenu
  const handleMenuChange = async (sub_menu_id) => {
    setSelectedSubMenu(sub_menu_id);
    if (!sub_menu_id) {
      setBlocks([]);
      return;
    }
    
    setLoading(true);
    try {
      // Llama al Endpoint 1 (GET)
      const data = await BloqueService.getBlockesBySubMenu(sub_menu_id);
      setBlocks(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error(error.toString());
    } finally {
      setLoading(false);
    }
  };

  // --- ESTO ES "EDITAR TODOS A LA VEZ" ---
  // Actualiza el bloque específico en el array 'blocks' del estado
  const handleBlockChange = (blockId, newDatosJson) => {
    setBlocks(currentBlocks =>
      currentBlocks.map(b =>
        b.id === blockId
          ? { ...b, datosJson: newDatosJson } // Ojo: el backend Java serializa 'datosJson'
          : b
      )
    );
  };

  // --- ESTO ES "CREAR DIRECTAMENTE" / "AGREGAR VARIAS VECES" ---
  const addBlock = (tipo) => {
    const newBlock = {
      // Usamos un ID temporal para el 'key' de React.
      // El backend lo ignorará y asignará uno real.
      id: `temp_${Date.now()}`, 
      tipoBloque: tipo,
      orden: blocks.length,
      estado: true,
      datosJson: {}, // Inicia vacío
    };
    
    // Valores por defecto
    if (tipo === 'titulo') newBlock.datosJson = { texto: "" };
    if (tipo === 'subtitulo') newBlock.datosJson = { texto: "" };
    if (tipo === 'texto') newBlock.datosJson = { descripcion: "" };
    if (tipo === 'archivo') newBlock.datosJson = { nombre: "", url: "" };

    setBlocks([...blocks, newBlock]);
  };
  
  const deleteBlock = (blockId) => {
    setBlocks(currentBlocks => currentBlocks.filter(b => b.id !== blockId));
  };

  // --- ESTO ES "UN SOLO BOTÓN PARA GUARDAR" ---
  const handleSave = async () => {
    setSaving(true);
    try {
      // Re-asignamos el 'orden' antes de guardar, por si se borraron/movieron
      const blocksToSave = blocks.map((block, index) => ({
        ...block,
        orden: index,
      }));
      
      // Llama al Endpoint 2 (POST)
      await BloqueService.saveBlocksForSubMenu(selectedSubMenu, blocksToSave);
      message.success("¡Página guardada exitosamente!");
      
      // Recargar los datos desde la BD para obtener IDs reales
      // y limpiar los 'temp_id'
      handleMenuChange(selectedSubMenu); 
      
    } catch (error) {
      message.error(error.toString());
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="admin-container">
      <Card>
        <div className="admin-header">
          <div className="admin-title-wrapper">
            <FileTextOutlined className="admin-header-icon" />
            <Title level={2}>Gestión de Contenido por Bloques</Title>
          </div>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave} 
            size="large"
            loading={saving}
            disabled={!selectedSubMenu || saving}
          >
            Guardar Cambios
          </Button>
        </div>
        
        <Title level={4}>Seleccione la página (SubMenú) a editar:</Title>
        <Select
          style={{ width: "100%", marginBottom: 24 }}
          placeholder="Seleccione un SubMenú"
          onChange={handleMenuChange}
          value={selectedSubMenu}
          allowClear
        >
          {subMenus.map(sm => <Option key={sm.id} value={sm.id}>{sm.titulo}</Option>)}
        </Select>

        <hr style={{ border: 'none', borderBottom: '1px solid #f0f0f0', margin: '24px 0' }} />

        {/* --- INICIO DEL EDITOR DE BLOQUES --- */}
        {!selectedSubMenu ? (
          <Empty description="Por favor, seleccione una página para comenzar a editar." />
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
        ) : (
          <div className="block-editor-container">
            {blocks.length === 0 ? (
              <Empty description="Esta página está vacía. ¡Agrega tu primer bloque!" />
            ) : (
              blocks.map(block => (
                <div key={block.id} className="block-wrapper">
                  <div className="block-drag-handle">
                     {/* <DragOutlined /> (Para futuro drag-and-drop) */}
                  </div>
                  <div className="block-content">
                    {/* El "Panel" que renderiza el editor correcto */}
                    {block.tipoBloque === 'titulo' && <EditorTitulo block={block} onChange={handleBlockChange} />}
                    {block.tipoBloque === 'subtitulo' && <EditorSubTitulo block={block} onChange={handleBlockChange} />}
                    {block.tipoBloque === 'texto' && <EditorTexto block={block} onChange={handleBlockChange} />}
                    {block.tipoBloque === 'archivo' && <EditorArchivo block={block} onChange={handleBlockChange} />}
                  </div>
                  <div className="block-controls">
                    <Popconfirm 
                      title="¿Eliminar este bloque?" 
                      onConfirm={() => deleteBlock(block.id)}
                      okText="Sí"
                      cancelText="No"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                      />
                    </Popconfirm>
                  </div>
                </div>
              ))
            )}
            
            {/* --- ESTO ES "ESCOGER PANELES" --- */}
            <Title level={5} style={{ marginTop: 30, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
              Añadir nuevo bloque (Panel):
            </Title>
            <Space wrap>
              <Button icon={<FontSizeOutlined />} onClick={() => addBlock('titulo')}>Título</Button>
              <Button icon={<DownSquareOutlined />} onClick={() => addBlock('subtitulo')}>Subtítulo</Button>
              <Button icon={<ReadOutlined />} onClick={() => addBlock('texto')}>Texto</Button>
              <Button icon={<FileOutlined />} onClick={() => addBlock('archivo')}>Archivo</Button>
            </Space>

          </div>
        )}
        {/* --- FIN DEL EDITOR DE BLOQUES --- */}

      </Card>
      
      {/* Añadimos un poco de CSS para que funcione */}
      <style>{`
        .block-wrapper {
          display: flex;
          align-items: flex-start;
          padding: 12px 8px;
          margin-bottom: 12px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .block-wrapper:hover {
          background: #f7f7f7;
        }
        .block-drag-handle {
          padding: 8px 4px;
          color: #aaa;
          cursor: grab;
          opacity: 0.5;
        }
        .block-content {
          flex-grow: 1;
          margin-left: 8px;
        }
        .block-controls {
          margin-left: 16px;
          padding-top: 4px;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }
        .block-wrapper:hover .block-controls {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}