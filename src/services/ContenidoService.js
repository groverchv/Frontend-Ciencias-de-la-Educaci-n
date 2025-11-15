// src/services/ContenidoService.js
import api from "../api/api";
import AuthService from "./AuthService";

// Helper para obtener el usuario (basado en tus otros servicios)
const getUsuarioActualObj = () => {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    if (user.id) return { id: user.id };
    if (user.usuario?.id) return { id: user.usuario.id };
    if (user.user?.id) return { id: user.user.id };
    return null;
  } catch (e) {
    console.error("Error al obtener usuario:", e);
    return null;
  }
};

const ContenidoService = {
  // GET /api/contenido (Asumido)
  getAllContenidos: async () => {
    try {
      const response = await api.get("/contenido");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener contenidos";
    }
  },

  // GET /api/contenido/{id} (Asumido)
  getContenidoById: async (id) => {
    try {
      const response = await api.get(`/contenido/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener contenido";
    }
  },

  // POST /api/contenido (Asumido)
  createContenido: async (contenidoData) => {
    try {
      const payload = {
        ...contenidoData,
        usuario_id: getUsuarioActualObj() // Asumiendo que se necesita
      };
      const response = await api.post("/contenido", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear contenido";
    }
  },

  // PUT /api/contenido/{id} (Asumido)
  updateContenido: async (id, contenidoData) => {
    try {
       const payload = {
        ...contenidoData,
        usuario_id: getUsuarioActualObj() // Asumiendo que se necesita
      };
      const response = await api.put(`/contenido/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar contenido";
    }
  },

  // DELETE /api/contenido/{id} (Asumido)
  deleteContenido: async (id) => {
    try {
      const response = await api.delete(`/contenido/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar contenido";
    }
  }
};

export default ContenidoService;