import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Info, Check, Trash2, Pin, Star, Edit2 } from 'lucide-react';

const TimelineCard = ({ block, onAddSuggested, onToggleComplete, onTogglePin, onToggleStar, onDelete, onEdit, isLast }) => {
  const isCompleted = block.isCompleted || false;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-dark-500/10 text-dark-500 border-dark-500/20';
    }
  };

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'default', active = false, activeColor = 'text-primary-500' }) => (
    <div className="relative group/tooltip flex items-center justify-center">
      <button 
        onClick={onClick}
        className={`p-2.5 rounded-xl transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm ${
          active 
            ? `bg-white dark:bg-dark-800 ${activeColor} ring-1 ring-dark-100 dark:ring-dark-700 shadow-md` 
            : 'text-dark-400 hover:bg-white dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-white hover:shadow-md'
        } ${variant === 'danger' ? 'hover:text-red-500' : ''}`}
      >
        <Icon size={16} fill={active ? "currentColor" : "none"} className="transition-transform" />
      </button>
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md text-dark-900 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none shadow-xl border border-dark-100 dark:border-dark-700 whitespace-nowrap z-50 translate-y-2 group-hover/tooltip:translate-y-0">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 dark:bg-dark-800/90 rotate-45 border-r border-b border-dark-100 dark:border-dark-700"></div>
      </div>
    </div>
  );

  return (
    <div className={`relative pl-8 pb-8 last:pb-0 group/card`}>
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-[11px] top-8 bottom-0 w-[2px] transition-colors duration-500 ${isCompleted ? 'bg-green-500/20' : 'bg-dark-100 dark:bg-dark-800'}`} />
      )}
      
      {/* Timeline Dot */}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 z-10 shadow-sm transition-all duration-500 ${
        isCompleted 
          ? 'bg-green-500 border-green-100 dark:border-green-900 scale-110 shadow-lg shadow-green-500/20' 
          : 'bg-white dark:bg-dark-900 border-primary-500 group-hover/card:scale-110 group-hover/card:shadow-lg group-hover/card:shadow-primary-500/20'
      }`}>
        {!isCompleted && (
          <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
        )}
        {isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={10} className="text-white mx-auto mt-0.5" /></motion.div>}
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`glass-card p-5 rounded-[2rem] transition-all duration-500 relative overflow-hidden group/content ${
          isCompleted 
            ? 'border-green-500/40 bg-green-500/[0.03] shadow-lg shadow-green-500/5 ring-1 ring-green-500/20' 
            : 'hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1.5'
        } ${block.isStarred && !isCompleted ? 'ring-2 ring-yellow-500/20 border-yellow-500/30 bg-yellow-500/[0.01]' : ''}`}
      >
        {/* Completion Success Glow */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, x: '-100%' }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-green-500/[0.08] via-transparent to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2.5">
              <span className={`text-sm font-black flex items-center gap-1.5 transition-all ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-primary-500'}`}>
                <Clock size={14} className={isCompleted ? '' : 'animate-pulse text-primary-500'} />
                {block.time}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${isCompleted ? 'bg-green-500/10 text-green-600 border-green-500/20' : getPriorityColor(block.priority)}`}>
                {block.priority}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-500 transition-all ${isCompleted ? 'opacity-40' : ''}`}>
                {block.category}
              </span>
              {block.isPinned && !isCompleted && (
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Pin size={12} className="text-primary-500 fill-primary-500" />
                </motion.div>
              )}
              {block.isStarred && !isCompleted && (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
            </div>
            
            <h3 className={`text-xl font-display font-bold mb-2.5 transition-all duration-500 leading-tight ${
              isCompleted ? 'text-dark-400 dark:text-dark-500 line-through opacity-60' : 'text-dark-900 dark:text-white group-hover/content:text-primary-500'
            }`}>
              {block.title}
            </h3>
            
            {!isCompleted ? (
              <div className="flex items-start gap-3 bg-white/40 dark:bg-dark-800/40 p-4 rounded-2xl border border-dark-100 dark:border-dark-700 shadow-sm backdrop-blur-sm transition-all group-hover/content:border-primary-500/20 group-hover/content:bg-white/60">
                <Info size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-dark-600 dark:text-dark-300 italic leading-relaxed">
                  {block.reasoning}
                </p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-lg w-fit"
              >
                <Check size={14} className="animate-bounce" />
                Plan Accomplished
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 opacity-0 group-hover/content:opacity-100 transition-all duration-500 translate-x-4 group-hover/content:translate-x-0">
                <ActionButton 
                  onClick={() => onTogglePin(block)}
                  icon={Pin}
                  label={block.isPinned ? "Unpin Item" : "Pin to Top"}
                  active={block.isPinned}
                />
                <ActionButton 
                  onClick={() => onToggleStar(block)}
                  icon={Star}
                  label={block.isStarred ? "Remove Star" : "Add to Favorites"}
                  active={block.isStarred}
                  activeColor="text-yellow-500"
                />
                <ActionButton 
                  onClick={() => onEdit(block)}
                  icon={Edit2}
                  label="Edit Details"
                />
                <ActionButton 
                  onClick={() => onDelete(block)}
                  icon={Trash2}
                  label="Delete Block"
                  variant="danger"
                />
            </div>

            <div className="h-10 w-px bg-dark-100 dark:bg-dark-800 mx-1 hidden md:block opacity-50" />

            <div className="flex items-center gap-3">
              <ActionButton 
                onClick={() => onAddSuggested(block)}
                icon={Plus}
                label="Add to My Tasks"
              />
              <button 
                onClick={() => onToggleComplete(block)}
                className={`p-4 rounded-[1.25rem] transition-all duration-500 shadow-xl active:scale-90 relative overflow-hidden group/btn ${
                  isCompleted 
                    ? 'bg-green-500 text-white shadow-green-500/30' 
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-400 hover:bg-green-500 hover:text-white hover:shadow-green-500/30'
                }`}
              >
                <motion.div
                  animate={isCompleted ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Check size={22} className="relative z-10" />
                </motion.div>
                {!isCompleted && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-600 to-green-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineCard;
