import { apiClient } from "./client.js";

export const submissionsApi = {
  create(payload) {
    return apiClient.post("/api/submissions", payload);
  },
  list(params = {}) {
    return apiClient.get("/api/submissions", { params });
  },
  assigned() {
    return apiClient.get("/api/submissions/assigned");
  },
  assignJudge(submissionId, judgeId) {
    return apiClient.post(`/api/submissions/${submissionId}/assign-judge`, {
      judgeId,
    });
  },
};
