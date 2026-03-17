import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/store';
import { LayoutDashboard, Trophy, Users, FileText } from 'lucide-react';

export const ParticipantLayout = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'hackathons', label: 'Hackathons', icon: <Trophy size={20} /> },
    { id: 'teams', label: 'Teams', icon: <Users size={20} /> },
    { id: 'submissions', label: 'Submissions', icon: <FileText size={20} /> },
  ];

  const handleNavigation = (itemId) => {
    setActiveItem(itemId);
    navigate(`/dashboard/${itemId}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar
          items={sidebarItems}
          activeItem={activeItem}
          onItemClick={handleNavigation}
        />
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 max-w-7xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
