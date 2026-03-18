import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import GlobalLoadingBar from "./components/GlobalLoadingBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import RoleHomeRedirect from "./components/RoleHomeRedirect.jsx";
import ScrollToHash from "./components/ScrollToHash.jsx";
import AdminHackathonsPage from "./pages/admin/AdminHackathonsPage.jsx";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage.jsx";
import AdminSubmissionsPage from "./pages/admin/AdminSubmissionsPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";
import JudgeOverviewPage from "./pages/judge/JudgeOverviewPage.jsx";
import JudgeReviewsPage from "./pages/judge/JudgeReviewsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ParticipantHackathonsPage from "./pages/participant/ParticipantHackathonsPage.jsx";
import ParticipantOverviewPage from "./pages/participant/ParticipantOverviewPage.jsx";
import ParticipantResultsPage from "./pages/participant/ParticipantResultsPage.jsx";
import ParticipantSubmissionsPage from "./pages/participant/ParticipantSubmissionsPage.jsx";
import ParticipantTeamsPage from "./pages/participant/ParticipantTeamsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <GlobalLoadingBar />
      <ScrollToHash />
      <Routes>
        <Route element={<HomePage />} path="/" />

        <Route element={<PublicOnlyRoute />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<Navigate replace to="/register" />} path="/signup" />
        </Route>

        <Route element={<UnauthorizedPage />} path="/unauthorized" />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleHomeRedirect />} path="/app" />

          <Route element={<RoleGuard allow={["admin"]} />}>
            <Route element={<DashboardLayout role="admin" />} path="/app/admin">
              <Route element={<AdminOverviewPage />} index />
              <Route element={<AdminHackathonsPage />} path="hackathons" />
              <Route element={<AdminUsersPage />} path="users" />
              <Route element={<AdminSubmissionsPage />} path="submissions" />
            </Route>
          </Route>

          <Route element={<RoleGuard allow={["participant"]} />}>
            <Route
              element={<DashboardLayout role="participant" />}
              path="/app/participant"
            >
              <Route element={<ParticipantOverviewPage />} index />
              <Route element={<ParticipantHackathonsPage />} path="hackathons" />
              <Route element={<ParticipantTeamsPage />} path="teams" />
              <Route element={<ParticipantSubmissionsPage />} path="submissions" />
              <Route element={<ParticipantResultsPage />} path="results" />
            </Route>
          </Route>

          <Route element={<RoleGuard allow={["judge"]} />}>
            <Route element={<DashboardLayout role="judge" />} path="/app/judge">
              <Route element={<JudgeOverviewPage />} index />
              <Route element={<JudgeReviewsPage />} path="reviews" />
            </Route>
          </Route>
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </ErrorBoundary>
  );
}
