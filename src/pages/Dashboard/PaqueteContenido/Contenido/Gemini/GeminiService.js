import { getDesignPrompt } from './PromtBloque';

const API_KEY = 'AIzaSyAmvhjGUhD6BUOKrvXg-WQCIt7o3eePR-I';

const GeminiService = {
    /**
     * Genera sugerencias de diseño basadas en el contenido proporcionado.
     * @param {string} [apiKey] - (Opcional) La clave de API de Gemini. Se usa la interna si no se provee.
     * @param {string} content - El contenido HTML actual del editor.
     * @param {string} [model] - (Opcional) El modelo a usar (ej: 'gemini-1.5-flash', 'gemini-pro').
     * @returns {Promise<Array>} - Una promesa que resuelve en un array de sugerencias (strings HTML).
     */
    generateSuggestions: async (providedKey, content, model = 'gemini-1.5-flash') => {
        // Usar la key proporcionada o la hardcoded
        const keyToUse = providedKey || API_KEY;

        if (!keyToUse) {
            throw new Error("API Key es requerida");
        }

        const prompt = getDesignPrompt(content);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Error en la petición a Gemini');
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            // Limpiar el texto de posibles bloques de código markdown
            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const suggestions = JSON.parse(cleanedText);
                if (!Array.isArray(suggestions)) {
                    throw new Error("La respuesta no es un array válido");
                }
                return suggestions;
            } catch (parseError) {
                console.error("Error al parsear JSON de Gemini:", textResponse);
                throw new Error("No se pudo procesar la respuesta de la IA. Intenta de nuevo.");
            }

        } catch (error) {
            console.error("Error en GeminiService:", error);
            throw error;
        }
    }
};

export default GeminiService;
