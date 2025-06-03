import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Settings,
  Users,
  FileText,
  Bell,
  Map,
  Building,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  collapsed?: boolean;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'map', label: '3D Navigator', icon: Map },
  { id: 'buildings', label: 'Buildings', icon: Building },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'dashboard',
  onItemClick,
  collapsed = false
}) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sidebar-nav fixed left-0 top-0 z-40 h-screen transition-all duration-300 custom-scrollbar",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-glass-accent-primary to-glass-accent-secondary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="heading-3 text-xl"
              >
                Urban 3D
              </motion.h1>
            )}
          </motion.div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onItemClick?.(item.id)}
                  className={cn(
                    "sidebar-item w-full text-left group",
                    isActive && "active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive ? "text-glass-accent-primary" : "text-glass-text-secondary group-hover:text-glass-text-primary"
                  )} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-glass-accent-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <motion.div
            className="sidebar-item group cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-glass-accent-secondary to-glass-accent-warning rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">U</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-glass-text-primary truncate">
                  Urban Admin
                </p>
                <p className="text-xs text-glass-text-muted truncate">
                  admin@urban3d.com
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 