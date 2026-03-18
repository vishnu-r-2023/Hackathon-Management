import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { TextField } from "../../components/ui/Fields.jsx";
import { useAuth } from "../../context/auth/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { hackathonsApi } from "../../services/api/hackathons.js";
import { teamsApi } from "../../services/api/teams.js";
import { getEntityId, hasMember } from "../../utils/data.js";
import { computeHackathonStatus, formatNumber } from "../../utils/format.js";

const PAGE_SIZE = 6;

export default function ParticipantTeamsPage() {
  const auth = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [busyId, setBusyId] = useState("");

  const hackathonsQuery = useAsyncData(() => hackathonsApi.list({ limit: 100 }), []);
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

  const teams = teamsQuery.data?.teams || [];
  const selectedHackathon = hackathons.find(
    (hackathon) => hackathon._id === selectedHackathonId
  );
  const currentTeam = teams.find((team) => hasMember(team, auth.user?.id));
  const filteredTeams = useMemo(() => {
    return teams.filter((team) =>
      !search ? true : team.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, teams]);
  const paged = filteredTeams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreateTeam(event) {
    event.preventDefault();
    if (!teamName || !selectedHackathonId) return;

    setBusyId("create-team");
    try {
      await teamsApi.create({ name: teamName, hackathonId: selectedHackathonId });
      toast.toast({
        title: "Team created",
        description: `${teamName} is ready for the selected hackathon.`,
        type: "success",
      });
      setTeamName("");
      teamsQuery.refetch();
    } catch (nextError) {
      toast.toast({
        title: "Team creation failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  async function handleJoinTeam(teamId) {
    setBusyId(teamId);
    try {
      await teamsApi.join(teamId);
      toast.toast({
        title: "Joined team",
        description: "You are now part of the selected team.",
        type: "success",
      });
      teamsQuery.refetch();
    } catch (nextError) {
      toast.toast({
        title: "Join failed",
        description: nextError.message,
        type: "error",
      });
    } finally {
      setBusyId("");
    }
  }

  if (hackathonsQuery.loading) {
    return <Card className="p-10">Loading team workspace...</Card>;
  }

  if (hackathonsQuery.error) {
    return (
      <EmptyState
        description={hackathonsQuery.error.message}
        icon="groups_3"
        title="Could not load hackathons"
      />
    );
  }

  if (!hackathons.length) {
    return (
      <EmptyState
        description="No hackathons are open for team creation right now."
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
              Team workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
              Create or join a team
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

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            Selected hackathon
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
            {selectedHackathon?.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
            {selectedHackathon?.description || "No event description provided."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Registered teams</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {formatNumber(teams.length)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/[0.06]">
              <p className="text-sm text-ink-500 dark:text-ink-300">Participants</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                {formatNumber(selectedHackathon?.participantCount)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]">
            <p className="text-sm font-medium text-ink-900 dark:text-white">
              {currentTeam ? `You are in ${currentTeam.name}` : "You are not in a team yet"}
            </p>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              {currentTeam
                ? "You can move to the submissions workspace whenever your team is ready."
                : "Create a new team or join an existing one for this hackathon."}
            </p>
            {currentTeam ? (
              <Link className="mt-4 inline-flex text-sm font-medium text-brand-300" to={`/app/participant/submissions?hackathon=${selectedHackathonId}`}>
                Open submissions
              </Link>
            ) : null}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleCreateTeam}>
            <TextField
              label="Create a team"
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Enter team name"
              value={teamName}
            />
            <Button
              className="w-full"
              disabled={Boolean(currentTeam)}
              loading={busyId === "create-team"}
              type="submit"
            >
              {currentTeam ? "Already in a team" : "Create team"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                Team directory
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
                Join an existing team
              </h2>
            </div>
            <input
              className="field-base min-w-[240px]"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search teams"
              value={search}
            />
          </div>

          {teamsQuery.loading ? (
            <div className="mt-6">Loading teams...</div>
          ) : teamsQuery.error ? (
            <div className="mt-6 rounded-[1.5rem] border border-rose-400/20 bg-rose-500/[0.12] px-4 py-4 text-sm text-rose-100">
              {teamsQuery.error.message}
            </div>
          ) : filteredTeams.length ? (
            <div className="mt-6 space-y-4">
              {paged.map((team) => {
                const isCurrent = currentTeam && getEntityId(currentTeam) === getEntityId(team);
                return (
                  <div
                    className="rounded-[1.75rem] border border-white/10 bg-white/70 p-5 dark:bg-white/[0.06]"
                    key={team._id}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                          {team.name}
                        </p>
                        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
                          {team.members?.length || 0} members
                        </p>
                      </div>
                      <Button
                        disabled={Boolean(currentTeam && !isCurrent)}
                        loading={busyId === team._id}
                        onClick={() => handleJoinTeam(team._id)}
                        variant={isCurrent ? "secondary" : "primary"}
                      >
                        {isCurrent ? "Your team" : currentTeam ? "Already joined" : "Join team"}
                      </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(team.members || []).map((member) => (
                        <span
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-ink-600 dark:text-ink-300"
                          key={getEntityId(member)}
                        >
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="table-shell">
                <Pagination
                  onPageChange={setPage}
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={filteredTeams.length}
                />
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                description="No teams match the current search."
                icon="groups_3"
                title="No teams found"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
