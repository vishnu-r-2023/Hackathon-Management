import { Link } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { submissionsApi } from "../../services/api/submissions.js";
import { getEntityId } from "../../utils/data.js";
import { formatNumber } from "../../utils/format.js";

export default function JudgeOverviewPage() {
  const auth = useAuth();
  const { data, error, loading } = useAsyncData(
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

  if (loading) {
    return <Card className="p-10">Loading judge overview...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="gavel"
        title="Could not load assigned submissions"
      />
    );
  }

  const assigned = data?.assigned || [];
  const assignedHackathons = data?.assignedHackathons || [];
  const reviewed = assigned.filter((item) => item.score !== null && item.score !== undefined);
  const pending = assigned.length - reviewed.length;
  const averageScore =
    reviewed.length > 0
      ? reviewed.reduce((sum, item) => sum + Number(item.score || 0), 0) / reviewed.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          caption="Hackathons"
          icon="event"
          value={formatNumber(assignedHackathons.length)}
        />
        <StatCard caption="Assigned" icon="assignment" value={formatNumber(assigned.length)} />
        <StatCard caption="Pending" icon="pending_actions" value={formatNumber(pending)} />
        <StatCard caption="Reviewed" icon="fact_check" value={formatNumber(reviewed.length)} />
        <StatCard
          caption="Average score"
          icon="trophy"
          value={reviewed.length ? Math.round(averageScore) : "--"}
        />
      </div>

      {assigned.length ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-8" strong>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Review lane
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 dark:text-white">
              Evaluate projects with a focused scoring workflow.
            </h1>
            <p className="mt-5 text-base leading-8 text-ink-600 dark:text-ink-300">
              Open the assigned review workspace to inspect project links, score
              the submission, and leave structured feedback for each team.
            </p>
            <div className="mt-8">
              <Link to="/app/judge/reviews">
                <Button icon="gavel" size="lg">
                  Open assigned reviews
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Queue preview
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              Recent assignments
            </h2>

            <div className="mt-6 space-y-4">
              {assigned.slice(0, 5).map((item) => (
                <div
                  className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]"
                  key={item.evaluationId}
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
                      {item.score === null || item.score === undefined ? "Pending" : "Reviewed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : assignedHackathons.length ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-8" strong>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Jury assignment
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 dark:text-white">
              You are linked to hackathons and waiting for submissions.
            </h1>
            <p className="mt-5 text-base leading-8 text-ink-600 dark:text-ink-300">
              The admin has added your account to the jury panel. Review items
              will appear here automatically once teams submit their projects.
            </p>
            <div className="mt-8">
              <Link to="/app/judge/reviews">
                <Button icon="gavel" size="lg">
                  Open review workspace
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Assigned hackathons
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              Waiting for team submissions
            </h2>

            <div className="mt-6 space-y-4">
              {assignedHackathons.map((hackathon) => (
                <div
                  className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]"
                  key={hackathon._id}
                >
                  <p className="font-medium text-ink-900 dark:text-white">
                    {hackathon.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink-500 dark:text-ink-300">
                    {hackathon.description || "This hackathon is ready for the review phase."}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          description="This judge account is not linked to any hackathon jury yet."
          icon="gavel"
          title="No reviews assigned"
        />
      )}
    </div>
  );
}
