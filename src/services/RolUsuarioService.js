import api from "../api/api";

const RolUsuarioService = {
  // Obtener todas las asignaciones de roles a usuarios
  getAllRolUsuarios: async () => {
    try {
      const response = await api.get("/rol_usuario");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener asignaciones de roles";
    }
  },

  // Obtener una asignación específica por ID
  getRolUsuarioById: async (id) => {
    try {
      const response = await api.get(`/rol_usuario/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener la asignación de rol";
    }
  },

  // Crear una nueva asignación (Asignar rol a usuario)
  // Se espera que rolUsuarioData contenga { rol: {id: X}, usuario: {id: Y} } o { rol_id: X, usuario_id: Y }
  createRolUsuario: async (rolUsuarioData) => {
    try {
      const response = await api.post("/rol_usuario", rolUsuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al asignar el rol al usuario";
    }
  },

  // Actualizar una asignación existente
  updateRolUsuario: async (id, rolUsuarioData) => {
    try {
      const response = await api.put(`/rol_usuario/${id}`, rolUsuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar la asignación de rol";
    }
  },

  // Eliminar una asignación (Desasignar rol)
  deleteRolUsuario: async (id) => {
    try {
      const response = await api.delete(`/rol_usuario/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar la asignación de rol";
    }
  }
};

export default RolUsuarioService;