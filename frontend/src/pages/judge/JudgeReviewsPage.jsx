import { useEffect, useMemo, useState } from "react";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { TextAreaField, TextField } from "../../components/ui/Fields.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { evaluationsApi } from "../../services/api/evaluations.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { submissionsApi } from "../../services/api/submissions.js";
import { getEntityId } from "../../utils/data.js";
import { clampNumber } from "../../utils/format.js";

export default function JudgeReviewsPage() {
  const auth = useAuth();
  const toast = useToast();
  const { data, error, loading, setData } = useAsyncData(
    async () => {
      const [assignedResponse, hackathonsResponse] = await Promise.all([
        submissionsApi.assigned(),
        hackathonsApi.list({ limit: 100 }),
      ]);

      return {
        assigned: assignedResponse.assigned || [],
        assignedHackathons: (hackathonsResponse.hackathons || []).filter((hackathon) =>
          (hackathon.judgeIds || []).some(
            (judge) => getEntityId(judge) === auth.user?.id
          )
        ),
      };
    },
    [auth.user?.id]
  );

  const [search, setSearch] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [score, setScore] = useState(70);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const assigned = data?.assigned || [];
  const assignedHackathons = data?.assignedHackathons || [];
  const filtered = useMemo(() => {
    return assigned.filter((item) => {
      const query = search.toLowerCase();
      return (
        !search ||
        item.submission?.projectTitle?.toLowerCase().includes(query) ||
        item.submission?.teamId?.name?.toLowerCase().includes(query) ||
        item.submission?.hackathonId?.title?.toLowerCase().includes(query)
      );
    });
  }, [assigned, search]);

  useEffect(() => {
    if (!selectedSubmissionId && filtered.length) {
      setSelectedSubmissionId(filtered[0].submission?._id);
    }
  }, [filtered, selectedSubmissionId]);

  const selected = filtered.find(
    (item) => item.submission?._id === selectedSubmissionId
  );

  useEffect(() => {
    if (!selected) return;
    setScore(selected.score ?? 70);
    setFeedback(selected.feedback || "");
  }, [selected]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selected?.submission?._id) return;

    const normalizedScore = clampNumber(score, 0, 100);

    setSaving(true);
    try {
      await evaluationsApi.create({
        submissionId: selected.submission._id,
        score: normalizedScore,
        feedback,
      });

      setData((current) => ({
        ...current,
        assigned: (current?.assigned || []).map((item) =>
          item.submission?._id === selected.submission._id
            ? { ...item, score: normalizedScore, feedback }
            : item
        ),
      }));

      toast.toast({
        title: "Evaluation saved",
        description: `Score ${normalizedScore} recorded for ${selected.submission.projectTitle}.`,
        type: "success",
      });
    } catch (nextError) {
      toast.toast({
        title: "Evaluation failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card className="p-10">Loading review queue...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="gavel"
        title="Could not load assigned reviews"
      />
    );
  }

  if (!assigned.length) {
    if (assignedHackathons.length) {
      return (
        <div className="space-y-6">
          <Card className="p-6" strong>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Review queue
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              You are already part of the jury panel.
            </h1>
            <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">
              The following hackathons are linked to your judge account. Review
              items will appear here as soon as teams submit projects.
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {assignedHackathons.map((hackathon) => (
              <Card className="p-6" key={hackathon._id}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                  Awaiting submissions
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {hackathon.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
                  {hackathon.description ||
                    "This hackathon will appear in your review list once teams submit."}
                </p>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <EmptyState
        description="This judge account is not linked to any hackathon jury yet."
        icon="gavel"
        title="No reviews assigned"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Assigned queue
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              Review list
            </h1>
          </div>
          <input
            className="field-base min-w-[220px]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assignments"
            value={search}
          />
        </div>

        <div className="mt-6 space-y-4">
          {filtered.map((item) => {
            const active = item.submission?._id === selectedSubmissionId;
            return (
              <button
                className={`w-full rounded-[1.75rem] border p-5 text-left ${
                  active
                    ? "border-brand-400/20 bg-brand-500/[0.12]"
                    : "border-white/10 bg-white/70 dark:bg-white/[0.06]"
                }`}
                key={item.evaluationId}
                onClick={() => setSelectedSubmissionId(item.submission?._id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {item.submission?.projectTitle}
                    </p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
                      {item.submission?.teamId?.name} · {item.submission?.hackathonId?.title}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-brand-300">
                    {item.score === null || item.score === undefined
                      ? "Pending"
                      : `${Math.round(item.score)}/100`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selected ? (
        <Card className="p-6" strong>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            Submission details
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
            {selected.submission?.projectTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
            Team {selected.submission?.teamId?.name} · {selected.submission?.hackathonId?.title}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">GitHub</p>
              <a
                className="mt-3 block break-all text-sm font-medium text-brand-300 hover:text-brand-200"
                href={selected.submission?.githubLink}
                rel="noreferrer"
                target="_blank"
              >
                {selected.submission?.githubLink || "No repository link"}
              </a>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Demo</p>
              <a
                className="mt-3 block break-all text-sm font-medium text-brand-300 hover:text-brand-200"
                href={selected.submission?.demoLink}
                rel="noreferrer"
                target="_blank"
              >
                {selected.submission?.demoLink || "No demo link"}
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
            <p className="text-sm text-ink-500 dark:text-ink-300">Description</p>
            <p className="mt-3 text-sm leading-7 text-ink-700 dark:text-ink-200">
              {selected.submission?.description || "No project description provided."}
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-500 dark:text-ink-300">Score</p>
                  <p className="mt-2 font-display text-4xl font-semibold text-brand-300">
                    {Math.round(score)}
                  </p>
                </div>
                <TextField
                  className="max-w-[140px]"
                  label="Numeric score"
                  onChange={(event) => setScore(clampNumber(event.target.value, 0, 100))}
                  type="number"
                  value={score}
                />
              </div>
              <input
                className="mt-5 w-full accent-brand-400"
                max="100"
                min="0"
                onChange={(event) => setScore(Number(event.target.value))}
                type="range"
                value={score}
              />
            </div>

            <TextAreaField
              label="Feedback"
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Explain the strengths, risks, and improvement areas for this project."
              rows={6}
              value={feedback}
            />

            <div className="flex justify-end">
              <Button loading={saving} type="submit">
                Save evaluation
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <EmptyState
          description="Select a submission from the left to start reviewing."
          icon="gavel"
          title="No submission selected"
        />
      )}
    </div>
  );
}
