import apiClient from "@/services/apiClient";
import { create } from "domain";
import { get } from "http";

export const CategoriaService = {
  getAll: async () => {
    const response = await apiClient.get("api/Categoria");
    return response.data;
  },

  create: (categoriaData) => {
    return apiClient.post("api/Categoria", categoriaData);
  },

  update: (id, categoriaData) => {
    return apiClient.put(`api/Categoria/${id}`, categoriaData);
  },
};
