import api from "../api/api";
import AuthService from "./AuthService";

// Helper para obtener usuario actual
const getUsuarioActualObj = () => {
    try {
        const user = AuthService.getCurrentUser();
        if (!user) return null;

        if (user.id) return { id: user.id };
        if (user.usuario?.id) return { id: user.usuario.id };
        if (user.user?.id) return { id: user.user.id };

        return null;
    } catch (e) {
        console.error("Error obteniendo usuario en ContenidoService:", e);
        return null;
    }
};

const ContenidoService = {
    // Obtener todos los contenidos
    getAllContenidos: async () => {
        try {
            const response = await api.get('/contenidos');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al obtener todos los contenidos";
        }
    },

    // Obtener todos los contenidos de un SubMenu
    getContenidosBySubMenu: async (subMenuId) => {
        try {
            const response = await api.get(`/sub_menu/${subMenuId}/contenidos`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al obtener contenidos";
        }
    },

    // Obtener un contenido específico con sus bloques
    getContenidoById: async (contenidoId) => {
        try {
            const response = await api.get(`/contenido/${contenidoId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al obtener contenido";
        }
    },

    // Crear nuevo contenido
    createContenido: async (subMenuId, titulo) => {
        try {
            const payload = {
                titulo,
                usuario_id: getUsuarioActualObj()
            };

            const response = await api.post(`/sub_menu/${subMenuId}/contenido`, payload);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al crear contenido";
        }
    },

    // Actualizar contenido (título/estado)
    updateContenido: async (contenidoId, updates) => {
        try {
            const response = await api.put(`/contenido/${contenidoId}`, updates);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Error al actualizar contenido";
        }
    },

    // Eliminar contenido
    deleteContenido: async (contenidoId) => {
        try {
            await api.delete(`/contenido/${contenidoId}`);
            return true;
        } catch (error) {
            throw error.response?.data?.message || "Error al eliminar contenido";
        }
    }
};

export default ContenidoService;
