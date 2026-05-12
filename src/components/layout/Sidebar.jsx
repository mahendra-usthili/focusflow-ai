import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Crosshair, 
  FileText, 
  BarChart2, 
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/focus', label: 'Focus', icon: Target },
  { path: '/goals', label: 'Goals', icon: Crosshair },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const SidebarContent = ({ openAIPanel, closeMobileMenu, openProPlan }) => (
  <div className="glass-panel flex-1 rounded-3xl p-6 flex flex-col relative overflow-hidden h-full">
    {/* Brand */}
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Zap className="text-white" size={20} />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg leading-tight">FocusFlow</h2>
          <p className="text-[10px] uppercase tracking-widest text-dark-400 font-semibold">AI Suite</p>
        </div>
      </div>
      {/* Mobile Close Button */}
      <button 
        onClick={closeMobileMenu}
        className="md:hidden p-2 text-dark-400 hover:text-dark-900 dark:hover:text-white"
      >
        <X size={20} />
      </button>
    </div>

    {/* Navigation */}
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={closeMobileMenu}
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
            ${isActive 
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
              : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
            }
          `}
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>

    {/* AI Assistant Button */}
    <div className="mt-auto pt-4 space-y-4">
      <button 
        onClick={() => {
          closeMobileMenu();
          openAIPanel();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800"
      >
        <Sparkles size={18} />
        AI Assistant
      </button>
      
      {/* Pro Plan Banner */}
      <div className="bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-2xl p-4 text-center">
        <Sparkles className="mx-auto text-primary-500 mb-2" size={20} />
        <h3 className="text-xs font-bold uppercase tracking-wider mb-1">Pro Plan</h3>
        <p className="text-[11px] text-dark-500 dark:text-dark-400 mb-3 leading-relaxed">
          Unlock AI Insights & unlimited focus sessions.
        </p>
        <button className="w-full bg-primary-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm" onClick={openProPlan}>
          UPGRADE NOW
        </button>
      </div>
    </div>
  </div>
);

const Sidebar = () => {
  const { openAIPanel, isMobileMenuOpen, closeMobileMenu, openProPlan } = useAppContext();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);
  
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={`
        w-64 h-screen fixed left-0 top-0 flex-col p-4 z-50 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 md:flex hidden'}
      `}>
        <SidebarContent openAIPanel={openAIPanel} closeMobileMenu={closeMobileMenu} openProPlan={openProPlan} />
      </aside>
    </>
  );
};

export default Sidebar;
