import { apiClient } from "./client.js";

export const hackathonsApi = {
  list(params = {}) {
    return apiClient.get("/api/hackathons", { params });
  },
  get(id) {
    return apiClient.get(`/api/hackathons/${id}`);
  },
  create(payload) {
    return apiClient.post("/api/hackathons", payload);
  },
  update(id, payload) {
    return apiClient.put(`/api/hackathons/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/api/hackathons/${id}`);
  },
  analytics(id) {
    return apiClient.get(`/api/hackathons/${id}/analytics`);
  },
};
