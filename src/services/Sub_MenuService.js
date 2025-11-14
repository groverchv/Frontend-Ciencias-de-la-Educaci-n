import api from "../api/api";
import AuthService from "./AuthService";

// Helper interno para obtener el objeto usuario actual
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

const Sub_MenuService = {
  // Obtener todos
  getAllSubMenu: async () => {
    try {
      const response = await api.get("/sub_menu"); // <--- Corregido a /api/sub_menu
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener sub-menús";
    }
  },

  // Obtener por ID
  getSubMenuById: async (id) => {
    try {
      const response = await api.get(`/sub_menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener sub-menú";
    }
  },

  // Crear
  createSubMenu: async (data) => {
    try {
      const payload = {
        ...data,
        usuario_id: getUsuarioActualObj()
      };
      const response = await api.post("/sub_menu", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear sub-menú";
    }
  },

  // Actualizar
  updateSubMenu: async (id, data) => {
    try {
      const payload = {
        ...data,
        usuario_id: getUsuarioActualObj()
      };
      const response = await api.put(`/sub_menu/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar sub-menú";
    }
  },

  // Eliminar
  deleteSubMenu: async (id) => {
    try {
      await api.delete(`/sub_menu/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar sub-menú";
    }
  }
};

export default Sub_MenuService;