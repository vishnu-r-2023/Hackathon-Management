export function formatDate(value) {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "--"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "--"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
}

export function formatRange(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: Number(value || 0) > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function computeHackathonStatus(hackathon) {
  if (hackathon?.status) return hackathon.status;
  const now = Date.now();
  const start = new Date(hackathon?.startDate || 0).valueOf();
  const end = new Date(hackathon?.endDate || 0).valueOf();
  if (!start || !end) return "upcoming";
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "ongoing";
}

export function daysUntil(dateValue) {
  if (!dateValue) return null;
  const target = new Date(dateValue).valueOf();
  const diff = target - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function pluralize(count, label) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

export function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}
