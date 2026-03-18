import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { TextField } from "../components/ui/Fields.jsx";
import { useAuth } from "../context/auth/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { DASHBOARD_HOME } from "../utils/constants.js";

function resolveDestination(role, from) {
  const home = DASHBOARD_HOME[role] || "/";
  if (typeof from !== "string") return home;
  if (!from.startsWith("/app") || from.startsWith(home)) return from;
  return home;
}

export default function LoginPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from, [location.state]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await auth.login(
        { email: form.email, password: form.password },
        { remember: form.remember }
      );
      toast.toast({
        title: "Signed in",
        description: `Redirecting to the ${response.user.role} workspace.`,
        type: "success",
      });
      navigate(resolveDestination(response.user.role, from), { replace: true });
    } catch (nextError) {
      setError(
        nextError?.message?.trim() || "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      subtitle="Use your account to continue as admin, judge, or participant and open the matching workspace automatically."
      title="Welcome back"
      variant="login"
      footer={
        <div className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-300">
            Need an account?{" "}
            <Link className="font-semibold text-brand-300 hover:text-brand-200" to="/register">
              Create one
            </Link>
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
            Secure sign-in with role-based access
          </p>
        </div>
      }
    >
      {error ? (
        <div className="rounded-[1.5rem] border border-rose-400/25 bg-rose-500/[0.12] px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-100">
          {error}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit}>
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

        <div className="space-y-2">
          <TextField
            autoComplete="current-password"
            icon="lock"
            label="Password"
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Enter your password"
            required
            type={showPassword ? "text" : "password"}
            value={form.password}
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink-500 dark:text-ink-300">
              <input
                checked={form.remember}
                className="h-4 w-4 rounded border-white/10"
                onChange={(event) => updateField("remember", event.target.checked)}
                type="checkbox"
              />
              Keep me signed in
            </label>
            <button
              className="font-medium text-brand-300 hover:text-brand-200"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <Button className="w-full" loading={busy} size="lg" type="submit">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
