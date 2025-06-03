import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Settings,
  User,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  sidebarCollapsed = false,
  className
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Add theme switching logic here
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-panel fixed top-0 right-0 z-30 h-16 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onToggleSidebar}
            className="btn-glass p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search Bar */}
          <motion.div
            className="relative"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-glass-text-muted" />
              <input
                type="text"
                placeholder="Search dashboard..."
                className="input-glass w-80 pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </motion.div>
        </div>

        {/* Center Section - Page Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 text-center"
        >
          <h1 className="heading-3 text-lg">Urban 3D Navigator</h1>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="btn-glass p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            className="btn-glass p-2 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-glass-accent-warning rounded-full text-xs flex items-center justify-center">
              3
            </span>
          </motion.button>

          {/* Settings */}
          <motion.button
            className="btn-glass p-2"
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* User Avatar */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-glass-accent-primary to-glass-accent-secondary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-glass-text-primary">
                Admin User
              </p>
              <p className="text-xs text-glass-text-muted">
                Administrator
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 