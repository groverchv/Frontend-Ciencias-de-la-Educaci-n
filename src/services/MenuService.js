import api from "../api/api";
import AuthService from "./AuthService";

// Helper interno para obtener el objeto { id: X } del usuario actual
const getUsuarioActualObj = () => {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    
    if (user.id) return { id: user.id };
    if (user.usuario?.id) return { id: user.usuario.id };
    if (user.user?.id) return { id: user.user.id };
    
    return null;
  } catch (e) {
    console.error("Error obteniendo usuario en MenuService:", e);
    return null;
  }
};

const MenuService = {
  // Obtener todos los menús
  getAllMenus: async () => {
    try {
      const response = await api.get("/menu"); // <--- Corregido a /api/menu
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener menús";
    }
  },

  // Obtener menú por ID
  getMenuById: async (id) => {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener menú";
    }
  },

  // Crear menú
  createMenu: async (menuData) => {
    try {
      const payload = {
        ...menuData,
        usuario_id: getUsuarioActualObj()
      };
      
      const response = await api.post("/menu", payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al crear menú";
    }
  },

  // Actualizar menú
  updateMenu: async (id, menuData) => {
    try {
      const payload = {
        ...menuData,
        usuario_id: getUsuarioActualObj()
      };

      const response = await api.put(`/menu/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al actualizar menú";
    }
  },

  // Eliminar menú
  deleteMenu: async (id) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al eliminar menú";
    }
  }
};

export default MenuService;