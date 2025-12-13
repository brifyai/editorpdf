import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileDrawer from './MobileDrawer';
import EnhancedMobileBottomNav from './EnhancedMobileBottomNav';
import Header from './Header';
import useIsMobile from '../../hooks/useIsMobile';

const MobileLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Only render mobile layout on mobile devices
  if (!isMobile) {
    return children;
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <Header 
        onMenuClick={toggleDrawer}
        showMenuButton={true}
        isMobile={true}
      />

      {/* Main Content - Mobile Optimized */}
      <main className="pb-20 pt-16 px-4">
        {children}
      </main>

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={drawerOpen}
        onClose={closeDrawer}
      />

      {/* Enhanced Mobile Bottom Navigation */}
      <EnhancedMobileBottomNav 
        onMenuClick={toggleDrawer}
      />
    </div>
  );
};

export default MobileLayout;