import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { computeHackathonStatus, formatDate, formatNumber } from "../../utils/format.js";
import { STATUS_STYLES } from "../../utils/constants.js";
import { cn } from "../../utils/cn.js";

const PAGE_SIZE = 6;

export default function ParticipantHackathonsPage() {
  const { data, error, loading } = useAsyncData(
    () => hackathonsApi.list({ limit: 100 }),
    []
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const hackathons = data?.hackathons || [];
  const filtered = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const status = computeHackathonStatus(hackathon);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        !search ||
        hackathon.title?.toLowerCase().includes(query) ||
        hackathon.description?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [hackathons, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <Card className="p-10">Loading hackathons...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="event_busy"
        title="Could not load hackathons"
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Explore
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Available hackathons
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="field-base min-w-[240px]"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search hackathons"
              value={search}
            />
            <select
              className="field-base min-w-[180px]"
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {paged.map((hackathon) => {
              const status = computeHackathonStatus(hackathon);

              return (
                <Card className="p-6" key={hackathon._id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                          STATUS_STYLES[status]
                        )}
                      >
                        {status}
                      </span>
                      <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                        {hackathon.title}
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-brand-500/[0.12] p-3 text-brand-300">
                      <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                    </div>
                  </div>

                  <p className="mt-4 min-h-14 text-sm leading-7 text-ink-600 dark:text-ink-300">
                    {hackathon.description || "No description provided."}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/70 p-4 dark:bg-white/[0.06]">
                      <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
                        Timeline
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/70 p-4 dark:bg-white/[0.06]">
                      <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-ink-400">
                        Team / Participant count
                      </p>
                      <p className="mt-2 text-sm font-semibold text-ink-900 dark:text-white">
                        {formatNumber(hackathon.registrationCount)} /{" "}
                        {formatNumber(hackathon.participantCount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/app/participant/teams?hackathon=${hackathon._id}`}>
                      <span className="inline-flex h-11 items-center rounded-2xl bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-400">
                        Teams
                      </span>
                    </Link>
                    <Link to={`/app/participant/submissions?hackathon=${hackathon._id}`}>
                      <span className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/70 px-5 text-sm font-medium text-ink-900 hover:bg-white dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10">
                        Submit
                      </span>
                    </Link>
                    <Link to={`/app/participant/results?hackathon=${hackathon._id}`}>
                      <span className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/70 px-5 text-sm font-medium text-ink-900 hover:bg-white dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10">
                        Results
                      </span>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="table-shell">
            <Pagination
              onPageChange={setPage}
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
            />
          </div>
        </>
      ) : (
        <EmptyState
          description="No hackathons match your filters."
          icon="event_note"
          title="No hackathons found"
        />
      )}
    </div>
  );
}
