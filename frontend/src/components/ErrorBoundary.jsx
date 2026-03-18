import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("HackSphere frontend crashed", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-panel-strong max-w-lg rounded-[2rem] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/[0.15] text-rose-300">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
            Refresh the page to try again. If the problem keeps happening, share the
            error below with your team.
          </p>
          {this.state.error?.message ? (
            <p className="mt-4 rounded-2xl bg-black/10 px-4 py-3 text-left text-xs text-ink-700 dark:bg-white/5 dark:text-ink-200">
              {this.state.error.message}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <button
              className="rounded-2xl bg-brand-500 px-5 py-3 font-medium text-white hover:bg-brand-400"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
