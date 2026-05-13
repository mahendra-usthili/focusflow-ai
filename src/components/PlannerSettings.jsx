import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Sun, Moon, Zap, Coffee, Target, Save } from 'lucide-react';

const PlannerSettings = ({ isOpen, onClose, preferences, onSave }) => {
  const [prefs, setPrefs] = useState(preferences || {
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    focusDuration: 50,
    breakDuration: 10,
    productivityStyle: 'balanced',
    preferredCategories: ['work', 'personal'],
  });

  const styles = [
    { id: 'balanced', label: 'Balanced', icon: <Coffee size={16} />, desc: 'Steady pace with regular breaks' },
    { id: 'intense', label: 'Intense', icon: <Zap size={16} />, desc: 'Deep work focus with shorter breaks' },
    { id: 'relaxed', label: 'Relaxed', icon: <Moon size={16} />, desc: 'Gentle flow with more downtime' }
  ];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center bg-gradient-to-r from-primary-500/5 to-transparent">
          <div>
            <h2 className="text-2xl font-display font-black text-dark-900 dark:text-white">Planner Preferences</h2>
            <p className="text-sm text-dark-500 mt-1">Personalize your AI daily planning logic.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Daily Rhythm */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-6 flex items-center gap-2">
              <Clock size={16} />
              Daily Rhythm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-dark-700 dark:text-dark-300 flex items-center gap-2">
                  <Sun size={14} className="text-orange-500" /> Wake Up Time
                </label>
                <input 
                  type="time" 
                  value={prefs.wakeUpTime}
                  onChange={(e) => setPrefs({...prefs, wakeUpTime: e.target.value})}
                  className="w-full glass-card bg-transparent border-dark-200 dark:border-dark-700 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-dark-700 dark:text-dark-300 flex items-center gap-2">
                  <Moon size={14} className="text-blue-500" /> Sleep Time
                </label>
                <input 
                  type="time" 
                  value={prefs.sleepTime}
                  onChange={(e) => setPrefs({...prefs, sleepTime: e.target.value})}
                  className="w-full glass-card bg-transparent border-dark-200 dark:border-dark-700 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
            </div>
          </section>

          {/* Productivity Style */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-6 flex items-center gap-2">
              <Target size={16} />
              Productivity Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPrefs({...prefs, productivityStyle: style.id})}
                  className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${
                    prefs.productivityStyle === style.id 
                      ? 'border-primary-500 bg-primary-500/5 ring-4 ring-primary-500/10' 
                      : 'border-dark-100 dark:border-dark-800 hover:border-primary-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    prefs.productivityStyle === style.id ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-800 text-dark-500'
                  }`}>
                    {style.icon}
                  </div>
                  <div>
                    <p className="font-bold text-dark-900 dark:text-white">{style.label}</p>
                    <p className="text-[10px] text-dark-500 mt-0.5 leading-tight">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Durations */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500 mb-6 flex items-center gap-2">
              <Zap size={16} />
              Focus & Breaks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-dark-700 dark:text-dark-300">Focus Duration</label>
                  <span className="text-primary-500 font-black">{prefs.focusDuration}m</span>
                </div>
                <input 
                  type="range" 
                  min="20" max="90" step="5"
                  value={prefs.focusDuration}
                  onChange={(e) => setPrefs({...prefs, focusDuration: parseInt(e.target.value)})}
                  className="w-full accent-primary-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-dark-700 dark:text-dark-300">Break Duration</label>
                  <span className="text-primary-500 font-black">{prefs.breakDuration}m</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="30" step="5"
                  value={prefs.breakDuration}
                  onChange={(e) => setPrefs({...prefs, breakDuration: parseInt(e.target.value)})}
                  className="w-full accent-primary-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-dark-100 dark:border-dark-800 bg-dark-50 dark:bg-dark-900/50 flex gap-4">
          <button onClick={onClose} className="flex-1 btn-secondary py-4 font-bold">Cancel</button>
          <button 
            onClick={() => {
              onSave(prefs);
              onClose();
            }}
            className="flex-1 btn-primary py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20"
          >
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlannerSettings;
