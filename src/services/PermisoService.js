import api from "../api/api";

const PermisoService = {
  // Obtener todos los permisos
  getAllPermisos: async () => {
    try {
      const response = await api.get("/permiso");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener permisos";
    }
  },

  // Obtener permiso por ID
  getPermisoById: async (id) => {
    try {
      const response = await api.get(`/permiso/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener permiso";
    }
  },

  // Crear permiso
  createPermiso: async (permisoData) => {
    try {
      const response = await api.post("/permiso", permisoData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear permiso";
    }
  },

  // Actualizar permiso
  updatePermiso: async (id, permisoData) => {
    try {
      const response = await api.put(`/permiso/${id}`, permisoData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar permiso";
    }
  },

  // Eliminar permiso
  deletePermiso: async (id) => {
    try {
      const response = await api.delete(`/permiso/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar permiso";
    }
  }
};

export default PermisoService;
