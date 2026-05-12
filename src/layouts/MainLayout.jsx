import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import AIPanel from '../components/ai/AIPanel';
import ProPlanModal from '../components/ui/ProPlanModal';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const MainLayout = () => {
  const { isProPlanOpen, closeProPlan } = useAppContext();

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex transition-colors duration-300 relative overflow-hidden">
      {/* Background Orbs for glassmorphism effect */}
      <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar />
      <AIPanel />
      
      {/* Global Pro Plan Modal — mounted here so it overlays everything */}
      <ProPlanModal isOpen={isProPlanOpen} onClose={closeProPlan} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10 w-full overflow-x-hidden">
        <Topbar />
        
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
