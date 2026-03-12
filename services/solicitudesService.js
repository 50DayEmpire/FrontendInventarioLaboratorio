import apiClient from "@/services/apiClient";

export const SolicitudesService = {
  getAll: async () => {
    const response = await apiClient.get("api/Solicitud");
    return response.data;
  },
  AdminDeny: async (id, mensaje) => {
    const response = await apiClient.post(`api/Solicitud/${id}/rechazar`, mensaje, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response.data;
  },
  AdminApprove: async (id) => {
    const response = await apiClient.post(`api/Solicitud/${id}/aprobar`);
    return response.data;
  },
  create: async (solicitudData) => {
    const response = await apiClient.post("api/Solicitud", solicitudData);
    return response.data;
  },
};
