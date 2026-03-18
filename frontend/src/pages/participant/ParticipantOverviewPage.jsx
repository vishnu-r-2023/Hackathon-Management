import { Link } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { computeHackathonStatus, formatNumber, formatRange } from "../../utils/format.js";

export default function ParticipantOverviewPage() {
  const { data, error, loading } = useAsyncData(
    () => hackathonsApi.list({ limit: 100 }),
    []
  );

  if (loading) {
    return <Card className="p-10">Loading participant overview...</Card>;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon="rocket_launch"
        title="Could not load participant overview"
      />
    );
  }

  const hackathons = data?.hackathons || [];
  const featured = hackathons
    .filter((hackathon) => computeHackathonStatus(hackathon) !== "completed")
    .slice(0, 3);

  if (!hackathons.length) {
    return (
      <EmptyState
        description="No hackathons are available to participants yet."
        icon="event_busy"
        title="Nothing to join yet"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          caption="Active or Upcoming"
          icon="rocket_launch"
          value={formatNumber(
            hackathons.filter((item) => computeHackathonStatus(item) !== "completed").length
          )}
        />
        <StatCard
          caption="Results Published"
          icon="emoji_events"
          value={formatNumber(hackathons.filter((item) => item.resultsPublished).length)}
        />
        <StatCard
          caption="Registrations"
          icon="groups_3"
          value={formatNumber(
            hackathons.reduce((sum, item) => sum + Number(item.registrationCount || 0), 0)
          )}
        />
        <StatCard
          caption="Participants"
          icon="person"
          value={formatNumber(
            hackathons.reduce((sum, item) => sum + Number(item.participantCount || 0), 0)
          )}
        />
      </div>

      <Card className="p-8" strong>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
          Builder workflow
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink-900 dark:text-white">
          Move from discovery to leaderboard without leaving the platform.
        </h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Browse",
              copy: "Find upcoming and live hackathons with clear timelines and counts.",
              to: "/app/participant/hackathons",
            },
            {
              title: "Form team",
              copy: "Create a team or join an existing one inside the selected hackathon.",
              to: "/app/participant/teams",
            },
            {
              title: "Submit & track",
              copy: "Ship your project links, watch result publication, and track your position.",
              to: "/app/participant/submissions",
            },
          ].map((step) => (
            <div
              className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]"
              key={step.title}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-300">
                {step.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
                {step.copy}
              </p>
              <Link className="mt-5 inline-flex text-sm font-medium text-brand-300" to={step.to}>
                Open workspace
              </Link>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {featured.map((hackathon) => (
          <Card className="p-6" key={hackathon._id}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
              {computeHackathonStatus(hackathon)}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900 dark:text-white">
              {hackathon.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
              {hackathon.description || "No event description available."}
            </p>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
              {formatRange(hackathon.startDate, hackathon.endDate)}
            </p>
            <div className="mt-6">
              <Link to={`/app/participant/teams?hackathon=${hackathon._id}`}>
                <Button variant="secondary">Open team workspace</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
