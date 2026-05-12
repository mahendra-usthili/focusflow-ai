import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Zap, Star, Crown } from 'lucide-react';

const FREE_FEATURES = [
  '5 active tasks',
  '3 goals',
  'Basic focus timer',
  'Limited analytics',
  '10 notes',
  'Community support',
];

const PRO_FEATURES = [
  'Unlimited tasks & subtasks',
  'Unlimited goals & milestones',
  'AI-powered productivity coach',
  'Advanced analytics & insights',
  'Unlimited notes with search',
  'Focus session history',
  'Smart daily planning',
  'Priority support',
  'Custom themes',
  'Export your data',
];

const ProPlanModal = ({ isOpen, onClose }) => {
  const [billing, setBilling] = useState('monthly');
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = billing === 'monthly' ? 12 : 8;
  const saving = billing === 'yearly' ? 'Save 33%' : null;

  const handleUpgrade = async () => {
    setUpgrading(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setUpgrading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-900/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="relative w-full max-w-3xl bg-white dark:bg-dark-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-blue-500"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <Crown size={72} className="text-white mb-6" />
                  </motion.div>
                  <h2 className="text-3xl font-display font-black text-white mb-2">You're Pro! 🎉</h2>
                  <p className="text-white/80 text-lg">Welcome to FocusFlow Pro</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-dark-900 to-dark-800 p-8 pb-6">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/10 text-white/70 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-primary-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={12} />
                  Limited Offer
                </div>
                <h2 className="text-3xl font-display font-black text-white mb-2">Unlock Your Full Potential</h2>
                <p className="text-dark-400 max-w-md mx-auto">Get AI-powered coaching, unlimited tasks, advanced analytics, and everything you need to become 10x more productive.</p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
                <span className={`text-sm font-semibold ${billing === 'monthly' ? 'text-white' : 'text-dark-500'}`}>Monthly</span>
                <button
                  onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${billing === 'yearly' ? 'bg-primary-500' : 'bg-dark-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${billing === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <span className={`text-sm font-semibold ${billing === 'yearly' ? 'text-white' : 'text-dark-500'}`}>
                  Yearly
                  {saving && <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-bold">{saving}</span>}
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="p-8 grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="border border-dark-200 dark:border-dark-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-dark-900 dark:text-white">Free</h3>
                    <p className="text-dark-500 text-sm">Get started</p>
                  </div>
                  <span className="text-3xl font-display font-black text-dark-900 dark:text-white">$0</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                      <Check size={14} className="text-dark-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button disabled className="w-full py-3 rounded-xl border border-dark-200 dark:border-dark-700 text-dark-500 font-semibold text-sm cursor-default">
                  Current Plan
                </button>
              </div>

              {/* Pro Plan */}
              <div className="relative bg-gradient-to-br from-dark-900 to-dark-800 border-2 border-primary-500/50 rounded-2xl p-6 shadow-xl shadow-primary-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-400 to-primary-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Star size={10} /> Most Popular
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4 mt-2">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Pro</h3>
                    <p className="text-dark-400 text-sm">Everything unlimited</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-display font-black text-white">${price}</span>
                    <span className="text-dark-400 text-sm">/{billing === 'monthly' ? 'mo' : 'mo'}</span>
                    {billing === 'yearly' && <p className="text-xs text-dark-500 line-through">${12}/mo</p>}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-dark-200">
                      <div className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0">
                        <Check size={10} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-400 to-primary-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {upgrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Upgrade to Pro — ${price}/{billing === 'monthly' ? 'mo' : 'mo'}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-dark-500 mt-3">
                  Cancel anytime · 14-day money-back guarantee
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProPlanModal;
