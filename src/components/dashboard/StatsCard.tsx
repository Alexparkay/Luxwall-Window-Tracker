import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  index?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-glass-accent-primary',
  className,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn("modern-card group", className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="small-text mb-2">{title}</p>
          <p className="heading-2 text-2xl font-bold">{value}</p>
          
          {change && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (index * 0.1) + 0.3 }}
              className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                change.type === 'increase' 
                  ? "text-glass-accent-secondary" 
                  : "text-glass-accent-warning"
              )}
            >
              <span>
                {change.type === 'increase' ? '↗' : '↘'}
              </span>
              <span>{Math.abs(change.value)}%</span>
              <span className="text-glass-text-muted text-xs">vs last month</span>
            </motion.div>
          )}
        </div>

        <motion.div
          className={cn(
            "p-3 rounded-lg bg-glass-background-accent/30 group-hover:bg-glass-background-accent/50 transition-colors duration-300",
            iconColor
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard; 