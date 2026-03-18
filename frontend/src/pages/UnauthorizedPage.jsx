import { Link } from "react-router-dom";

import Card from "../components/ui/Card.jsx";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="max-w-xl p-10 text-center" strong>
        <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.75rem] bg-amber-500/[0.12] text-amber-300">
          <span className="material-symbols-outlined text-4xl">lock_person</span>
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold text-ink-900 dark:text-white">
          Access restricted
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink-600 dark:text-ink-300">
          Your account is signed in, but this route belongs to a different role workspace.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            className="inline-flex h-11 items-center rounded-2xl bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-400"
            to="/app"
          >
            Go to my dashboard
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-2xl border border-white/10 bg-white/70 px-5 text-sm font-medium text-ink-900 hover:bg-white dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
            to="/"
          >
            Back home
          </Link>
        </div>
      </Card>
    </div>
  );
}
