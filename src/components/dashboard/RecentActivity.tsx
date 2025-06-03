import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'text-glass-accent-secondary';
      case 'warning':
        return 'text-glass-accent-warning';
      case 'error':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-glass-accent-primary';
    }
  };

  const getBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return 'bg-glass-accent-secondary/20';
      case 'warning':
        return 'bg-glass-accent-warning/20';
      case 'error':
        return 'bg-red-400/20';
      case 'info':
      default:
        return 'bg-glass-accent-primary/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn("modern-card", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-3">Recent Activity</h3>
        <motion.button
          className="btn-glass px-3 py-1 text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </motion.button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          const bgColor = getBgColor(activity.type);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-glass-background-accent/30 hover:bg-glass-background-accent/50 transition-colors duration-300"
            >
              <motion.div
                className={cn(
                  "p-2 rounded-full flex-shrink-0",
                  bgColor
                )}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className={cn("w-4 h-4", iconColor)} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-glass-text-primary mb-1">
                  {activity.action}
                </p>
                <div className="flex items-center gap-2 text-xs text-glass-text-muted">
                  <span>by {activity.user}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glass-background-accent/30 flex items-center justify-center">
            <Clock className="w-8 h-8 text-glass-text-muted" />
          </div>
          <p className="text-glass-text-muted">No recent activity</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentActivity; 