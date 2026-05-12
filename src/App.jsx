import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './pages/Auth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Focus from './pages/Focus';
import Goals from './pages/Goals';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Router>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="focus" element={<Focus />} />
                  <Route path="goals" element={<Goals />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
