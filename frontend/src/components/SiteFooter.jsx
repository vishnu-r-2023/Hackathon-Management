import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-20 max-w-7xl border-t border-black/5 px-4 py-10 sm:px-6 dark:border-white/10">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/[0.12] text-brand-400">
              <span className="material-symbols-outlined">browse_activity</span>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
                HackSphere
              </p>
              <p className="text-sm text-ink-500 dark:text-ink-300">
                Role-based hackathon workspace for organizers, judges, and participants.
              </p>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-ink-500 dark:text-ink-300">
          <Link className="hover:text-ink-900 dark:hover:text-white" to="/">
            Home
          </Link>
          <Link className="hover:text-ink-900 dark:hover:text-white" to="/login">
            Login
          </Link>
          <Link className="hover:text-ink-900 dark:hover:text-white" to="/register">
            Register
          </Link>
        </div>
      </div>
    </footer>
  );
}
