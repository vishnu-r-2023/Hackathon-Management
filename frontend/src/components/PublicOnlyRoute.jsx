import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";

export default function PublicOnlyRoute() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate replace to={auth.homePath} />;
  }

  return <Outlet />;
}
