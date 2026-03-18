import { cn } from "../../utils/cn.js";

export default function Card({ children, className, strong = false }) {
  return (
    <div
      className={cn(
        strong ? "surface-panel-strong" : "surface-panel",
        "rounded-[2rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
