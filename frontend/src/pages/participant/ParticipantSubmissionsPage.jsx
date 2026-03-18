import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { TextAreaField, TextField } from "../../components/ui/Fields.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { resultsApi } from "../../services/api/results.js";
import { submissionsApi } from "../../services/api/submissions.js";
import { teamsApi } from "../../services/api/teams.js";
import { getEntityId, hasMember } from "../../utils/data.js";
import { computeHackathonStatus, formatDateTime } from "../../utils/format.js";
import { getCachedSubmission, setCachedSubmission } from "../../utils/submissionCache.js";

function ProgressChip({ active, label }) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-sm font-medium ${
        active
          ? "border-brand-400/20 bg-brand-500/[0.12] text-brand-200"
          : "border-white/10 bg-white/60 text-ink-500 dark:bg-white/[0.06] dark:text-ink-300"
      }`}
    >
      {label}
    </div>
  );
}

export default function ParticipantSubmissionsPage() {
  const auth = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    projectTitle: "",
    description: "",
    githubLink: "",
    demoLink: "",
  });
  const [knownSubmission, setKnownSubmission] = useState(null);

  const hackathonsQuery = useAsyncData(() => hackathonsApi.list({ limit: 100 }), [], {
    refreshInterval: 5000,
  });
  const hackathons = hackathonsQuery.data?.hackathons || [];
  const selectedHackathonId = searchParams.get("hackathon") || "";

  useEffect(() => {
    if (!selectedHackathonId && hackathons.length) {
      const preferred =
        hackathons.find((item) => computeHackathonStatus(item) !== "completed") ||
        hackathons[0];
      setSearchParams({ hackathon: preferred._id }, { replace: true });
    }
  }, [hackathons, selectedHackathonId, setSearchParams]);

  const teamsQuery = useAsyncData(
    () => teamsApi.byHackathon(selectedHackathonId),
    [selectedHackathonId],
    { enabled: Boolean(selectedHackathonId) }
  );

  const selectedHackathon = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathonId
  );
  const assignedJudges = selectedHackathon?.judgeIds || [];
  const teams = teamsQuery.data?.teams || [];
  const currentTeam = teams.find((team) => hasMember(team, auth.user?.id));

  const resultsQuery = useAsyncData(
    () => resultsApi.get(selectedHackathonId),
    [selectedHackathonId],
    {
      enabled: Boolean(selectedHackathonId && selectedHackathon?.resultsPublished),
      refreshInterval: 5000,
    }
  );

  const resultEntry = useMemo(() => {
    if (!currentTeam || !selectedHackathon?.resultsPublished) return null;
    return (resultsQuery.data?.leaderboard || []).find(
      (entry) => entry.teamId === getEntityId(currentTeam)
    );
  }, [currentTeam, resultsQuery.data?.leaderboard, selectedHackathon?.resultsPublished]);

  useEffect(() => {
    if (!currentTeam) {
      setKnownSubmission(null);
      return;
    }

    const cached = getCachedSubmission(getEntityId(currentTeam));
    if (cached) {
      setKnownSubmission(cached);
      return;
    }

    if (resultEntry) {
      setKnownSubmission({
        teamId: getEntityId(currentTeam),
        projectTitle: resultEntry.projectTitle,
        submittedAt: resultsQuery.data?.publishedAt,
        derivedFromResults: true,
      });
      return;
    }

    setKnownSubmission(null);
  }, [currentTeam, resultEntry, resultsQuery.data?.publishedAt]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentTeam) return;

    setBusy(true);
    try {
      const submission = await submissionsApi.create({
        ...form,
        teamId: getEntityId(currentTeam),
        hackathonId: selectedHackathonId,
      });

      setCachedSubmission(getEntityId(currentTeam), submission);
      setKnownSubmission(submission);
      toast.toast({
        title: "Submission received",
        description:
          submission.assignedJudgeCount > 0
            ? `${form.projectTitle} was submitted and routed to ${submission.assignedJudgeCount} judge${submission.assignedJudgeCount > 1 ? "s" : ""}.`
            : `${form.projectTitle} has been submitted.`,
        type: "success",
      });
    } catch (nextError) {
      if (nextError.message.includes("already submitted")) {
        const recovered = {
          ...form,
          teamId: getEntityId(currentTeam),
          submittedAt: new Date().toISOString(),
          recoveredFromConflict: true,
        };
        setCachedSubmission(getEntityId(currentTeam), recovered);
        setKnownSubmission(recovered);
      }

      toast.toast({
        title: "Submission failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (hackathonsQuery.loading) {
    return <Card className="p-10">Loading submission workspace...</Card>;
  }

  if (hackathonsQuery.error) {
    return (
      <EmptyState
        description={hackathonsQuery.error.message}
        icon="deployed_code"
        title="Could not load hackathons"
      />
    );
  }

  if (!hackathons.length) {
    return (
      <EmptyState
        description="No hackathons are open for submissions."
        icon="event_busy"
        title="No hackathons available"
      />
    );
  }

  const progress = {
    registered: Boolean(currentTeam),
    submitted: Boolean(knownSubmission),
    evaluated: Boolean(resultEntry),
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Submission workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Ship your project
            </h1>
          </div>

          <select
            className="field-base min-w-[280px]"
            onChange={(event) =>
              setSearchParams({ hackathon: event.target.value }, { replace: true })
            }
            value={selectedHackathonId}
          >
            {hackathons.map((hackathon) => (
              <option key={hackathon._id} value={hackathon._id}>
                {hackathon.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap gap-3">
          <ProgressChip active={progress.registered} label="Registered" />
          <ProgressChip active={progress.submitted} label="Submitted" />
          <ProgressChip active={progress.evaluated} label="Evaluated" />
        </div>
      </Card>

      {!currentTeam ? (
        <EmptyState
          action={() => setSearchParams({ hackathon: selectedHackathonId }, { replace: true })}
          actionLabel="Choose a team"
          description="You need to create or join a team before submitting a project."
          icon="groups_3"
          title="No team connected"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Team context
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              {currentTeam.name}
            </h2>
            <p className="mt-3 text-sm text-ink-500 dark:text-ink-300">
              Hackathon: {selectedHackathon?.title}
            </p>

            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Members</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(currentTeam.members || []).map((member) => (
                  <span
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-600 dark:text-ink-300"
                    key={getEntityId(member)}
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            </div>

            {assignedJudges.length ? (
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Review panel</p>
                  <p className="text-sm font-semibold text-ink-900 dark:text-white">
                    {assignedJudges.length} judges
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
                  New submissions for this hackathon are automatically routed to the
                  selected judges for scoring and feedback.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {assignedJudges.map((judge) => (
                    <span
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-ink-600 dark:text-ink-300"
                      key={getEntityId(judge) || judge.name}
                    >
                      {judge.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {knownSubmission ? (
              <div className="mt-6 rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/[0.12] p-5 text-emerald-50">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                  Submission on file
                </p>
                <p className="mt-3 font-display text-2xl font-semibold">
                  {knownSubmission.projectTitle || "Project submitted"}
                </p>
                <p className="mt-3 text-sm text-emerald-100/80">
                  Submitted at {formatDateTime(knownSubmission.submittedAt)}
                </p>
                {resultEntry ? (
                  <p className="mt-3 text-sm text-emerald-100/80">
                    Current leaderboard score: {Math.round(resultEntry.avgScore)}
                  </p>
                ) : selectedHackathon?.resultsPublished ? (
                  <p className="mt-3 text-sm text-emerald-100/80">
                    Results are live. Scores will appear here once your entry is included in the published set.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-emerald-100/80">
                    Scores refresh here automatically after results are published.
                  </p>
                )}
                <div className="mt-4">
                  <Link className="text-sm font-medium text-white" to={`/app/participant/results?hackathon=${selectedHackathonId}`}>
                    Open results workspace
                  </Link>
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Project submission
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              {knownSubmission ? "Submission already recorded" : "Submit your project"}
            </h2>

            {knownSubmission ? (
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 text-sm leading-7 text-ink-600 dark:bg-white/[0.06] dark:text-ink-300">
                Your team already has a submission on file for this hackathon. You can
                review the recorded project title here and return to results when judging
                is published.
              </div>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <TextField
                  label="Project title"
                  onChange={(event) => updateField("projectTitle", event.target.value)}
                  placeholder="Realtime mentor matching"
                  required
                  value={form.projectTitle}
                />
                <TextAreaField
                  label="Description"
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Describe the problem, approach, and innovation."
                  value={form.description}
                />
                <TextField
                  label="GitHub link"
                  onChange={(event) => updateField("githubLink", event.target.value)}
                  placeholder="https://github.com/your-team/project"
                  type="url"
                  value={form.githubLink}
                />
                <TextField
                  label="Demo link"
                  onChange={(event) => updateField("demoLink", event.target.value)}
                  placeholder="https://your-demo.app"
                  type="url"
                  value={form.demoLink}
                />
                <div className="flex justify-end">
                  <Button loading={busy} type="submit">
                    Submit project
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
