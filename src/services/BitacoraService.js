import api from "../api/api.js";

const BitacoraService = {
  getAllBitacoras: async () => {
    try {
      const response = await api.get("/bitacora");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener las bitácoras"
      );
    }
  },

  getBitacoraById: async (id) => {
    try {
      const response = await api.get(`/bitacora/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al obtener la bitácora"
      );
    }
  },

  deleteBitacora: async (id) => {
    try {
      const response = await api.delete(`/bitacora/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al eliminar la bitácora"
      );
    }
  },

  // Filtros avanzados
  getBitacorasByUsuario: async (usuarioId) => {
    try {
      const response = await api.get(`/bitacora/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al filtrar bitácoras por usuario"
      );
    }
  },

  getBitacorasByFechas: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get("/bitacora/fecha", {
        params: { inicio: fechaInicio, fin: fechaFin }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al filtrar bitácoras por fecha"
      );
    }
  },

  getBitacorasByAccion: async (accion) => {
    try {
      const response = await api.get(`/bitacora/accion/${accion}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al filtrar bitácoras por acción"
      );
    }
  }
};

export default BitacoraService;
