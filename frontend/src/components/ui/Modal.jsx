import { AnimatePresence, motion } from "framer-motion";

import { cn } from "../../utils/cn.js";

export default function Modal({
  children,
  className,
  description,
  open,
  onClose,
  title,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "surface-panel-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] p-6",
              className
            )}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                className="rounded-full bg-black/5 p-2 text-ink-500 hover:bg-black/10 dark:bg-white/[0.06] dark:text-ink-300 dark:hover:bg-white/10"
                onClick={onClose}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
