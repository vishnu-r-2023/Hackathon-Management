import { useMemo, useState } from "react";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { useSubmissionEvaluations } from "../../hooks/useSubmissionEvaluations.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { resultsApi } from "../../services/api/results.js";
import { submissionsApi } from "../../services/api/submissions.js";
import { usersApi } from "../../services/api/users.js";
import { formatDateTime, formatNumber } from "../../utils/format.js";
import {
  getHackathonPublishState,
  getSubmissionHackathonId,
} from "../../utils/publishState.js";

const PAGE_SIZE = 8;

export default function AdminSubmissionsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hackathonFilter, setHackathonFilter] = useState("all");
  const [assignments, setAssignments] = useState({});
  const [busyId, setBusyId] = useState("");
  const [publishHackathonId, setPublishHackathonId] = useState("");

  const { data, error, loading, refetch, setData } = useAsyncData(async () => {
    const [submissions, judges, hackathons] = await Promise.all([
      submissionsApi.list({ limit: 100 }),
      usersApi.list({ limit: 100, role: "judge" }),
      hackathonsApi.list({ limit: 100 }),
    ]);

    return {
      submissions: submissions.submissions || [],
      judges: judges.users || [],
      hackathons: hackathons.hackathons || [],
    };
  }, []);

  const submissions = data?.submissions || [];
  const judges = data?.judges || [];
  const hackathons = data?.hackathons || [];
  const publishTarget = hackathons.find((hackathon) => hackathon._id === publishHackathonId);
  const publishSubmissionIds = useMemo(
    () =>
      submissions
        .filter((submission) => getSubmissionHackathonId(submission) === publishHackathonId)
        .map((submission) => submission._id)
        .filter(Boolean),
    [publishHackathonId, submissions]
  );
  const publishEvaluationsQuery = useSubmissionEvaluations(publishSubmissionIds, {
    refreshInterval: publishHackathonId ? 12000 : 0,
  });
  const publishEvaluationMap = publishEvaluationsQuery.data || {};
  const publishState = useMemo(
    () =>
      getHackathonPublishState(
        publishTarget,
        submissions,
        publishEvaluationMap
      ),
    [publishEvaluationMap, publishTarget, submissions]
  );

  const filtered = useMemo(() => {
    return submissions.filter((submission) => {
      const submissionHackathonId =
        submission.hackathonId?._id || submission.hackathonId || "";
      const matchesHackathon =
        hackathonFilter === "all" || submissionHackathonId === hackathonFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        !search ||
        submission.projectTitle?.toLowerCase().includes(query) ||
        submission.teamId?.name?.toLowerCase().includes(query) ||
        submission.hackathonId?.title?.toLowerCase().includes(query);

      return matchesHackathon && matchesSearch;
    });
  }, [hackathonFilter, search, submissions]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAssign(submissionId) {
    const judgeId = assignments[submissionId];
    if (!judgeId) return;

    setBusyId(submissionId);
    try {
      await submissionsApi.assignJudge(submissionId, judgeId);
      toast.toast({
        title: "Judge assigned",
        description: "The submission is now in a judge review lane.",
        type: "success",
      });
      publishEvaluationsQuery.refetch();
      refetch();
    } catch (nextError) {
      toast.toast({
        title: "Assignment failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  async function handlePublishResults() {
    if (!publishHackathonId) return;
    setBusyId(publishHackathonId);

    try {
      await resultsApi.publish(publishHackathonId);
      setData((current) => ({
        ...(current || {}),
        hackathons: (current?.hackathons || []).map((hackathon) =>
          hackathon._id === publishHackathonId
            ? { ...hackathon, resultsPublished: true, status: "completed" }
            : hackathon
        ),
      }));
      toast.toast({
        title: "Results published",
        description: `${publishTarget?.title || "Hackathon"} leaderboard is now public.`,
        type: "success",
      });
      refetch();
    } catch (nextError) {
      toast.toast({
        title: "Publish failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return <Card className="p-10">Loading submissions...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="assignment_late"
        title="Could not load submissions"
      />
    );
  }

  const publishChecking =
    publishEvaluationsQuery.loading &&
    publishSubmissionIds.length > 0 &&
    !Object.keys(publishEvaluationMap).length;
  const publishDisabled =
    !publishHackathonId ||
    publishChecking ||
    Boolean(publishEvaluationsQuery.error) ||
    !publishState.canPublish;
  const publishSummary = !publishHackathonId
    ? "Select a hackathon to inspect publish readiness."
    : publishEvaluationsQuery.error
      ? publishEvaluationsQuery.error.message
      : publishChecking
        ? "Checking score completion across assigned reviews."
        : publishState.reason;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            Review pipeline
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
            Submission operations
          </h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Submissions</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {formatNumber(submissions.length)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Judges</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {formatNumber(judges.length)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Hackathons</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {formatNumber(hackathons.length)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Results publishing
              </p>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                Publish only after the evaluation set is complete for the selected hackathon.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Submissions</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {publishHackathonId ? formatNumber(publishState.submissionCount) : "--"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Scores in</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {publishHackathonId ? formatNumber(publishState.completedEvaluations) : "--"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Scores pending</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {publishHackathonId ? formatNumber(publishState.pendingEvaluations) : "--"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-ink-500 dark:text-ink-300">
            {publishSummary}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <select
                className="field-base min-w-[260px]"
                onChange={(event) => setPublishHackathonId(event.target.value)}
                value={publishHackathonId}
              >
                <option value="">Select hackathon</option>
                {hackathons.map((hackathon) => (
                  <option key={hackathon._id} value={hackathon._id}>
                    {hackathon.title}
                  </option>
                ))}
              </select>
              <Button
                className="min-w-[12rem]"
                disabled={publishDisabled}
                loading={busyId === publishHackathonId}
                onClick={handlePublishResults}
                variant={!publishDisabled && !publishTarget?.resultsPublished ? "primary" : "secondary"}
              >
                {publishChecking ? "Checking scores..." : "Publish results"}
              </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="field-base min-w-[240px]"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search project, team, or hackathon"
            value={search}
          />
          <select
            className="field-base min-w-[220px]"
            onChange={(event) => {
              setHackathonFilter(event.target.value);
              setPage(1);
            }}
            value={hackathonFilter}
          >
            <option value="all">All hackathons</option>
            {hackathons.map((hackathon) => (
              <option key={hackathon._id} value={hackathon._id}>
                {hackathon.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length ? (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-black/5 text-xs uppercase tracking-[0.24em] text-ink-500 dark:bg-white/[0.06] dark:text-ink-400">
                <tr>
                  <th className="px-5 py-4">Submission</th>
                  <th className="px-5 py-4">Hackathon</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Assign judge</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((submission) => (
                  <tr className="border-b border-white/8 last:border-b-0" key={submission._id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink-900 dark:text-white">
                        {submission.projectTitle}
                      </p>
                      <p className="text-sm text-ink-500 dark:text-ink-300">
                        Team: {submission.teamId?.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                      {submission.hackathonId?.title}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                      {formatDateTime(submission.submittedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-[280px] gap-3">
                        <select
                          className="field-base h-11 flex-1"
                          onChange={(event) =>
                            setAssignments((current) => ({
                              ...current,
                              [submission._id]: event.target.value,
                            }))
                          }
                          value={assignments[submission._id] || ""}
                        >
                          <option value="">Choose judge</option>
                          {judges.map((judge) => (
                            <option key={judge._id} value={judge._id}>
                              {judge.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          loading={busyId === submission._id}
                          onClick={() => handleAssign(submission._id)}
                          size="sm"
                        >
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            onPageChange={setPage}
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
          />
        </div>
      ) : (
        <EmptyState
          description="No submissions match the current filters."
          icon="assignment_turned_in"
          title="No submissions found"
        />
      )}
    </div>
  );
}
