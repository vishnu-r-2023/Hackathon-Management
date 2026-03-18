import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { SelectField, TextField } from "../components/ui/Fields.jsx";
import { useAuth } from "../context/auth/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  DASHBOARD_HOME,
  REGISTRATION_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "../utils/constants.js";

const ROLE_SUMMARIES = {
  admin: "Manage hackathons, users, assignments, submissions, and result publishing.",
  judge: "Review assigned submissions, score projects, and leave structured feedback.",
  participant: "Join hackathons, build teams, submit projects, and track results clearly.",
};

export default function RegisterPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "participant",
    bootstrapSecret: "",
    remember: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role !== "participant") {
        payload.bootstrapSecret = form.bootstrapSecret;
      }

      const response = await auth.register(payload, { remember: form.remember });
      toast.toast({
        title: "Account created",
        description: `${ROLE_LABELS[response.user.role]} access is ready.`,
        type: "success",
      });
      navigate(DASHBOARD_HOME[response.user.role] || "/", { replace: true });
    } catch (nextError) {
      setError(nextError?.message?.trim() || "Unable to create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      subtitle="Choose the role you need, add your account details, and continue into the matching workspace after signup."
      title="Create your account"
      variant="register"
      footer={
        <div className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            Already onboarded?{" "}
            <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/login">
              Sign in
            </Link>
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
            Role-based access with protected dashboards
          </p>
        </div>
      }
    >
      {error ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/[0.12] px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-100">
          {error}
        </div>
      ) : null}

      <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <TextField
            autoComplete="name"
            icon="badge"
            label="Full name"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Vishnu"
            required
            value={form.name}
          />
        </div>

        <div className="md:col-span-2">
          <TextField
            autoComplete="email"
            icon="mail"
            label="Email"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="you@hacksphere.dev"
            required
            type="email"
            value={form.email}
          />
        </div>

        <SelectField
          hint="Your workspace opens from this role after signup."
          label="Role"
          onChange={(event) => updateField("role", event.target.value)}
          value={form.role}
        >
          {REGISTRATION_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>

        <div className="rounded-[1.5rem] border border-brand-500/15 bg-brand-500/[0.08] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
            {ROLE_LABELS[form.role]} workspace
          </p>
          <p className="mt-2 text-sm font-medium text-ink-900 dark:text-white">
            {ROLE_DESCRIPTIONS[form.role]}
          </p>
          <p className="mt-2 text-sm leading-7 text-ink-600 dark:text-ink-300">
            {ROLE_SUMMARIES[form.role]}
          </p>
        </div>

        <TextField
          autoComplete="new-password"
          icon="lock"
          label="Password"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="At least 6 characters"
          required
          type="password"
          value={form.password}
        />

        <TextField
          autoComplete="new-password"
          icon="lock_reset"
          label="Confirm password"
          onChange={(event) => updateField("confirmPassword", event.target.value)}
          placeholder="Repeat password"
          required
          type="password"
          value={form.confirmPassword}
        />

        {form.role !== "participant" ? (
          <div className="md:col-span-2">
            <TextField
              hint="Required by the backend for admin and judge onboarding."
              icon="key"
              label="Bootstrap secret"
              onChange={(event) => updateField("bootstrapSecret", event.target.value)}
              placeholder="Enter bootstrap secret"
              required
              value={form.bootstrapSecret}
            />
          </div>
        ) : null}

        <label className="md:col-span-2 flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300">
          <input
            checked={form.remember}
            className="h-4 w-4 rounded border-white/10"
            onChange={(event) => updateField("remember", event.target.checked)}
            type="checkbox"
          />
          Keep me signed in on this device
        </label>

        <div className="md:col-span-2">
          <Button className="w-full" loading={busy} size="lg" type="submit">
            Create account
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
