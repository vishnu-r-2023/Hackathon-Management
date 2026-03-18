import { apiClient } from "./client.js";

export const usersApi = {
  list(params = {}) {
    return apiClient.get("/api/users", { params });
  },
  remove(id) {
    return apiClient.delete(`/api/users/${id}`);
  },
};
