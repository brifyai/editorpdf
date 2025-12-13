import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OptimizedSidebar from './OptimizedSidebar';
import MobileBottomNav from './MobileBottomNav';
import Header from './Header';
import '../../styles/optimized-layout.css';

const OptimizedMainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Close sidebar on route change (mobile)
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <OptimizedSidebar 
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          <div 
            className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
          <OptimizedSidebar 
            isCollapsed={false}
            setIsCollapsed={() => {}}
            isMobile={true}
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
          />
        </>
      )}

      {/* Main Content */}
      <div className={`main-content ${!isMobile ? 'lg:ml-80' : ''} ${!isMobile && sidebarCollapsed ? 'lg:ml-20' : ''}`}>
        
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          showMenuButton={true}
        />

        {/* Page Content */}
        <main className="p-6 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default OptimizedMainLayout;