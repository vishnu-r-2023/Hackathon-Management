import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";
import { cn } from "../utils/cn.js";
import ThemeToggle from "./ui/ThemeToggle.jsx";

const NAV_ITEMS = [
  { href: "#active", label: "Active events", icon: "flare" },
  { href: "#benefits", label: "Benefits", icon: "auto_awesome" },
];

export default function SiteHeader() {
  const auth = useAuth();
  const location = useLocation();
  const activeHash = location.pathname === "/" ? location.hash || "#active" : "";

  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-4 z-40 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-black/5 bg-white/80 px-4 py-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(14,24,38,0.86),rgba(8,16,28,0.8))] dark:shadow-[0_24px_60px_rgba(3,10,20,0.28)]"
      initial={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <Link className="flex items-center gap-3" to="/">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/[0.12] text-brand-400">
          <span className="material-symbols-outlined">browse_activity</span>
        </div>
        <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">
          HackSphere
        </p>
      </Link>

      <nav className="hidden items-center gap-1 rounded-full border border-black/6 bg-black/[0.03] p-1.5 md:flex dark:border-white/10 dark:bg-white/[0.04]">
        {NAV_ITEMS.map((item) => {
          const active = activeHash === item.href;

          return (
            <a
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white text-ink-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:bg-white/[0.12] dark:text-white dark:shadow-none"
                  : "text-ink-600 hover:bg-black/[0.04] hover:text-ink-900 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[1rem]",
                  active ? "text-brand-500 dark:text-brand-200" : "text-ink-400 dark:text-slate-500"
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {auth.isAuthenticated ? (
          <Link
            className="inline-flex h-11 items-center rounded-2xl bg-brand-500 px-5 text-sm font-medium text-white shadow-[0_16px_36px_rgba(24,149,255,0.24)] hover:bg-brand-400"
            to={auth.homePath}
          >
            Open dashboard
          </Link>
        ) : (
          <>
            <Link
              className="hidden rounded-2xl px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-2xl bg-brand-500 px-5 text-sm font-medium text-white shadow-[0_16px_36px_rgba(24,149,255,0.24)] hover:bg-brand-400"
              to="/register"
            >
              Join hackathon
            </Link>
          </>
        )}
      </div>
    </motion.header>
  );
}
