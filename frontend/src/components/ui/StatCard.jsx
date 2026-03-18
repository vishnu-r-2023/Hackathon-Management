import Badge from "./Badge.jsx";
import Card from "./Card.jsx";

export default function StatCard({
  caption,
  icon,
  tone = "bg-brand-500/[0.12] text-brand-300",
  value,
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Badge className="border-white/10 bg-white/60 text-ink-500 dark:bg-white/5 dark:text-ink-300">
          {caption}
        </Badge>
        <span className={`rounded-2xl p-2 ${tone}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </span>
      </div>
      <div className="mt-6 font-display text-3xl font-semibold text-ink-900 dark:text-white">
        {value}
      </div>
    </Card>
  );
}
