import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  MapPin,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ChartCard from '@/components/dashboard/ChartCard';

const AnalyticsPage: React.FC = () => {
  const analyticsStats = [
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: { value: 18, type: 'increase' as const },
      icon: TrendingUp,
      iconColor: 'text-glass-accent-secondary',
    },
    {
      title: 'User Growth',
      value: '+1,234',
      change: { value: 25, type: 'increase' as const },
      icon: Users,
      iconColor: 'text-glass-accent-primary',
    },
    {
      title: 'Building Utilization',
      value: '87.5%',
      change: { value: 5, type: 'decrease' as const },
      icon: Building,
      iconColor: 'text-glass-accent-warning',
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: { value: 0.1, type: 'increase' as const },
      icon: Activity,
      iconColor: 'text-glass-accent-secondary',
    },
  ];

  const chartData = [
    { name: 'Jan', revenue: 4000, users: 2400, buildings: 2400 },
    { name: 'Feb', revenue: 3000, users: 1398, buildings: 2210 },
    { name: 'Mar', revenue: 2000, users: 9800, buildings: 2290 },
    { name: 'Apr', revenue: 2780, users: 3908, buildings: 2000 },
    { name: 'May', revenue: 1890, users: 4800, buildings: 2181 },
    { name: 'Jun', revenue: 2390, users: 3800, buildings: 2500 },
    { name: 'Jul', revenue: 3490, users: 4300, buildings: 2100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="modern-card"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-glass-accent-primary/20">
            <BarChart3 className="w-8 h-8 text-glass-accent-primary" />
          </div>
          <div>
            <h1 className="heading-1 mb-2">Analytics Dashboard</h1>
            <p className="body-text">
              Comprehensive insights into your urban 3D navigation system performance.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Analytics Stats Grid */}
      <div className="dashboard-grid">
        {analyticsStats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            iconColor={stat.iconColor}
            index={index}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue Trends"
          subtitle="Monthly revenue analysis"
          data={chartData}
          type="area"
        />
        <ChartCard
          title="User Engagement"
          subtitle="User activity patterns"
          data={chartData}
          type="line"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="modern-card lg:col-span-2"
        >
          <h3 className="heading-3 mb-6">Performance Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Average Load Time', value: '1.2s', progress: 85, color: 'bg-glass-accent-secondary' },
              { label: 'API Response Time', value: '150ms', progress: 92, color: 'bg-glass-accent-primary' },
              { label: 'Error Rate', value: '0.03%', progress: 97, color: 'bg-glass-accent-warning' },
              { label: 'User Satisfaction', value: '94%', progress: 94, color: 'bg-glass-accent-secondary' },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-glass-text-primary">
                      {metric.label}
                    </span>
                    <span className="text-sm font-bold text-glass-text-primary">
                      {metric.value}
                    </span>
                  </div>
                  <div className="w-full bg-glass-background-accent rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="modern-card"
        >
          <h3 className="heading-3 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { icon: Users, label: 'Daily Active Users', value: '12,847', color: 'text-glass-accent-primary' },
              { icon: Building, label: 'Buildings Indexed', value: '2,847', color: 'text-glass-accent-secondary' },
              { icon: MapPin, label: 'Locations Served', value: '45', color: 'text-glass-accent-warning' },
              { icon: Activity, label: 'API Calls Today', value: '1.2M', color: 'text-glass-accent-primary' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-glass-background-accent/30 hover:bg-glass-background-accent/50 transition-colors duration-300"
              >
                <div className={`p-2 rounded-lg bg-glass-background-accent/50 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-glass-text-muted">{item.label}</p>
                  <p className="text-lg font-bold text-glass-text-primary">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage; 