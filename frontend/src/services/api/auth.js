import { apiClient } from "./client.js";

export const authApi = {
  login(payload) {
    return apiClient.post("/api/auth/login", payload);
  },
  register(payload) {
    return apiClient.post("/api/auth/register", payload);
  },
};
