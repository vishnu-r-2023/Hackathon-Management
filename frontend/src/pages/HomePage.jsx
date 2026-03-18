import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { useAuth } from "../context/auth/AuthContext.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { hackathonsApi } from "../services/api/hackathons.js";
import { cn } from "../utils/cn.js";
import { STATUS_STYLES } from "../utils/constants.js";
import {
  computeHackathonStatus,
  daysUntil,
  formatDate,
  formatNumber,
  formatRange,
} from "../utils/format.js";

const CORE_FUNCTIONALITIES = [
  {
    title: "Hackathon Setup",
    description: "Create events, adjust schedules, and frame the full program from one surface.",
    icon: "settings_input_component",
  },
  {
    title: "Teams and Submissions",
    description: "Track registrations, project links, and delivery checkpoints with less clutter.",
    icon: "account_tree",
  },
  {
    title: "Judging and Outcomes",
    description: "Make review flow, scoring, and final publication easier to scan and manage.",
    icon: "gavel",
  },
];

const BENEFITS = [
  {
    title: "Less operational overhead",
    description: "Keep schedules, teams, judging, and results organized in one place.",
    icon: "speed",
  },
  {
    title: "Clear progress visibility",
    description: "Live stats, status labels, and timeline groupings make the operating picture obvious.",
    icon: "visibility",
  },
  {
    title: "Cleaner day-to-day usage",
    description: "Move through the workspace comfortably in either light or dark mode.",
    icon: "clean_hands",
  },
];

const POSTER_ACCENTS = [
  ["from-cyan-400 via-sky-500 to-blue-700", "memory"],
  ["from-fuchsia-400 via-violet-500 to-indigo-700", "planet"],
  ["from-emerald-400 via-teal-500 to-cyan-700", "hub"],
  ["from-amber-300 via-orange-500 to-rose-600", "neurology"],
];

const SURFACE =
  "rounded-[1.75rem] border border-black/6 bg-white/78 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_24px_60px_rgba(2,8,20,0.28)]";

function Surface({ children, className, hover = false }) {
  return (
    <div
      className={cn(
        SURFACE,
        hover &&
          "transition duration-300 hover:-translate-y-1 hover:border-brand-300/40 hover:shadow-[0_0_30px_rgba(75,189,255,0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function getWindowLabel(status) {
  if (status === "completed") return "Ended";
  if (status === "ongoing") return "Ending";
  return "Starting";
}

function getWindowValue(hackathon, status) {
  const targetDate = status === "upcoming" ? hackathon.startDate : hackathon.endDate;
  const remainingDays = daysUntil(targetDate);
  if (remainingDays === null || status === "completed") return formatDate(targetDate);
  return `${Math.max(remainingDays, 0)}d`;
}

function MetricCard({ icon, label, note, value }) {
  return (
    <Surface className="p-6" hover>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink-500 dark:text-slate-400">{label}</span>
        <span className="rounded-xl bg-brand-500/[0.12] p-2 text-brand-500 dark:text-brand-200">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </span>
      </div>
      <p className="mt-4 font-display text-4xl font-black text-ink-900 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300/80">
        {note}
      </p>
    </Surface>
  );
}

function ActiveHackathonCard({ auth, hackathon, index }) {
  const [gradient, icon] = POSTER_ACCENTS[index % POSTER_ACCENTS.length];
  const status = computeHackathonStatus(hackathon);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ delay: index * 0.06 }}
    >
      <Surface className="overflow-hidden p-0" hover>
        <div className="grid h-full sm:grid-cols-[12rem_1fr]">
          <div className={cn("relative min-h-56 overflow-hidden bg-gradient-to-br", gradient)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_30%),linear-gradient(180deg,rgba(8,15,27,0),rgba(8,15,27,0.45))]" />
            <div className="relative flex h-full flex-col justify-between p-5 text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20">
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Participants
                </p>
                <p className="mt-2 font-display text-4xl font-black">
                  {formatNumber(hackathon.participantCount)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-2xl font-black text-ink-900 dark:text-white">
                    {hackathon.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-slate-300">
                    {hackathon.description || "No public description has been added yet."}
                  </p>
                </div>

                <span
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                    STATUS_STYLES[status]
                  )}
                >
                  {status}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-black/6 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-slate-500">
                    Timeline
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink-900 dark:text-white">
                    {formatRange(hackathon.startDate, hackathon.endDate)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-black/6 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-slate-500">
                    Registrations
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink-900 dark:text-white">
                    {formatNumber(hackathon.registrationCount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="rounded-full border border-brand-300/20 bg-brand-500/[0.12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-200">
                {getWindowLabel(status)} {getWindowValue(hackathon, status)}
              </span>

              <Link
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand-500 px-5 text-sm font-medium text-white shadow-[0_16px_36px_rgba(24,149,255,0.24)] hover:bg-brand-400"
                to={auth.isAuthenticated ? auth.homePath : "/register"}
              >
                {auth.isAuthenticated ? "Open dashboard" : "Join hackathon"}
              </Link>
            </div>
          </div>
        </div>
      </Surface>
    </motion.div>
  );
}

export default function HomePage() {
  const auth = useAuth();
  const { data, error, loading } = useAsyncData(
    () => hackathonsApi.list({ limit: 12 }),
    []
  );

  const hackathons = data?.hackathons || [];
  const featuredHackathons = hackathons.slice(0, 4);
  const ongoingHackathons = hackathons.filter(
    (hackathon) => computeHackathonStatus(hackathon) === "ongoing"
  );
  const upcomingHackathons = hackathons.filter(
    (hackathon) => computeHackathonStatus(hackathon) === "upcoming"
  );
  const totalParticipants = hackathons.reduce(
    (sum, item) => sum + Number(item.participantCount || 0),
    0
  );
  const totalRegistrations = hackathons.reduce(
    (sum, item) => sum + Number(item.registrationCount || 0),
    0
  );
  const publishedResults = hackathons.filter((item) => item.resultsPublished).length;
  const focusHackathon = ongoingHackathons[0] || upcomingHackathons[0] || featuredHackathons[0];
  const focusStatus = focusHackathon ? computeHackathonStatus(focusHackathon) : "upcoming";

  const stats = [
    ["Live hackathons", formatNumber(ongoingHackathons.length), "analytics", "Active now"],
    ["Participants tracked", formatNumber(totalParticipants), "groups", "Community pulse"],
    ["Registrations", formatNumber(totalRegistrations), "description", "Across public events"],
    ["Results published", formatNumber(publishedResults), "verified", "Outcome boards"],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4f8_42%,#e7eef8_100%)] dark:bg-[linear-gradient(180deg,#07111f_0%,#081422_45%,#06101e_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(24,149,255,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(24,149,255,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_22%)]" />
      <div className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px] dark:[background-image:linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]" />

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="pt-4">
          <SiteHeader />
        </div>

        <main className="space-y-20 pb-10 pt-14 md:pt-16">
          <section className="grid gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }}>
              <h1 className="font-display text-5xl font-black leading-[0.95] text-ink-900 md:text-7xl dark:text-white">
                Build the Future,
                <br />
                <span className="text-brand-600 dark:text-brand-300">One Hack</span> at a Time
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-600 dark:text-slate-300">
                Plan events, coordinate teams, review submissions, and publish outcomes
                from one focused workspace.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-brand-500 px-7 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(24,149,255,0.24)] hover:bg-brand-400"
                  to={auth.isAuthenticated ? auth.homePath : "/register"}
                >
                  {auth.isAuthenticated ? "Open dashboard" : "Join hackathon"}
                </Link>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/8 bg-white/70 px-7 text-sm font-medium text-ink-800 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                  href="#benefits"
                >
                  Explore benefits
                </a>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              transition={{ delay: 0.12 }}
            >
              <Surface className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-black/6 px-5 py-4 dark:border-white/10">
                  <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-300/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                  <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-400 dark:text-slate-500">
                    hacksphere dashboard
                  </span>
                </div>

                <div className="grid gap-4 p-5 xl:grid-cols-[1.02fr_0.98fr]">
                  <div className="rounded-[1.65rem] border border-black/6 bg-[linear-gradient(150deg,rgba(24,149,255,0.12),rgba(255,255,255,0.92)_55%,rgba(241,246,252,0.84))] p-6 dark:border-white/10 dark:bg-[linear-gradient(150deg,rgba(13,204,242,0.14),rgba(8,15,27,0.92)_50%,rgba(8,15,27,0.76))]">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-brand-200">
                      Event in focus
                    </p>

                    <div className="mt-3 flex items-start justify-between gap-4">
                      <h2 className="font-display text-3xl font-black text-ink-900 dark:text-white">
                        {focusHackathon?.title || "Launch your next flagship event"}
                      </h2>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                          STATUS_STYLES[focusStatus]
                        )}
                      >
                        {focusStatus}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-slate-200">
                      {focusHackathon?.description ||
                        "Highlight upcoming timelines, participation, and results from a single live event snapshot."}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.35rem] border border-black/6 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                        <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-slate-500">
                          Timeline
                        </p>
                        <p className="mt-2 text-sm font-medium text-ink-900 dark:text-white">
                          {focusHackathon
                            ? formatRange(focusHackathon.startDate, focusHackathon.endDate)
                            : "Set launch and final dates"}
                        </p>
                      </div>
                      <div className="rounded-[1.35rem] border border-black/6 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                        <p className="text-xs uppercase tracking-[0.24em] text-ink-500 dark:text-slate-500">
                          Result state
                        </p>
                        <p className="mt-2 text-sm font-medium text-ink-900 dark:text-white">
                          {focusHackathon?.resultsPublished
                            ? "Published"
                            : focusStatus === "completed"
                              ? "Ready to publish"
                              : "Pending event close"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.65rem] border border-white/10 bg-slate-950/92 p-5 font-mono text-[11px] leading-6 text-brand-200 shadow-[0_20px_40px_rgba(0,0,0,0.24)]">
                    <p className="text-white/90">// config/hackathon.config.ts</p>
                    <p className="mt-3 ml-4">
                      export <span className="text-brand-300">const</span> hackathon = {"{"}
                    </p>
                    <p className="ml-8 text-white">
                      name: <span className="text-brand-300">"{focusHackathon?.title || "Global Build '26"}"</span>,
                    </p>
                    <p className="ml-8 text-white">
                      timeline: <span className="text-brand-300">"{focusHackathon ? formatRange(focusHackathon.startDate, focusHackathon.endDate) : "Draft"}"</span>,
                    </p>
                    <p className="ml-8 text-white">
                      participants: <span className="text-brand-300">{Number(focusHackathon?.participantCount || 0)}</span>,
                    </p>
                    <p className="ml-8 text-white">
                      resultsPublished: <span className="text-brand-300">{focusHackathon?.resultsPublished ? "true" : "false"}</span>
                    </p>
                    <p className="ml-4">{"};"}</p>
                  </div>
                </div>
              </Surface>
            </motion.div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value, icon, note]) => (
              <MetricCard
                icon={icon}
                key={label}
                label={label}
                note={note}
                value={value}
              />
            ))}
          </section>

          <section className="space-y-10">
            <div className="text-center">
              <h2 className="font-display text-4xl font-black tracking-tight text-ink-900 dark:text-white">
                Core Functionalities
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-ink-600 dark:text-slate-400">
                Every role works from the same live event data, so planning, submissions,
                and judging stay aligned.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {CORE_FUNCTIONALITIES.map((item) => (
                <Surface className="p-8" hover key={item.title}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-300/20 bg-brand-500/[0.1] text-brand-500 dark:text-brand-200">
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-black text-ink-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </Surface>
              ))}
            </div>
          </section>

          <section className="space-y-8" id="active">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-3xl font-black text-ink-900 dark:text-white">
                  Active Hackathons
                </h2>
                <p className="mt-2 text-ink-600 dark:text-slate-400">
                  Browse live and upcoming events, then jump into the workspace that
                  matches your role.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <Surface className="overflow-hidden p-0" key={index}>
                    <div className="grid sm:grid-cols-[12rem_1fr]">
                      <div className="h-56 bg-black/[0.04] dark:bg-white/[0.05]" />
                      <div className="space-y-4 p-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </Surface>
                ))}
              </div>
            ) : error ? (
              <Surface className="p-10 text-center">
                <h3 className="font-display text-2xl font-black text-ink-900 dark:text-white">
                  Could not load public hackathons
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm text-ink-600 dark:text-slate-400">
                  {error.message}
                </p>
              </Surface>
            ) : featuredHackathons.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                <AnimatePresence>
                  {featuredHackathons.map((hackathon, index) => (
                    <ActiveHackathonCard
                      auth={auth}
                      hackathon={hackathon}
                      index={index}
                      key={hackathon._id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Surface className="p-10 text-center">
                <h3 className="font-display text-2xl font-black text-ink-900 dark:text-white">
                  No hackathons live yet
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm text-ink-600 dark:text-slate-400">
                  New events will appear here as soon as they open for participants.
                </p>
              </Surface>
            )}
          </section>

          <section className="space-y-12" id="benefits">
            <div className="text-center">
              <h2 className="font-display text-3xl font-black text-ink-900 dark:text-white">
                Why Organizers Choose Us
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {BENEFITS.map((item) => (
                <Surface className="p-8" hover key={item.title}>
                  <span className="material-symbols-outlined text-4xl text-brand-500 dark:text-brand-200">
                    {item.icon}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-black text-ink-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </Surface>
              ))}
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
