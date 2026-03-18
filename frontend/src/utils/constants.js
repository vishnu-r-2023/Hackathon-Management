export const ROLE_LABELS = {
  admin: "Admin",
  participant: "Participant",
  judge: "Judge",
};

export const ROLE_DESCRIPTIONS = {
  admin: "Organizer controls, analytics, and publishing",
  participant: "Teams, submissions, and live result tracking",
  judge: "Assigned reviews, scoring, and written feedback",
};

export const REGISTRATION_ROLES = ["participant", "judge", "admin"];

export const DASHBOARD_HOME = {
  admin: "/app/admin",
  participant: "/app/participant",
  judge: "/app/judge",
};

export const DASHBOARD_NAVIGATION = {
  admin: [
    { to: "/app/admin", label: "Overview", icon: "dashboard" },
    { to: "/app/admin/hackathons", label: "Hackathons", icon: "event" },
    { to: "/app/admin/users", label: "Users", icon: "group" },
    { to: "/app/admin/submissions", label: "Submissions", icon: "assignment" },
  ],
  participant: [
    { to: "/app/participant", label: "Overview", icon: "space_dashboard" },
    {
      to: "/app/participant/hackathons",
      label: "Hackathons",
      icon: "rocket_launch",
    },
    { to: "/app/participant/teams", label: "Teams", icon: "groups_3" },
    {
      to: "/app/participant/submissions",
      label: "Submissions",
      icon: "deployed_code",
    },
    { to: "/app/participant/results", label: "Results", icon: "emoji_events" },
  ],
  judge: [
    { to: "/app/judge", label: "Overview", icon: "insights" },
    { to: "/app/judge/reviews", label: "Assigned Reviews", icon: "gavel" },
  ],
};

export const STATUS_STYLES = {
  ongoing: "bg-emerald-500/[0.15] text-emerald-300 border-emerald-400/20",
  upcoming: "bg-amber-500/[0.15] text-amber-200 border-amber-400/20",
  completed: "bg-slate-500/[0.15] text-slate-200 border-slate-300/20",
  published: "bg-brand-500/[0.15] text-brand-200 border-brand-400/20",
};

export const THEME_STORAGE_KEY = "hacksphere-theme";
