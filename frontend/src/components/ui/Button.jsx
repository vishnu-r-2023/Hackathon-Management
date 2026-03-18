import { cn } from "../../utils/cn.js";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white shadow-[0_20px_40px_rgba(24,149,255,0.28)] hover:bg-brand-400",
  secondary:
    "border border-white/[0.15] bg-white/70 text-ink-900 hover:bg-white dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10",
  ghost:
    "text-ink-700 hover:bg-black/5 dark:text-ink-100 dark:hover:bg-white/[0.06]",
  danger:
    "bg-rose-500 text-white shadow-[0_16px_36px_rgba(244,63,94,0.24)] hover:bg-rose-400",
};

const SIZES = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  children,
  className,
  icon,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      type={type}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : icon ? (
        <span className="material-symbols-outlined text-[1.15rem]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
