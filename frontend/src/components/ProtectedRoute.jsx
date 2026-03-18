import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <Outlet />;
}
