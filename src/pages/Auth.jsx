import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  // ✅ THE FIX: redirect only when Firebase has confirmed the user session
  // This fires AFTER onAuthStateChanged sets currentUser, so ProtectedRoute
  // will always see a valid user before rendering the protected pages.
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // Do NOT call navigate() here — the useEffect above handles it
      // once AuthContext confirms the session via onAuthStateChanged
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      setLoading(false);
    }
    // Note: don't set loading=false on success — let the redirect happen naturally
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // Do NOT call navigate() here — useEffect handles it
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-50 dark:bg-dark-950 transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/40">
            <Zap className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-900 dark:text-white">
            FocusFlow <span className="text-primary-500 text-sm font-semibold tracking-widest uppercase">AI Suite</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-2 text-center text-sm">
            Unlock your ultimate productivity potential.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-dark-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-dark-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center py-3 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b border-dark-200 dark:border-dark-800 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-dark-500 dark:text-dark-400 uppercase">or continue with</span>
          <span className="border-b border-dark-200 dark:border-dark-800 w-1/5 lg:w-1/4"></span>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full mt-6 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-800 dark:text-white font-medium py-3 px-4 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors duration-200 flex items-center justify-center shadow-sm disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              <path fill="none" d="M1 1h22v22H1z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-dark-500 dark:text-dark-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
