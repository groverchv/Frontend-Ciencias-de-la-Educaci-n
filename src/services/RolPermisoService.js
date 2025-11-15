import api from "../api/api";

const RolPermisoService = {
  // Obtener permisos de un rol
  getPermisosByRol: async (rolId) => {
    try {
      const response = await api.get(`/rol-permiso/${rolId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener permisos del rol";
    }
  },

  // Asignar múltiples permisos a un rol
  asignarPermisosARol: async (rolId, permisosIds) => {
    try {
      const response = await api.post(`/rol-permiso/${rolId}`, { permisosIds });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al asignar permisos";
    }
  },

  // Agregar un permiso individual
  agregarPermisoARol: async (rolId, permisoId) => {
    try {
      const response = await api.put(`/rol-permiso/${rolId}/agregar/${permisoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al agregar permiso";
    }
  },

  // Quitar un permiso de un rol
  quitarPermisoDeRol: async (rolId, permisoId) => {
    try {
      const response = await api.delete(`/rol-permiso/${rolId}/quitar/${permisoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al quitar permiso";
    }
  }
};

export default RolPermisoService;
