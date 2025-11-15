// src/services/ArchivoService.js
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

const ArchivoService = {
  // GET /api/archivos
  getAllArchivos: async () => {
    try {
      const response = await api.get("/archivos");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener archivos";
    }
  },

  // GET /api/archivos/{id}
  getArchivoById: async (id) => {
    try {
      const response = await api.get(`/archivos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener archivo";
    }
  },

  // POST /api/archivos
  // (Equivalente a tu 'guardarArchivo' para un nuevo objeto)
  createArchivo: async (archivoData) => {
    try {
      const payload = {
        ...archivoData,
        usuario_id: getUsuarioActualObj() // Asumiendo que se necesita
      };
      const response = await api.post("/archivos", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al guardar archivo";
    }
  },

  // PUT /api/archivos/{id}
  updateArchivo: async (id, archivoData) => {
    try {
      const payload = {
        ...archivoData,
        usuario_id: getUsuarioActualObj() // Asumiendo que se necesita
      };
      const response = await api.put(`/archivos/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar archivo";
    }
  },

  // DELETE /api/archivos/{id}
  deleteArchivo: async (id) => {
    try {
      const response = await api.delete(`/archivos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar archivo";
    }
  }
};

export default ArchivoService;