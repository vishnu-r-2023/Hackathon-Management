import { useEffect, useState } from "react";

import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { submissionsApi } from "../../services/api/submissions.js";
import { usersApi } from "../../services/api/users.js";
import { computeHackathonStatus, formatNumber, formatRange } from "../../utils/format.js";

function ScoreBar({ item }) {
  return (
    <div className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-900 dark:text-white">{item.projectTitle}</p>
          <p className="text-sm text-ink-500 dark:text-ink-300">{item.teamName}</p>
        </div>
        <p className="font-display text-2xl font-semibold text-brand-300">
          {Math.round(item.avgScore)}
        </p>
      </div>
      <div className="h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-cyan-300"
          style={{ width: `${Math.max(4, Math.min(item.avgScore || 0, 100))}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, error, loading } = useAsyncData(async () => {
    const [hackathons, users, submissions] = await Promise.all([
      hackathonsApi.list({ limit: 100 }),
      usersApi.list({ limit: 100 }),
      submissionsApi.list({ limit: 100 }),
    ]);

    return {
      hackathons: hackathons.hackathons || [],
      users: users.users || [],
      submissions: submissions.submissions || [],
    };
  }, []);

  const [selectedHackathonId, setSelectedHackathonId] = useState("");

  useEffect(() => {
    if (!selectedHackathonId && data?.hackathons?.length) {
      setSelectedHackathonId(data.hackathons[0]._id);
    }
  }, [data?.hackathons, selectedHackathonId]);

  const analyticsQuery = useAsyncData(
    () => hackathonsApi.analytics(selectedHackathonId),
    [selectedHackathonId],
    { enabled: Boolean(selectedHackathonId) }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-36 rounded-[2rem]" key={index} />
          ))}
        </div>
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="monitoring"
        title="Could not load admin analytics"
      />
    );
  }

  const hackathons = data?.hackathons || [];
  const users = data?.users || [];
  const submissions = data?.submissions || [];
  const selectedHackathon = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathonId
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard caption="Hackathons" icon="event" value={formatNumber(hackathons.length)} />
        <StatCard caption="Users" icon="group" value={formatNumber(users.length)} />
        <StatCard
          caption="Submissions"
          icon="assignment"
          value={formatNumber(submissions.length)}
        />
        <StatCard
          caption="Published Results"
          icon="emoji_events"
          value={formatNumber(hackathons.filter((item) => item.resultsPublished).length)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Pipeline
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                Operational overview
              </h2>
            </div>
            <div className="rounded-2xl bg-brand-500/[0.12] p-3 text-brand-300">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {hackathons.slice(0, 4).map((hackathon) => (
              <div
                className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]"
                key={hackathon._id}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900 dark:text-white">
                      {hackathon.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">
                      {formatRange(hackathon.startDate, hackathon.endDate)}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-brand-300">
                    {computeHackathonStatus(hackathon)}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/[0.06]">
                    Teams: {formatNumber(hackathon.registrationCount)}
                  </div>
                  <div className="rounded-2xl bg-black/5 px-4 py-3 text-sm dark:bg-white/[0.06]">
                    Participants: {formatNumber(hackathon.participantCount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Analytics
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                Submission scores by hackathon
              </h2>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-600 dark:text-ink-300">
                Focus hackathon
              </span>
              <select
                className="field-base min-w-[260px]"
                onChange={(event) => setSelectedHackathonId(event.target.value)}
                value={selectedHackathonId}
              >
                {hackathons.map((hackathon) => (
                  <option key={hackathon._id} value={hackathon._id}>
                    {hackathon.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {!selectedHackathon ? (
            <div className="mt-6">
              <EmptyState
                description="Create a hackathon to unlock admin analytics."
                icon="event_busy"
                title="No hackathon selected"
              />
            </div>
          ) : analyticsQuery.loading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-24 rounded-[1.5rem]" key={index} />
              ))}
            </div>
          ) : analyticsQuery.error ? (
            <div className="mt-6 rounded-[1.5rem] border border-rose-400/20 bg-rose-500/[0.12] px-4 py-4 text-sm text-rose-100">
              {analyticsQuery.error.message}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Hackathon</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                    {selectedHackathon.title}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Teams</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                    {formatNumber(analyticsQuery.data?.totalTeams)}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Submissions</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                    {formatNumber(analyticsQuery.data?.totalSubmissions)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(analyticsQuery.data?.averageScoresPerSubmission || [])
                  .slice(0, 6)
                  .map((item) => (
                    <ScoreBar item={item} key={item.submissionId} />
                  ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
