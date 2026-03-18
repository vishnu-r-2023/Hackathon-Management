import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";
import { DASHBOARD_NAVIGATION, ROLE_DESCRIPTIONS, ROLE_LABELS } from "../utils/constants.js";
import { cn } from "../utils/cn.js";
import ThemeToggle from "./ui/ThemeToggle.jsx";

function SidebarLink({ item, onClick }) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-black/5 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-white/[0.08] dark:hover:text-white",
          isActive
            ? "bg-brand-500 text-white shadow-[0_16px_40px_rgba(24,149,255,0.24)] hover:bg-brand-500 hover:text-white dark:text-white"
            : ""
        )
      }
      onClick={onClick}
      to={item.to}
    >
      <span className="material-symbols-outlined text-[1.2rem]">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );
}

export default function DashboardLayout({ role }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = DASHBOARD_NAVIGATION[role] || [];
  const activeItem = useMemo(
    () =>
      navigation.find((item) =>
        item.to === location.pathname || location.pathname.startsWith(`${item.to}/`)
      ) || navigation[0],
    [location.pathname, navigation]
  );

  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  const sidebarContent = (
    <div className="surface-panel-strong flex h-full flex-col rounded-[2rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-300">
            HackSphere
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-white">
            {ROLE_LABELS[role]} Console
          </h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">
            {ROLE_DESCRIPTIONS[role]}
          </p>
        </div>
        <button
          className="rounded-2xl bg-black/5 p-2 lg:hidden dark:bg-white/[0.06]"
          onClick={() => setSidebarOpen(false)}
          type="button"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="mt-8 space-y-2">
        {navigation.map((item) => (
          <SidebarLink item={item} key={item.to} onClick={() => setSidebarOpen(false)} />
        ))}
      </nav>

      <div className="mt-auto rounded-[1.75rem] border border-white/10 bg-black/5 p-4 dark:bg-white/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-500 dark:text-ink-400">
          Signed in
        </p>
        <p className="mt-3 font-medium text-ink-900 dark:text-white">{auth.user?.name}</p>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{auth.user?.email}</p>
        <div className="mt-4 flex items-center justify-between">
          <ThemeToggle />
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-black/5 dark:text-ink-200 dark:hover:bg-white/10"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="dashboard-grid mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{sidebarContent}</aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-[80] bg-slate-950/[0.55] px-4 py-4 backdrop-blur-sm lg:hidden">
            <div className="h-full max-w-sm">{sidebarContent}</div>
          </div>
        ) : null}

        <main className="surface-panel min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem]">
          <header className="border-b border-white/10 px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/70 text-ink-700 hover:bg-white lg:hidden dark:bg-white/[0.06] dark:text-ink-100 dark:hover:bg-white/10"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                    {ROLE_LABELS[role]}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                    {activeItem?.label || "Workspace"}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/60 px-4 py-2 text-sm text-ink-600 dark:bg-white/[0.06] dark:text-ink-200">
                  {auth.user?.name}
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[calc(100vh-9rem)] px-5 py-6 sm:px-8"
            initial={{ opacity: 0, y: 16 }}
            key={location.pathname}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
