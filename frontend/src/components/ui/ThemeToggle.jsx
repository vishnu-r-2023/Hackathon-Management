import { useTheme } from "../../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/70 text-ink-700 hover:bg-white dark:bg-white/[0.06] dark:text-ink-100 dark:hover:bg-white/10"
      onClick={toggleTheme}
      type="button"
    >
      <span className="material-symbols-outlined">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
