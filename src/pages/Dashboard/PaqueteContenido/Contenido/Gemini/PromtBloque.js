/**
 * Genera el prompt para solicitar diseños a Gemini.
 * @param {string} content - El contenido HTML actual.
 * @returns {string} - El prompt formateado.
 */
export const getDesignPrompt = (content) => {
    return `
            Actúa como un diseñador web experto y desarrollador frontend.
            Tengo el siguiente contenido HTML crudo proveniente de un editor de texto:
            
            ---
            ${content}
            ---

            Tu tarea es tomar ESTA MISMA INFORMACIÓN (texto, imágenes, enlaces) y reestructurarla en 3 plantillas HTML profesionales y visualmente impactantes.
            NO inventes texto nuevo (lorem ipsum), usa el contenido real proporcionado.

            Genera 3 variaciones distintas:

            1. **Estilo Corporativo / Limpio**:
               - Diseño estructurado, uso de tarjetas para secciones, tipografía clara (sans-serif).
               - Colores neutros y profesionales (azules, grises, blancos).
               - Ideal para reportes o documentos oficiales.

            2. **Estilo Moderno / Magazine**:
               - Diseño tipo revista, con letras capitales, citas destacadas (blockquotes) estilizadas.
               - Uso de fondos sutiles o bordes de color para separar secciones.
               - Disposición más dinámica (ej: imagen flotando a la derecha del texto).

            3. **Estilo Visual / Destacado**:
               - Enfocado en el impacto visual.
               - Contenedores con sombras suaves (box-shadow), bordes redondeados.
               - Títulos con colores llamativos o subrayados estilizados.

            REGLAS TÉCNICAS:
            - Usa **estilos en línea (inline styles)** para todo el CSS. No uses clases que requieran CSS externo.
            - Usa etiquetas semánticas HTML5 (section, article, header, footer).
            - Asegúrate de que las imágenes tengan \`max-width: 100%; height: auto;\` para ser responsivas.
            - Si el contenido es muy corto, expándelo visualmente con padding y bordes, pero no inventes texto.
            
            FORMATO DE RESPUESTA:
            - Devuelve SOLO un array JSON válido de strings.
            - Ejemplo: ["<div style='...'>...</div>", "<section style='...'>...</section>", "..."]
            - NO incluyas markdown (\`\`\`json), ni explicaciones. Solo el array JSON puro.
    `;
};
