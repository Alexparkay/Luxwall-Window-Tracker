import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building,
  MapPin,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import RecentActivity from './RecentActivity';

const DashboardOverview: React.FC = () => {
  const statsData = [
    {
      title: 'Total Buildings',
      value: '2,847',
      change: { value: 12, type: 'increase' as const },
      icon: Building,
      iconColor: 'text-glass-accent-primary',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: { value: 8, type: 'increase' as const },
      icon: Users,
      iconColor: 'text-glass-accent-secondary',
    },
    {
      title: 'Locations Mapped',
      value: '856',
      change: { value: 15, type: 'increase' as const },
      icon: MapPin,
      iconColor: 'text-glass-accent-warning',
    },
    {
      title: 'System Performance',
      value: '98.5%',
      change: { value: 2, type: 'decrease' as const },
      icon: Activity,
      iconColor: 'text-glass-accent-secondary',
    },
  ];

  const chartData = [
    { name: 'Jan', users: 400, buildings: 240 },
    { name: 'Feb', users: 300, buildings: 139 },
    { name: 'Mar', users: 200, buildings: 980 },
    { name: 'Apr', users: 278, buildings: 390 },
    { name: 'May', users: 189, buildings: 480 },
    { name: 'Jun', users: 239, buildings: 380 },
  ];

  const recentActivities = [
    {
      id: '1',
      action: 'New building added',
      user: 'John Doe',
      timestamp: '2 minutes ago',
      type: 'success' as const,
    },
    {
      id: '2',
      action: 'System maintenance completed',
      user: 'System',
      timestamp: '15 minutes ago',
      type: 'info' as const,
    },
    {
      id: '3',
      action: 'User authentication failed',
      user: 'Security',
      timestamp: '1 hour ago',
      type: 'warning' as const,
    },
    {
      id: '4',
      action: 'Data export completed',
      user: 'Jane Smith',
      timestamp: '2 hours ago',
      type: 'success' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="modern-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 mb-2">Welcome back, Admin!</h1>
            <p className="body-text">
              Here's what's happening with your urban 3D navigation system today.
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 text-glass-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">{new Date().toLocaleDateString()}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {statsData.map((stat, index) => (
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

      {/* Charts and Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Usage Overview"
            subtitle="Monthly users and buildings data"
            data={chartData}
          />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="modern-card"
      >
        <h3 className="heading-3 mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building, label: 'Add Building', color: 'text-glass-accent-primary' },
            { icon: Users, label: 'Manage Users', color: 'text-glass-accent-secondary' },
            { icon: MapPin, label: 'View Map', color: 'text-glass-accent-warning' },
            { icon: TrendingUp, label: 'Analytics', color: 'text-glass-accent-primary' },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              className="btn-glass flex flex-col items-center gap-2 p-4 h-20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-sm font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview; 