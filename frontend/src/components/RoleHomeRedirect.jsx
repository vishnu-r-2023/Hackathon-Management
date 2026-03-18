import { Navigate } from "react-router-dom";

import { useAuth } from "../context/auth/AuthContext.jsx";

export default function RoleHomeRedirect() {
  const auth = useAuth();
  return <Navigate replace to={auth.homePath} />;
}
