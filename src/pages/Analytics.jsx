import React, { useMemo } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { BarChart2, TrendingUp, Target, Clock, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#a855f7'];

// Defined outside component to prevent re-creation on every render
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 p-3 rounded-lg shadow-xl">
        <p className="font-semibold text-dark-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsSkeleton = () => (
  <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar space-y-8 animate-pulse">
    <div className="h-10 w-64 skeleton mb-2"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-3xl skeleton"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1,2,3].map(i => <div key={i} className="h-80 rounded-3xl skeleton"></div>)}
    </div>
  </div>
);

const Analytics = () => {
  const { data: tasks, loading: tasksLoading } = useFirestore('tasks');
  const { data: sessions, loading: sessionsLoading } = useFirestore('focusSessions');
  const { isDarkMode } = useTheme();

  const loading = tasksLoading || sessionsLoading;

  const stats = useMemo(() => {
    if (!tasks.length && !sessions.length) return null;

    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    const totalFocusMinutes = Math.round(sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60);
    const focusHours = (totalFocusMinutes / 60).toFixed(1);

    // Tasks by category
    const categories = tasks.reduce((acc, task) => {
      const cat = task.category || 'uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const categoryData = Object.keys(categories).map((key, index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: categories[key],
      color: COLORS[index % COLORS.length]
    }));

    // Last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const weeklyFocusData = last7Days.map(dayStr => ({ name: dayStr, minutes: 0 }));

    sessions.forEach(session => {
      const d = new Date(session.createdAt?.seconds * 1000 || session.date);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = weeklyFocusData.find(d => d.name === dayStr);
      if (dayData) {
        dayData.minutes += Math.round((session.duration || 0) / 60);
      }
    });

    const weeklyTaskData = last7Days.map(dayStr => ({ name: dayStr, completed: 0, added: 0 }));
    tasks.forEach(task => {
      if (task.completed && task.updatedAt?.seconds) {
        const d = new Date(task.updatedAt.seconds * 1000);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayData = weeklyTaskData.find(d => d.name === dayStr);
        if (dayData) dayData.completed++;
      }
      if (task.createdAt?.seconds) {
        const d = new Date(task.createdAt.seconds * 1000);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayData = weeklyTaskData.find(d => d.name === dayStr);
        if (dayData) dayData.added++;
      }
    });

    return {
      completedTasks,
      completionRate,
      focusHours,
      categoryData,
      weeklyFocusData,
      weeklyTaskData
    };
  }, [tasks, sessions]);

  const chartTheme = {
    textColor: isDarkMode ? '#94a3b8' : '#64748b',
    gridColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  if (loading) return <AnalyticsSkeleton />;

  if (!stats) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
        <BarChart2 size={64} className="mb-4 text-dark-400" />
        <h2 className="text-xl font-display font-bold text-dark-700 dark:text-dark-300">Not Enough Data Yet</h2>
        <p className="text-dark-500 mt-2 max-w-sm">Complete some tasks and focus sessions to unlock your analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20 pr-2 custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white flex items-center gap-3">
          <BarChart2 className="text-primary-500" size={32} />
          Analytics Overview
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Insights and metrics based on your activity.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-500/10 text-primary-500 rounded-xl"><Target size={20} /></div>
            <h3 className="font-semibold text-dark-600 dark:text-dark-300 text-sm uppercase tracking-wider">Completed Tasks</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-bold text-dark-900 dark:text-white">{stats.completedTasks}</span>
            <span className="text-sm text-primary-500 font-medium mb-1">Lifetime</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><TrendingUp size={20} /></div>
            <h3 className="font-semibold text-dark-600 dark:text-dark-300 text-sm uppercase tracking-wider">Completion Rate</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-bold text-dark-900 dark:text-white">{stats.completionRate}%</span>
            <span className="text-sm text-dark-500 font-medium mb-1">Avg</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl"><Clock size={20} /></div>
            <h3 className="font-semibold text-dark-600 dark:text-dark-300 text-sm uppercase tracking-wider">Focus Hours</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-bold text-dark-900 dark:text-white">{stats.focusHours}</span>
            <span className="text-sm text-dark-500 font-medium mb-1">Hours</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary-500 to-blue-500 text-white border-none shadow-xl shadow-primary-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl"><Activity size={20} /></div>
            <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wider">Productivity Score</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-display font-bold">{Math.min(100, stats.completionRate + 10)}</span>
            <span className="text-sm text-white/80 font-medium mb-1">{stats.completionRate >= 70 ? 'Excellent' : stats.completionRate >= 40 ? 'Good' : 'Building'}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Weekly Focus Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="font-display font-bold text-lg mb-6 text-dark-800 dark:text-white">Focus Time (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyFocusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="font-display font-bold text-lg mb-6 text-dark-800 dark:text-white">Task Activity (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyTaskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }} />
                <Bar dataKey="added" name="Added" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by Category Pie Chart */}
        {stats.categoryData.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-display font-bold text-lg mb-2 text-dark-800 dark:text-white">Tasks by Category</h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {stats.categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-dark-600 dark:text-dark-300">{entry.name}</span>
                  <span className="text-dark-900 dark:text-white font-bold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
