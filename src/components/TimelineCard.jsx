import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Info } from 'lucide-react';

const TimelineCard = ({ block, onAddSuggested, isLast }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-dark-500/10 text-dark-500 border-dark-500/20';
    }
  };

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-dark-100 dark:bg-dark-800" />
      )}
      
      {/* Timeline Dot */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-dark-900 border-4 border-primary-500 z-10 shadow-sm" />

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="glass-card p-5 rounded-2xl group hover:border-primary-500/30 transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-black text-primary-500 flex items-center gap-1">
                <Clock size={14} />
                {block.time}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityColor(block.priority)}`}>
                {block.priority}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-800 text-dark-500">
                {block.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
              {block.title}
            </h3>
            
            <div className="flex items-start gap-2 bg-primary-500/5 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-500/10">
              <Info size={14} className="text-primary-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-dark-600 dark:text-dark-300 italic leading-relaxed">
                {block.reasoning}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden md:block mr-2">
              <p className="text-[10px] font-bold text-dark-400 uppercase">Duration</p>
              <p className="text-sm font-black text-dark-700 dark:text-dark-200">{block.duration}</p>
            </div>
            
            <button 
              onClick={() => onAddSuggested(block)}
              className="p-3 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
              title="Add to Tasks"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineCard;
