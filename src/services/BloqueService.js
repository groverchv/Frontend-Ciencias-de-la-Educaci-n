// src/services/BloqueService.js
// --- REEMPLAZA TU ARCHIVO ANTERIOR ---

import api from "../api/api";
import AuthService from "./AuthService";

// Helper interno (copiado de tus otros servicios)
const getUsuarioActualObj = () => {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;
    if (user.id) return { id: user.id };
    if (user.usuario?.id) return { id: user.usuario.id };
    if (user.user?.id) return { id: user.user.id };
    return null;
  } catch (e) {
    console.error("Error obteniendo usuario en BloqueService:", e);
    return null;
  }
};

const BloqueService = {
  /**
   * Endpoint 1: Obtiene el array de bloques para un SubMenú.
   * Llama a: GET /api/sub_menu/{id}/bloques
   */
  getBlockesBySubMenu: async (sub_menu_id) => {
    try {
      const response = await api.get(`/sub_menu/${sub_menu_id}/bloques`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener los bloques";
    }
  },

  /**
   * Endpoint 2: Guarda TODOS los bloques para un SubMenú.
   * Llama a: POST /api/sub_menu/{id}/bloques
   * Envía el payload que el DTO de Spring Boot (BloqueSaveRequestDto) espera.
   */
  saveBlocksForSubMenu: async (sub_menu_id, array_de_bloques) => {
    try {
      const payload = {
        // Coincide con el DTO: { "usuario_id": {...}, "bloques": [...] }
        usuario_id: getUsuarioActualObj(),
        bloques: array_de_bloques
      };

      const response = await api.post(`/sub_menu/${sub_menu_id}/bloques`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al guardar los bloques";
    }
  }
};

export default BloqueService;