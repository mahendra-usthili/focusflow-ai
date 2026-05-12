import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Moon, Sun, Bell, Sparkles, Menu, 
  LogOut, User, Settings, Crown, ChevronDown, Loader2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import EditProfileModal from '../ui/EditProfileModal';
import ProPlanModal from '../ui/ProPlanModal';

const Topbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { openAIPanel, toggleMobileMenu } = useAppContext();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [proPlanOpen, setProPlanOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
      setProfileOpen(false);
    }
  };

  const userInitial = (currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <header className="h-20 flex items-center justify-between px-4 md:px-8 z-30 flex-shrink-0">
        {/* Left: Mobile menu + Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 -ml-2 text-dark-500 hover:text-dark-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:block flex-1 max-w-xl relative">
            <div className="glass-card flex items-center px-4 py-3 rounded-2xl w-full">
              <Search size={18} className="text-dark-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search tasks, notes, goals..."
                className="bg-transparent border-none outline-none w-full text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400"
              />
              <div className="hidden md:flex items-center gap-1 text-[10px] font-medium text-dark-400 bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded flex-shrink-0">
                <span>CTRL</span><span>K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions + Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            In the Zone
          </div>

          {/* Ask AI */}
          <button
            onClick={openAIPanel}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-400 to-primary-500 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
          >
            <Sparkles size={15} />
            <span className="hidden md:inline">Ask AI</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-card text-dark-600 dark:text-dark-300 hover:text-primary-500 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 flex items-center justify-center rounded-xl glass-card text-dark-600 dark:text-dark-300 hover:text-primary-500 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-900" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-500/40 flex-shrink-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold leading-none text-dark-900 dark:text-white">
                  {currentUser?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-dark-400 font-semibold uppercase tracking-wider mt-0.5">
                  Free Plan
                </p>
              </div>
              <ChevronDown size={14} className={`hidden lg:block text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-900 border border-dark-100 dark:border-dark-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* User Info Header */}
                  <div className="px-4 py-4 border-b border-dark-100 dark:border-dark-800 bg-dark-50 dark:bg-dark-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {currentUser?.photoURL ? (
                          <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-primary-500 flex items-center justify-center text-white font-bold">
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-dark-900 dark:text-white truncate">
                          {currentUser?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-dark-500 truncate">{currentUser?.email}</p>
                        <span className="text-[10px] bg-dark-200 dark:bg-dark-700 text-dark-600 dark:text-dark-300 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                          Free Plan
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => { setProfileOpen(false); setEditProfileOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <User size={16} className="text-dark-400" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => { setProfileOpen(false); toggleTheme(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      {isDarkMode ? <Sun size={16} className="text-dark-400" /> : <Moon size={16} className="text-dark-400" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                      onClick={() => { setProfileOpen(false); setProPlanOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                    >
                      <Crown size={16} className="text-orange-500" />
                      <span>Upgrade to Pro</span>
                      <span className="ml-auto text-[10px] bg-gradient-to-r from-orange-400 to-primary-500 text-white px-2 py-0.5 rounded-full font-bold">
                        PRO
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-dark-100 dark:border-dark-800 py-2">
                    <button
                      onClick={() => { setProfileOpen(false); setShowLogoutConfirm(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-800 p-6 text-center"
            >
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-display font-bold text-dark-900 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-dark-500 text-sm mb-6">You'll be returned to the login page. Your data is safely saved in the cloud.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1 py-3">
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <ProPlanModal isOpen={proPlanOpen} onClose={() => setProPlanOpen(false)} />
    </>
  );
};

export default Topbar;
