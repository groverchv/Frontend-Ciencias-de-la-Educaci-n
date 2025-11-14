import api from "../api/api";

const UsuarioService = {
  // Obtener todos los usuarios
  getAllUsuarios: async () => {
    try {
      const response = await api.get("/usuarios");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener usuarios";
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener usuario";
    }
  },

  // Crear usuario
  createUsuario: async (usuarioData) => {
    try {
      const response = await api.post("/usuarios", usuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear usuario";
    }
  },

  // Actualizar usuario
  updateUsuario: async (id, usuarioData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, usuarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar usuario";
    }
  },

  // Eliminar usuario
  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar usuario";
    }
  },

  // Cambiar estado del usuario
  toggleEstado: async (id) => {
    try {
      const response = await api.patch(`/usuarios/${id}/estado`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al cambiar estado";
    }
  },
};

export default UsuarioService;
