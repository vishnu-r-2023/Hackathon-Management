import { apiClient } from "./client.js";

export const evaluationsApi = {
  create(payload) {
    return apiClient.post("/api/evaluations", payload);
  },
  bySubmission(submissionId) {
    return apiClient.get(`/api/evaluations/${submissionId}`);
  },
};
