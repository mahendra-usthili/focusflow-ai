import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Coffee, Target, Award } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';

const MODES = {
  focus: { time: 25 * 60, label: 'Focus Time', color: 'text-primary-500', bg: 'bg-primary-500' },
  shortBreak: { time: 5 * 60, label: 'Short Break', color: 'text-blue-500', bg: 'bg-blue-500' },
  longBreak: { time: 15 * 60, label: 'Long Break', color: 'text-purple-500', bg: 'bg-purple-500' }
};

const Focus = () => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);
  const { addDocument, data: sessions } = useFirestore('focusSessions');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    
    // Play sound here if needed

    // Save to Firestore
    if (mode === 'focus') {
      await addDocument({
        duration: MODES.focus.time,
        type: 'focus',
        date: new Date().toISOString()
      });
      // Suggest break
      handleModeChange('shortBreak');
    } else {
      handleModeChange('focus');
    }
  };

  const handleModeChange = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;
  const circumference = 2 * Math.PI * 120; // r=120
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.createdAt?.seconds * 1000 || s.date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const totalFocusMinutes = Math.round(todaySessions.reduce((acc, curr) => acc + curr.duration, 0) / 60);

  return (
    <div className="h-full flex flex-col md:flex-row gap-8">
      {/* Main Timer Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        
        {/* Mode Selector */}
        <div className="glass-card flex p-1 rounded-2xl mb-12">
          {Object.entries(MODES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === key 
                  ? `${config.bg} text-white shadow-lg` 
                  : 'text-dark-500 hover:text-dark-900 dark:hover:text-white'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Animated Timer Ring */}
        <div className="relative flex items-center justify-center mb-12">
          <svg className="w-[300px] h-[300px] transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="150"
              cy="150"
              r="120"
              className="stroke-dark-200 dark:stroke-dark-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="150"
              cy="150"
              r="120"
              className={`stroke-current ${MODES[mode].color}`}
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          
          <div className="absolute text-center">
            <h2 className={`text-6xl font-display font-black tracking-tighter ${MODES[mode].color}`}>
              {formatTime(timeLeft)}
            </h2>
            <p className="text-dark-500 dark:text-dark-400 font-medium uppercase tracking-widest text-xs mt-2">
              {isActive ? 'Session in progress' : 'Ready to start'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center text-dark-500 hover:text-dark-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${MODES[mode].bg}`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>

          <button 
            onClick={() => {
              if(isActive) handleComplete();
            }}
            disabled={!isActive}
            className={`w-14 h-14 rounded-2xl glass-card flex items-center justify-center transition-colors ${isActive ? 'text-red-500 hover:bg-red-500/10' : 'text-dark-300 dark:text-dark-700 cursor-not-allowed'}`}
          >
            <Square size={24} />
          </button>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-3xl">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            <Award className="text-orange-500" />
            Today's Progress
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-500 font-medium">Focus Time</span>
                <span className="font-bold">{totalFocusMinutes} min</span>
              </div>
              <div className="h-2 w-full bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${Math.min((totalFocusMinutes / 120) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-dark-400 mt-2 text-right">Goal: 120 min</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-50 dark:bg-dark-800 p-4 rounded-2xl border border-dark-100 dark:border-dark-700">
                <Target size={20} className="text-primary-500 mb-2" />
                <p className="text-2xl font-bold">{todaySessions.length}</p>
                <p className="text-xs text-dark-500 font-medium">Sessions</p>
              </div>
              <div className="bg-dark-50 dark:bg-dark-800 p-4 rounded-2xl border border-dark-100 dark:border-dark-700">
                <Coffee size={20} className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-dark-500 font-medium">Breaks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex-1">
          <h3 className="font-display font-bold text-lg mb-4">Recent Sessions</h3>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-dark-500">No sessions completed today.</p>
          ) : (
            <div className="space-y-3">
              {todaySessions.slice(0, 5).map((session, i) => (
                <div key={session.id || i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Focus Block</p>
                      <p className="text-[10px] text-dark-500">{new Date(session.createdAt?.seconds * 1000 || session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{Math.round(session.duration / 60)}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Focus;
