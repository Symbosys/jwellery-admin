import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapsed = () => setIsCollapsed(prev => !prev);
  const toggleMobile = () => setIsMobileOpen(prev => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
}
