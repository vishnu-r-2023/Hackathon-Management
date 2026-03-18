import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { cn } from "../utils/cn.js";

const FUNCTIONALITY_PILLS = [
  {
    title: "Event management",
    description: "Create hackathons, control timelines, and keep operations centralized.",
  },
  {
    title: "Submission workflow",
    description: "Handle teams, project links, and progress tracking in one place.",
  },
  {
    title: "Reviews and results",
    description: "Score projects, capture feedback, and publish outcomes with less friction.",
  },
];

const BENEFIT_ITEMS = [
  {
    label: "Cleaner workflow",
    value: "Fewer screens",
  },
  {
    label: "Clear progress",
    value: "Track each stage",
  },
  {
    label: "Faster decisions",
    value: "Review with context",
  },
];

function InfoPill({ item }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 shadow-[0_12px_30px_rgba(2,8,18,0.18)] backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">
        {item.title}
      </p>
      <p className="mt-1 text-xs leading-6 text-slate-300">{item.description}</p>
    </div>
  );
}

export default function AuthShell({
  children,
  footer,
  subtitle,
  title,
  variant = "login",
}) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] overflow-hidden rounded-[2rem] border border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#081420_0%,#0a1726_52%,#07111d_100%)] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,211,238,0.24),transparent_24%),radial-gradient(circle_at_85%_82%,rgba(45,212,191,0.18),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />

          <div className="relative z-10 flex items-center justify-between">
            <Link className="flex items-center gap-3" to="/">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.12]">
                <span className="material-symbols-outlined text-2xl text-brand-200">
                  browse_activity
                </span>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">HackSphere</p>
                <p className="text-sm text-slate-300">Hackathon management workspace</p>
              </div>
            </Link>
            <Link
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              to="/"
            >
              Back to home
            </Link>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mt-16 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-brand-200">
              {variant === "login" ? "Access your workspace" : "Create your identity"}
            </p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight">
              {variant === "login"
                ? "Sign in and continue the workflow."
                : "Create your account and get started."}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Plan events, manage submissions, review projects, and track
              results in one consistent product flow.
            </p>
          </motion.div>

          <div className="relative z-10 mt-10 grid gap-3 xl:grid-cols-3">
            {FUNCTIONALITY_PILLS.map((item) => (
              <InfoPill item={item} key={item.title} />
            ))}
          </div>

          <div className="relative z-10 mt-10">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_60px_rgba(3,10,20,0.28)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.26em] text-slate-400">
                    User benefits
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold">
                    Built to reduce friction across the full hackathon cycle
                  </p>
                </div>
                <span className="rounded-2xl bg-brand-500/[0.18] p-3 text-brand-100">
                  <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {BENEFIT_ITEMS.map((item) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/[0.16] p-4"
                    key={item.label}
                  >
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 font-display text-2xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel-strong flex min-h-[calc(100vh-2rem)] items-center justify-center bg-white/[0.92] px-5 py-10 dark:bg-[rgba(8,18,30,0.94)] sm:px-8 lg:px-14">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <Link className="inline-flex items-center gap-3 lg:hidden" to="/">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/[0.12] text-brand-400">
                  <span className="material-symbols-outlined">browse_activity</span>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-ink-900 dark:text-white">
                    HackSphere
                  </p>
                  <p className="text-sm text-ink-500 dark:text-ink-300">
                    Hackathon management workspace
                  </p>
                </div>
              </Link>
            </div>

            <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }}>
              <h2 className="font-display text-4xl font-semibold text-ink-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-3 text-base leading-7 text-ink-600 dark:text-ink-300">
                {subtitle}
              </p>
            </motion.div>

            <div className={cn("mt-8 space-y-6")}>{children}</div>
            <div className="mt-8">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
