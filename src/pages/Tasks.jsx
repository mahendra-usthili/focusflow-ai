import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Calendar, Flag, CheckCircle2, Circle, Trash2, Edit2, X, CheckSquare } from 'lucide-react';
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
  
  // Filter & Sort
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('work');
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleOpenEdit = (task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setCategory(task.category || 'work');
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
      dueDate: null // Add date picker later
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-dark-500 bg-dark-500/10 border-dark-500/20';
    }
  };

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

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-20">
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
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-4 rounded-2xl flex items-start gap-4 transition-all duration-300 ${
                  task.completed ? 'opacity-60 grayscale-[0.5]' : ''
                }`}
              >
                <button 
                  onClick={() => toggleComplete(task)}
                  className="mt-1 flex-shrink-0 text-primary-500 hover:scale-110 transition-transform"
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} className="text-dark-300 dark:text-dark-600" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-semibold truncate ${task.completed ? 'line-through text-dark-400' : 'text-dark-800 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">
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
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(task)} className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteDocument(task.id)} className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
    </div>
  );
};

export default Tasks;
