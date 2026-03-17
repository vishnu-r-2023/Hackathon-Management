import { motion } from 'framer-motion';
import { useAuthStore, useUIStore } from '../store/store';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">
              HackSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="btn-icon"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.name}
                </span>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="btn-icon"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-icon hover:text-red-500"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-700 dark:text-slate-300"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 flex items-center gap-3"
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className="btn-icon"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost w-full text-center">
                  Login
                </Link>
                <Link to="/register" className="btn-primary w-full text-center">
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost w-full justify-center"
              >
                <LogOut size={18} /> Logout
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
