import api from "../api/api";

const AuthService = {
  // Login
  login: async (correo, password) => {
    try {
      const response = await api.post("/auth/login", { correo, password });
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al iniciar sesión";
    }
  },

  // Logout
  logout: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.refreshToken) {
      api.post("/auth/logout", { refreshToken: user.refreshToken }).catch(() => {});
    }
    localStorage.removeItem("user");
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error al registrar usuario";
    }
  },

  // Get current user
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  // Refresh token
  refreshToken: async () => {
    const user = AuthService.getCurrentUser();
    if (!user?.refreshToken) {
      throw new Error("No hay refresh token disponible");
    }

    try {
      const response = await api.post("/auth/refresh", {
        refreshToken: user.refreshToken,
      });

      if (response.data.token) {
        const updatedUser = { ...user, token: response.data.token };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return response.data.token;
      }
    } catch (error) {
      AuthService.logout();
      throw error;
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const user = AuthService.getCurrentUser();
    return !!user?.token;
  },

  // Obtener el token
  getToken: () => {
    const user = AuthService.getCurrentUser();
    return user?.token;
  },
};

export default AuthService;
