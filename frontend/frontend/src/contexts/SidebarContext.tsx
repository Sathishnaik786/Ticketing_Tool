import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or default to false
  const [collapsed, setCollapsedState] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true' ? true : false;
  });

  const [mobileOpen, setMobileOpenState] = useState(false);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsedState(prev => !prev);
  };

  const setCollapsed = (collapsed: boolean) => {
    setCollapsedState(collapsed);
  };

  const setMobileOpen = (open: boolean) => {
    setMobileOpenState(open);
  };

  return (
    <SidebarContext.Provider value={{ 
      collapsed, 
      toggleSidebar, 
      setCollapsed,
      mobileOpen,
      setMobileOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};