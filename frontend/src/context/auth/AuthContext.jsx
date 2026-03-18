import { createContext, useContext, useMemo, useState } from "react";

import { authApi } from "../../services/api/auth.js";
import { DASHBOARD_HOME } from "../../utils/constants.js";
import { clearAuthSession, readAuthSession, writeAuthSession } from "./storage.js";

const AuthContext = createContext(null);

function getHome(role) {
  return DASHBOARD_HOME[role] || "/";
}

export function AuthProvider({ children }) {
  const initial = readAuthSession();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);
  const [remember, setRemember] = useState(initial.remember);

  const value = useMemo(
    () => ({
      token,
      user,
      remember,
      isAuthenticated: Boolean(token && user),
      homePath: getHome(user?.role),
      async login(credentials, options = {}) {
        const response = await authApi.login(credentials);
        const shouldRemember = options.remember ?? true;
        writeAuthSession(response.token, response.user, shouldRemember);
        setToken(response.token);
        setUser(response.user);
        setRemember(shouldRemember);
        return response;
      },
      async register(payload, options = {}) {
        const response = await authApi.register(payload);
        const shouldRemember = options.remember ?? true;
        writeAuthSession(response.token, response.user, shouldRemember);
        setToken(response.token);
        setUser(response.user);
        setRemember(shouldRemember);
        return response;
      },
      persistSession(authData, nextRemember = true) {
        writeAuthSession(authData?.token || "", authData?.user || null, nextRemember);
        setToken(authData?.token || "");
        setUser(authData?.user || null);
        setRemember(nextRemember);
      },
      logout() {
        clearAuthSession();
        setToken("");
        setUser(null);
      },
      hasRole(roles) {
        return roles.includes(user?.role);
      },
    }),
    [remember, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
