import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, CheckCircle2, Circle, MoreVertical, Trash2, Calendar, Edit2, X } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

const Goals = () => {
  const { data: goals, loading, addDocument, updateDocument, deleteDocument } = useFirestore('goals');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [milestones, setMilestones] = useState([{ id: Date.now(), title: '', completed: false }]);

  const resetForm = () => {
    setTitle('');
    setDeadline('');
    setMilestones([{ id: Date.now(), title: '', completed: false }]);
    setEditingGoal(null);
    setIsModalOpen(false);
  };

  const handleOpenEdit = (goal) => {
    setTitle(goal.title);
    setDeadline(goal.deadline || '');
    setMilestones(goal.milestones || []);
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { id: Date.now(), title: '', completed: false }]);
  };

  const handleMilestoneChange = (id, newTitle) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, title: newTitle } : m));
  };

  const handleRemoveMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validMilestones = milestones.filter(m => m.title.trim() !== '');

    const goalData = {
      title,
      deadline,
      milestones: validMilestones,
    };

    if (editingGoal) {
      await updateDocument(editingGoal.id, goalData);
    } else {
      await addDocument(goalData);
    }
    resetForm();
  };

  const toggleMilestoneComplete = async (goal, milestoneId) => {
    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    await updateDocument(goal.id, { milestones: updatedMilestones });
  };

  const calculateProgress = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-3">
            <Target className="text-primary-500" size={32} />
            Goals
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">Track your long-term objectives and milestones.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-2.5"
        >
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Target size={48} className="mb-4 text-dark-400" />
            <p className="text-lg font-medium">No goals set yet</p>
            <p className="text-sm mt-1">Define your first big objective to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {goals.map(goal => {
                const progress = calculateProgress(goal.milestones);
                const isCompleted = progress === 100;
                
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-panel p-6 rounded-3xl relative group transition-all duration-300 ${
                      isCompleted ? 'border-primary-500/50 shadow-primary-500/10' : ''
                    }`}
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(goal)} className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteDocument(goal.id)} className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 className="text-xl font-bold mb-2 pr-16 text-dark-800 dark:text-white">{goal.title}</h3>
                    
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-xs font-medium text-dark-500 dark:text-dark-400 mb-6 bg-dark-50 dark:bg-dark-800 inline-flex px-3 py-1.5 rounded-lg border border-dark-100 dark:border-dark-700">
                        <Calendar size={14} />
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className={isCompleted ? 'text-primary-500' : 'text-dark-600 dark:text-dark-300'}>Progress</span>
                        <span className={isCompleted ? 'text-primary-500' : 'text-dark-900 dark:text-white'}>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isCompleted ? 'bg-primary-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-blue-500 to-primary-500'}`}
                        />
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-3 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-dark-400 mb-3">Milestones</h4>
                      {goal.milestones?.length === 0 ? (
                        <p className="text-sm text-dark-500 italic">No milestones set.</p>
                      ) : (
                        goal.milestones?.map(milestone => (
                          <div 
                            key={milestone.id} 
                            onClick={() => toggleMilestoneComplete(goal, milestone.id)}
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800 cursor-pointer transition-colors group/item"
                          >
                            <button className={`mt-0.5 flex-shrink-0 transition-transform group-hover/item:scale-110 ${milestone.completed ? 'text-primary-500' : 'text-dark-300 dark:text-dark-600'}`}>
                              {milestone.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <span className={`text-sm font-medium transition-colors ${milestone.completed ? 'line-through text-dark-400' : 'text-dark-700 dark:text-dark-200'}`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-xl font-display font-bold">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
                <button onClick={resetForm} className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="goalForm" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Goal Title</label>
                    <input 
                      type="text" 
                      required
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Launch SaaS Product"
                      className="input-field font-bold text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Target Deadline</label>
                    <input 
                      type="date" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider">Milestones</label>
                      <button 
                        type="button" 
                        onClick={handleAddMilestone}
                        className="text-primary-500 hover:text-primary-600 text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={14} /> Add Step
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence>
                        {milestones.map((milestone, index) => (
                          <motion.div 
                            key={milestone.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-500 flex-shrink-0">
                              {index + 1}
                            </div>
                            <input 
                              type="text" 
                              value={milestone.title}
                              onChange={(e) => handleMilestoneChange(milestone.id, e.target.value)}
                              placeholder={`Milestone ${index + 1}...`}
                              className="input-field flex-1 text-sm py-2"
                              required={index === 0 && milestones.length === 1}
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveMilestone(milestone.id)}
                              className="text-dark-400 hover:text-red-500 p-2"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3 bg-dark-50 dark:bg-dark-950/50 mt-auto">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" form="goalForm" className="btn-primary">
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
