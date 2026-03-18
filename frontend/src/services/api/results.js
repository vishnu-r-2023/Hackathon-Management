import { apiClient } from "./client.js";

export const resultsApi = {
  publish(hackathonId) {
    return apiClient.post(`/api/results/publish/${hackathonId}`);
  },
  get(hackathonId) {
    return apiClient.get(`/api/results/${hackathonId}`);
  },
};
