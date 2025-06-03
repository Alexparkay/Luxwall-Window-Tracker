import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  onNavigate?: (item: string) => void;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeItem = 'dashboard',
  onNavigate,
  className
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-glass-background-primary">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        onItemClick={onNavigate}
        collapsed={sidebarCollapsed}
      />

      {/* Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(
          "pt-16 transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "ml-16" : "ml-64",
          className
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout; 