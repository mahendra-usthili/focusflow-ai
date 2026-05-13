import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Info, Check, Trash2, Pin, Star, Copy, Edit2 } from 'lucide-react';

const TimelineCard = ({ block, onAddSuggested, onToggleComplete, onTogglePin, onToggleStar, onDelete, onDuplicate, onEdit, isLast }) => {
  const isCompleted = block.isCompleted || false;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-dark-500/10 text-dark-500 border-dark-500/20';
    }
  };

  return (
    <div className={`relative pl-8 pb-8 last:pb-0 transition-opacity duration-300 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-dark-100 dark:bg-dark-800" />
      )}
      
      {/* Timeline Dot */}
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 z-10 shadow-sm transition-colors ${
        isCompleted ? 'bg-green-500 border-green-200 dark:border-green-900' : 'bg-white dark:bg-dark-900 border-primary-500'
      }`}>
        {isCompleted && <Check size={10} className="text-white mx-auto mt-0.5" />}
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`glass-card p-5 rounded-2xl group hover:border-primary-500/30 transition-all duration-300 ${
          isCompleted ? 'bg-dark-50/50 dark:bg-dark-900/50 grayscale-[0.5]' : ''
        } ${block.isStarred ? 'ring-2 ring-yellow-500/20 border-yellow-500/30' : ''}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <span className={`text-sm font-black flex items-center gap-1 ${isCompleted ? 'text-dark-400 line-through' : 'text-primary-500'}`}>
                <Clock size={14} />
                {block.time}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityColor(block.priority)}`}>
                {block.priority}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-800 text-dark-500">
                {block.category}
              </span>
              {block.isPinned && <Pin size={12} className="text-primary-500 fill-primary-500" />}
              {block.isStarred && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
            </div>
            
            <h3 className={`text-lg font-bold mb-2 transition-all ${
              isCompleted ? 'text-dark-500 line-through' : 'text-dark-900 dark:text-white group-hover:text-primary-500'
            }`}>
              {block.title}
            </h3>
            
            {!isCompleted && (
              <div className="flex items-start gap-2 bg-primary-500/5 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-500/10">
                <Info size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-dark-600 dark:text-dark-300 italic leading-relaxed">
                  {block.reasoning}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-1">
                <button 
                  onClick={() => onTogglePin(block)}
                  className={`p-2 rounded-lg transition-colors ${block.isPinned ? 'bg-primary-500/10 text-primary-500' : 'hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400'}`}
                  title="Pin block"
                >
                  <Pin size={14} fill={block.isPinned ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => onToggleStar(block)}
                  className={`p-2 rounded-lg transition-colors ${block.isStarred ? 'bg-yellow-500/10 text-yellow-500' : 'hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400'}`}
                  title="Star block"
                >
                  <Star size={14} fill={block.isStarred ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => onEdit(block)}
                  className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-primary-500 transition-colors"
                  title="Edit block"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => onDuplicate(block)}
                  className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-400 hover:text-primary-500 transition-colors"
                  title="Duplicate block"
                >
                  <Copy size={14} />
                </button>
                <button 
                  onClick={() => onDelete(block)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-500 transition-colors"
                  title="Delete block"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="h-10 w-px bg-dark-100 dark:bg-dark-800 mx-1 hidden md:block" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAddSuggested(block)}
                className="p-3 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                title="Add to Tasks"
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={() => onToggleComplete(block)}
                className={`p-3 rounded-xl transition-all shadow-sm ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-400 hover:bg-green-500 hover:text-white'
                }`}
                title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
              >
                <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineCard;
