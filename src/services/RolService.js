import api from "../api/api";

const RolService = {
  // Obtener todos los roles
  getAllRoles: async () => {
    try {
      const response = await api.get("/rol");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener roles";
    }
  },

  // Obtener rol por ID
  getRolById: async (id) => {
    try {
      const response = await api.get(`/rol/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener rol";
    }
  },

  // Crear rol
  createRol: async (rolData) => {
    try {
      const response = await api.post("/rol", rolData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear rol";
    }
  },

  // Actualizar rol
  updateRol: async (id, rolData) => {
    try {
      const response = await api.put(`/rol/${id}`, rolData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar rol";
    }
  },

  // Eliminar rol
  deleteRol: async (id) => {
    try {
      const response = await api.delete(`/rol/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar rol";
    }
  }
};

export default RolService;
