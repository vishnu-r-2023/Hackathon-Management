import { Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/store';
import { LayoutDashboard, FileText } from 'lucide-react';
import { useState } from 'react';

export const JudgeLayout = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const sidebarItems = [
    { id: 'dashboard', label: 'Submissions', icon: <FileText size={20} /> },
  ];

  const handleNavigation = (itemId) => {
    setActiveItem(itemId);
    navigate(`/judge/${itemId}`);
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
