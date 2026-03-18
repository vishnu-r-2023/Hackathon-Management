import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";

export default function RoleGuard({ allow }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (!allow.includes(auth.user?.role)) {
    return <Navigate replace state={{ from: location.pathname }} to="/unauthorized" />;
  }

  return <Outlet />;
}
