import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useMemo, useState } from "react";

import { cn } from "../utils/cn.js";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success:
    "border-emerald-300/45 bg-white/95 text-emerald-900 shadow-[0_18px_45px_rgba(16,185,129,0.14)] dark:border-emerald-400/20 dark:bg-[rgba(6,78,59,0.9)] dark:text-emerald-50",
  error:
    "border-rose-300/45 bg-white/95 text-rose-900 shadow-[0_18px_45px_rgba(244,63,94,0.14)] dark:border-rose-400/20 dark:bg-[rgba(127,29,29,0.9)] dark:text-rose-50",
  info:
    "border-brand-300/45 bg-white/95 text-brand-900 shadow-[0_18px_45px_rgba(24,149,255,0.14)] dark:border-brand-400/20 dark:bg-[rgba(12,74,110,0.9)] dark:text-brand-50",
};

const TOAST_DESCRIPTION_STYLES = {
  success: "text-emerald-800/80 dark:text-emerald-100/80",
  error: "text-rose-800/80 dark:text-rose-100/80",
  info: "text-brand-900/75 dark:text-brand-100/80",
};

const TOAST_ICON_STYLES = {
  success: "text-emerald-600 dark:text-emerald-200",
  error: "text-rose-600 dark:text-rose-200",
  info: "text-brand-600 dark:text-brand-200",
};

const TOAST_CLOSE_STYLES = {
  success:
    "text-emerald-700/70 hover:bg-emerald-500/10 hover:text-emerald-900 dark:text-emerald-100/70 dark:hover:bg-white/10 dark:hover:text-white",
  error:
    "text-rose-700/70 hover:bg-rose-500/10 hover:text-rose-900 dark:text-rose-100/70 dark:hover:bg-white/10 dark:hover:text-white",
  info:
    "text-brand-700/70 hover:bg-brand-500/10 hover:text-brand-900 dark:text-brand-100/70 dark:hover:bg-white/10 dark:hover:text-white",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      toast({ title, description, type = "info", duration = 4200 }) {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((current) => [...current, { id, title, description, type }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, duration);
      },
      dismiss(id) {
        setToasts((current) => current.filter((item) => item.id !== id));
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed left-4 right-4 top-4 z-[90] flex w-auto max-w-sm flex-col gap-3 sm:left-auto">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className={cn(
                "pointer-events-auto rounded-3xl border px-4 py-4 backdrop-blur-xl",
                TOAST_STYLES[toast.type] || TOAST_STYLES.info
              )}
              exit={{ opacity: 0, x: 28, scale: 0.96 }}
              initial={{ opacity: 0, x: 28, scale: 0.96 }}
              key={toast.id}
              layout
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "material-symbols-outlined mt-0.5 text-lg",
                    TOAST_ICON_STYLES[toast.type] || TOAST_ICON_STYLES.info
                  )}
                >
                  {toast.type === "success"
                    ? "check_circle"
                    : toast.type === "error"
                      ? "error"
                      : "info"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        TOAST_DESCRIPTION_STYLES[toast.type] ||
                          TOAST_DESCRIPTION_STYLES.info
                      )}
                    >
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  className={cn(
                    "rounded-full p-1",
                    TOAST_CLOSE_STYLES[toast.type] || TOAST_CLOSE_STYLES.info
                  )}
                  onClick={() => value.dismiss(toast.id)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
