// src/services/userService.js
import apiClient from "./apiClient";

export const UserService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await apiClient.get("api/User");
    return response.data;
  },

  // Obtener un usuario por ID y transformar la respuesta si es necesario
  getById: async (id) => {
    const { data } = await apiClient.get(`api/User/${id}`);
    // Aquí puedes limpiar datos: ej. combinar nombre y apellido
    return {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`,
    };
  },

  //Actualizar rol de un usuario
  updateRole: async (body) => {
    const response = await apiClient.post(`api/User/actualizar-roles`, body);
    return response.data;
  },

  deleteUser: async (id) => {
    await apiClient.delete(`api/User/${id}`);
  },
};
