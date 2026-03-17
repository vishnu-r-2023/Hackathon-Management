import { useQuery, useMutation } from 'react-query';
import { toast } from 'sonner';
import { hackathonAPI, teamAPI, submissionAPI, evaluationAPI, resultAPI } from '../services/endpoints';

// Hackathon Hooks
export const useHackathons = (params) => {
  return useQuery(
    ['hackathons', params],
    () => hackathonAPI.getAll(params),
    { select: (res) => res.data.hackathons }
  );
};

export const useHackathonById = (id) => {
  return useQuery(
    ['hackathon', id],
    () => hackathonAPI.getById(id),
    { select: (res) => res.data.hackathon, enabled: !!id }
  );
};

export const useHackathonAnalytics = (id) => {
  return useQuery(
    ['hackathon-analytics', id],
    () => hackathonAPI.getAnalytics(id),
    { select: (res) => res.data, enabled: !!id }
  );
};

// Team Hooks
export const useTeams = (hackathonId) => {
  return useQuery(
    ['teams', hackathonId],
    () => teamAPI.getByHackathon(hackathonId),
    { select: (res) => res.data.teams, enabled: !!hackathonId }
  );
};

// Submission Hooks
export const useSubmissions = (hackathonId) => {
  return useQuery(
    ['submissions', hackathonId],
    () => submissionAPI.getByHackathon(hackathonId),
    { select: (res) => res.data.submissions, enabled: !!hackathonId }
  );
};

// Evaluation Hooks
export const useAssignedSubmissions = () => {
  return useQuery(
    'assigned-submissions',
    () => evaluationAPI.getAssigned(),
    {
      select: (res) => (res.data.assigned || []).map((a) => ({
        ...a.submission,
        evaluationId: a.evaluationId,
        score: a.score,
        feedback: a.feedback,
      })),
    }
  );
};

// Result Hooks
export const useLeaderboard = (hackathonId) => {
  return useQuery(
    ['leaderboard', hackathonId],
    () => resultAPI.getLeaderboard(hackathonId),
    { select: (res) => res.data.leaderboard, enabled: !!hackathonId }
  );
};

// Mutations
export const useCreateHackathon = (onSuccess) => {
  return useMutation(
    (data) => hackathonAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Hackathon created successfully!');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating hackathon');
      },
    }
  );
};

export const useCreateSubmission = (onSuccess) => {
  return useMutation(
    (data) => submissionAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Submission created successfully!');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error creating submission');
      },
    }
  );
};

export const useCreateEvaluation = (onSuccess) => {
  return useMutation(
    (data) => evaluationAPI.create(data),
    {
      onSuccess: () => {
        toast.success('Evaluation submitted successfully!');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error submitting evaluation');
      },
    }
  );
};
