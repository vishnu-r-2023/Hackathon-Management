export const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-3">
          403
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You don&apos;t have permission to access this page.
        </p>
        <a href="/" className="btn-primary w-full justify-center">
          Go Home
        </a>
      </div>
    </div>
  );
};
