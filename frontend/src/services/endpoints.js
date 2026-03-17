import api from './api';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// User APIs
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
};

// Hackathon APIs
export const hackathonAPI = {
  getAll: (params) => api.get('/hackathons', { params }),
  getById: (id) => api.get(`/hackathons/${id}`),
  create: (data) => api.post('/hackathons', data),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`),
  getAnalytics: (id) => api.get(`/hackathons/${id}/analytics`),
};

// Team APIs
export const teamAPI = {
  getByHackathon: (hackathonId) => api.get(`/teams/${hackathonId}`),
  create: (data) => api.post('/teams', data),
  joinTeam: (teamId) => api.post(`/teams/join/${teamId}`),
};

// Submission APIs
export const submissionAPI = {
  getByHackathon: (hackathonId) => api.get(`/submissions?hackathonId=${hackathonId}`),
  create: (data) => api.post('/submissions', data),
  getById: (id) => api.get(`/submissions/${id}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  assignJudge: (submissionId, judgeId) => api.post(`/submissions/${submissionId}/assign-judge`, { judgeId }),
};

// Evaluation APIs
export const evaluationAPI = {
  getBySubmission: (submissionId) => api.get(`/evaluations/${submissionId}`),
  create: (data) => api.post('/evaluations', data),
  update: (id, data) => api.put(`/evaluations/${id}`, data),
  getAssigned: () => api.get('/submissions/assigned'),
};

// Result APIs
export const resultAPI = {
  getByHackathon: (hackathonId) => api.get(`/results/${hackathonId}`),
  getLeaderboard: (hackathonId) => api.get(`/results/${hackathonId}`),
  publishResults: (hackathonId) => api.post(`/results/publish/${hackathonId}`),
};
