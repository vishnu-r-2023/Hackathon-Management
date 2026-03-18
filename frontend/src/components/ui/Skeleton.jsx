import { cn } from "../../utils/cn.js";

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]",
        className
      )}
    />
  );
}
