import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { resultsApi } from "../../services/api/results.js";
import { formatDateTime, formatNumber } from "../../utils/format.js";

const PAGE_SIZE = 8;

export default function ParticipantResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const hackathonsQuery = useAsyncData(() => hackathonsApi.list({ limit: 100 }), []);
  const hackathons = hackathonsQuery.data?.hackathons || [];
  const selectedHackathonId = searchParams.get("hackathon") || "";

  useEffect(() => {
    if (!selectedHackathonId && hackathons.length) {
      const preferred =
        hackathons.find((item) => item.resultsPublished) ||
        hackathons.find((item) => item.status === "completed") ||
        hackathons[0];
      setSearchParams({ hackathon: preferred._id }, { replace: true });
    }
  }, [hackathons, selectedHackathonId, setSearchParams]);

  const selectedHackathon = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathonId
  );

  const resultsQuery = useAsyncData(
    () => resultsApi.get(selectedHackathonId),
    [selectedHackathonId],
    { enabled: Boolean(selectedHackathonId && selectedHackathon?.resultsPublished) }
  );

  const leaderboard = resultsQuery.data?.leaderboard || [];
  const paged = leaderboard.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const podium = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  if (hackathonsQuery.loading) {
    return <Card className="p-10">Loading results workspace...</Card>;
  }

  if (hackathonsQuery.error) {
    return (
      <EmptyState
        description={hackathonsQuery.error.message}
        icon="emoji_events"
        title="Could not load hackathons"
      />
    );
  }

  if (!hackathons.length) {
    return (
      <EmptyState
        description="No hackathons are available for result tracking."
        icon="event_busy"
        title="No hackathons available"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Results workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Leaderboards and published scores
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

      {!selectedHackathon?.resultsPublished ? (
        <EmptyState
          description="Results have not been published for this hackathon yet."
          icon="timer"
          title="Leaderboard pending"
        />
      ) : resultsQuery.loading ? (
        <Card className="p-10">Loading leaderboard...</Card>
      ) : resultsQuery.error ? (
        <EmptyState
          description={resultsQuery.error.message}
          icon="emoji_events"
          title="Could not load results"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {podium.map((entry, index) => (
              <Card className="p-6" key={entry.submissionId}>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                  Rank #{index + 1}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {entry.teamName}
                </h2>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                  {entry.projectTitle}
                </p>
                <p className="mt-5 font-display text-4xl font-semibold text-brand-300">
                  {Math.round(entry.avgScore)}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                  Published details
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {selectedHackathon?.title}
                </h2>
              </div>
              <div className="text-sm text-ink-500 dark:text-ink-300">
                Published {formatDateTime(resultsQuery.data?.publishedAt)}
              </div>
            </div>

            {leaderboard.length ? (
              <div className="mt-6 table-shell">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-white/10 bg-black/5 text-xs uppercase tracking-[0.24em] text-ink-500 dark:bg-white/[0.06] dark:text-ink-400">
                      <tr>
                        <th className="px-5 py-4">Rank</th>
                        <th className="px-5 py-4">Team</th>
                        <th className="px-5 py-4">Project</th>
                        <th className="px-5 py-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((entry, index) => (
                        <tr className="border-b border-white/8 last:border-b-0" key={entry.submissionId}>
                          <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                            {(page - 1) * PAGE_SIZE + index + 1}
                          </td>
                          <td className="px-5 py-4 font-medium text-ink-900 dark:text-white">
                            {entry.teamName}
                          </td>
                          <td className="px-5 py-4 text-sm text-ink-600 dark:text-ink-300">
                            {entry.projectTitle}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-brand-300">
                            {Math.round(entry.avgScore)}
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
                  total={leaderboard.length}
                />
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  description="This hackathon has no scored submissions in the published result set."
                  icon="leaderboard"
                  title="No leaderboard entries"
                />
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                <p className="text-sm text-ink-500 dark:text-ink-300">Entries</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {formatNumber(leaderboard.length)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                <p className="text-sm text-ink-500 dark:text-ink-300">Top score</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {leaderboard[0] ? Math.round(leaderboard[0].avgScore) : "--"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
                <p className="text-sm text-ink-500 dark:text-ink-300">Published by admin</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  Ready
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
