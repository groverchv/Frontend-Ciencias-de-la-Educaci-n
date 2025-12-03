import React, { useState } from 'react';
import { Button, Card, Alert, Drawer, Typography, Select } from 'antd';
import { RobotOutlined, ThunderboltOutlined, CheckOutlined, SettingOutlined } from '@ant-design/icons';
import GeminiService from './GeminiService';
import DOMPurify from 'dompurify';

const { Text, Paragraph } = Typography;
const { Option } = Select;

export default function GenerarBloque({ visible, onClose, currentContent, onApplyContent }) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');

    const handleGenerate = async () => {
        if (!currentContent || currentContent.trim() === '' || currentContent === '<p><br></p>') {
            setError("El editor está vacío. Escribe algo de contenido para que la IA pueda mejorarlo.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            // No necesitamos pasar la API Key, el servicio ya la tiene internamente
            const results = await GeminiService.generateSuggestions(null, currentContent, selectedModel);
            setSuggestions(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RobotOutlined style={{ color: '#DAA520', fontSize: '20px' }} />
                    <span>Asistente de Diseño IA</span>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={450}
            mask={false} // Permitir interactuar con el editor mientras está abierto
            style={{
                boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                top: '240px', // Ajustar para que no tape el header ni la barra de herramientas
                height: 'calc(100% - 240px)' // Ajustar altura acorde
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>

                {/* Selector de Modelo */}
                <Card size="small" style={{ background: '#f9f9f9', borderColor: '#eee' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <SettingOutlined style={{ color: '#888' }} />
                        <Text strong style={{ fontSize: '13px' }}>Modelo de IA:</Text>
                    </div>
                    <Select
                        defaultValue="gemini-1.5-flash"
                        style={{ width: '100%' }}
                        onChange={setSelectedModel}
                        value={selectedModel}
                    >
                        <Option value="gemini-1.5-flash">Gemini 1.5 Flash (Más Rápido)</Option>
                        <Option value="gemini-1.5-pro">Gemini 1.5 Pro (Más Inteligente)</Option>
                        <Option value="gemini-1.0-pro">Gemini 1.0 Pro (Estándar)</Option>
                    </Select>
                </Card>

                {/* Panel Principal */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <Paragraph type="secondary">
                        La IA analizará tu contenido actual y generará 3 propuestas de diseño moderno.
                    </Paragraph>
                    <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={handleGenerate}
                        loading={loading}
                        size="large"
                        block
                        style={{
                            background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 100%)',
                            borderColor: '#DAA520',
                            color: '#fff',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(218, 165, 32, 0.3)'
                        }}
                    >
                        {loading ? 'Generando...' : 'Generar Propuestas'}
                    </Button>
                </div>

                {error && (
                    <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
                )}

                {/* Lista de Sugerencias */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    {suggestions.map((html, index) => (
                        <Card
                            key={index}
                            hoverable
                            style={{ marginBottom: '20px', overflow: 'hidden', border: '1px solid #e0e0e0' }}
                            bodyStyle={{ padding: '0' }}
                            actions={[
                                <Button
                                    type="link"
                                    icon={<CheckOutlined />}
                                    onClick={() => onApplyContent(html)}
                                    style={{ color: '#52c41a', fontWeight: 'bold' }}
                                >
                                    Aplicar este diseño
                                </Button>
                            ]}
                        >
                            <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #eee' }}>
                                <Text strong>Opción {index + 1}</Text>
                            </div>
                            <div
                                style={{
                                    padding: '15px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zoom: '0.7', // Zoom out para ver mejor la estructura
                                    background: '#fff'
                                }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
                            />
                        </Card>
                    ))}

                    {suggestions.length === 0 && !loading && !error && (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#ccc' }}>
                            <RobotOutlined style={{ fontSize: '48px', marginBottom: '10px' }} />
                            <p>Tus sugerencias aparecerán aquí</p>
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    );
}
