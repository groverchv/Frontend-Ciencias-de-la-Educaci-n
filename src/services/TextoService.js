// src/services/TextoService.js
import api from "../api/api";
import AuthService from "./AuthService";

// Helper para obtener el usuario
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

const TextoService = {
  // GET /api/texto
  getAllTextos: async () => {
    try {
      const response = await api.get("/texto");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener textos";
    }
  },

  // GET /api/texto/{id}
  getTextoById: async (id) => {
    try {
      const response = await api.get(`/texto/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener texto";
    }
  },

  // POST /api/texto
  createTexto: async (textoData) => {
    try {
      const payload = { 
        ...textoData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.post("/texto", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear texto";
    }
  },

  // PUT /api/texto/{id}
  updateTexto: async (id, textoData) => {
    try {
      const payload = { 
        ...textoData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.put(`/texto/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar texto";
    }
  },

  // DELETE /api/texto/{id}
  deleteTexto: async (id) => {
    try {
      const response = await api.delete(`/texto/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar texto";
    }
  }
};

export default TextoService;