import axios from "axios";

const API_URL = "http://localhost:8080/api/visitas";

const VisitaService = {
    // Register a visit
    registerVisit: async (contenidoId) => {
        try {
            const response = await axios.post(`${API_URL}`, null, {
                params: { contenidoId },
            });
            return response.data;
        } catch (error) {
            console.error("Error registering visit:", error);
            throw error;
        }
    },

    // Get visit statistics
    getVisitStats: async (period = "mes") => {
        try {
            const response = await axios.get(`${API_URL}/stats`, {
                params: { period },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching visit stats:", error);
            throw error;
        }
    },

    // Get visits by content ID
    getVisitsByContenido: async (contenidoId, period = "mes") => {
        try {
            const response = await axios.get(`${API_URL}/contenido/${contenidoId}`, {
                params: { period },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching visits by contenido:", error);
            throw error;
        }
    },
};

export default VisitaService;
