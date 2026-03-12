// api/client.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para inyectar el token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para manejar errores 401 (no autorizado)
apiClient.interceptors.response.use(
  (response) => response, // Si la respuesta es 2xx, no hace nada
  (error) => {
    if (error.response && error.response.status === 401) {
      // 1. Limpiar el token local (opcional pero recomendado)
      localStorage.removeItem("token");

      // 2. Redirigir al login (index)
      // Usamos window.location para forzar un refresh y limpiar estados de React
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
