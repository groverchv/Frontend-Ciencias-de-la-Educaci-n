// src/services/TituloService.js
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

const TituloService = {
  // GET /api/titulo
  getAllTitulos: async () => {
    try {
      const response = await api.get("/titulo");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener títulos";
    }
  },

  // GET /api/titulo/{id}
  getTituloById: async (id) => {
    try {
      const response = await api.get(`/titulo/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener título";
    }
  },

  // POST /api/titulo
  createTitulo: async (tituloData) => {
    try {
      const payload = { 
        ...tituloData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.post("/titulo", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear título";
    }
  },

  // PUT /api/titulo/{id}
  updateTitulo: async (id, tituloData) => {
    try {
      const payload = { 
        ...tituloData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.put(`/titulo/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar título";
    }
  },

  // DELETE /api/titulo/{id}
  deleteTitulo: async (id) => {
    try {
      const response = await api.delete(`/titulo/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar título";
    }
  }
};

export default TituloService;