// src/services/Sub_TituloService.js
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

const Sub_TituloService = {
  // GET /api/sub_titulo
  getAllSubTitulos: async () => {
    try {
      const response = await api.get("/sub_titulo");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener sub-títulos";
    }
  },

  // GET /api/sub_titulo/{id}
  getSubTituloById: async (id) => {
    try {
      const response = await api.get(`/sub_titulo/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener sub-título";
    }
  },

  // POST /api/sub_titulo
  createSubTitulo: async (subTituloData) => {
    try {
      const payload = { 
        ...subTituloData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.post("/sub_titulo", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear sub-título";
    }
  },

  // PUT /api/sub_titulo/{id}
  updateSubTitulo: async (id, subTituloData) => {
    try {
      const payload = { 
        ...subTituloData, 
        usuario_id: getUsuarioActualObj() 
      };
      const response = await api.put(`/sub_titulo/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar sub-título";
    }
  },

  // DELETE /api/sub_titulo/{id} (Asumido del método deleteSubTitulo)
  deleteSubTitulo: async (id) => {
    try {
      const response = await api.delete(`/sub_titulo/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar sub-título";
    }
  }
};

export default Sub_TituloService;