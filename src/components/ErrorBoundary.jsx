import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex items-center justify-center p-8">
          <div className="glass-panel max-w-lg w-full p-10 rounded-3xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-dark-900 dark:text-white mb-3">
              Something went wrong
            </h2>
            <p className="text-dark-500 dark:text-dark-400 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please refresh the page to continue. If the issue persists, try clearing your browser cache.
            </p>
            <p className="text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mb-6 font-mono text-left break-all">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary py-3 px-8 text-base"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
