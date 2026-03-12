// src/services/productService.js
import apiClient from "@/services/apiClient";

export const ProductService = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await apiClient.get("api/Products");
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const response = await apiClient.get(`api/Products/${id}`);
    return response.data;
  },

  // Crear un nuevo producto
  create: (productData) => {
    return apiClient.post("api/Products", productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Actualizar un producto existente
  update: (id, productData) => {
    return apiClient.patch(`api/Products/${id}`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Eliminar un producto por ID
  delete: (id) => {
    return apiClient.delete(`api/Products/${id}`);
  },
};
