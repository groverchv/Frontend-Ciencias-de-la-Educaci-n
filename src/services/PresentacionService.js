// Servicio CRUD de Imagenes contra /api/imagen
import api from "../api/api";

export const ImagenesAPI = {
  // LISTAR (GET /imagen)
  list: async (params) => {
    const res = await api.get("/presentacion", { params });
    return res.data;
  },
  // OBTENER (GET /imagen/{id})
  get: async (id) => {
    const res = await api.get(`/presentacion/${id}`);
    return res.data;
  },
  // CREAR (POST /imagen)
  create: async (payload) => {
    const res = await api.post("/presentacion", payload);
    return res.data;
  },
  // ACTUALIZAR (PUT /imagen/{id})
  update: async (id, payload) => {
    const res = await api.put(`/presentacion/${id}`, payload);
    return res.data;
  },
  // ELIMINAR (DELETE /imagen/{id})
  remove: async (id) => {
    await api.delete(`/presentacion/${id}`);
    return true;
  },
};
