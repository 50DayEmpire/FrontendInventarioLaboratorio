import apiClient from "@/services/apiClient";

export const AuthService = {
  login: async (credentials) => {
    const response = await apiClient.post("api/Auth/login", credentials);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
  register: async (userData) => {
    const response = await apiClient.post("api/Auth/register", userData);
  },
};
