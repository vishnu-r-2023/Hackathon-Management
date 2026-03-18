import { cn } from "../../utils/cn.js";

function FieldShell({ children, hint, label, required }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink-700 dark:text-ink-200">
        {label}
        {required ? <span className="ml-1 text-rose-400">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block text-xs text-ink-500 dark:text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function TextField({
  className,
  hint,
  icon,
  label,
  required,
  type = "text",
  ...props
}) {
  return (
    <FieldShell hint={hint} label={label} required={required}>
      <div className="relative">
        {icon ? (
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        ) : null}
        <input
          className={cn("field-base", icon ? "pl-12" : "", className)}
          type={type}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export function SelectField({ className, hint, label, required, ...props }) {
  return (
    <FieldShell hint={hint} label={label} required={required}>
      <select className={cn("field-base appearance-none", className)} {...props} />
    </FieldShell>
  );
}

export function TextAreaField({ className, hint, label, required, rows = 4, ...props }) {
  return (
    <FieldShell hint={hint} label={label} required={required}>
      <textarea className={cn("field-base resize-none", className)} rows={rows} {...props} />
    </FieldShell>
  );
}
