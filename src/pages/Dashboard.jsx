import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Target, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { data: tasks, loading: tasksLoading } = useFirestore('tasks');
  const { data: focusSessions, loading: focusLoading } = useFirestore('focusSessions');
  const { data: goals, loading: goalsLoading } = useFirestore('goals');

  const loading = tasksLoading || focusLoading || goalsLoading;

  if (loading) {
    return (
      <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar space-y-8 animate-pulse">
        {/* Hero Skeleton */}
        <div className="glass-panel p-8 md:p-12 rounded-[2rem] h-64 bg-dark-100 dark:bg-dark-800/50"></div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="glass-card h-28 rounded-3xl bg-dark-100 dark:bg-dark-800/50"></div>)}
        </div>
        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1,2].map(i => <div key={i} className="glass-panel h-80 rounded-3xl bg-dark-100 dark:bg-dark-800/50"></div>)}
        </div>
      </div>
    );
  }

  // Active Tasks
  const activeTasks = tasks.filter(t => !t.completed).slice(0, 3);
  
  // Today's Focus
  const todaySessions = focusSessions.filter(s => {
    const d = new Date(s.createdAt?.seconds * 1000 || s.date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const totalFocusMinutes = Math.round(todaySessions.reduce((acc, curr) => acc + curr.duration, 0) / 60);

  // Active Goals
  const activeGoals = goals.filter(g => {
    if (!g.milestones || g.milestones.length === 0) return true;
    const completed = g.milestones.filter(m => m.completed).length;
    return completed < g.milestones.length;
  }).slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar">
      
      {/* Hero Section */}
      <div className="glass-panel p-8 md:p-12 rounded-[2rem] mb-8 relative overflow-hidden bg-gradient-to-br from-white/60 to-white/30 dark:from-dark-900/80 dark:to-dark-900/40">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={200} className="text-primary-500" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-bold text-orange-500 uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-black text-dark-900 dark:text-white mb-2 tracking-tight">
            {getGreeting()},
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-primary-500 text-transparent bg-clip-text">
              {currentUser?.displayName?.split(' ')[0] || 'User'}
            </span>
          </h1>
          
          <p className="text-lg text-dark-600 dark:text-dark-300 mt-6 mb-8 font-medium max-w-lg leading-relaxed">
            "Discipline is choosing between what you want now, and what you want most." Let's make today legendary.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/focus" className="btn-primary py-3 px-6 shadow-xl shadow-primary-500/30 flex items-center gap-2">
              <Zap size={18} />
              Start Focus Session
            </Link>
            <Link to="/tasks" className="btn-secondary py-3 px-6 bg-white dark:bg-dark-800 shadow-sm font-semibold">
              View Today's Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-dark-900 dark:text-white">{tasks.filter(t => t.completed).length}</p>
            <p className="text-sm font-medium text-dark-500 uppercase tracking-wider">Tasks Done</p>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-dark-900 dark:text-white">{totalFocusMinutes}m</p>
            <p className="text-sm font-medium text-dark-500 uppercase tracking-wider">Focus Today</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-dark-900 dark:text-white">5</p>
            <p className="text-sm font-medium text-dark-500 uppercase tracking-wider">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Tasks */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <CheckSquare className="text-primary-500" />
              Priority Tasks
            </h2>
            <Link to="/tasks" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-3 flex-1">
            {activeTasks.length === 0 ? (
              <p className="text-dark-500 text-sm text-center py-10">You're all caught up!</p>
            ) : (
              activeTasks.map(task => (
                <div key={task.id} className="p-4 rounded-2xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 flex items-center justify-between group hover:border-primary-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border-2 border-primary-500"></div>
                    <span className="font-semibold text-dark-800 dark:text-white">{task.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Goals */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Target className="text-orange-500" />
              Active Goals
            </h2>
            <Link to="/goals" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {activeGoals.length === 0 ? (
              <p className="text-dark-500 text-sm text-center py-10">No active goals currently.</p>
            ) : (
              activeGoals.map(goal => {
                const completed = goal.milestones ? goal.milestones.filter(m => m.completed).length : 0;
                const total = goal.milestones ? goal.milestones.length : 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <div key={goal.id} className="p-5 rounded-2xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-dark-900 dark:text-white">{goal.title}</h3>
                      <span className="text-sm font-bold text-primary-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-orange-400 to-primary-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs font-semibold text-dark-500 mt-3 text-right">
                      {completed} of {total} milestones
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
