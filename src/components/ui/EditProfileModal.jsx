import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Check, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentUser?.displayName || '');
      setPhotoURL(currentUser?.photoURL || '');
      setError('');
      setSaved(false);
    }
  }, [isOpen, currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (displayName || currentUser?.displayName || 'U').charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="relative w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-100 dark:border-dark-800">
              <h2 className="text-lg font-display font-bold text-dark-900 dark:text-white">Edit Profile</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-xl text-dark-400 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full border-4 border-primary-500/30 overflow-hidden">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" onError={() => setPhotoURL('')} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-dark-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={18} className="text-white" />
                  </div>
                </div>
                <p className="text-xs text-dark-500 text-center">Provide a URL to your avatar image below</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="input-field"
                  autoFocus
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">
                  Avatar URL <span className="normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={e => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="input-field"
                />
              </div>

              {/* Read-only info */}
              <div className="bg-dark-50 dark:bg-dark-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Email</span>
                  <span className="font-semibold text-dark-800 dark:text-dark-200">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Member since</span>
                  <span className="font-semibold text-dark-800 dark:text-dark-200">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Plan</span>
                  <span className="font-bold text-primary-500">Free Plan</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !displayName.trim()}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : saved ? (
                    <><Check size={16} /> Saved!</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
