import { computeHackathonStatus, pluralize } from "./format.js";

export function getSubmissionHackathonId(submission) {
  return submission?.hackathonId?._id || submission?.hackathonId || "";
}

export function hasRecordedScore(evaluation) {
  return evaluation?.score !== null && evaluation?.score !== undefined;
}

export function getSubmissionEvaluationProgress(evaluations = []) {
  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(hasRecordedScore).length;

  return {
    totalEvaluations,
    completedEvaluations,
    pendingEvaluations: Math.max(totalEvaluations - completedEvaluations, 0),
  };
}

export function getHackathonPublishState(hackathon, submissions = [], evaluationMap = {}) {
  if (!hackathon?._id) {
    return {
      canPublish: false,
      completedEvaluations: 0,
      pendingEvaluations: 0,
      reason: "Select a hackathon to inspect publish readiness.",
      status: "upcoming",
      submissionCount: 0,
      totalEvaluations: 0,
    };
  }

  const status = computeHackathonStatus(hackathon);
  const scopedSubmissions = submissions.filter(
    (submission) => getSubmissionHackathonId(submission) === hackathon._id
  );

  const totals = scopedSubmissions.reduce(
    (summary, submission) => {
      const progress = getSubmissionEvaluationProgress(
        evaluationMap[submission._id] || []
      );

      return {
        submissionCount: summary.submissionCount + 1,
        totalEvaluations: summary.totalEvaluations + progress.totalEvaluations,
        completedEvaluations:
          summary.completedEvaluations + progress.completedEvaluations,
        pendingEvaluations: summary.pendingEvaluations + progress.pendingEvaluations,
      };
    },
    {
      submissionCount: 0,
      totalEvaluations: 0,
      completedEvaluations: 0,
      pendingEvaluations: 0,
    }
  );

  let reason = "Results can be published once the leaderboard is ready.";

  if (hackathon.resultsPublished) {
    reason = "Results are already published for this hackathon.";
  } else if (status !== "completed") {
    reason = "Results become available after the hackathon ends.";
  } else if (totals.pendingEvaluations > 0) {
    reason = `Waiting for ${pluralize(totals.pendingEvaluations, "score")} to be recorded.`;
  } else if (totals.totalEvaluations > 0) {
    reason = `All assigned reviews are complete across ${pluralize(
      totals.submissionCount,
      "submission"
    )}.`;
  } else if (totals.submissionCount > 0) {
    reason = "No judge scores are assigned to these submissions, so the current leaderboard can be published.";
  } else {
    reason = "No submissions were received, but the result set can still be published.";
  }

  return {
    ...totals,
    canPublish:
      !hackathon.resultsPublished &&
      status === "completed" &&
      totals.pendingEvaluations === 0,
    reason,
    status,
  };
}
