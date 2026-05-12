import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProPlanOpen, setIsProPlanOpen] = useState(false);
  
  const toggleAIPanel = () => setIsAIPanelOpen(prev => !prev);
  const openAIPanel = () => setIsAIPanelOpen(true);
  const closeAIPanel = () => setIsAIPanelOpen(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <AppContext.Provider value={{ 
      isAIPanelOpen, 
      toggleAIPanel,
      openAIPanel,
      closeAIPanel,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      isProPlanOpen,
      openProPlan: () => setIsProPlanOpen(true),
      closeProPlan: () => setIsProPlanOpen(false),
    }}>
      {children}
    </AppContext.Provider>
  );
};
