import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function EmptyState({
  action,
  actionLabel,
  description,
  icon = "inbox",
  title,
}) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500/[0.12] text-brand-300">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-ink-900 dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-600 dark:text-ink-300">
        {description}
      </p>
      {action ? (
        <div className="mt-6">
          <Button onClick={action}>{actionLabel}</Button>
        </div>
      ) : null}
    </Card>
  );
}
