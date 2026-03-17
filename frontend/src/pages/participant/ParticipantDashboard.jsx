import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { Button } from '../../components/FormElements';
import { Home, LogOut } from 'lucide-react';

export const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Ready to build something amazing?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/hackathons')}
          className="card p-6 hover:shadow-lg transition-smooth text-left"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Browse Hackathons
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Find and join upcoming hackathons
          </p>
        </button>

        <button
          onClick={() => navigate('/dashboard/teams')}
          className="card p-6 hover:shadow-lg transition-smooth text-left"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Manage Teams
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Create and manage your teams
          </p>
        </button>

        <button
          onClick={() => navigate('/dashboard/submissions')}
          className="card p-6 hover:shadow-lg transition-smooth text-left"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Submissions
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Submit your projects
          </p>
        </button>
      </div>
    </div>
  );
};
