import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Clock, Tag, Flag } from 'lucide-react';

const PlannerBlockModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [block, setBlock] = useState(initialData || {
    title: '',
    time: '09:00 - 10:00',
    duration: '60m',
    category: 'Work',
    priority: 'medium',
    reasoning: 'User managed block'
  });

  useEffect(() => {
    if (initialData) setBlock(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-dark-100 dark:border-dark-800 flex justify-between items-center bg-gradient-to-r from-primary-500/5 to-transparent">
          <h2 className="text-xl font-display font-black text-dark-900 dark:text-white">
            {initialData ? 'Edit Planner Block' : 'Add Custom Block'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest">Block Title</label>
            <input 
              type="text" 
              placeholder="e.g., Team Meeting, Gym Session..."
              value={block.title}
              onChange={(e) => setBlock({...block, title: e.target.value})}
              className="w-full glass-card bg-transparent border-dark-200 dark:border-dark-700 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Time Range
              </label>
              <input 
                type="text" 
                placeholder="09:00 - 10:00"
                value={block.time}
                onChange={(e) => setBlock({...block, time: e.target.value})}
                className="w-full glass-card bg-transparent border-dark-200 dark:border-dark-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-500 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} /> Category
              </label>
              <select 
                value={block.category}
                onChange={(e) => setBlock({...block, category: e.target.value})}
                className="w-full glass-card bg-transparent border-dark-200 dark:border-dark-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
                <option value="Social">Social</option>
                <option value="Study">Study</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-500 uppercase tracking-widest flex items-center gap-2">
              <Flag size={12} /> Priority
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  onClick={() => setBlock({...block, priority: p})}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                    block.priority === p 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'glass-card text-dark-500 border-transparent hover:border-primary-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark-50 dark:bg-dark-900/50 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm font-bold">Cancel</button>
          <button 
            onClick={() => {
              if (!block.title) return;
              onSave(block);
              onClose();
            }}
            className="flex-1 btn-primary text-sm font-bold flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {initialData ? 'Save Changes' : 'Add to Timeline'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddBlockModal;
