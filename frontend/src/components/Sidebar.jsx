import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = ({ items, activeItem, onItemClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass shadow-soft h-screen overflow-y-auto border-r border-slate-200/60 dark:border-slate-800/60"
      style={{ width: collapsed ? 80 : 256 }}
    >
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-icon w-full justify-start"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronDown size={20} className={collapsed ? '-rotate-90' : ''} />
        </button>
      </div>

      <nav className="space-y-2 px-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => onItemClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
              activeItem === item.id
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-soft'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
            }`}
            title={collapsed ? item.label : ''}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  );
};
