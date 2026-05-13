import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Calendar, Flag, CheckCircle2, Circle, Trash2, Edit2, X, CheckSquare, Star, Pin, AlertCircle } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

const Tasks = () => {
  const { data: tasks, loading, addDocument, updateDocument, deleteDocument } = useFirestore('tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('work');
  const [dueDate, setDueDate] = useState('');
  
  // Filter & Sort
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirmation
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Helper Functions (Moved to top to prevent initialization errors)
  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date().setHours(0,0,0,0);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-dark-500 bg-dark-500/10 border-dark-500/20';
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('work');
    setDueDate('');
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleOpenEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setCategory(task.category || 'work');
    setDueDate(task.dueDate || '');
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title,
      description,
      priority,
      category,
      completed: editingTask ? editingTask.completed : false,
      isStarred: editingTask ? (editingTask.isStarred || false) : false,
      isPinned: editingTask ? (editingTask.isPinned || false) : false,
      dueDate: dueDate || null
    };

    if (editingTask) {
      await updateDocument(editingTask.id, taskData);
    } else {
      await addDocument(taskData);
    }
    resetForm();
  };

  const toggleComplete = async (task) => {
    await updateDocument(task.id, { completed: !task.completed });
  };
  
  const toggleStar = async (task) => {
    await updateDocument(task.id, { isStarred: !task.isStarred });
  };

  const togglePin = async (task) => {
    await updateDocument(task.id, { isPinned: !task.isPinned });
  };

  const filteredTasks = tasks.filter(task => {
    // Status Filter (all, active, completed)
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Priority Filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // Category Filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    
    // Starred/Pinned Filters
    if (showStarredOnly && !task.isStarred) return false;
    if (showPinnedOnly && !task.isPinned) return false;
    
    // Search Query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  }).sort((a, b) => {
    // 1. Completed tasks always go to the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    // 2. Pinned tasks go to the top (among same completion status)
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    
    // 3. Overdue tasks get next priority
    const aOverdue = isOverdue(a.dueDate) && !a.completed;
    const bOverdue = isOverdue(b.dueDate) && !b.completed;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    
    // 4. Starred tasks
    if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
    
    // 5. Default: Creation date (assuming newer first if not specified)
    return 0;
  });

  const pinnedTasks = filteredTasks.filter(t => t.isPinned && !t.completed);
  const otherTasks = filteredTasks.filter(t => !t.isPinned || t.completed);


  return (
    <div className="h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white">Tasks</h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">You have {tasks.filter(t => !t.completed).length} active tasks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-card flex items-center px-3 py-2 rounded-xl">
            <Search size={16} className="text-dark-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-32 md:w-48 text-sm"
            />
          </div>
          
          <div className="glass-card flex items-center rounded-xl p-1">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filter === f ? 'bg-white dark:bg-dark-700 text-primary-500 shadow-sm' : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 py-2.5"
          >
            <Plus size={18} />
            <span className="hidden md:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="glass-card flex items-center rounded-xl p-1">
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 px-3 text-xs font-semibold ${
              showStarredOnly ? 'bg-yellow-500/10 text-yellow-500' : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <Star size={14} fill={showStarredOnly ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">Starred</span>
          </button>
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 px-3 text-xs font-semibold ${
              showPinnedOnly ? 'bg-primary-500/10 text-primary-500' : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'
            }`}
          >
            <Pin size={14} fill={showPinnedOnly ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">Pinned</span>
          </button>
        </div>

        <select 
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="glass-card bg-transparent border-none outline-none text-xs font-semibold p-2 rounded-xl text-dark-600 dark:text-dark-300 cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="glass-card bg-transparent border-none outline-none text-xs font-semibold p-2 rounded-xl text-dark-600 dark:text-dark-300 cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="learning">Learning</option>
          <option value="health">Health</option>
        </select>

        {(priorityFilter !== 'all' || categoryFilter !== 'all' || showStarredOnly || showPinnedOnly) && (
          <button 
            onClick={() => {
              setPriorityFilter('all');
              setCategoryFilter('all');
              setShowStarredOnly(false);
              setShowPinnedOnly(false);
            }}
            className="text-xs font-bold text-primary-500 hover:text-primary-600 px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <CheckSquare size={48} className="mb-4 text-dark-400" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Create a new task to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Tasks Section */}
            {pinnedTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-dark-400 uppercase tracking-widest pl-2">
                  <Pin size={12} className="text-primary-500" />
                  Pinned Tasks
                </div>
                <AnimatePresence>
                  {pinnedTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      toggleComplete={toggleComplete} 
                      toggleStar={toggleStar} 
                      togglePin={togglePin} 
                      handleOpenEdit={handleOpenEdit} 
                      openDeleteConfirm={(task) => {
                        setTaskToDelete(task);
                        setIsDeleteModalOpen(true);
                      }}
                      isOverdue={isOverdue}
                      formatDate={formatDate}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* All/Other Tasks Section */}
            <div className="space-y-3">
              {pinnedTasks.length > 0 && otherTasks.length > 0 && (
                <div className="text-xs font-bold text-dark-400 uppercase tracking-widest pl-2 mt-4">
                  All Tasks
                </div>
              )}
              <AnimatePresence>
                {otherTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    toggleComplete={toggleComplete} 
                    toggleStar={toggleStar} 
                    togglePin={togglePin} 
                    handleOpenEdit={handleOpenEdit} 
                    openDeleteConfirm={(task) => {
                      setTaskToDelete(task);
                      setIsDeleteModalOpen(true);
                    }}
                    isOverdue={isOverdue}
                    formatDate={formatDate}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-100 dark:border-dark-800">
                <h2 className="text-xl font-display font-bold">
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </h2>
                <button onClick={resetForm} className="text-dark-400 hover:text-dark-900 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Task Title</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="input-field font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    className="input-field min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value)}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="learning">Learning</option>
                      <option value="health">Health</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-dark-100 dark:border-dark-800 flex justify-end gap-3">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && taskToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Task?</h2>
              <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">
                Are you sure you want to delete <span className="font-bold text-dark-900 dark:text-white">"{taskToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                  }} 
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await deleteDocument(taskToDelete.id);
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                  }} 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;

const TaskCard = ({ task, toggleComplete, toggleStar, togglePin, handleOpenEdit, openDeleteConfirm, isOverdue, formatDate, getPriorityColor }) => {
  const overdue = isOverdue(task.dueDate) && !task.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 group ${
        task.completed ? 'opacity-60 grayscale-[0.5]' : ''
      } ${task.isPinned && !task.completed ? 'border-primary-500/30 bg-primary-500/5' : ''} 
      ${overdue ? 'border-red-500/30 bg-red-500/5' : ''}`}
    >
      <button 
        onClick={() => toggleComplete(task)}
        className="mt-1 flex-shrink-0 text-primary-500 hover:scale-110 transition-transform"
      >
        {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-dark-300 dark:text-dark-600" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-base font-semibold truncate ${task.completed ? 'line-through text-dark-400' : 'text-dark-800 dark:text-white'}`}>
            {task.title}
          </h3>
          {task.isStarred && <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
        </div>
        
        {task.description && (
          <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className="text-xs text-dark-500 dark:text-dark-400 font-medium capitalize bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded">
            {task.category}
          </span>
          {task.dueDate && (
            <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded border ${
              task.completed ? 'text-dark-400 border-dark-200' : 
              overdue ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
              'text-primary-500 bg-primary-500/10 border-primary-500/20'
            }`}>
              <Calendar size={10} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {overdue && (
            <span className="text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded border text-red-500 bg-red-500/10 border-red-500/20">
              <AlertCircle size={10} />
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
        <button 
          onClick={() => togglePin(task)} 
          className={`p-2 rounded-lg transition-colors ${task.isPinned ? 'text-primary-500 bg-primary-500/10' : 'text-dark-400 hover:text-primary-500 hover:bg-primary-500/10'}`}
          title={task.isPinned ? "Unpin" : "Pin to top"}
        >
          <Pin size={16} fill={task.isPinned ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={() => toggleStar(task)} 
          className={`p-2 rounded-lg transition-colors ${task.isStarred ? 'text-yellow-500 bg-yellow-500/10' : 'text-dark-400 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
          title={task.isStarred ? "Unstar" : "Mark as favorite"}
        >
          <Star size={16} fill={task.isStarred ? "currentColor" : "none"} />
        </button>
        <button onClick={() => handleOpenEdit(task)} className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors">
          <Edit2 size={16} />
        </button>
        <button onClick={() => openDeleteConfirm(task)} className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};
