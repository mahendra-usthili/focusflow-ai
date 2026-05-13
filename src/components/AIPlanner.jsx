import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Settings, 
  Plus, 
  RotateCcw,
  Calendar,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { generateDailyPlan } from '../services/groqService';
import TimelineCard from './TimelineCard';
import PlannerSettings from './PlannerSettings';
import PlannerBlockModal from './PlannerBlockModal';

const AIPlanner = ({ tasks, focusSessions, goals }) => {
  const { data: plans, addDocument: addPlan, updateDocument: updatePlan } = useFirestore('dailyPlans');
  const { data: userPrefs, addDocument: addPrefs, updateDocument: updatePrefs } = useFirestore('userPreferences');
  const { addDocument: addTask } = useFirestore('tasks');
  
  const [currentPlanDoc, setCurrentPlanDoc] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [undoStack, setUndoStack] = useState([]);

  // Load preferences
  useEffect(() => {
    if (userPrefs.length > 0) {
      setPreferences(userPrefs[0]);
    } else {
      // Default preferences if none exist
      const defaultPrefs = {
        wakeUpTime: '07:00',
        sleepTime: '23:00',
        focusDuration: 50,
        breakDuration: 10,
        productivityStyle: 'balanced',
      };
      setPreferences(defaultPrefs);
    }
  }, [userPrefs]);

  // Load the most recent plan for today on mount
  useEffect(() => {
    if (plans.length > 0) {
      const today = new Date().toDateString();
      const latestPlan = plans
        .filter(p => new Date(p.createdAt?.seconds * 1000).toDateString() === today)
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];
      
      if (latestPlan) {
        setCurrentPlanDoc(latestPlan);
        setCurrentPlan(latestPlan.planData);
      }
    }
  }, [plans]);

  const savePlanToFirestore = async (newPlanData) => {
    if (currentPlanDoc) {
      await updatePlan(currentPlanDoc.id, { planData: newPlanData });
    } else {
      await addPlan({
        planData: newPlanData,
        createdAt: new Date()
      });
    }
  };

  const addToUndo = (plan) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(plan))].slice(-10));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setCurrentPlan(previousState);
    savePlanToFirestore(previousState);
    setSuccessMsg('Undo successful!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccessMsg('');
    
    try {
      const result = await generateDailyPlan(tasks, focusSessions, goals, preferences);
      
      if (result && result.plan) {
        const enhancedPlan = result.plan.map(block => ({
          ...block,
          id: block.id || Math.random().toString(36).substr(2, 9),
          isCompleted: false,
          isPinned: false,
          isStarred: false
        }));
        
        setCurrentPlan(enhancedPlan);
        await addPlan({
          planData: enhancedPlan,
          recommendations: result.recommendations,
          focusAdvice: result.focusAdvice,
          createdAt: new Date()
        });
        setSuccessMsg('Personalized AI Daily Plan generated!');
      } else {
        throw new Error('Could not generate plan');
      }
    } catch (err) {
      setError('Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    try {
      if (userPrefs.length > 0) {
        await updatePrefs(userPrefs[0].id, newPrefs);
      } else {
        await addPrefs(newPrefs);
      }
      setPreferences(newPrefs);
      setSuccessMsg('Preferences saved!');
    } catch (err) {
      setError('Failed to save preferences.');
    }
  };

  const handleSaveBlock = (blockData) => {
    addToUndo(currentPlan || []);
    let newPlan;
    if (editingBlock) {
      newPlan = currentPlan.map(b => b.id === editingBlock.id ? blockData : b);
    } else {
      newPlan = currentPlan ? [...currentPlan, blockData] : [blockData];
    }
    setCurrentPlan(newPlan);
    savePlanToFirestore(newPlan);
    setSuccessMsg(editingBlock ? 'Block updated!' : 'Block added!');
    setEditingBlock(null);
  };

  const updateBlockState = (blockId, updates) => {
    addToUndo(currentPlan);
    const newPlan = currentPlan.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setCurrentPlan(newPlan);
    savePlanToFirestore(newPlan);
  };

  const handleDeleteBlock = (blockId) => {
    addToUndo(currentPlan);
    const newPlan = currentPlan.filter(block => block.id !== blockId);
    setCurrentPlan(newPlan);
    savePlanToFirestore(newPlan);
    setSuccessMsg('Block deleted. Undo?');
  };

  const handleReorder = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentPlan.length - 1) return;
    
    addToUndo(currentPlan);
    const newPlan = [...currentPlan];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPlan[index], newPlan[targetIndex]] = [newPlan[targetIndex], newPlan[index]];
    
    setCurrentPlan(newPlan);
    savePlanToFirestore(newPlan);
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
    <div className="glass-panel p-6 md:p-8 rounded-[2rem] flex flex-col h-full bg-gradient-to-br from-primary-500/[0.03] to-orange-500/[0.03] relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-dark-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-primary-500 animate-pulse" />
            AI Daily Planner
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-dark-400" />
            <p className="text-sm font-medium text-dark-500 dark:text-dark-400">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — Optimized for you
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {undoStack.length > 0 && (
            <button 
              onClick={handleUndo}
              className="p-3 rounded-xl glass-card text-dark-500 hover:text-primary-500 transition-all active:scale-95"
              title="Undo last change"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-xl glass-card text-dark-500 hover:text-primary-500 transition-all active:scale-95"
            title="Planner Settings"
          >
            <Settings size={18} />
          </button>
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
            <span>{isGenerating ? 'Planning...' : currentPlan ? 'Refresh' : 'Generate'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(error || successMsg) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 border rounded-2xl text-sm mb-6 ${
              error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
            }`}
          >
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {error || successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full py-20 space-y-4 opacity-50">
            <Loader2 size={48} className="text-primary-500 animate-spin" />
            <p className="text-dark-500 font-bold animate-pulse">Consulting FocusFlow AI Intelligence...</p>
          </div>
        ) : currentPlan ? (
          <div className="space-y-2">
            {currentPlan.map((block, index) => (
              <div key={block.id || index} className="group/item relative">
                <div className="absolute -left-10 top-6 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleReorder(index, 'up')} 
                    className={`p-1.5 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 transition-all ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    disabled={index === 0}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    onClick={() => handleReorder(index, 'down')} 
                    className={`p-1.5 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 transition-all ${index === currentPlan.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    disabled={index === currentPlan.length - 1}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                
                <TimelineCard 
                  block={block} 
                  isLast={index === currentPlan.length - 1} 
                  onAddSuggested={handleAddSuggested}
                  onToggleComplete={(b) => updateBlockState(b.id, { isCompleted: !b.isCompleted })}
                  onTogglePin={(b) => updateBlockState(b.id, { isPinned: !b.isPinned })}
                  onToggleStar={(b) => updateBlockState(b.id, { isStarred: !b.isStarred })}
                  onDelete={(b) => handleDeleteBlock(b.id)}
                  onEdit={(b) => {
                    setEditingBlock(b);
                    setIsModalOpen(true);
                  }}
                />
              </div>
            ))}
            
            <button 
              onClick={() => {
                setEditingBlock(null);
                setIsModalOpen(true);
              }}
              className="w-full py-4 mt-6 border-2 border-dashed border-dark-200 dark:border-dark-800 rounded-3xl text-dark-400 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2 group"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">Add Custom Block</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-24 h-24 bg-dark-100 dark:bg-dark-800 rounded-[2rem] flex items-center justify-center mb-8 text-dark-300 relative">
              <Zap size={48} />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-dark-900 animate-bounce">
                <Sparkles size={14} />
              </div>
            </div>
            <h3 className="text-2xl font-display font-black text-dark-900 dark:text-white mb-3 tracking-tight">Personalized Planning</h3>
            <p className="text-dark-500 text-sm max-w-xs mx-auto leading-relaxed">
              Generate an intelligent schedule that respects your wake-up time, focus style, and goals.
            </p>
          </div>
        )}
      </div>

      <PlannerSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        preferences={preferences}
        onSave={handleSavePreferences}
      />

      <PlannerBlockModal 
        isOpen={isModalOpen}
        initialData={editingBlock}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleSaveBlock}
      />
    </div>
  );
};

export default AIPlanner;
