import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { generateDailyPlan } from '../services/groqService';
import TimelineCard from './TimelineCard';

const AIPlanner = ({ tasks, focusSessions, goals }) => {
  const { data: plans, addDocument } = useFirestore('dailyPlans');
  const { addDocument: addTask } = useFirestore('tasks');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Load the most recent plan for today on mount
  useEffect(() => {
    if (plans.length > 0) {
      const today = new Date().toDateString();
      const latestPlan = plans
        .filter(p => new Date(p.createdAt?.seconds * 1000).toDateString() === today)
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];
      
      if (latestPlan) {
        setCurrentPlan(latestPlan.planData);
      }
    }
  }, [plans]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMsg('');
    
    try {
      const result = await generateDailyPlan(tasks, focusSessions, goals);
      
      if (result && result.plan) {
        setCurrentPlan(result.plan);
        // Save to Firestore
        await addDocument({
          planData: result.plan,
          recommendations: result.recommendations,
          focusAdvice: result.focusAdvice
        });
        setSuccessMsg('AI Daily Plan generated successfully!');
      } else {
        throw new Error('Could not generate plan');
      }
    } catch (err) {
      setError(err.message === 'GROQ_NOT_CONFIGURED' 
        ? 'AI is not configured. Please add your API key.' 
        : 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSuggested = async (block) => {
    try {
      await addTask({
        title: block.title,
        priority: block.priority || 'medium',
        category: block.category?.toLowerCase() || 'work',
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Suggested by AI: ${block.reasoning}`
      });
      setSuccessMsg(`"${block.title}" added to your tasks!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to add task.');
    }
  };

  return (
    <div className="glass-panel p-6 md:p-8 rounded-[2rem] flex flex-col h-full bg-gradient-to-br from-primary-500/[0.03] to-orange-500/[0.03]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-dark-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-primary-500 animate-pulse" />
            AI Daily Planner
          </h2>
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mt-1">
            Optimized schedule based on your goals and focus history.
          </p>
        </div>

        <button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className={`btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-lg transition-all ${
            isGenerating ? 'opacity-70 cursor-not-allowed' : 'shadow-primary-500/20 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : currentPlan ? (
            <RefreshCw size={18} />
          ) : (
            <Zap size={18} />
          )}
          <span>{isGenerating ? 'Planning...' : currentPlan ? 'Refresh Plan' : 'Generate Plan'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm mb-6"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 text-sm mb-6"
          >
            <CheckCircle2 size={18} />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-4 opacity-50">
            <Loader2 size={48} className="text-primary-500 animate-spin" />
            <p className="text-dark-500 font-bold animate-pulse">Analyzing your productivity data...</p>
          </div>
        ) : currentPlan ? (
          <div className="space-y-2">
            {currentPlan.map((block, index) => (
              <TimelineCard 
                key={index} 
                block={block} 
                isLast={index === currentPlan.length - 1} 
                onAddSuggested={handleAddSuggested}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-20 h-20 bg-dark-100 dark:bg-dark-800 rounded-3xl flex items-center justify-center mb-6 text-dark-300">
              <Zap size={40} />
            </div>
            <h3 className="text-xl font-bold text-dark-800 dark:text-dark-200 mb-2">Ready to Plan?</h3>
            <p className="text-dark-500 text-sm max-w-xs mx-auto">
              Click generate to create an intelligent daily schedule using your tasks, goals, and focus patterns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlanner;
