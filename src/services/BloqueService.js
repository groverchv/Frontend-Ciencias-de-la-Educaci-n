import api from "../api/api";
import AuthService from "./AuthService";

// Helper para obtener el objeto usuario actual
const getUsuarioActualObj = () => {
  try {
    const user = AuthService.getCurrentUser();
    if (!user) return null;

    if (user.id) return { id: user.id };
    if (user.usuario?.id) return { id: user.usuario.id };
    if (user.user?.id) return { id: user.user.id };

    return null;
  } catch (e) {
    console.error("Error al obtener usuario en BloqueService:", e);
    return null;
  }
};

const BloqueService = {
  /**
   * Obtiene todos los bloques de un Contenido
   * @param {number} contenidoId - ID del contenido
   */
  getBlocksByContenido: async (contenidoId) => {
    try {
      const response = await api.get(`/contenido/${contenidoId}/bloques`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al obtener bloques";
    }
  },

  /**
   * Guarda todos los bloques de un Contenido
   * @param {number} contenidoId - ID del contenido
   * @param {Array} bloques - Array de bloques a guardar
   */
  saveBlocksForContenido: async (contenidoId, bloques) => {
    try {
      const payload = {
        bloques: bloques,
        usuario_id: getUsuarioActualObj()
      };

      const response = await api.post(`/contenido/${contenidoId}/bloques`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al guardar bloques";
    }
  }
};

export default BloqueService;