import { apiClient } from "./client.js";

export const teamsApi = {
  create(payload) {
    return apiClient.post("/api/teams", payload);
  },
  join(teamId) {
    return apiClient.post(`/api/teams/join/${teamId}`);
  },
  byHackathon(hackathonId) {
    return apiClient.get(`/api/teams/${hackathonId}`);
  },
};
